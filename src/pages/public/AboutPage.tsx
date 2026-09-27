import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Target, Heart, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <PublicHeader />

      <section className="py-12 sm:py-16 border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-bold text-[#0A6847] uppercase tracking-wider">
            Our Purpose & Philosophy
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-['Space_Grotesk'] mt-2">
            Transforming Inhalation Care from Reactive to Predictive
          </h1>
          <p className="text-base text-slate-600 mt-3 leading-relaxed">
            For decades, inhalers have been purely reactive: people wait until their chest tightens before reaching for medication. AirGuard creates the missing guardian layer.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Core Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0A6847] flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                Proactive Guardian
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We monitor the invisible air around you so you never have to guess whether your surrounding environment is safe or deteriorating.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0A6847] flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                Calm, Trustworthy UI
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Health technology should inspire confidence, not anxiety. Every screen uses sober typography, clear metrics, and zero alarmist hype.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0A6847] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk']">
                Patient Data Privacy
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You retain complete control over your geocoded telemetry. Reports are shared only with clinicians when explicitly authorized.
              </p>
            </div>
          </div>

          {/* Clinical Integrity Statement */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 font-['Space_Grotesk']">
              Commitment to Medical Integrity
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              AirGuard adheres strictly to responsible communication standards. We never claim to diagnose medical conditions, predict biological asthma attacks with clinical certainty, or replace prescribed asthma action plans. We observe, measure, and analyze physical environmental triggers—giving individuals and their healthcare providers accurate empirical context.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#0A6847]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Evidence-based environmental trigger correlation</span>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
