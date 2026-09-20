import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { deviceService } from '../../services/deviceService';
import { Badge } from '../../components/common/Badge';
import { 
  User, 
  Shield, 
  CheckCircle2, 
  Calendar, 
  Save, 
  Radio,
  Mail,
  UserCheck
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [emergencyName, setEmergencyName] = useState(user?.emergencyContact?.name || 'Emergency Guardian');
  const [emergencyRelation, setEmergencyRelation] = useState(user?.emergencyContact?.relation || 'Guardian');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergencyContact?.phone || '+1 (555) 019-2834');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeviceConnected, setIsDeviceConnected] = useState<boolean>(false);

  useEffect(() => {
    const unsub = deviceService.subscribeToDeviceStatus((status) => {
      setIsDeviceConnected(status.connected);
    });
    return () => unsub();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile({
      name,
      email,
      emergencyContact: {
        name: emergencyName,
        relation: emergencyRelation,
        phone: emergencyPhone,
      },
    });
    setIsSaving(false);
    setSaveNotice('Profile changes saved successfully.');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Compact Header Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-[#0A6847]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
              Profile
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 pl-10">
            Manage your account and device information
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2.5 rounded-xl font-bold text-white bg-[#0A6847] hover:bg-[#085338] shadow-xs flex items-center gap-2 text-xs sm:text-sm transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50 min-h-[44px]"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>

      {saveNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2.5 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-[#0A6847] shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Profile Overview & Hardware Association */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* User Identity Overview */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-[#0A6847] flex items-center justify-center font-black text-xl font-['Space_Grotesk'] shrink-0 shadow-2xs">
            {name.split(' ').map((n) => n[0]).join('') || 'AG'}
          </div>
          <div className="space-y-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk'] truncate">
              {user?.name || 'AirGuard Member'}
            </h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{user?.email || 'demo@airguard.local'}</span>
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Member since {user?.accountCreatedAt || 'January 2026'}</span>
            </p>
          </div>
        </div>

        {/* Device Pairing Association Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Radio className={`w-4 h-4 ${isDeviceConnected ? 'text-[#0A6847]' : 'text-slate-400'}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">
                  Device Information
                </span>
              </div>
              <Badge variant={isDeviceConnected ? 'green' : 'neutral'} size="sm">
                {isDeviceConnected ? 'Paired' : 'Not Paired'}
              </Badge>
            </div>

            <div className="mt-3">
              <span className="text-[11px] text-slate-400 block uppercase font-medium">
                Hardware Identifier
              </span>
              <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                {isDeviceConnected
                  ? `${user?.deviceAssignedId || 'ESP32-AG-8849'} (Simulation Mode)`
                  : 'Device identifier unavailable'}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-3">
            {isDeviceConnected
              ? 'AirGuard smart inhaler sleeve active and paired via Bluetooth LE.'
              : 'Waiting for connection with physical or simulated AirGuard sleeve.'}
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-6">
          {/* Account Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
                <UserCheck className="w-3.5 h-3.5 text-[#0A6847]" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  Account Details
                </h4>
                <p className="text-xs text-slate-500">
                  Primary patient contact name and email credentials
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="profile-full-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  id="profile-full-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 bg-white text-slate-800 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-[#0A6847]/20 focus:border-[#0A6847] transition-all min-h-[44px]"
                />
              </div>

              <div>
                <label htmlFor="profile-email-addr" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  id="profile-email-addr"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 bg-white text-slate-800 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-[#0A6847]/20 focus:border-[#0A6847] transition-all min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Emergency / Caregiver Contact Details */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
                <Shield className="w-3.5 h-3.5 text-[#0A6847]" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  Guardian / Emergency Contact
                </h4>
                <p className="text-xs text-slate-500">
                  Caregiver notified during severe sustained particulate anomalies
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="emergency-contact-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contact Name
                </label>
                <input
                  id="emergency-contact-name"
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 bg-white text-slate-800 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-[#0A6847]/20 focus:border-[#0A6847] transition-all min-h-[44px]"
                />
              </div>

              <div>
                <label htmlFor="emergency-relationship" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Relationship
                </label>
                <input
                  id="emergency-relationship"
                  type="text"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 bg-white text-slate-800 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-[#0A6847]/20 focus:border-[#0A6847] transition-all min-h-[44px]"
                />
              </div>

              <div>
                <label htmlFor="emergency-phone-number" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Telephone Number
                </label>
                <input
                  id="emergency-phone-number"
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 bg-white text-slate-800 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-[#0A6847]/20 focus:border-[#0A6847] transition-all min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Personal settings and emergency contacts are persisted locally to your active profile.
            </span>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-white bg-[#0A6847] hover:bg-[#085338] shadow-xs flex items-center justify-center gap-2 text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

