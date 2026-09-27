import { DoctorReport } from '../types';
import { mockDefaultDoctorReport } from '../data/mockReports';
import { mockEvents } from '../data/mockEvents';

class ReportService {
  private currentReport: DoctorReport = { ...mockDefaultDoctorReport };

  public async getDoctorReport(dateRange?: { start: string; end: string }): Promise<DoctorReport> {
    await new Promise((r) => setTimeout(r, 250));
    if (dateRange) {
      return {
        ...this.currentReport,
        dateRange,
        eventsIncluded: mockEvents.slice(0, 5),
      };
    }
    return { ...this.currentReport };
  }

  public async generateDoctorShareCode(): Promise<string> {
    await new Promise((r) => setTimeout(r, 300));
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `AG-CLINIC-${randomSuffix}`;
  }

  public async exportReport(format: 'pdf' | 'csv' | 'json'): Promise<{ downloadUrl: string; filename: string }> {
    await new Promise((r) => setTimeout(r, 400));
    return {
      downloadUrl: '#',
      filename: `AirGuard_Environmental_Summary_${this.currentReport.dateRange.start}_to_${this.currentReport.dateRange.end}.${format}`,
    };
  }
}

export const reportService = new ReportService();
