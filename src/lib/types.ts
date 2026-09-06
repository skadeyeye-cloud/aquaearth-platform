export type AccessTier = 'SUPERADMIN' | 'ADMIN' | 'STANDARD';
export type ManagementTier = 'NONE' | 'TEAM_LEAD' | 'LINE_MANAGER' | 'DEPT_HEAD';

export type FunctionalRole =
  | 'SUPERADMIN'
  | 'MANAGING_CONSULTANT'
  | 'BD_LEAD'
  | 'PROJECT_MANAGER'
  | 'TECHNICAL_CONSULTANT'
  | 'FIELD_STAFF'
  | 'QA_LEAD'
  | 'COMPLIANCE_OFFICER'
  | 'HR_ADMIN'
  | 'FINANCE_ADMIN'
  | 'IT_LEAD'
  | 'DESIGN_LEAD'
  | 'IT_DESIGN_OFFICER';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  jobTitle: string;
  functionalRole: FunctionalRole;
  accessTier: AccessTier;
  managementTier: ManagementTier;
  departmentId?: string;
  departmentName?: string;
  managerId?: string;
  managerName?: string;
  status: 'ACTIVE' | 'DEACTIVATED';
  createdAt: string;
}

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  avatar?: string;
  text: string;
  timestamp: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  moduleOrigin: 'PROJECT' | 'FIELD' | 'IT' | 'DESIGN' | 'QA' | 'BD' | 'COMPLIANCE';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string;
  completedAt?: string;
  blockedReason?: string;
  assigneeId: string;
  assigneeName?: string;
  projectId?: string;
  projectName?: string;
  estimatedHours?: number;
  loggedHours?: number;
  approvalStatus?: 'APPROVED' | 'PENDING_APPROVAL' | 'REJECTED';
  progressPercent?: number;
  assignedById?: string;
  assignedByName?: string;
  managerId?: string;
  managerName?: string;
  rejectionReason?: string;
  comments?: TaskComment[];
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  requesterId: string;
  requesterName: string;
  requesterDept: string;
  category: 'IT_SUPPORT' | 'REPAIR' | 'PROCUREMENT' | 'DESIGN';
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'SUBMITTED' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DELIVERED' | 'RESOLVED' | 'CLOSED';
  assignedToId?: string;
  assignedToName?: string;
  assetId?: string;
  estimatedCost?: number;
  finalCost?: number;
  isTemplate?: boolean;
  deliverableUrl?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface CertificationItem {
  id: string;
  userId: string;
  userName: string;
  name: string;
  issuingBody: string;
  issueDate: string;
  expiryDate: string;
  certNumber?: string;
  verified: boolean;
  daysUntilExpiry: number;
}

export interface LeaveItem {
  id: string;
  userId: string;
  userName: string;
  leaveType: 'ANNUAL' | 'SICK' | 'CASUAL' | 'MATERNITY' | 'PATERNITY';
  startDate: string;
  endDate: string;
  daysCount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason?: string;
  createdAt: string;
}

export interface KpiLeaderboardEntry {
  userId: string;
  name: string;
  avatar?: string;
  jobTitle: string;
  departmentName: string;
  totalScore: number;
  completedCount: number;
  onTimeCount: number;
  overdueCount: number;
  rankPosition: number;
  monthYear: string;
}

export interface AuditRecord {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId?: string;
  details: string;
  timestamp: string;
}

export type OpportunityStage = 
  | 'IDENTIFIED' 
  | 'QUALIFYING' 
  | 'PROPOSAL_DRAFTING' 
  | 'SUBMITTED' 
  | 'WON' 
  | 'LOST';

export interface OpportunityItem {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  serviceLines: string[];
  estimatedValue: number;
  currency: 'NGN' | 'USD' | 'EUR' | 'GBP';
  stage: OpportunityStage;
  source: string;
  submissionDeadline: string;
  decisionDate?: string;
  bdOwnerId: string;
  bdOwnerName: string;
  technicalLeadId?: string;
  technicalLeadName?: string;
  requiresLeadershipApproval?: boolean;
  isApprovedByLeadership?: boolean;
  winLossReason?: string;
  winningCompetitor?: string;
  convertedProjectId?: string;
  proposalDocName?: string;
  createdAt: string;
}

export interface ClientAccount {
  id: string;
  name: string;
  type: 'CLIENT' | 'REGULATOR' | 'STAKEHOLDER';
  industry: string;
  primaryContact: {
    name: string;
    role: string;
    email: string;
    phone: string;
    preferredChannel: 'EMAIL' | 'PHONE' | 'WHATSAPP' | 'IN_PERSON';
  };
  secondaryContacts?: Array<{
    name: string;
    role: string;
    email: string;
    phone: string;
  }>;
  address: string;
  activeProjectsCount: number;
  totalRevenueBilled: number;
  status: 'ACTIVE' | 'DORMANT' | 'FLAGGED';
  lastActivityDate: string;
  communicationsLog: Array<{
    id: string;
    date: string;
    author: string;
    channel: string;
    summary: string;
    projectTag?: string;
  }>;
}

// Module 4: Project Management Types
export type ProjectHealth = 'ON_TRACK' | 'AT_RISK' | 'DELAYED';
export type ProjectStatus = 'MOBILIZATION' | 'ACTIVE' | 'IN_REVIEW' | 'COMPLETED' | 'CLOSED_OUT' | 'ON_HOLD';

export interface ProjectMilestone {
  id: string;
  name: string;
  workstream: string;
  targetDate: string;
  actualDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  isGatePrerequisite?: boolean;
  deliverablesCount: number;
}

export interface ProjectWorkstream {
  id: string;
  serviceLine: string;
  leadName: string;
  progressPercent: number;
  milestones: ProjectMilestone[];
}

export interface ProjectRecord {
  id: string;
  projectCode: string;
  title: string;
  clientId: string;
  clientName: string;
  serviceLines: string[];
  contractValue: number;
  currency: 'NGN' | 'USD' | 'EUR' | 'GBP';
  status: ProjectStatus;
  health: ProjectHealth;
  healthReason?: string;
  startDate: string;
  targetEndDate: string;
  leadPmId: string;
  leadPmName: string;
  progressPercent: number;
  budgetSpent: number;
  vaultStorageTier: 'ACTIVE_VAULT' | 'COLD_ARCHIVE';
  storageSizeGb: number;
  workstreams: ProjectWorkstream[];
  createdAt: string;
}

// Module 5: Field Data Capture Types
export type FieldFormType = 'BOREHOLE_LOG' | 'WATER_SAMPLING' | 'ECOLOGY_TRANSECT' | 'METOCEAN_READING';

export interface FieldRecordItem {
  id: string;
  formType: FieldFormType;
  projectId: string;
  projectName: string;
  samplePointId: string;
  technicianId: string;
  technicianName: string;
  timestamp: string;
  gps: {
    lat: number;
    lng: number;
    elevationM: number;
    accuracyM: number;
  };
  payload: Record<string, any>;
  photoUrls: string[];
  watermarkText: string;
  syncStatus: 'SYNCED' | 'LOCAL_QUEUED';
  isLockedForQA: boolean;
}

// Module 6: Document Repository Types
export type DocumentCategory = 
  | 'TECHNICAL_REPORT' 
  | 'PROPOSAL' 
  | 'LAB_CERTIFICATE' 
  | 'REGULATORY_PERMIT' 
  | 'GIS_MAP' 
  | 'FIELD_LOG';

export interface DocumentItem {
  id: string;
  title: string;
  documentNumber: string;
  projectId?: string;
  projectName?: string;
  category: DocumentCategory;
  version: string;
  fileSizeMb: number;
  authorName: string;
  qaStatus: 'DRAFT_WATERMARKED' | 'IN_REVIEW' | 'QA_APPROVED' | 'RELEASED_TO_CLIENT';
  storageTier: 'ACTIVE_VAULT' | 'COLD_ARCHIVE';
  uploadedAt: string;
  downloadUrl: string;
}

// Module 7: QA/QC Review Chains
export type QaReviewStage = 
  | 'AUTHOR_SUBMITTED' 
  | 'PEER_REVIEW' 
  | 'QA_LEAD_REVIEW' 
  | 'LEADERSHIP_SIGNOFF' 
  | 'APPROVED_RELEASED' 
  | 'REVISION_REQUESTED';

export interface QaReviewItem {
  id: string;
  documentId: string;
  documentTitle: string;
  projectCode: string;
  authorId: string;
  authorName: string;
  stage: QaReviewStage;
  slaDeadline: string;
  isOverdue: boolean;
  peerReviewerId?: string;
  peerReviewerName?: string;
  qaLeadId?: string;
  qaLeadName?: string;
  managingConsultantSigned: boolean;
  tamperProofCertificateHash?: string;
  reviewNotes: Array<{
    author: string;
    role: string;
    timestamp: string;
    comment: string;
    action: 'APPROVED' | 'REJECTED' | 'COMMENTED';
  }>;
  createdAt: string;
}

// Module 8: Regulatory Compliance
export type RegulatoryBody = 'FMEnv' | 'NESREA' | 'NUPRC' | 'STATE_MOE' | 'NIWA';

export interface CompliancePermit {
  id: string;
  permitTitle: string;
  permitNumber: string;
  regulatoryBody: RegulatoryBody;
  projectId?: string;
  projectName?: string;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'RENEWAL_IN_PROGRESS';
  issueDate: string;
  expiryDate: string;
  daysRemaining: number;
  statutoryFeeNgn: number;
  feeReconciled: boolean;
  isRecurringCycle: boolean;
  cycleDurationYears: number;
  officerInCharge: string;
  stampedCertificateUrl?: string;
}

// Module 10: Finance & Invoicing Types
export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  milestoneDescription: string;
  subtotalNgn: number;
  vatRatePercent: number; // 7.5% default in Nigeria
  vatAmountNgn: number;
  whtRatePercent: number; // 5% (services) or 10% (contracts)
  whtDeductionNgn: number;
  netPayableNgn: number;
  whtCreditNoteReceived: boolean;
  whtCreditNoteNumber?: string;
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
  currency: 'NGN' | 'USD' | 'EUR' | 'GBP';
}

// Module 12: IT & Design Operations
export interface HardwareAsset {
  id: string;
  assetTag: string;
  name: string;
  category: 'LAPTOP' | 'SURVEY_DGPS' | 'DRONE' | 'WATER_PROBE' | 'SERVER_NODE';
  assignedToName: string;
  assignedToDept: string;
  purchaseDate: string;
  status: 'OPERATIONAL' | 'IN_REPAIR' | 'DECOMMISSIONED';
  location: string;
}

export interface SubscriptionItem {
  id: string;
  serviceName: string;
  provider: string;
  category: 'CONNECTIVITY' | 'SOFTWARE_LICENSE' | 'CLOUD_INFRASTRUCTURE';
  renewalDate: string;
  daysRemaining: number;
  monthlyCostNgn: number;
  assignedUnit: string;
  status: 'ACTIVE' | 'EXPIRING_SOON';
}

export interface DesignRequest {
  id: string;
  requestNumber: string;
  title: string;
  projectId?: string;
  requesterName: string;
  is24hRush: boolean;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  deliverableUrl?: string;
  createdAt: string;
}

// Module 11: Executive Reporting & Digest
export interface ExecutiveDigestConfig {
  emailRecipients: string[];
  scheduleDay: 'MONDAY' | 'FRIDAY' | 'FIRST_OF_MONTH';
  scheduleTime: string;
  lastSentTimestamp: string;
  activeMetrics: string[];
}

export interface AccessRequestItem {
  id: string;
  fullName: string;
  email: string;
  jobTitle: string;
  departmentName: string;
  professionalLicense?: string;
  assignedProjectCode?: string;
  justification: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export type NotificationCategory = 'APPROVAL' | 'DEADLINE' | 'QA_REVIEW' | 'COMPLIANCE' | 'KPI_ALERT' | 'SYSTEM';

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  description?: string;
  timestamp: string;
  isRead: boolean;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  actionType?: 'APPROVE_BID' | 'REVIEW_QA' | 'RENEW_PERMIT' | 'VIEW_TASK';
  actionTargetId?: string;
  actionLabel?: string;
  actionUrl?: string;
  actionDone?: boolean;
}

export interface AttendanceRecordItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  date: string;
  clockInTime: string;
  clockOutTime?: string;
  locationTag: string;
  status: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'OVERTIME';
  kpiAwarded: number;
  coordinates?: string;
  notes?: string;
}

export interface PresenceUser {
  id: string;
  name: string;
  avatar: string;
  jobTitle: string;
  activeModule: string;
  activeItemTitle?: string;
  location?: string;
  status: 'ONLINE' | 'ACTIVE' | 'IDLE';
  lastPing: string;
}

export interface PushNotificationEvent {
  id: string;
  title: string;
  body: string;
  icon?: string;
  category: 'TASK_APPROVAL' | 'LEAVE_APPROVAL' | 'BID_SIGN_OFF' | 'QA_ALERT' | 'SYSTEM';
  targetId?: string;
  targetUrl?: string;
  timestamp: string;
  actorName: string;
  actorAvatar?: string;
  canQuickApprove?: boolean;
}

