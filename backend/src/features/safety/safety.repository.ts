import type { IReport } from '../../db/models/Report';
import { ReportModel } from '../../db/models/Report';
import type { IUser } from '../../db/models/User';
import { UserModel } from '../../db/models/User';

import type { ReportRequestDTO } from './safety.types';

export class SafetyRepository {
  async createReport(reporterId: string, dto: ReportRequestDTO): Promise<IReport> {
    const report = new ReportModel({
      reporterId,
      reportedUserId: dto.reportedUserId,
      reason: dto.reason,
    });
    
    await report.save();
    return report.toObject() as IReport;
  }

  async blockUser(userId: string, targetUserId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { blockedUsers: targetUserId }
    });
  }

  async isUserBlocked(userId: string, targetUserId: string): Promise<boolean> {
    const user = await UserModel.findById(userId).lean() as IUser | null;
    if (!user || !user.blockedUsers) return false;
    
    return user.blockedUsers.some(id => id.toString() === targetUserId.toString());
  }
}

export const safetyRepository = new SafetyRepository();
