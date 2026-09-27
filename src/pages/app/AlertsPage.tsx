import React, { useEffect, useState } from 'react';
import { RiskAlert, AlertSeverity, AlertStatus } from '../../types';
import { alertService } from '../../services/alertService';
import { Badge } from '../../components/common/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Radio,
  WifiOff,
  Cpu,
  Check,
  Search,
  Filter,
  Clock,
  MapPin,
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadAlerts = async () => {
    setIsLoading(true);
    const data = await alertService.getAlerts({
      severity: severityFilter,
      status: statusFilter,
      search: searchQuery,
    });
    setAlerts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAlerts();
  }, [severityFilter, statusFilter, searchQuery]);

  const handleAcknowledge = async (id: string) => {
    await alertService.acknowledgeAlert(id);
    loadAlerts();
  };

  const handleResolve = async (id: string) => {
    await alertService.resolveAlert(id);
    loadAlerts();
  };

  const handleAcknowledgeAll = async () => {
    await alertService.acknowledgeAll();
    loadAlerts();
  };

  const getSeverityBadge = (sev: AlertSeverity) => {
    switch (sev) {
      case 'critical':
        return <Badge variant="red" size="sm">Critical Risk</Badge>;
      case 'high':
        return <Badge variant="red" size="sm">High Risk</Badge>;
      case 'moderate':
        return <Badge variant="amber" size="sm">Moderate Warning</Badge>;
      case 'low':
      default:
        return <Badge variant="green" size="sm">Advisory</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'environmental':
        return <Flame className="w-4 h-4 text-amber-600" />;
      case 'device':
        return <Radio className="w-4 h-4 text-[#0A6847]" />;
      case 'sensor':
        return <Cpu className="w-4 h-4 text-blue-600" />;
      case 'connection':
        return <WifiOff className="w-4 h-4 text-slate-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const newAlertsCount = alerts.filter((a) => a.status === 'new').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#0A6847]" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
              Environmental Risk & Device Alerts
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            Predictive particulate warnings, localized spikes, and hardware connection state notices
          </p>
        </div>

        {newAlertsCount > 0 && (
          <button
            type="button"
            onClick={handleAcknowledgeAll}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Acknowledge All ({newAlertsCount})</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter alerts by title, message, or location..."
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0A6847]/20 focus:border-[#0A6847]"
            />
          </div>
        </div>

        {/* Severity and Status Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Severity:
            </span>
            {(['all', 'critical', 'high', 'moderate', 'low'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSeverityFilter(s)}
                className={`px-2.5 py-1 rounded-lg capitalize font-semibold transition-colors cursor-pointer border ${
                  severityFilter === s
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {s === 'all' ? 'All Severities' : s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Status:
            </span>
            {(['all', 'new', 'acknowledged', 'resolved'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg capitalize font-semibold transition-colors cursor-pointer border ${
                  statusFilter === st
                    ? 'bg-[#0A6847] text-white border-[#0A6847]'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st === 'all' ? 'All Statuses' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      {isLoading ? (
        <LoadingState message="Checking alert queues..." subMessage="Synchronizing sensor alert events" />
      ) : alerts.length === 0 ? (
        <EmptyState
          title="No alerts match your current filter"
          description="Your surrounding environmental conditions are within stable parameters, and no hardware anomalies are reported."
        />
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                alert.status === 'new'
                  ? 'border-amber-300 ring-1 ring-amber-100 bg-amber-50/20'
                  : 'border-slate-200/90'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                {/* Alert Body */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="p-1 rounded-md bg-slate-100">
                      {getCategoryIcon(alert.category)}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {alert.category}
                    </span>
                    <span className="text-slate-300">•</span>
                    {getSeverityBadge(alert.severity)}
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        alert.status === 'new'
                          ? 'bg-red-100 text-red-800'
                          : alert.status === 'acknowledged'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {alert.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                    {alert.message}
                  </p>

                  {/* Related Readings Pill Grid */}
                  {alert.relatedReadings && alert.relatedReadings.length > 0 && (
                    <div className="pt-2 flex items-center gap-2 flex-wrap">
                      {alert.relatedReadings.map((r, i) => (
                        <div
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-slate-100/90 border border-slate-200/80 text-[11px] font-mono text-slate-700"
                        >
                          <span className="text-slate-400 font-sans mr-1">{r.metric}:</span>
                          <span className="font-bold text-slate-900">{r.value}</span>
                          {r.threshold && (
                            <span className="text-slate-400 text-[10px] ml-1">
                              (limit: {r.threshold})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Location & Time */}
                  <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {alert.date} at {alert.timestamp}
                    </span>
                    {alert.locationName && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {alert.locationName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                  {alert.status === 'new' && (
                    <button
                      type="button"
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  )}
                  {alert.status !== 'resolved' && (
                    <button
                      type="button"
                      onClick={() => handleResolve(alert.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0A6847] hover:bg-[#085338] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
