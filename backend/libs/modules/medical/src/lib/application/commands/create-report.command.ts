export class CreateReportCommand {
  private readonly _report: string;
  private readonly _examId: string;

  constructor(examId: string, report: string) {
    if (!examId?.trim()) {
      throw new Error('Exam id is required');
    }
    if (!report?.trim()) {
      throw new Error('Report is required');
    }
    this._examId = examId.trim();
    this._report = report.trim();
  }

  get report(): string {
    return this._report;
  }

  get examId(): string {
    return this._examId;
  }
}
