import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Activity,
  Wind,
  Cpu,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  MapPin,
  Share2,
  Lock,
  Layers,
  Flame,
  Thermometer,
  Droplets,
  Radio,
} from 'lucide-react';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';

export const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stable' | 'rising' | 'moderate'>('rising');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 bg-linear-to-b from-[#F0FDF4]/70 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#0A6847]">
                <Radio className="w-3.5 h-3.5 animate-pulse text-[#0A6847]" />
                <span>Next-Gen Environmental Risk Guardian</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] font-['Space_Grotesk']">
                Reactive Care <br />
                <span className="text-[#0A6847]">→ Predictive Care</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                AirGuard transforms the conventional passive asthma inhaler into a proactive environmental safety system. By continuously monitoring ambient particulates, volatile gases, and airway triggers, AirGuard alerts you before high-risk exposure escalates.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  to="/app/dashboard"
                  className="px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-[#0A6847] hover:bg-[#085338] shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Launch Live App</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/how-it-works"
                  className="px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Explore How It Works</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-100 text-xs text-slate-500">
                <div>
                  <span className="block font-bold text-slate-900 text-sm">ESP32 + Sensors</span>
                  <span>Continuous micro-telemetry</span>
                </div>
                <div>
                  <span className="block font-bold text-slate-900 text-sm">3 Detection Modes</span>
                  <span>Threshold, trend & edge AI</span>
                </div>
                <div>
                  <span className="block font-bold text-slate-900 text-sm">Zero Guesswork</span>
                  <span>Calm, verified risk scores</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Live Sensor Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 relative">
                {/* Header state switch */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#0A6847]" />
                    <span className="font-bold text-sm text-slate-900 font-['Space_Grotesk']">
                      AirGuard Guardian Engine
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md">
                    Live Telemetry
                  </span>
                </div>

                {/* State selector tabs for interactive demonstration */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl my-4 text-xs font-semibold text-slate-600">
                  <button
                    type="button"
                    onClick={() => setActiveTab('stable')}
                    className={`py-1.5 rounded-lg transition-all ${
                      activeTab === 'stable' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-900'
                    }`}
                  >
                    Stable Safe
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('rising')}
                    className={`py-1.5 rounded-lg transition-all ${
                      activeTab === 'rising' ? 'bg-white text-amber-900 shadow-xs' : 'hover:text-slate-900'
                    }`}
                  >
                    Risk Rising
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('moderate')}
                    className={`py-1.5 rounded-lg transition-all ${
                      activeTab === 'moderate' ? 'bg-white text-red-900 shadow-xs' : 'hover:text-slate-900'
                    }`}
                  >
                    High Risk
                  </button>
                </div>

                {/* Dynamic Risk Visualizer */}
                {activeTab === 'rising' && (
                  <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                        Predictive Warning
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                        Trend Alert
                      </span>
                    </div>
                    <div className="text-2xl font-black text-amber-950 font-['Space_Grotesk']">
                      Risk Rising
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      PM2.5 has increased steadily over the last 15 minutes (28 → 31 → 35 → 39 → 44 µg/m³).
                    </p>
                    <div className="flex items-center gap-2 pt-1 font-mono text-xs font-bold text-amber-900">
                      <span>28</span> <span>→</span> <span>31</span> <span>→</span> <span>35</span> <span>→</span> <span>39</span> <span>→</span> <span className="bg-amber-300 px-1 rounded">44 µg/m³</span>
                    </div>
                  </div>
                )}

                {activeTab === 'stable' && (
                  <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                        Primary Status
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                        Safe Zone
                      </span>
                    </div>
                    <div className="text-2xl font-black text-emerald-950 font-['Space_Grotesk']">
                      Low Risk
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed">
                      Environmental conditions currently appear stable and within baseline limits.
                    </p>
                    <div className="text-xs text-emerald-800 font-medium">
                      Sensor baseline: PM2.5 14 µg/m³ • VOC 95 ppb • Temp 22°C
                    </div>
                  </div>
                )}

                {activeTab === 'moderate' && (
                  <div className="p-4 rounded-2xl bg-red-50/90 border border-red-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-red-900">
                        Environmental Caution
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-200 text-red-900">
                        High Exposure
                      </span>
                    </div>
                    <div className="text-2xl font-black text-red-950 font-['Space_Grotesk']">
                      High Risk
                    </div>
                    <p className="text-xs text-red-900 leading-relaxed">
                      Acute particulate spike detected (96 µg/m³) near transit repaving zone.
                    </p>
                    <div className="text-xs text-red-800 font-medium">
                      Anomaly Score: 0.89 • Suggest moving indoors or wearing barrier protection.
                    </div>
                  </div>
                )}

                {/* Micro Metric Gauges */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                      PM2.5 Sensor
                    </span>
                    <span className="text-lg font-bold text-slate-900 font-['Space_Grotesk']">
                      {activeTab === 'stable' ? '14' : activeTab === 'rising' ? '44' : '96'} µg/m³
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                      VOC Gas Level
                    </span>
                    <span className="text-lg font-bold text-slate-900 font-['Space_Grotesk']">
                      {activeTab === 'stable' ? '95' : activeTab === 'rising' ? '142' : '420'} ppb
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                  <Link
                    to="/app/dashboard"
                    className="text-xs font-bold text-[#0A6847] hover:text-[#085338] flex items-center justify-center gap-1"
                  >
                    <span>View Full Authenticated Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Conceptual Detection Mechanisms Section */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#0A6847] uppercase tracking-wider">
              Intelligent Risk Engine
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight font-['Space_Grotesk'] mt-1">
              Three Distinct Environmental Detection Layers
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
              AirGuard does not rely on a single static threshold. It processes live physical telemetry across three synchronized analytical tiers to provide early warnings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Threshold-Based Detection */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0A6847] flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-['Space_Grotesk']">
                1. Threshold-Based Detection
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Continually compares real-time PM2.5, PM10, and VOC gas concentrations against established environmental air safety baselines and guidelines.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#0A6847]">
                Immediate boundary detection
              </div>
            </div>

            {/* 2. Trend-Based Detection */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0A6847] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-['Space_Grotesk']">
                2. Trend-Based Velocity Detection
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Calculates the rate of change over 5, 15, and 30-minute intervals. Detects particulate buildup before dangerous absolute thresholds are breached.
              </p>
              <div className="pt-2 text-xs font-semibold text-[#0A6847]">
                Predictive early incline warning
              </div>
            </div>

            {/* 3. Edge AI Anomaly Detection */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0A6847] flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-['Space_Grotesk']">
                3. Edge AI Anomaly Engine
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Evaluates multivariate combinations of particulate density, VOC, thermal shift, and barometric differential flow with an Environmental Anomaly Score (0.00–1.00).
              </p>
              <div className="pt-2 text-xs font-semibold text-[#0A6847]">
                Local micro-anomaly scoring
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* End-to-End System Flow */}
      <section className="py-16 sm:py-20 bg-[#F0FDF4]/50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#0A6847] uppercase tracking-wider">
              Architecture & Data Flow
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight font-['Space_Grotesk'] mt-1">
              From Microcontroller to Personal Guardian
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-black text-[#0A6847] mb-2">01 / HARDWARE</div>
              <h4 className="font-bold text-slate-900 text-sm">ESP32 & Sensors</h4>
              <p className="text-xs text-slate-500 mt-1">
                Sharp GP2Y1010AU0F optical dust sensor, Sensirion VOC, and SHT31 temperature/humidity sampling at 1 Hz.
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-black text-[#0A6847] mb-2">02 / INHALER SLEEVE</div>
              <h4 className="font-bold text-slate-900 text-sm">Differential Flow Sleeve</h4>
              <p className="text-xs text-slate-500 mt-1">
                Mechanical piezoresistive flow sensor logs actuation timestamps without medication tampering.
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-black text-[#0A6847] mb-2">03 / STREAMING</div>
              <h4 className="font-bold text-slate-900 text-sm">Realtime Gateway</h4>
              <p className="text-xs text-slate-500 mt-1">
                Synchronizes sensor telemetry over BLE/WiFi into abstracted Firebase datastore.
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-black text-[#0A6847] mb-2">04 / WEB PLATFORM</div>
              <h4 className="font-bold text-slate-900 text-sm">AirGuard Dashboard</h4>
              <p className="text-xs text-slate-500 mt-1">
                Instant 2-3 second risk clarity, doctor reporting, trigger map, and AI pattern synthesis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0A6847] text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col items-center text-center space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-700">
              Proactive Health-Tech IoT
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight max-w-xl font-['Space_Grotesk']">
              Ready to experience personal environmental safety?
            </h2>
            <p className="text-sm sm:text-base text-emerald-100 max-w-lg">
              Explore the live authenticated AirGuard application now with real-time sensor simulations, trigger maps, and AI insights.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                to="/app/dashboard"
                className="px-6 py-3.5 rounded-xl text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Enter AirGuard Application</span>
                <ArrowRight className="w-4 h-4 text-[#0A6847]" />
              </Link>
              <Link
                to="/technology"
                className="px-6 py-3.5 rounded-xl text-sm font-semibold text-white border border-white/30 hover:bg-white/10 transition-colors"
              >
                View Sensor Specs
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
