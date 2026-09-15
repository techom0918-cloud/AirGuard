import { User } from '../types';
import { mockCurrentUser } from '../data/mockUser';

export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

// In-memory / session storage layer prepared for future Firebase Authentication
const AUTH_STORAGE_KEY = 'airguard_auth_session';

type AuthListener = (session: AuthSession) => void;

class AuthService {
  private listeners: Set<AuthListener> = new Set();
  private currentSession: AuthSession;

  constructor() {
    // Check if session was saved (e.g. remember me or active session)
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.currentSession = {
          user: parsed.user,
          isAuthenticated: true,
          token: parsed.token || 'mock_jwt_token_airguard',
        };
      } catch {
        this.currentSession = {
          user: mockCurrentUser,
          isAuthenticated: true,
          token: 'mock_jwt_token_airguard',
        };
      }
    } else {
      // Default to authenticated for direct developer/preview inspection, but easily toggled
      this.currentSession = {
        user: mockCurrentUser,
        isAuthenticated: true,
        token: 'mock_jwt_token_airguard',
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentSession));
    }
  }

  public getSession(): AuthSession {
    return this.currentSession;
  }

  public subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    listener(this.currentSession);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.currentSession));
  }

  public async login(email: string, _password: string, rememberMe = true): Promise<{ success: boolean; error?: string }> {
    // Artificial latency simulating secure auth handshake
    await new Promise((r) => setTimeout(r, 600));

    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please provide a valid email address.' };
    }

    const updatedUser: User = {
      ...mockCurrentUser,
      email,
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    };

    this.currentSession = {
      user: updatedUser,
      isAuthenticated: true,
      token: `airguard_auth_${Date.now()}`,
    };

    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentSession));
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentSession));
    }

    this.notify();
    return { success: true };
  }

  public async register(fullName: string, email: string, _password: string): Promise<{ success: boolean; error?: string }> {
    await new Promise((r) => setTimeout(r, 650));

    if (!fullName.trim()) {
      return { success: false, error: 'Full name is required.' };
    }
    if (!email.includes('@')) {
      return { success: false, error: 'Please provide a valid email address.' };
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: fullName,
      email,
      accountCreatedAt: 'Today',
      deviceAssignedId: 'ESP32-AG-Pending',
    };

    this.currentSession = {
      user: newUser,
      isAuthenticated: true,
      token: `airguard_auth_${Date.now()}`,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentSession));
    this.notify();
    return { success: true };
  }

  public async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await new Promise((r) => setTimeout(r, 500));
    return {
      success: true,
      message: `If an AirGuard account exists for ${email}, a password reset link has been dispatched.`,
    };
  }

  public async resetPassword(_token: string, _newPass: string): Promise<{ success: boolean; message: string }> {
    await new Promise((r) => setTimeout(r, 500));
    return {
      success: true,
      message: 'Your AirGuard account password has been successfully reset. You may now log in.',
    };
  }

  public async updateProfile(updatedData: Partial<User>): Promise<User> {
    await new Promise((r) => setTimeout(r, 400));
    if (this.currentSession.user) {
      this.currentSession.user = {
        ...this.currentSession.user,
        ...updatedData,
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentSession));
      this.notify();
    }
    return this.currentSession.user!;
  }

  public async logout(): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
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
