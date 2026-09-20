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
          subMessage="Correlating particulate trends, timestamps, and observed sensor events"
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
      case 'Notable Changes':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'Recommended Questions for Doctor':
        return <ShieldAlert className="w-4 h-4 text-blue-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#0A6847]" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Compact Page Header Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[#0A6847]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
              AI Environmental Insights
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1 pl-10">
            Pattern synthesis and environmental risk trends derived from observed sensor telemetry
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-2.5 rounded-xl font-bold text-white bg-[#0A6847] hover:bg-[#085338] shadow-xs flex items-center gap-2 text-xs sm:text-sm transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50 min-h-[44px]"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Synthesizing...' : 'Refresh Pattern Analysis'}</span>
        </button>
      </div>

      {refreshNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2.5 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-[#0A6847] shrink-0" />
          <span>{refreshNotice}</span>
        </div>
      )}

      {/* Pattern Synthesis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {insights.map((insight, index) => {
          const isLeadCard = index === 0 || insight.section === 'Weekly Summary';
          return (
            <div
              key={insight.id}
              className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all ${
                isLeadCard
                  ? 'md:col-span-2 border-emerald-200/80 bg-gradient-to-br from-white via-white to-emerald-50/20'
                  : 'border-slate-200/90'
              }`}
            >
              <div>
                {/* Section Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
                      {getSectionIcon(insight.section)}
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                      {insight.section}
                    </span>
                  </div>
                  {getSeverityBadge(insight.severity)}
                </div>

                {/* Headline */}
                <h3 className={`font-bold text-slate-900 mt-3.5 tracking-tight font-['Space_Grotesk'] ${
                  isLeadCard ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
                }`}>
                  {insight.headline}
                </h3>

                {/* Detail */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                  {insight.detail}
                </p>
              </div>

              {/* Bottom Meta */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 text-xs">
                  {insight.highlightStat}
                </span>
                <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{insight.observedDateRange}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Environmental Correlation Methodology Card */}
      <div className="bg-emerald-50/70 rounded-2xl border border-emerald-200/80 p-5 sm:p-6 text-emerald-950 shadow-2xs">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-md bg-emerald-100 text-[#0A6847] flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-sm font-bold tracking-tight text-slate-900 font-['Space_Grotesk']">
            Environmental Correlation Methodology
          </h4>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl pl-8">
          AirGuard cross-references sensor telemetry timestamps (particulate density, volatile organic compounds, and temperature shifts) against differential flow detections registered on the inhaler sleeve. By synthesizing repeated co-occurrences, AirGuard highlights micro-environmental patterns where elevated air co-factors coincided with observed activity.
        </p>
      </div>

      {/* Mandatory Informational Medical Disclaimer */}
      <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs text-slate-500 flex items-start gap-3 shadow-2xs">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-700 font-semibold">Important Medical Disclaimer: </strong>
          AirGuard provides environmental pattern summaries based on observed telemetry and is not a medical diagnostic or predictive clinical system. Insights are for personal informational awareness only and do not replace consultation with a qualified healthcare professional or a personalized asthma action plan.
        </p>
      </div>
    </div>
  );
};

