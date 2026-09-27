import React from 'react';
import { Link } from 'react-router-dom';
import {
  Radio,
  Wind,
  Cpu,
  ShieldCheck,
  Share2,
  ArrowRight,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Attach the AirGuard Sleeve & Carry the Sensor Pod',
      description:
        'The lightweight AirGuard sleeve clips onto your standard metered-dose inhaler (MDI), while the compact companion pod pairs via Bluetooth Low Energy (BLE). No medication disruption or chemical interference.',
      icon: Radio,
    },
    {
      num: '02',
      title: 'Continuous Ambient Air Monitoring',
      description:
        'Onboard optical laser scattering sensors continuously measure PM1.0, PM2.5, and PM10 particles. An electrochemical VOC sensor tracks volatile gases, while SHT31 monitors temperature and relative humidity.',
      icon: Wind,
    },
    {
      num: '03',
      title: 'Real-Time Edge Risk Assessment',
      description:
        'The ESP32 microcontroller processes readings locally at 1 Hz. It checks static thresholds, calculates 15-minute particulate velocity, and computes the Environmental Anomaly Score.',
      icon: Cpu,
    },
    {
      num: '04',
      title: 'Proactive Alert Before Trigger Conditions Peak',
      description:
        'If particulate velocity steepens or VOCs elevate, AirGuard delivers a calm notification to your phone and an ambient LED cue on the device, prompting you to move to cleaner air or check your action plan.',
      icon: ShieldCheck,
    },
    {
      num: '05',
      title: 'Physician Collaboration & Pattern Intelligence',
      description:
        'Every actuation and ambient warning is timestamped and geocoded. At your next clinical appointment, export a 7-day or 30-day physician summary that highlights exposure patterns and discussion questions.',
      icon: Share2,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <PublicHeader />

      <section className="py-12 sm:py-16 border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-bold text-[#0A6847] uppercase tracking-wider">
            Step-By-Step Workflow
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-['Space_Grotesk'] mt-2">
            How AirGuard Protects Your Airway
          </h1>
          <p className="text-base text-slate-600 mt-3 leading-relaxed">
            Transitioning from reactive symptom relief to proactive environmental awareness in five seamless stages.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start gap-6 hover:border-emerald-300 transition-all"
              >
                <div className="flex sm:flex-col items-center gap-3 shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0A6847] flex items-center justify-center font-bold text-lg">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-slate-400 font-mono">
                    STEP {step.num}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-['Space_Grotesk']">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}

          <div className="p-8 bg-[#F0FDF4] rounded-3xl border border-emerald-200 text-center space-y-4">
            <h3 className="text-xl font-bold text-slate-900 font-['Space_Grotesk']">
              Experience the Proactive Difference
            </h3>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              Test the interactive live dashboard with real-time sensor simulated feeds and proactive risk alert demonstrations.
            </p>
            <Link
              to="/app/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#0A6847] hover:bg-[#085338] shadow-md transition-all text-sm cursor-pointer"
            >
              <span>Launch Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
