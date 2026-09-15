import { User } from '../types';
import { mockCurrentUser } from '../data/mockUser';

export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

// Storage keys for development authentication state (prepared for future Firebase Auth)
const AUTH_STORAGE_KEY = 'airguard_auth_session';
const DEV_USERS_STORAGE_KEY = 'airguard_dev_registered_users';

type AuthListener = (session: AuthSession) => void;

// Fixed development-only demo credentials (never for production use)
const DEV_DEMO_EMAIL = 'demo@airguard.local';
const DEV_DEMO_PASSWORD = 'AirGuard@123';

interface DevUserRecord {
  user: User;
  passwordHash: string;
}

// Simple dev password hasher ensuring NO plaintext password is ever stored in web storage
async function hashDevPassword(password: string): Promise<string> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoded = new TextEncoder().encode(password + '_airguard_dev_salt');
      const buffer = await crypto.subtle.digest('SHA-256', encoded);
      return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch {
    // Fallback if crypto.subtle is not supported in current context
  }
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) - hash) + password.charCodeAt(i);
    hash |= 0;
  }
  return 'dev_h_' + Math.abs(hash);
}

class AuthService {
  private listeners: Set<AuthListener> = new Set();
  private currentSession: AuthSession = {
    user: null,
    isAuthenticated: false,
    token: null,
  };

  constructor() {
    // Session is restored explicitly on app startup via restoreSession()
    this.restoreSession();
  }

  /**
   * Inspects storage to restore a valid existing session.
   * If none exists, initializes as unauthenticated (user = null, isAuthenticated = false).
   */
  public restoreSession(): AuthSession {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.user && parsed.isAuthenticated === true) {
          this.currentSession = {
            user: parsed.user,
            isAuthenticated: true,
            token: parsed.token || `dev-session-${Date.now()}`,
          };
          return this.currentSession;
        }
      }
    } catch {
      // Storage corrupted or invalid, clear it
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }

    // Default initial state: explicitly unauthenticated
    this.currentSession = {
      user: null,
      isAuthenticated: false,
      token: null,
    };
    return this.currentSession;
  }

  public getSession(): AuthSession {
    return this.currentSession;
  }

  public getCurrentUser(): User | null {
    return this.currentSession.user;
  }

  public subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    listener(this.currentSession);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.currentSession));
  }

  private getRegisteredRecords(): DevUserRecord[] {
    try {
      const data = localStorage.getItem(DEV_USERS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveRegisteredRecord(user: User, passwordHash: string) {
    try {
      const records = this.getRegisteredRecords();
      const existingIdx = records.findIndex((r) => r.user.email.toLowerCase() === user.email.toLowerCase());
      if (existingIdx >= 0) {
        records[existingIdx] = { user, passwordHash };
      } else {
        records.push({ user, passwordHash });
      }
      localStorage.setItem(DEV_USERS_STORAGE_KEY, JSON.stringify(records));
    } catch {
      // Ignore dev storage errors
    }
  }

  public async login(
    email: string,
    password: string,
    rememberMe = true
  ): Promise<{ success: boolean; error?: string }> {
    // Artificial latency simulating auth handshake
    await new Promise((r) => setTimeout(r, 450));

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please provide a valid email address.' };
    }
    if (!password || password.trim().length === 0) {
      return { success: false, error: 'Please enter your password.' };
    }

    let authenticatedUser: User;

    // 1. Verify fixed development demo account credentials
    if (cleanEmail === DEV_DEMO_EMAIL) {
      if (password !== DEV_DEMO_PASSWORD) {
        return { success: false, error: 'Invalid email or password.' };
      }
      authenticatedUser = { ...mockCurrentUser };
    } else {
      // 2. Check dev registered users
      const records = this.getRegisteredRecords();
      const record = records.find((r) => r.user.email.toLowerCase() === cleanEmail);
      if (!record) {
        return { success: false, error: 'Invalid email or password.' };
      }

      const inputHash = await hashDevPassword(password);
      if (record.passwordHash !== inputHash) {
        return { success: false, error: 'Invalid email or password.' };
      }

      authenticatedUser = record.user;
    }

    this.currentSession = {
      user: authenticatedUser,
      isAuthenticated: true,
      token: `dev-session-${Date.now()}`,
    };

    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentSession));
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentSession));
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    this.notify();
    return { success: true };
  }

  public async register(
    fullName: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    await new Promise((r) => setTimeout(r, 500));

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!cleanEmail.includes('@')) {
      return { success: false, error: 'Please provide a valid email address.' };
    }
    if (!password || password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters in length.' };
    }

    if (cleanEmail === DEV_DEMO_EMAIL) {
      return { success: false, error: 'This email is reserved for the development demo account.' };
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      accountCreatedAt: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      deviceAssignedId: 'ESP32-AG-Pending',
    };

    const passwordHash = await hashDevPassword(password);
    this.saveRegisteredRecord(newUser, passwordHash);

    this.currentSession = {
      user: newUser,
      isAuthenticated: true,
      token: `dev-session-${Date.now()}`,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentSession));
    this.notify();
    return { success: true };
  }

  public async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await new Promise((r) => setTimeout(r, 400));
    return {
      success: true,
      message: `If an AirGuard account exists for ${email}, a password recovery link has been prepared (Firebase-ready).`,
    };
  }

  public async resetPassword(_token: string, _newPass: string): Promise<{ success: boolean; message: string }> {
    await new Promise((r) => setTimeout(r, 400));
    return {
      success: true,
      message: 'Your AirGuard account password has been successfully reset. You may now sign in.',
    };
  }

  public async updateProfile(updatedData: Partial<User>): Promise<User> {
    await new Promise((r) => setTimeout(r, 300));
    if (this.currentSession.user) {
      this.currentSession.user = {
        ...this.currentSession.user,
        ...updatedData,
      };

      // Persist to whichever storage currently holds the session
      if (localStorage.getItem(AUTH_STORAGE_KEY)) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentSession));
      } else if (sessionStorage.getItem(AUTH_STORAGE_KEY)) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentSession));
      }

      this.saveRegisteredUser(this.currentSession.user);
      this.notify();
    }
    return this.currentSession.user!;
  }

  public async logout(): Promise<void> {
    await new Promise((r) => setTimeout(r, 150));
    this.currentSession = {
      user: null,
      isAuthenticated: false,
      token: null,
    };
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    this.notify();
  }
}

export const authService = new AuthService();
