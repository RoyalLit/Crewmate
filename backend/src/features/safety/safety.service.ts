import { ValidationError } from '../../shared/errors';

import { safetyRepository } from './safety.repository';
import type { ReportRequestDTO, BlockRequestDTO, ReportResponseDTO } from './safety.types';

export class SafetyService {
  async reportUser(reporterId: string, dto: ReportRequestDTO): Promise<ReportResponseDTO> {
    if (reporterId === dto.reportedUserId) {
      throw new ValidationError('Cannot report yourself');
    }

    const report = await safetyRepository.createReport(reporterId, dto);
    
    return {
      id: report._id.toString(),
      reporterId: report.reporterId,
      reportedUserId: report.reportedUserId,
      reason: report.reason,
      status: report.status,
      createdAt: report.createdAt.toISOString(),
    };
  }

  async blockUser(userId: string, dto: BlockRequestDTO): Promise<void> {
    if (userId === dto.userIdToBlock) {
      throw new ValidationError('Cannot block yourself');
    }

    await safetyRepository.blockUser(userId, dto.userIdToBlock);
  }

  async checkIfBlocked(userId: string, targetUserId: string): Promise<boolean> {
    return safetyRepository.isUserBlocked(userId, targetUserId);
  }
}

export const safetyService = new SafetyService();
