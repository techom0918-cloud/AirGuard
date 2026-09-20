import React, { useEffect, useState } from 'react';
import { DoctorReport } from '../../types';
import { reportService } from '../../services/reportService';
import { Badge } from '../../components/common/Badge';
import { LoadingState } from '../../components/common/LoadingState';
import {
  Share2,
  Download,
  Calendar,
  CheckCircle2,
  Copy,
  Info,
  Printer,
  Sparkles,
} from 'lucide-react';

export const DoctorSharePage: React.FC = () => {
  const [report, setReport] = useState<DoctorReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [shareCode] = useState<string>('AG-CLINIC-7741');
  const [copied, setCopied] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Filter options
  const [dateRangeSelection, setDateRangeSelection] = useState<'7d' | '14d' | '30d'>('7d');
  const [includeAISummary, setIncludeAISummary] = useState<boolean>(true);
  const [includeActuations, setIncludeActuations] = useState<boolean>(true);
  const [includeGeoClusters, setIncludeGeoClusters] = useState<boolean>(true);

  useEffect(() => {
    reportService.getDoctorReport().then((data) => {
      setReport(data);
      setIsLoading(false);
    });
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    const res = await reportService.exportReport(format);
    setExportNotice(`Generated ${format.toUpperCase()} export: ${res.filename}`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !report) {
    return (
      <div className="py-12 max-w-7xl mx-auto">
        <LoadingState
          message="Formatting Clinical Exposure Report..."
          subMessage="Aggregating particulate metrics and physician discussion points"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Action & Access Code Bar (Replaces duplicate page header) */}
      <div className="no-print bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0A6847] flex items-center justify-center shrink-0 border border-emerald-100">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Direct Clinical Access Code
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-[#0A6847] border border-emerald-200">
                Active Session
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Share this code with your doctor for read-only environmental exposure review during consultations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Access Code pill + Copy */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
            <span className="font-mono text-sm sm:text-base font-bold text-slate-900 px-2.5 py-1">
              {shareCode}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200/80 shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
              title="Copy access code"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1" />

          {/* Action Buttons */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button
            type="button"
            onClick={() => handleExport('pdf')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#0A6847] hover:bg-[#085338] rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="no-print p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#0A6847]" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Report Configuration Controls */}
      <div className="no-print bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        {/* Date span */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-700">Observation Window:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['7d', '14d', '30d'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDateRangeSelection(r)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  dateRangeSelection === r
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Past {r.replace('d', ' Days')}
              </button>
            ))}
          </div>
        </div>

        {/* Section toggles */}
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 font-medium">
            <input
              type="checkbox"
              checked={includeAISummary}
              onChange={(e) => setIncludeAISummary(e.target.checked)}
              className="rounded text-[#0A6847] focus:ring-[#0A6847] accent-[#0A6847] w-4 h-4"
            />
            <span>AI Pattern Synthesis</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 font-medium">
            <input
              type="checkbox"
              checked={includeActuations}
              onChange={(e) => setIncludeActuations(e.target.checked)}
              className="rounded text-[#0A6847] focus:ring-[#0A6847] accent-[#0A6847] w-4 h-4"
            />
            <span>Inhalation Actuations</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 font-medium">
            <input
              type="checkbox"
              checked={includeGeoClusters}
              onChange={(e) => setIncludeGeoClusters(e.target.checked)}
              className="rounded text-[#0A6847] focus:ring-[#0A6847] accent-[#0A6847] w-4 h-4"
            />
            <span>Geospatial Exposure Zones</span>
          </label>
        </div>
      </div>

      {/* Clinical Report Preview Container (Paper-style Presentation with Responsive Padding) */}
      <div 
        id="clinical-report-sheet" 
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm sm:shadow-md p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8 print:p-0 print:border-none print:shadow-none print:rounded-none"
      >
        {/* Report Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-slate-200 gap-4 report-section">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#0A6847] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                AIRGUARD ENVIRONMENTAL REPORT
              </span>
              <span className="text-xs text-slate-400">Ref: {report.id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 font-['Space_Grotesk'] mt-2">
              Patient Environmental Exposure Summary
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Generated: {report.generatedAt}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-600 space-y-1 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border sm:border-none border-slate-100">
            <div>
              Patient Identifier: <strong className="text-slate-900 font-mono">{report.userIdentifier}</strong>
            </div>
            <div>
              Patient Name: <strong className="text-slate-900">{report.userName}</strong>
            </div>
            <div>
              Observation Window: <strong className="text-slate-900">{report.dateRange.start} to {report.dateRange.end}</strong>
            </div>
          </div>
        </div>

        {/* Executive Environmental Summary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 report-section">
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Recorded Alerts
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Space_Grotesk'] block mt-0.5">
              {report.totalEvents}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Across observation window</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Mean PM2.5 Exposure
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Space_Grotesk']">
                {report.averagePm25}
              </span>
              <span className="text-xs font-medium text-slate-400">µg/m³</span>
            </div>
            <span className="text-[11px] text-emerald-700 block mt-0.5 font-medium">Within moderate limits</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Peak Acute PM2.5
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-extrabold text-red-600 font-['Space_Grotesk']">
                {report.peakPm25}
              </span>
              <span className="text-xs font-medium text-slate-400">µg/m³</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">Sep 14, 06:45 PM transit</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Inhalation Doses Logged
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#0A6847] font-['Space_Grotesk'] block mt-0.5">
              {report.inhalationCount}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Differential flow sleeve</span>
          </div>
        </div>

        {/* AI Environmental Pattern Synthesis */}
        {includeAISummary && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#F0FDF4] border border-emerald-200/90 space-y-2 report-section">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0A6847]" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                AI Environmental Pattern Synthesis
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {report.aiEnvironmentalSummary}
            </p>
          </div>
        )}

        {/* Recommended Questions for Physician Consultation */}
        <div className="space-y-3 report-section">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
            Discussion Topics for Physician Consultation
          </h3>
          <div className="space-y-2">
            {report.recommendedPhysicianQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#0A6847] font-bold flex items-center justify-center shrink-0 text-[11px]">
                  {idx + 1}
                </span>
                <span className="leading-relaxed font-medium">{q}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dominant Exposure Zones */}
        {includeGeoClusters && (
          <div className="space-y-3 report-section">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
              Dominant Micro-Environmental Zones
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {report.dominantExposureZones.map((z, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700"
                >
                  <span className="font-bold text-slate-900 block mb-0.5">Zone {idx + 1}</span>
                  <span>{z}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Timeline Table */}
        <div className="space-y-3 report-section">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
            Chronological Observation Timeline
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200/80">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                  <th className="py-2.5 px-3 whitespace-nowrap">Date / Time</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Event Classification</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Risk Level</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">PM2.5</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">VOC</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Inhaler Dose</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Location / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {report.eventsIncluded.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-800 whitespace-nowrap">
                      {evt.date} {evt.timestamp}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                      {evt.eventType}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <Badge riskLevel={evt.riskLevel} size="sm">
                        {evt.riskLevel}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 font-mono whitespace-nowrap">{evt.pm25} µg/m³</td>
                    <td className="py-2.5 px-3 font-mono whitespace-nowrap">{evt.voc} ppb</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {evt.inhalationDetected ? (
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] border border-emerald-200">
                          Logged
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">
                      {evt.location.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mandatory Clinical Disclaimer */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500 flex items-start gap-2.5 leading-relaxed report-section">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-700 font-semibold">Clinical Environmental Notice: </strong>
            AirGuard provides ambient environmental telemetry and empirical sensor correlation. It does not constitute a diagnostic device or replace spirometry, peak flow measurements, or physician clinical evaluations. Decisions regarding pharmacological therapy adjustments should be made exclusively by the licensed physician in accordance with clinical guidelines.
          </p>
        </div>
      </div>
    </div>
  );
};
