export type AccessTier = 'SUPERADMIN' | 'ADMIN' | 'STANDARD';
export type ManagementTier = 'NONE' | 'TEAM_LEAD' | 'LINE_MANAGER' | 'DEPT_HEAD';

export type FunctionalRole =
  | 'SUPERADMIN'
  | 'MANAGING_CONSULTANT'
  | 'DEPUTY_MANAGING_CONSULTANT'
  | 'CFO'
  | 'FINANCE_OFFICER'
  | 'SENIOR_CONSULTANT'
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
  password?: string;
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
  status: 'ACTIVE' | 'DEACTIVATED' | 'SUSPENDED';
  createdAt: string;
  phone?: string;
  location?: string;
  bio?: string;
  preferredTheme?: 'light' | 'dark' | 'system';
  skills?: string[];
  certificationsList?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
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

export type ProjectTaskType = 'STANDARD' | 'REPORT' | 'APPROVAL_GATE' | 'DECISION_GATE' | 'ONGOING';
export type TaskAssigneeRole = 'LEAD' | 'CONTRIBUTOR' | 'WRITER' | 'DESIGNER';

export interface TaskAssignee {
  userId: string;
  userName: string;
  role: TaskAssigneeRole;
  weightPercent?: number;
}

export interface TaskDueDateChangeRequest {
  id: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName?: string;
  oldDate: string;
  newDate: string;
  reason: string;
  requestedById: string;
  requestedByName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedById?: string;
  approvedByName?: string;
  decidedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface ProjectPauseEvent {
  id: string;
  projectId: string;
  projectName?: string;
  pausedAt: string;
  resumedAt?: string;
  reason: string;
  pausedById: string;
  pausedByName: string;
  resumedById?: string;
  resumedByName?: string;
  durationDays?: number;
}

export interface KpiBonusAward {
  id: string;
  projectId: string;
  projectName?: string;
  userId: string;
  userName: string;
  points: number; // Capped at 10
  note: string;
  awardedById: string;
  awardedByName: string;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  moduleOrigin: 'PROJECT' | 'FIELD' | 'IT' | 'DESIGN' | 'QA' | 'BD' | 'COMPLIANCE';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'BLOCKED' | 'DONE' | 'SUGGESTED' | 'COMPLETED' | 'OVERDUE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string;
  originalDueDate?: string;
  currentDueDate?: string;
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
  assignmentType?: 'INDIVIDUAL' | 'MULTIPLE' | 'DEPARTMENT';
  assigneeIds?: string[];
  assigneeNames?: string[];
  departmentId?: string;
  departmentName?: string;
  completedById?: string;
  completedByName?: string;
  completionNotes?: string;
  kpiAttributed?: boolean;
  kpiBreakdown?: {
    completerPoints?: number;
    assigneePoints?: number;
    managerPoints?: number;
    departmentPoints?: number;
  };
  comments?: TaskComment[];

  // Slate Labs V1.2 Project Milestone Module Fields
  confirmed?: boolean; // false for Suggested starter tasks, true for confirmed tasks
  taskType?: ProjectTaskType;
  stage?: string; // e.g. "01 Contracting / kick-off", "02 Preliminary / pre-mobilisation", etc.
  gateBlocks?: string[]; // e.g. ["04 Data gathering"]
  isBlockedByGate?: boolean;
  taskAssignees?: TaskAssignee[];
  isOngoing?: boolean; // For ongoing tasks with no due date (e.g. EBS Consultation)
  route?: 'ROUTE_1_PERA' | 'ROUTE_2_DETAILED_EIA'; // For Template C branching
  suggestedRole?: string;
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
  userDepartment?: string;
  leaveType: 'ANNUAL' | 'SICK' | 'CASUAL' | 'MATERNITY' | 'PATERNITY';
  startDate: string;
  endDate: string;
  daysCount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason?: string;
  createdAt: string;
  approvedById?: string;
  approvedByName?: string;
  approverRole?: string;
  approvalDate?: string;
  approverComments?: string;
}

export type KpiWorkItemType = 
  | 'PROJECT_TASK' 
  | 'FIELD_FORM' 
  | 'QA_REVIEW' 
  | 'DESIGN_ASSET' 
  | 'IT_TICKET' 
  | 'WON_TENDER';

export interface KpiWorkItemRule {
  workItemType: KpiWorkItemType;
  label: string;
  description: string;
  basePoints: number;
  onTimeBonus: number;
  overduePenaltyPerDay: number;
}

export interface KpiTierThresholds {
  needsImprovementMax: number;
  satisfactoryMin: number;
  commendableMin: number;
  exemplaryMin: number;
}

export interface KpiScoringConfig {
  rules: Record<KpiWorkItemType, KpiWorkItemRule>;
  attendanceOnTimeBonus: number;
  tierThresholds: KpiTierThresholds;
  lastUpdated?: string;
  updatedBy?: string;
}

export type PerformanceTier = 'NEEDS_IMPROVEMENT' | 'SATISFACTORY' | 'COMMENDABLE' | 'EXEMPLARY';

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
  tier?: PerformanceTier;
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
  referredByStaffId?: string;
  referredByStaffName?: string;
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
export type ProjectStatus = 'MOBILIZATION' | 'ACTIVE' | 'IN_REVIEW' | 'COMPLETED' | 'CLOSED_OUT' | 'ON_HOLD' | 'PAUSED' | 'CLOSED';
export type ProjectType = 'EIA' | 'ESIA' | 'PIAR' | 'EBS' | 'PERA_EIA_ROUTE';

export interface TemplateTaskDefinition {
  title: string;
  stage: string;
  taskType: ProjectTaskType;
  suggestedRole: TaskAssigneeRole;
  dueOffsetDays: number;
  gateBlocks?: string[];
  isApprovalGate?: boolean;
  isDecisionGate?: boolean;
  isOngoing?: boolean;
  route?: 'ROUTE_1_PERA' | 'ROUTE_2_DETAILED_EIA';
}

export interface ProjectTemplateDefinition {
  id: string;
  projectType: ProjectType;
  version: string;
  name: string;
  description: string;
  tasks: TemplateTaskDefinition[];
}

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

  // Slate Labs V1.2 Project Milestone Extensions
  projectType?: ProjectType;
  projectManagerId?: string;
  projectManagerName?: string;
  teamMemberIds?: string[];
  isPaused?: boolean;
  pausedAt?: string;
  pauseReason?: string;
  totalPausedDays?: number;
  templateId?: string;
  selectedRoute?: 'ROUTE_1_PERA' | 'ROUTE_2_DETAILED_EIA';
  description?: string;
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
  preparedByName?: string;
  confirmedWithDrK?: boolean;
  confirmedAt?: string;
  paymentReceiptUrl?: string;
}

// Module 12: IT & Design Operations
export interface HardwareAsset {
  id: string;
  assetTag: string;
  name: string;
  serialNumber?: string;
  category: 'LAPTOP' | 'SURVEY_DGPS' | 'DRONE' | 'WATER_PROBE' | 'SERVER_NODE';
  assignedToId?: string;
  assignedToName: string;
  assignedToDept: string;
  purchaseDate: string;
  status: 'OPERATIONAL' | 'IN_REPAIR' | 'DECOMMISSIONED' | 'IN_STORAGE';
  location: string;
  condition?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'MAINTENANCE_REQUIRED';
  history?: Array<{ 
    date: string; 
    action: 'CREATED' | 'ASSIGNED' | 'RETRIEVED' | 'REASSIGNED' | 'MAINTENANCE'; 
    staffName: string; 
    notes?: string 
  }>;
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

export type NotificationCategory = 'APPROVAL' | 'DEADLINE' | 'QA_REVIEW' | 'COMPLIANCE' | 'KPI_ALERT' | 'SYSTEM' | 'FINANCE' | 'EXECUTIVE' | 'TASK';

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  description?: string;
  timestamp: string;
  isRead: boolean;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  actionType?: 'APPROVE_BID' | 'REVIEW_QA' | 'RENEW_PERMIT' | 'VIEW_TASK' | 'VIEW_BUDGET' | 'VIEW_PROJECT';
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

// Module 6 & 8: Document Folders (IT & Admin Governed)
export interface DocumentFolder {
  id: string;
  name: string;
  department: string;
  description: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  isRestricted?: boolean;
  itemCount?: number;
}

// Module 10: Budget Requests Workflow & SOP
export type BudgetCategory = 
  | 'FIELD_EXPEDITION' 
  | 'EQUIPMENT_PROCUREMENT' 
  | 'SOFTWARE_LICENSES' 
  | 'SUBCONTRACTOR' 
  | 'OPERATIONAL_EXPENSE'
  | 'CLIENT_PROJECT_DELIVERY'
  | 'MISCELLANEOUS';

export type BudgetType = 'DEPARTMENTAL' | 'CLIENT_FACING';
export type BudgetFrequency = 'WEEKLY' | 'PER_PROJECT';
export type BudgetApprovalStage = 
  | 'DRAFT' 
  | 'IN_COLLATION' 
  | 'WITH_OZIOMA'
  | 'CFO_REVIEW' 
  | 'MD_PENDING' 
  | 'APPROVED' 
  | 'DECLINED';
export type BudgetDeclineOutcome = 'REVISE_RESUBMIT' | 'DROPPED';

export type BudgetRequestStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'DECLINED';

export interface BudgetRequest {
  id: string;
  requestNumber: string;
  title: string;
  department: string;
  requestedById: string;
  requestedByName: string;
  amountNgn: number;
  category: BudgetCategory;
  justification: string;
  status: BudgetRequestStatus;
  budgetType?: BudgetType;
  frequency?: BudgetFrequency;
  projectId?: string;
  projectName?: string;
  collatedById?: string;
  collatedByName?: string;
  collationNotes?: string;
  cfoReviewStatus?: 'PENDING' | 'IN_REVIEW' | 'CFO_VETTED' | 'VETTED_PROJECTED' | 'DECLINED_REVISE' | 'DECLINED_DROP';
  cfoReviewNotes?: string;
  cfoReviewedAt?: string;
  presentedToMdBy?: 'ERICA' | 'OZIOMA';
  approvalStage?: BudgetApprovalStage;
  approvedById?: string;
  approvedByName?: string;
  approvedOnBehalfOfDrK?: boolean;
  drKNotified?: boolean;
  declineOutcome?: BudgetDeclineOutcome;
  miscellaneousAmountNgn?: number;
  miscellaneousJustification?: string;
  reviewedById?: string;
  reviewedByName?: string;
  reviewComments?: string;
  reviewedAt?: string;
  createdAt: string;
}

// Petty Cash Operations (SOP Section 4)
export type PettyCashCustodian = 'GIFT' | 'MARVELOUS';
export type PettyCashCategory = 
  | 'WATER_PURCHASE' 
  | 'TRANSPORTATION_UBER' 
  | 'MINOR_OPERATIONAL' 
  | 'OFFICE_SUPPLIES' 
  | 'EMERGENCY_FIELD';

export interface PettyCashFund {
  id: string;
  custodian: PettyCashCustodian;
  custodianName: string;
  allocatedAmountNgn: number;
  currentBalanceNgn: number;
  allocatedBy: string;
  lastReplenishedDate: string;
}

export interface PettyCashTransaction {
  id: string;
  fundCustodian: PettyCashCustodian;
  date: string;
  amountNgn: number;
  category: PettyCashCategory;
  description: string;
  receiptUrl?: string;
  approvedByName: string;
  createdAt: string;
}

export interface PettyCashTopUpRecord {
  id: string;
  fundCustodian: PettyCashCustodian;
  amountNgn: number;
  fundingSource: string;
  referenceNumber?: string;
  notes?: string;
  authorizedByName: string;
  date: string;
  createdAt: string;
}

export interface PettyCashAnalysis {
  id: string;
  monthYear: string;
  analyzedById: string;
  analyzedByName: string;
  isPrimaryGift: boolean;
  giftOpeningBalanceNgn: number;
  giftDisbursedNgn: number;
  giftClosingBalanceNgn: number;
  marvelousOpeningBalanceNgn: number;
  marvelousDisbursedNgn: number;
  marvelousClosingBalanceNgn: number;
  totalDisbursedNgn: number;
  replenishmentRequestedNgn: number;
  status: 'DRAFT' | 'SUBMITTED_TO_DR_K' | 'APPROVED';
  approvedByDrK?: boolean;
  drKNotes?: string;
  createdAt: string;
}

// Module 9: Disciplinary Queries
export type QueryResolution = 'PROCEEDING' | 'FORMAL_WARNING' | 'CANCELLED';
export type QueryStatus = 'ISSUED' | 'RESPONSE_SUBMITTED' | 'RESOLVED';

export interface StaffQuery {
  id: string;
  queryNumber: string;
  staffId: string;
  staffName: string;
  staffDepartment: string;
  issuedById: string;
  issuedByName: string;
  title: string;
  allegationDetails: string;
  incidentDate: string;
  issuedDate: string;
  responseDeadline: string;
  status: QueryStatus;
  staffResponse?: string;
  respondedAt?: string;
  resolution?: QueryResolution;
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedById?: string;
  resolvedByName?: string;
}

// Module 9 & 10: Payroll, Bonuses & Benefits
export interface CustomBenefit {
  id: string;
  name: string;
  amountNgn: number;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  department: string;
  jobTitle: string;
  baseSalaryNgn: number;
  hazardAllowanceNgn: number;
  fieldPerDiemNgn: number;
  performanceBonusNgn: number;
  customBenefits?: CustomBenefit[];
  pensionDeductionNgn: number;
  taxPayeNgn: number;
  netPayNgn: number;
  monthYear: string;
  paymentStatus: 'DRAFT' | 'APPROVED' | 'DISBURSED';
}

// Module 9B: Onboarding & Recruitment Pipeline
export type InterviewStage = 
  | 'PROSPECTIVE' 
  | 'INTERVIEW_1' 
  | 'INTERVIEW_2' 
  | 'INTERVIEW_3' 
  | 'PROBATIONARY' 
  | 'FULL_EMPLOYMENT' 
  | 'NON_EMPLOYMENT';

export interface InterviewNote {
  stage: InterviewStage;
  interviewerId: string;
  interviewerName: string;
  date: string;
  rating: number; // 1-5
  technicalCompetency: string;
  culturalFit: string;
  recommendation: 'ADVANCE' | 'HOLD' | 'REJECT' | 'OFFER_PROBATION' | 'OFFER_FULL';
  comments: string;
}

export interface CandidateDocument {
  id: string;
  title: string;
  stage: InterviewStage;
  fileType: string;
  fileSizeMb: number;
  uploadedAt: string;
  downloadUrl: string;
}

export interface CandidateApplication {
  id: string;
  candidateNumber: string;
  fullName: string;
  email: string;
  phone: string;
  appliedRole: string;
  department: string;
  currentStage: InterviewStage;
  yearsExperience: number;
  expectedSalaryNgn?: number;
  notes: InterviewNote[];
  documents: CandidateDocument[];
  vaultFolderId?: string;
  outcome?: 'PROBATIONARY' | 'FULL_EMPLOYMENT' | 'NON_EMPLOYMENT';
  outcomeDate?: string;
  createdAt: string;
}

// Project Expense Tracking & Client Collections
export type ProjectExpenseCategory = 
  | 'FIELD_OPERATIONS'
  | 'EQUIPMENT_RENTAL'
  | 'LAB_TESTING'
  | 'LOGISTICS_TRAVEL'
  | 'SUBCONTRACTOR'
  | 'REGULATORY_PERMITS'
  | 'MATERIALS_CONSUMABLES'
  | 'MISCELLANEOUS';

export type ExpensePaymentMethod = 
  | 'BANK_TRANSFER'
  | 'PETTY_CASH'
  | 'CORPORATE_CARD'
  | 'VENDOR_CREDIT';

export type ExpenseStatus = 
  | 'PENDING'
  | 'APPROVED'
  | 'PAID'
  | 'RECONCILED';

export interface ProjectExpenseItem {
  id: string;
  expenseNumber: string;
  projectId: string;
  projectName: string;
  category: ProjectExpenseCategory;
  title: string;
  description?: string;
  amountNgn: number;
  currency: 'NGN' | 'USD' | 'EUR' | 'GBP';
  date: string;
  vendor: string;
  receiptNumber?: string;
  status: ExpenseStatus;
  paymentMethod: ExpensePaymentMethod;
  recordedById?: string;
  recordedByName: string;
  approvedByName?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface ClientReceiptItem {
  id: string;
  receiptNumber: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  amountNgn: number;
  currency: 'NGN' | 'USD' | 'EUR' | 'GBP';
  paymentDate: string;
  paymentReference: string;
  milestoneDescription: string;
  invoiceId?: string;
  whtDeductedNgn?: number;
  vatPaidNgn?: number;
  bankAccount: string;
  recordedById?: string;
  recordedByName: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface ProjectFinancialSummary {
  projectId: string;
  projectName: string;
  clientName: string;
  contractValueNgn: number;
  totalInvoicedNgn: number;
  totalReceivedNgn: number;
  totalExpensesNgn: number;
  netMarginNgn: number;
  marginPercent: number;
  burnRatePercent: number;
  collectionPercent: number;
  expensesCount: number;
  receiptsCount: number;
}



