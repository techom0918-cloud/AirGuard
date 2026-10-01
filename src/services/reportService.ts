import { DoctorReport } from '../types';
import { mockDefaultDoctorReport } from '../data/mockReports';
import { mockEvents } from '../data/mockEvents';
import { medicationService } from './medicationService';

class ReportService {
  private currentReport: DoctorReport = { ...mockDefaultDoctorReport };

  public async getDoctorReport(dateRange?: { start: string; end: string }): Promise<DoctorReport> {
    await new Promise((r) => setTimeout(r, 200));

    const activePatient = medicationService.getActivePatient();
    const patientName = activePatient?.name || 'Patient';

    const report: DoctorReport = {
      ...this.currentReport,
      userName: patientName,
      userIdentifier: `AG-PT-${activePatient?.id?.slice(-5).toUpperCase() || '88219'}`,
    };

    if (dateRange) {
      return {
        ...report,
        dateRange,
        eventsIncluded: mockEvents.slice(0, 5),
      };
    }
    return report;
  }

  public async generateDoctorShareCode(): Promise<string> {
    await new Promise((r) => setTimeout(r, 200));
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `AG-CLINIC-${randomSuffix}`;
  }

  public async exportReport(format: 'pdf' | 'csv' | 'json'): Promise<{ downloadUrl: string; filename: string }> {
    await new Promise((r) => setTimeout(r, 300));
    const activePatient = medicationService.getActivePatient();
    const safeName = (activePatient?.name || 'Patient').replace(/\s+/g, '_');
    return {
      downloadUrl: '#',
      filename: `AirGuard_${safeName}_Clinical_Report_${this.currentReport.dateRange.start}_to_${this.currentReport.dateRange.end}.${format}`,
    };
  }
}

export const reportService = new ReportService();
