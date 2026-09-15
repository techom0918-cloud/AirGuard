import React from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu,
  Radio,
  Wind,
  Layers,
  ShieldCheck,
  Zap,
  Activity,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';

export const TechnologyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <PublicHeader />

      <section className="py-12 sm:py-16 border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-bold text-[#0A6847] uppercase tracking-wider">
            Hardware & Systems Architecture
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-['Space_Grotesk'] mt-2">
            The Science Behind AirGuard
          </h1>
          <p className="text-base text-slate-600 mt-3 leading-relaxed">
            Engineered at the intersection of embedded microcontrollers, precision optical laser air-sampling, differential pressure detection, and edge anomaly modeling.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Microcontroller & Hardware Grid */}
          <div>
            <div className="mb-6">
              <span className="text-xs font-bold text-[#0A6847] uppercase">Hardware Foundation</span>
              <h2 className="text-2xl font-bold text-slate-900 font-['Space_Grotesk'] mt-0.5">
                Embedded Microcontroller Specifications
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0A6847] flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  ESP32-WROOM-32E
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Dual-core Xtensa 32-bit LX6 running up to 240 MHz. Manages simultaneous real-time I2C sensor interrogation and low-latency BLE packet streaming.
                </p>
                <div className="text-xs font-mono text-slate-500 pt-2 border-t border-slate-100">
                  ESP-IDF v5.1.2 FreeRTOS Core
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0A6847] flex items-center justify-center">
                  <Radio className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  Dual Wireless Gateway
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Ultra-low-power Bluetooth 4.2 BLE for continuous phone pairing, complemented by 802.11 b/g/n Wi-Fi for autonomous home gateway synchronization.
                </p>
                <div className="text-xs font-mono text-slate-500 pt-2 border-t border-slate-100">
                  AES-128 Hardware Encryption
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0A6847] flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                  Power Management
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Integrated 650mAh LiPo cell with Texas Instruments bq24075 dynamic power-path management, yielding ~36 hours of active sampling per charge.
                </p>
                <div className="text-xs font-mono text-slate-500 pt-2 border-t border-slate-100">
                  USB-C Fast Recharge in 45 min
                </div>
              </div>
            </div>
          </div>

          {/* Sensor Array Breakdown */}
          <div>
            <div className="mb-6">
              <span className="text-xs font-bold text-[#0A6847] uppercase">Sensor Suite</span>
              <h2 className="text-2xl font-bold text-slate-900 font-['Space_Grotesk'] mt-0.5">
                Precision Environmental & Inhalation Sensors
              </h2>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px] tracking-wider">
                      <th className="py-3 px-4 sm:px-6">Sensor Target</th>
                      <th className="py-3 px-4 sm:px-6">Hardware Model</th>
                      <th className="py-3 px-4 sm:px-6">Measurement Principle</th>
                      <th className="py-3 px-4 sm:px-6">Range & Precision</th>
                      <th className="py-3 px-4 sm:px-6">Sampling Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                        Particulate Matter (PM1.0, PM2.5, PM10)
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-mono text-slate-700">Plantower PMSA003I</td>
                      <td className="py-3.5 px-4 sm:px-6">Laser optical light scattering</td>
                      <td className="py-3.5 px-4 sm:px-6">0.3 to 1000 µg/m³ (±10%)</td>
                      <td className="py-3.5 px-4 sm:px-6">1.0 Hz continuous</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                        Volatile Organic Compounds (VOC)
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-mono text-slate-700">Sensirion SGP40</td>
                      <td className="py-3.5 px-4 sm:px-6">Multi-pixel MOX gas sensing</td>
                      <td className="py-3.5 px-4 sm:px-6">0 to 1000 ppb VOC Index</td>
                      <td className="py-3.5 px-4 sm:px-6">1.0 Hz continuous</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                        Ambient Temperature & Humidity
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-mono text-slate-700">Sensirion SHT31-DIS</td>
                      <td className="py-3.5 px-4 sm:px-6">Capacitive polymer micro-sensor</td>
                      <td className="py-3.5 px-4 sm:px-6">-40°C to 125°C (±0.2°C), 0–100% RH</td>
                      <td className="py-3.5 px-4 sm:px-6">0.5 Hz</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                        Inhaler Actuation & Differential Flow
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-mono text-slate-700">MEMS Piezoresistive Flow</td>
                      <td className="py-3.5 px-4 sm:px-6">Differential orifice pressure drop</td>
                      <td className="py-3.5 px-4 sm:px-6">10 to 120 L/min inhalation flow</td>
                      <td className="py-3.5 px-4 sm:px-6">Event-triggered (100 Hz burst)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Software and AI Stack */}
          <div className="p-8 bg-[#F0FDF4] rounded-3xl border border-emerald-200 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 font-['Space_Grotesk'] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0A6847]" />
              Edge Intelligence & Cloud Synthesis
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
              AirGuard uses an on-device quantized anomaly classifier running directly on the ESP32’s Xtensa LX6 core. It calculates an <strong>Environmental Anomaly Score (0.00 to 1.00)</strong> by tracking multivariate vector deviations without requiring cloud round-trips. When online, historical logs stream into Firebase, enabling pattern aggregation and clinical doctor reports.
            </p>
            <div className="pt-2">
              <Link
                to="/app/device"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-[#0A6847] hover:bg-[#085338] shadow-xs text-xs"
              >
                <span>Inspect Live Device Screen</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
