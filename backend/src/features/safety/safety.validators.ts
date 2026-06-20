import { z } from 'zod';

import type { ReportRequestDTO, BlockRequestDTO } from './safety.types';

const reportSchema = z.object({
  reportedUserId: z.string().min(1, "Reported user ID is required"),
  reason: z.string().min(5, "Reason must be at least 5 characters long").max(1000, "Reason is too long"),
});

export function validateReportRequest(data: unknown): ReportRequestDTO {
  return reportSchema.parse(data);
}

const blockSchema = z.object({
  userIdToBlock: z.string().min(1, "User ID to block is required"),
});

export function validateBlockRequest(data: unknown): BlockRequestDTO {
  return blockSchema.parse(data);
}
