import { Injectable } from '@nestjs/common';
import { basename } from 'path';
import {
  IObjectStorageProvider,
  isErr,
  isOk,
  ok,
  Result,
} from '@healthflow/shared';
import { MedicalExam } from '../../domain/entities/medical-exam.entity';
import { ExamProcessingQueuePort } from '../../domain/ports/exam-processing-queue.port';
import { MedicalExamRepository } from '../../domain/repositories/medical-exam.repository';
import { UploadExamCommand } from '../commands/upload-exam.command';

@Injectable()
export class UploadExamUseCase {
  constructor(
    private readonly medicalExamRepository: MedicalExamRepository,
    private readonly examProcessingQueue: ExamProcessingQueuePort,
    private readonly objectStorage: IObjectStorageProvider,
  ) {}

  async execute(command: UploadExamCommand) {
    const exam = MedicalExam.create({
      fileName: command.fileName,
      mimeType: command.mimeType,
      fileSize: command.fileSize,
      storagePath: null,
    });

    const objectKeyResult = await this.getObjectKey(exam, command.fileBuffer);

    if (!isOk(objectKeyResult)) {
      return objectKeyResult;
    }

    const { value: storageKey } = objectKeyResult;
    exam.setStoragePath(storageKey as string);

    const updatedExam = await this.medicalExamRepository.persist(exam);

    const publishExamQueuedResult =
      await this.examProcessingQueue.publishExamQueued(updatedExam.id);
    if (isErr(publishExamQueuedResult)) {
      return publishExamQueuedResult;
    }

    return {
      id: updatedExam.id,
      status: updatedExam.status,
      processingResult: updatedExam.processingResult,
    };
  }

  private async getObjectKey(
    exam: MedicalExam,
    fileBuffer: Buffer,
  ): Promise<Result<string, Error>> {
    const safeName = basename(exam.fileName).replace(/[^\w.-]+/g, '_');
    const objectKey = ['medical-exams', exam.id, safeName].join('/');

    const result = await this.objectStorage.putObject({
      key: objectKey,
      body: fileBuffer,
      contentType: exam.mimeType,
    });

    if (isErr(result)) {
      return result;
    }

    return ok(objectKey);
  }
}
