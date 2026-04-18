import { ERole } from '@healthflow/shared';
import { EMedicalExamStatus } from '../enums/medical-exam-status.enum';
import { User } from './user.entity';
import { MedicalExam } from './medical-exam.entity';

const makeUploader = () =>
  User.fromPrimitives({
    id: 'user-attendant',
    email: 'att@hospital.com',
    role: ERole.ATTENDANT,
  });

const makeDoctor = () =>
  User.fromPrimitives({
    id: 'user-doctor',
    email: 'doc@hospital.com',
    role: ERole.DOCTOR,
  });

const makeExam = () =>
  MedicalExam.create({
    fileName: 'chest.dcm',
    mimeType: 'application/dicom',
    fileSize: 1024,
    storagePath: null,
    uploadedBy: makeUploader(),
  });

describe('MedicalExam', () => {
  describe('create', () => {
    it('should create an exam with PENDING status', () => {
      const exam = makeExam();
      expect(exam.status).toBe(EMedicalExamStatus.PENDING);
    });

    it('should assign a generated id', () => {
      const exam = makeExam();
      expect(exam.id).toBeDefined();
      expect(typeof exam.id).toBe('string');
    });

    it('should initialize report and processingResult as null', () => {
      const exam = makeExam();
      expect(exam.report).toBeNull();
      expect(exam.processingResult).toBeNull();
    });

    it('should initialize reportedBy as null', () => {
      const exam = makeExam();
      expect(exam.reportedBy).toBeNull();
    });

    it('should store fileName, mimeType, fileSize and uploadedBy', () => {
      const uploader = makeUploader();
      const exam = MedicalExam.create({
        fileName: 'scan.pdf',
        mimeType: 'application/pdf',
        fileSize: 2048,
        storagePath: null,
        uploadedBy: uploader,
      });
      expect(exam.fileName).toBe('scan.pdf');
      expect(exam.mimeType).toBe('application/pdf');
      expect(exam.fileSize).toBe(2048);
      expect(exam.uploadedBy.id).toBe(uploader.id);
    });
  });

  describe('setStoragePath', () => {
    it('should update storagePath', () => {
      const exam = makeExam();
      exam.setStoragePath('medical-exams/123/chest.dcm');
      expect(exam.storagePath).toBe('medical-exams/123/chest.dcm');
    });

    it('should update updatedAt', () => {
      const exam = makeExam();
      const before = new Date();
      exam.setStoragePath('path/to/file');
      expect(exam.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('toProcessing', () => {
    it('should change status to PROCESSING', () => {
      const exam = makeExam();
      exam.toProcessing();
      expect(exam.status).toBe(EMedicalExamStatus.PROCESSING);
    });
  });

  describe('markDone', () => {
    it('should change status to DONE and set processingResult', () => {
      const exam = makeExam();
      exam.markDone('Processing completed');
      expect(exam.status).toBe(EMedicalExamStatus.DONE);
      expect(exam.processingResult).toBe('Processing completed');
    });
  });

  describe('markError', () => {
    it('should change status to ERROR and set processingResult', () => {
      const exam = makeExam();
      exam.markError('Failed to process');
      expect(exam.status).toBe(EMedicalExamStatus.ERROR);
      expect(exam.processingResult).toBe('Failed to process');
    });
  });

  describe('reportTo', () => {
    it('should fail when exam is not in DONE status', () => {
      const exam = makeExam();
      const result = exam.reportTo('Some report', makeDoctor());
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('Exam is not in DONE status');
      }
    });

    it('should fail when exam is in PROCESSING status', () => {
      const exam = makeExam();
      exam.toProcessing();
      const result = exam.reportTo('Some report', makeDoctor());
      expect(result.ok).toBe(false);
    });

    it('should succeed when exam is in DONE status', () => {
      const exam = makeExam();
      exam.markDone('AI result');
      const doctor = makeDoctor();
      const result = exam.reportTo('No anomalies', doctor);
      expect(result.ok).toBe(true);
    });

    it('should update report, reportedBy and status to REPORTED on success', () => {
      const exam = makeExam();
      exam.markDone('AI result');
      const doctor = makeDoctor();
      exam.reportTo('No anomalies', doctor);
      expect(exam.report).toBe('No anomalies');
      expect(exam.reportedBy?.id).toBe(doctor.id);
      expect(exam.status).toBe(EMedicalExamStatus.REPORTED);
    });
  });
});
