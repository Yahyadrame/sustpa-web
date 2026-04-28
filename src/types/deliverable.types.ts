export type DeliverableStatus = "PENDING" | "APPROVED" | "REVISION_REQUESTED";
// CORRECTION : 'SUBMITTED' supprimé — cohérent avec le schema backend

export interface Deliverable {
  id: string;
  milestoneId: string;
  projectId: string;
  studentId: string;
  title: string;
  version: number;
  fileUrl: string;
  filePublicId: string;
  // CORRECTION : number et non string — integer() côté Drizzle, number côté JS
  fileSize: number;
  mimeType: string;
  status: DeliverableStatus;
  createdAt: string;
  updatedAt: string;
  // Enrichis par findDeliverableById
  signedUrl?: string;
  versions?: Deliverable[];
  reviews?: DeliverableReview[];
}

export interface DeliverableReview {
  id: string;
  deliverableId: string;
  reviewerId: string;
  // CORRECTION : nullable — null = commentaire libre, valeur = décision de validation
  status: DeliverableStatus | null;
  comment: string | null;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: string | null;
  createdAt: string;
}
