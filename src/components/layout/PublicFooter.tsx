import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowUpRight, Heart, Info, Radio } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0A6847] text-white flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-300" />
              </div>
              <span className="text-xl font-black tracking-tight text-white font-['Space_Grotesk']">
                AIRGUARD
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              AirGuard transforms passive asthma inhaler management into an intelligent, proactive environmental risk guardian. Continuous micro-environmental monitoring powered by ESP32 hardware and edge intelligence.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-lg w-fit">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Reactive Care → Predictive Care</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/features" className="hover:text-white transition-colors">
                  System Features
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/technology" className="hover:text-white transition-colors">
                  ESP32 & Sensors
                </Link>
              </li>
              <li>
                <Link to="/app/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Web App</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Organization
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About AirGuard
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Member Portal
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Health Disclaimer Banner */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 text-xs text-slate-400 flex items-start gap-3 leading-relaxed">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-200 font-semibold">Important Medical Notice: </strong>
              AirGuard provides predictive environmental monitoring and personal risk insights. It does not provide medical diagnosis, guarantee asthma attack prevention, or replace professional healthcare counsel. Always consult a qualified physician and maintain your prescribed medical treatment regimen.
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} AirGuard Health-Tech Systems. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <span>Sensor Protocol: ESP-IDF v5.1</span>
              <span>•</span>
              <span>Proactive Smart Inhaler System</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
