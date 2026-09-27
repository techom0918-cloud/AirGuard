import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Shield, CheckCircle2, Phone, Mail, Calendar, Save, Radio } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [emergencyName, setEmergencyName] = useState(user?.emergencyContact?.name || 'Emergency Guardian');
  const [emergencyRelation, setEmergencyRelation] = useState(user?.emergencyContact?.relation || 'Guardian');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergencyContact?.phone || '+1 (555) 019-2834');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-[#0A6847]" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
            User Profile & Identity
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
          Manage your personal AirGuard account identifier and linked emergency guardian contact
        </p>
      </div>

      {saveNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#0A6847]" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
          {/* Avatar and Basic Identifiers */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
            <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-[#0A6847] flex items-center justify-center font-black text-2xl font-['Space_Grotesk'] shadow-inner shrink-0">
              {name.split(' ').map((n) => n[0]).join('') || 'AG'}
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-lg font-bold text-slate-900 font-['Space_Grotesk']">
                {user?.name || 'AirGuard Member'}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Account Created: {user?.accountCreatedAt || 'January 2026'}</span>
              </p>
              <p className="text-xs text-[#0A6847] flex items-center gap-2 font-medium">
                <Radio className="w-3.5 h-3.5" />
                <span>Linked Hardware Device: {user?.deviceAssignedId || 'ESP32-AG-8849'}</span>
              </p>
            </div>
          </div>

          {/* Account Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0A6847]/20 focus:border-[#0A6847]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0A6847]/20 focus:border-[#0A6847]"
              />
            </div>
          </div>

          {/* Emergency / Caregiver Contact Details */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 font-['Space_Grotesk']">
              Guardian / Emergency Contact
            </h4>
            <p className="text-xs text-slate-500">
              This contact receives high-priority ambient warning SMS notifications if sustained severe particulate spikes coincide with acute inhaler actuations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0A6847]/20 focus:border-[#0A6847]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0A6847]/20 focus:border-[#0A6847]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telephone Number
                </label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0A6847]/20 focus:border-[#0A6847]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#0A6847] hover:bg-[#085338] shadow-xs flex items-center gap-2 text-xs sm:text-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Profile...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
