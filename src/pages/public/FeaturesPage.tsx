import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Activity,
  Wind,
  Cpu,
  MapPin,
  Share2,
  Bell,
  Sparkles,
  Layers,
  History,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';

export const FeaturesPage: React.FC = () => {
  const features = [
    {
      icon: Activity,
      title: 'Instant Primary Risk Assessment',
      description:
        'Know within 2–3 seconds whether your ambient environment is stable, experiencing rising particulate risk, or elevated. No complex dials—just immediate clarity.',
      tag: 'Core Dashboard',
    },
    {
      icon: Wind,
      title: 'Predictive Particulate Velocity',
      description:
        'Tracks rates of change (e.g. 28 → 31 → 35 → 39 → 44 µg/m³) to warn you before air quality worsens significantly.',
      tag: 'Early Warning',
    },
    {
      icon: Cpu,
      title: 'Multivariate Sensor Telemetry',
      description:
        'Simultaneous real-time monitoring of PM1.0, PM2.5, PM10, total VOC gas emissions, ambient temperature, and relative humidity.',
      tag: 'IoT Telemetry',
    },
    {
      icon: MapPin,
      title: 'Geospatial Trigger Mapping',
      description:
        'Pairs with your smartphone’s GPS to log the precise coordinates of environmental anomalies and smart inhaler actuations.',
      tag: 'Geospatial',
    },
    {
      icon: Sparkles,
      title: 'AI Pattern Synthesis',
      description:
        'Analyzes correlation between environmental parameters and actuation times to identify recurrent micro-environmental exposure zones.',
      tag: 'Edge & Cloud AI',
    },
    {
      icon: Share2,
      title: 'Clinical Doctor Sharing',
      description:
        'Generate structured clinical summaries with exposure trends, risk distributions, and discussion points formatted for pulmonologists.',
      tag: 'Healthcare Integration',
    },
    {
      icon: Bell,
      title: 'Calm Alert Notification System',
      description:
        'Tiered alerts (low, moderate, high, critical) categorize environmental warnings and device connection alerts without inducing panic.',
      tag: 'Safety Alerts',
    },
    {
      icon: History,
      title: 'Chronological Audit History',
      description:
        'Searchable, filterable event history with full sensor telemetry snapshots and one-click CSV data export.',
      tag: 'Data Transparency',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <PublicHeader />

      <section className="py-12 sm:py-16 border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-bold text-[#0A6847] uppercase tracking-wider">
            AirGuard Platform Capabilities
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-['Space_Grotesk'] mt-2">
            Engineered for Proactive Airway Safety
          </h1>
          <p className="text-base text-slate-600 mt-3 leading-relaxed">
            Every feature is designed around a single mandate: delivering timely, reliable environmental risk intelligence before exposure triggers discomfort.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0A6847] flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {f.tag}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                      {f.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom call to action */}
          <div className="mt-16 text-center">
            <Link
              to="/app/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-[#0A6847] hover:bg-[#085338] shadow-md transition-all cursor-pointer text-sm"
            >
              <span>Explore Features in Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
