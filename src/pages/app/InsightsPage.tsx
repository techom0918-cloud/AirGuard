import React, { useEffect, useState } from 'react';
import { WeeklyInsight } from '../../types';
import { insightsService } from '../../services/insightsService';
import { LoadingState } from '../../components/common/LoadingState';
import { Badge } from '../../components/common/Badge';
import { 
  Sparkles, 
  RotateCw, 
  ShieldAlert, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Compass, 
  Info,
  Layers 
} from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<WeeklyInsight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);

  useEffect(() => {
    insightsService.getWeeklyInsights().then((data) => {
      setInsights(data);
      setIsLoading(false);
    });
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const res = await insightsService.requestSynthesisRefresh();
    const updated = await insightsService.getWeeklyInsights();
    setInsights(updated);
    setRefreshNotice(res.message);
    setIsRefreshing(false);
    setTimeout(() => setRefreshNotice(null), 4000);
  };

  if (isLoading) {
    return (
      <div className="py-12 max-w-7xl mx-auto">
        <LoadingState
          message="Synthesizing Environmental Telemetry..."
          subMessage="Correlating particulate trends, timestamps, and smart inhaler actuations"
        />
      </div>
    );
  }

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'warning':
        return <Badge variant="red" size="sm">Attention Cluster</Badge>;
      case 'caution':
        return <Badge variant="amber" size="sm">Elevated Trend</Badge>;
      default:
        return <Badge variant="green" size="sm">Baseline Observation</Badge>;
    }
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'Weekly Summary':
        return <Layers className="w-4 h-4 text-[#0A6847]" />;
      case 'Environmental Pattern':
        return <TrendingUp className="w-4 h-4 text-amber-600" />;
      case 'Risk Pattern':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'Potential Pattern':
        return <Compass className="w-4 h-4 text-[#0A6847]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#0A6847]" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="rounded-3xl bg-[#2A8E77] p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk']">AI Insights</h1>
          <p className="text-emerald-100 text-xs mt-1">Patterns & micro-trends in recent exposure</p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-5 py-2.5 rounded-full bg-white text-[#2A8E77] font-bold text-xs hover:bg-emerald-50 transition-all cursor-pointer shadow-xs self-start sm:self-auto disabled:opacity-60 flex items-center gap-1.5"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Analyzing...' : 'Refresh'}</span>
        </button>
      </div>

      {refreshNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#0A6847]" />
          <span>{refreshNotice}</span>
        </div>
      )}

      {/* 4 Primary Pattern Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              {/* Section Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                    {getSectionIcon(insight.section)}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {insight.section}
                  </span>
                </div>
                {getSeverityBadge(insight.severity)}
              </div>

              {/* Headline */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-3 tracking-tight">
                {insight.headline}
              </h3>

              {/* Detail */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                {insight.detail}
              </p>
            </div>

            {/* Bottom Meta */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                {insight.highlightStat}
              </span>
              <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {insight.observedDateRange}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Predictive Guidance Explainer Card */}
      <div className="bg-[#F0FDF4] rounded-2xl border border-emerald-200/90 p-5 sm:p-6 text-emerald-950">
        <h4 className="text-sm font-bold tracking-tight text-slate-900 mb-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#0A6847]" />
          How AirGuard AI Correlates Your Environment
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          AirGuard cross-references sensor telemetry timestamps (particulate count, volatile gas spikes, temperature changes) against differential flow detections registered on your inhaler sleeve. By mapping repeated co-occurrences, AirGuard highlights micro-environmental zones where airborne trigger risks build up prior to physical sensitivity.
        </p>
      </div>

      {/* Mandatory Medical Disclaimer */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-700 font-semibold">Important Medical Disclaimer: </strong>
          AirGuard provides environmental insights and is not a medical diagnostic system. Consult a qualified healthcare professional for medical advice.
        </p>
      </div>
    </div>
  );
};
