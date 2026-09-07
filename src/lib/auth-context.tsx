'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getStoredData, setStoredData, clearDatabase } from './storage';
import { 
  UserProfile, 
  TaskItem, 
  TaskComment,
  SupportTicket, 
  LeaveItem, 
  CertificationItem, 
  KpiLeaderboardEntry, 
  AuditRecord,
  OpportunityItem,
  ClientAccount,
  OpportunityStage,
  ProjectRecord,
  FieldRecordItem,
  DocumentItem,
  QaReviewItem,
  CompliancePermit,
  QaReviewStage,
  InvoiceItem,
  HardwareAsset,
  SubscriptionItem,
  DesignRequest,
  ExecutiveDigestConfig,
  AccessRequestItem,
  NotificationItem,
  AttendanceRecordItem
} from './types';
import { 
  INITIAL_USERS, 
  INITIAL_TASKS, 
  INITIAL_TICKETS, 
  INITIAL_LEAVE, 
  INITIAL_CERTIFICATIONS, 
  INITIAL_KPI_LEADERBOARD,
  INITIAL_AUDIT_LOGS,
  INITIAL_OPPORTUNITIES,
  INITIAL_CLIENTS,
  INITIAL_PROJECTS,
  INITIAL_FIELD_RECORDS,
  INITIAL_DOCUMENTS,
  INITIAL_QA_REVIEWS,
  INITIAL_COMPLIANCE_PERMITS,
  INITIAL_INVOICES,
  INITIAL_HARDWARE_ASSETS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_DESIGN_REQUESTS,
  INITIAL_EXECUTIVE_DIGEST_CONFIG,
  INITIAL_ACCESS_REQUESTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ATTENDANCE
} from './mock-data';
import { calculateEventPoints } from './kpi-engine';

interface AuthContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isLoading: boolean;
  loadingMessage: string;
  isAuthenticated: boolean;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  tasks: TaskItem[];
  tickets: SupportTicket[];
  leaveRequests: LeaveItem[];
  certifications: CertificationItem[];
  leaderboard: KpiLeaderboardEntry[];
  auditLogs: AuditRecord[];
  opportunities: OpportunityItem[];
  clients: ClientAccount[];
  projects: ProjectRecord[];
  fieldRecords: FieldRecordItem[];
  documents: DocumentItem[];
  qaReviews: QaReviewItem[];
  compliancePermits: CompliancePermit[];
  invoices: InvoiceItem[];
  hardwareAssets: HardwareAsset[];
  subscriptions: SubscriptionItem[];
  designRequests: DesignRequest[];
  digestConfig: ExecutiveDigestConfig;
  accessRequests: AccessRequestItem[];
  notifications: NotificationItem[];
  attendanceRecords: AttendanceRecordItem[];
  todayAttendance?: AttendanceRecordItem;
  clockIn: (locationTag: string, coordinates?: string) => { success: boolean; message: string; kpiAwarded: number };
  clockOut: (notes?: string) => { success: boolean; message: string };
  loginAsUser: (user: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, newStatus: TaskItem['status']) => void;
  createTaskForApproval: (task: {
    title: string;
    description?: string;
    moduleOrigin: TaskItem['moduleOrigin'];
    priority: TaskItem['priority'];
    dueDate: string;
    assigneeId?: string;
    projectId?: string;
    projectName?: string;
    estimatedHours?: number;
    initialComment?: string;
  }) => void;
  approveTask: (taskId: string, comment?: string) => void;
  rejectTask: (taskId: string, reason: string) => void;
  addTaskComment: (taskId: string, text: string) => void;
  updateTaskProgress: (taskId: string, progressPercent: number, status?: TaskItem['status'], loggedHours?: number) => void;
  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'requesterId' | 'requesterName' | 'requesterDept' | 'createdAt'>) => void;
  submitLeaveRequest: (leave: Omit<LeaveItem, 'id' | 'userId' | 'userName' | 'status' | 'createdAt'>) => void;
  updateLeaveStatus: (leaveId: string, status: LeaveItem['status']) => void;
  updateUserStatus: (userId: string, status: 'ACTIVE' | 'DEACTIVATED') => void;
  updateUserRole: (userId: string, functionalRole: any, accessTier: any, managementTier: any) => void;
  bulkImportUsers: (records: Array<{
    name: string;
    email: string;
    jobTitle: string;
    departmentName: string;
    functionalRole?: any;
    accessTier?: any;
    managementTier?: any;
    managerEmail?: string;
    phone?: string;
    location?: string;
    skills?: string[];
    certificationsList?: string[];
  }>) => { successCount: number; errors: string[] };
  createOpportunity: (opp: Omit<OpportunityItem, 'id' | 'createdAt'>) => void;
  updateOpportunityStage: (oppId: string, newStage: OpportunityStage, reason?: string, competitor?: string) => { success: boolean; requiresApproval?: boolean };
  approveHighValueBid: (oppId: string) => void;
  convertWonToProject: (oppId: string) => string;
  addClientCommunication: (clientId: string, log: { author: string; channel: string; summary: string; projectTag?: string }) => void;
  createProject: (project: Omit<ProjectRecord, 'id' | 'createdAt'>) => void;
  closeOutAndArchiveProject: (projectId: string) => void;
  createFieldRecord: (record: Omit<FieldRecordItem, 'id' | 'timestamp' | 'watermarkText'>) => void;
  uploadDocument: (doc: Omit<DocumentItem, 'id' | 'documentNumber' | 'uploadedAt'>) => void;
  submitForQa: (docId: string, peerReviewerId: string, qaLeadId: string) => void;
  advanceQaReview: (qaId: string, action: 'APPROVED' | 'REJECTED', comment: string) => void;
  renewCompliancePermit: (permitId: string) => void;
  createInvoice: (inv: Omit<InvoiceItem, 'id' | 'invoiceNumber' | 'vatAmountNgn' | 'whtDeductionNgn' | 'netPayableNgn' | 'issuedDate'>) => void;
  markInvoicePaid: (invoiceId: string, whtCreditNumber?: string) => void;
  updateDigestRecipients: (recipients: string[]) => void;
  createDesignRequest: (req: Omit<DesignRequest, 'id' | 'requestNumber' | 'status' | 'createdAt'>) => void;
  submitAccessRequest: (req: Omit<AccessRequestItem, 'id' | 'status' | 'createdAt'>) => void;
  approveAccessRequest: (reqId: string) => void;
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  executeNotificationAction: (notifId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [leaveRequests, setLeaveRequests] = useState<LeaveItem[]>(INITIAL_LEAVE);
  const [certifications, setCertifications] = useState<CertificationItem[]>(INITIAL_CERTIFICATIONS);
  const [leaderboard, setLeaderboard] = useState<KpiLeaderboardEntry[]>(INITIAL_KPI_LEADERBOARD);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(INITIAL_AUDIT_LOGS);
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>(INITIAL_OPPORTUNITIES);
  const [clients, setClients] = useState<ClientAccount[]>(INITIAL_CLIENTS);
  const [projects, setProjects] = useState<ProjectRecord[]>(INITIAL_PROJECTS);
  const [fieldRecords, setFieldRecords] = useState<FieldRecordItem[]>(INITIAL_FIELD_RECORDS);
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [qaReviews, setQaReviews] = useState<QaReviewItem[]>(INITIAL_QA_REVIEWS);
  const [compliancePermits, setCompliancePermits] = useState<CompliancePermit[]>(INITIAL_COMPLIANCE_PERMITS);
  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);
  const [hardwareAssets, setHardwareAssets] = useState<HardwareAsset[]>(INITIAL_HARDWARE_ASSETS);
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(INITIAL_SUBSCRIPTIONS);
  const [designRequests, setDesignRequests] = useState<DesignRequest[]>(INITIAL_DESIGN_REQUESTS);
  const [digestConfig, setDigestConfig] = useState<ExecutiveDigestConfig>(INITIAL_EXECUTIVE_DIGEST_CONFIG);
  const [accessRequests, setAccessRequests] = useState<AccessRequestItem[]>(INITIAL_ACCESS_REQUESTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecordItem[]>(INITIAL_ATTENDANCE);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const isHydrated = useRef(false);

  // Safe Hydration from Persistent Storage with Defensive Data Repair
  useEffect(() => {
    try {
      const storedTasks = getStoredData<TaskItem[]>('tasks', INITIAL_TASKS);
      const sanitizedTasks = (storedTasks || []).map(t => ({
        ...t,
        comments: Array.isArray(t.comments) ? t.comments : []
      }));
      setTasks(sanitizedTasks);

      const storedAttendance = getStoredData<AttendanceRecordItem[]>('attendance', INITIAL_ATTENDANCE);
      setAttendanceRecords(storedAttendance || []);

      const storedTickets = getStoredData<SupportTicket[]>('tickets', INITIAL_TICKETS);
      setTickets(storedTickets || []);

      const storedLeave = getStoredData<LeaveItem[]>('leave', INITIAL_LEAVE);
      setLeaveRequests(storedLeave || []);

      const storedOpps = getStoredData<OpportunityItem[]>('opportunities', INITIAL_OPPORTUNITIES);
      setOpportunities(storedOpps || []);

      const storedClients = getStoredData<ClientAccount[]>('clients', INITIAL_CLIENTS);
      setClients(storedClients || []);

      const storedProjects = getStoredData<ProjectRecord[]>('projects', INITIAL_PROJECTS);
      setProjects(storedProjects || []);

      const storedField = getStoredData<FieldRecordItem[]>('field_records', INITIAL_FIELD_RECORDS);
      setFieldRecords(storedField || []);

      const storedDocs = getStoredData<DocumentItem[]>('documents', INITIAL_DOCUMENTS);
      setDocuments(storedDocs || []);

      const storedQa = getStoredData<QaReviewItem[]>('qa_reviews', INITIAL_QA_REVIEWS);
      setQaReviews(storedQa || []);

      const storedPermits = getStoredData<CompliancePermit[]>('compliance', INITIAL_COMPLIANCE_PERMITS);
      setCompliancePermits(storedPermits || []);

      const storedInvoices = getStoredData<InvoiceItem[]>('invoices', INITIAL_INVOICES);
      setInvoices(storedInvoices || []);

      const storedNotifs = getStoredData<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS);
      setNotifications(storedNotifs || []);

      const storedUsers = getStoredData<UserProfile[]>('users', INITIAL_USERS);
      setAllUsers(storedUsers || []);

      const storedAudit = getStoredData<AuditRecord[]>('audit_logs', INITIAL_AUDIT_LOGS);
      setAuditLogs(storedAudit || []);

      const storedLeaderboard = getStoredData<KpiLeaderboardEntry[]>('leaderboard', INITIAL_KPI_LEADERBOARD);
      setLeaderboard(storedLeaderboard || []);

      const savedTheme = localStorage.getItem('ae_theme') as 'light' | 'dark';
      if (savedTheme) {
        setTheme(savedTheme);
      }

      const savedUser = localStorage.getItem('ae_user_id');
      if (savedUser) {
        const u = (storedUsers || INITIAL_USERS).find(user => user.id === savedUser);
        if (u) setCurrentUser(u);
      }
    } catch (e) {
      console.warn('[AquaEarth] Storage hydration fallback:', e);
    } finally {
      isHydrated.current = true;
    }
  }, []);

  // Theme synchronization to DOM
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('ae_theme', theme);
    } catch (e) {}
  }, [theme]);

  // Database Persistence Auto-Sync
  useEffect(() => {
    if (isHydrated.current) setStoredData('tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    if (isHydrated.current) setStoredData('attendance', attendanceRecords);
  }, [attendanceRecords]);

  useEffect(() => {
    if (isHydrated.current) setStoredData('tickets', tickets);
  }, [tickets]);

  useEffect(() => {
    if (isHydrated.current) setStoredData('leave', leaveRequests);
  }, [leaveRequests]);

  useEffect(() => {
    if (isHydrated.current) setStoredData('opportunities', opportunities);
  }, [opportunities]);

  useEffect(() => {
    if (isHydrated.current) setStoredData('clients', clients);
  }, [clients]);

  useEffect(() => {
    if (isHydrated.current) setStoredData('projects', projects);
  }, [projects]);

  useEffect(() => {
    if (isHydrated.current) setStoredData('field_records', fieldRecords);
  }, [fieldRecords]);

  useEffect(() => {
    if (isHydrated.current) setStoredData('documents', documents);
  }, [documents]);

  useEffect(() => {
    if (isHydrated.current) setStoredData('qa_reviews', qaReviews);
  }, [qaReviews]);

  useEffect(() => {
    if (isHydrated.current) setStoredData('compliance', compliancePermits);
  }, [compliancePermits]);

  useEffect(() => {
    if (isHydrated.current) setStoredData('invoices', invoices);
  }, [invoices]);

  useEffect(() => {
    if (isHydrated.current) setStoredData('notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    if (isHydrated.current) setStoredData('users', allUsers);
  }, [allUsers]);

  useEffect(() => {
    if (isHydrated.current) setStoredData('audit_logs', auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    if (isHydrated.current) setStoredData('leaderboard', leaderboard);
  }, [leaderboard]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      try {
        localStorage.setItem('ae_theme', next);
      } catch (e) {}
      return next;
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceRecords.find(a => a.userId === currentUser.id && a.date === todayStr);

  const clockIn = (locationTag: string, coordinates?: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const [hours, minutes] = timeStr.split(':').map(Number);
    const isLate = hours > 8 || (hours === 8 && minutes > 15);
    const status = isLate ? 'LATE' : 'PRESENT';
    const kpiAwarded = isLate ? 0 : 10;

    const newRecord: AttendanceRecordItem = {
      id: `att-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      date: todayStr,
      clockInTime: timeStr,
      locationTag: locationTag || 'Lekki HQ',
      status,
      kpiAwarded,
      coordinates: coordinates || '6.4698°N, 3.5852°E'
    };

    setAttendanceRecords(prev => [newRecord, ...prev]);

    if (kpiAwarded > 0) {
      setLeaderboard(lPrev => {
        const updated = lPrev.map(entry => {
          if (entry.userId === currentUser.id) {
            return {
              ...entry,
              totalScore: entry.totalScore + kpiAwarded,
              onTimeCount: entry.onTimeCount + 1
            };
          }
          return entry;
        });
        return updated.sort((a, b) => b.totalScore - a.totalScore).map((item, idx) => ({ ...item, rankPosition: idx + 1 }));
      });
    }

    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'ATTENDANCE_CLOCK_IN',
      targetType: 'Attendance',
      targetId: newRecord.id,
      details: `${currentUser.name} clocked in at ${timeStr} WAT (${locationTag}). Awarded +${kpiAwarded} pts.`,
      timestamp: now.toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);

    return {
      success: true,
      message: isLate ? `Clocked in at ${timeStr} WAT (Flagged Late). 0 KPI points.` : `Punctual clock-in at ${timeStr} WAT! +10 KPI Points awarded.`,
      kpiAwarded
    };
  };

  const clockOut = (notes?: string) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    setAttendanceRecords(prev => prev.map(a => {
      if (a.userId === currentUser.id && a.date === todayStr) {
        return {
          ...a,
          clockOutTime: timeStr,
          notes: notes || a.notes
        };
      }
      return a;
    }));

    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'ATTENDANCE_CLOCK_OUT',
      targetType: 'Attendance',
      targetId: currentUser.id,
      details: `${currentUser.name} clocked out at ${timeStr} WAT.`,
      timestamp: now.toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);

    return { success: true, message: `Clocked out successfully at ${timeStr} WAT.` };
  };

  const loginAsUser = async (user: UserProfile) => {
    setIsLoading(true);
    setLoadingMessage(`Verifying credentials for ${user.name}...`);
    await new Promise(r => setTimeout(r, 400));

    setLoadingMessage(`Applying role permissions: ${user.jobTitle}...`);
    await new Promise(r => setTimeout(r, 450));

    setLoadingMessage(`Mounting sovereign vault & project cache...`);
    setCurrentUser(user);
    try {
      localStorage.setItem('ae_user_id', user.id);
    } catch (e) {}
    setIsAuthenticated(true);
    await new Promise(r => setTimeout(r, 450));

    setLoadingMessage(`Welcome, ${user.name.split(' ')[0]}. Opening Workspace...`);
    await new Promise(r => setTimeout(r, 350));
    setIsLoading(false);

    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: user.id,
      actorName: user.name,
      action: 'USER_LOGIN_SUCCESS',
      targetType: 'Session',
      targetId: user.id,
      details: `User ${user.name} (${user.email}) authenticated into AquaEarth Platform.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const logout = async () => {
    setLoadingMessage('Securing session & signing out...');
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 450));
    try {
      localStorage.removeItem('ae_user_id');
    } catch (e) {}
    setIsAuthenticated(false);
    setIsLoading(false);
  };

  const switchUser = async (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setIsLoading(true);
      setLoadingMessage(`Switching profile to ${user.name}...`);
      await new Promise(r => setTimeout(r, 400));
      setCurrentUser(user);
      try {
        localStorage.setItem('ae_user_id', user.id);
      } catch (e) {}
      setLoadingMessage(`Applying permissions for ${user.jobTitle}...`);
      await new Promise(r => setTimeout(r, 350));
      setIsLoading(false);
    }
  };

  const createTaskForApproval = (taskData: {
    title: string;
    description?: string;
    moduleOrigin: TaskItem['moduleOrigin'];
    priority: TaskItem['priority'];
    dueDate: string;
    assigneeId?: string;
    projectId?: string;
    projectName?: string;
    estimatedHours?: number;
    initialComment?: string;
  }) => {
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 16);

    // Identify user role tiers
    const isAdmin = currentUser.accessTier === 'SUPERADMIN' || 
                    currentUser.functionalRole === 'SUPERADMIN' || 
                    currentUser.functionalRole === 'MANAGING_CONSULTANT';

    const isManagerOrLead = currentUser.managementTier === 'LINE_MANAGER' || 
                            currentUser.managementTier === 'TEAM_LEAD' || 
                            currentUser.managementTier === 'DEPT_HEAD';

    // Resolve target assignee: defaults to currentUser if not specified
    const targetAssignee = (taskData.assigneeId && allUsers.find(u => u.id === taskData.assigneeId)) || currentUser;
    const isSelfAssigned = targetAssignee.id === currentUser.id;

    // Rule 1: Admins do NOT need approvals on tasks!
    // Rule 2: Admins, Team Leads, and Line Managers can assign tasks to people under them, which are pre-approved!
    // Only non-manager officers creating tasks for themselves require line manager approval.
    const needsApproval = !isAdmin && !(isManagerOrLead && !isSelfAssigned);
    const approvalStatus: TaskItem['approvalStatus'] = needsApproval ? 'PENDING_APPROVAL' : 'APPROVED';

    // Find manager for the task
    const manager = allUsers.find(u => u.id === targetAssignee.managerId) || 
                    allUsers.find(u => u.id === currentUser.managerId) || 
                    allUsers.find(u => u.id === 'usr-1') || 
                    allUsers[0];

    const initialComments: TaskComment[] = [];
    if (taskData.initialComment) {
      initialComments.push({
        id: `tc-${Date.now()}`,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorRole: currentUser.jobTitle,
        avatar: currentUser.avatar,
        text: taskData.initialComment,
        timestamp: timestampStr
      });
    }

    const newTask: TaskItem = {
      id: `tsk-${Date.now()}`,
      title: taskData.title,
      description: taskData.description,
      moduleOrigin: taskData.moduleOrigin,
      status: 'NOT_STARTED',
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      assigneeId: targetAssignee.id,
      assigneeName: targetAssignee.name,
      assignedById: currentUser.id,
      assignedByName: currentUser.name,
      projectId: taskData.projectId,
      projectName: taskData.projectName,
      estimatedHours: taskData.estimatedHours || 4,
      loggedHours: 0,
      approvalStatus,
      progressPercent: 0,
      managerId: isAdmin || (isManagerOrLead && !isSelfAssigned) ? currentUser.id : manager.id,
      managerName: isAdmin || (isManagerOrLead && !isSelfAssigned) ? currentUser.name : manager.name,
      comments: initialComments
    };

    setTasks(prev => [newTask, ...prev]);

    // Audit Record
    let auditAction = 'TASK_CREATED_FOR_APPROVAL';
    let auditDetails = '';

    if (isAdmin) {
      auditAction = 'ADMIN_TASK_CREATED';
      auditDetails = isSelfAssigned
        ? `${currentUser.name} (Admin) created task "${newTask.title}" (Pre-Approved / No Approval Required).`
        : `${currentUser.name} (Executive Admin) assigned task "${newTask.title}" to ${targetAssignee.name} (Direct Pre-Approved Assignment).`;
    } else if (isManagerOrLead && !isSelfAssigned) {
      auditAction = 'SUPERVISOR_TASK_ASSIGNED';
      auditDetails = `${currentUser.name} (${currentUser.jobTitle}) assigned task "${newTask.title}" to subordinate ${targetAssignee.name} (Pre-Approved).`;
    } else {
      auditAction = 'TASK_CREATED_FOR_APPROVAL';
      auditDetails = `${currentUser.name} submitted task "${newTask.title}" for approval to Line Manager ${manager.name}.`;
    }

    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: auditAction,
      targetType: 'Task',
      targetId: newTask.id,
      details: auditDetails,
      timestamp: now.toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);

    // Notifications
    if (approvalStatus === 'APPROVED') {
      if (!isSelfAssigned) {
        // Notify the officer that leadership assigned them a task
        const notif: NotificationItem = {
          id: `notif-${Date.now()}`,
          category: 'SYSTEM',
          title: 'New Task Assigned by Leadership',
          message: `${currentUser.name} (${currentUser.jobTitle}) assigned you a task: "${newTask.title}" (${taskData.priority} priority).`,
          isRead: false,
          priority: taskData.priority === 'URGENT' ? 'URGENT' : 'NORMAL',
          timestamp: 'Just now',
          actionType: 'VIEW_TASK',
          actionTargetId: newTask.id,
          actionLabel: 'Open My Tasks',
          actionUrl: '/tasks'
        };
        setNotifications(prev => [notif, ...prev]);
      }
    } else {
      // Notify Line Manager to review & sign off
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        category: 'APPROVAL',
        title: 'Task Awaiting Line Manager Sign-Off',
        message: `${currentUser.name} submitted "${newTask.title}" for review.`,
        isRead: false,
        priority: 'HIGH',
        timestamp: 'Just now',
        actionType: 'VIEW_TASK',
        actionTargetId: newTask.id,
        actionLabel: 'Review Task',
        actionUrl: '/tasks'
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  const approveTask = (taskId: string, comment?: string) => {
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 16);

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedComments = [...(t.comments || [])];
        if (comment) {
          updatedComments.push({
            id: `tc-${Date.now()}`,
            authorId: currentUser.id,
            authorName: currentUser.name,
            authorRole: `${currentUser.name} (Line Manager)`,
            avatar: currentUser.avatar,
            text: comment,
            timestamp: timestampStr
          });
        }
        return {
          ...t,
          approvalStatus: 'APPROVED',
          status: 'IN_PROGRESS',
          comments: updatedComments
        };
      }
      return t;
    }));

    const targetTask = tasks.find(t => t.id === taskId);
    if (targetTask) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        category: 'APPROVAL',
        title: 'Task Approved by Line Manager',
        message: `Your task "${targetTask.title}" was approved by ${currentUser.name}.`,
        isRead: false,
        priority: 'NORMAL',
        timestamp: 'Just now',
        actionType: 'VIEW_TASK',
        actionTargetId: targetTask.id
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  const rejectTask = (taskId: string, reason: string) => {
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 16);

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedComments = [...(t.comments || []), {
          id: `tc-${Date.now()}`,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorRole: `${currentUser.name} (Line Manager)`,
          avatar: currentUser.avatar,
          text: `[REVISION REQUESTED]: ${reason}`,
          timestamp: timestampStr
        }];
        return {
          ...t,
          approvalStatus: 'REJECTED',
          rejectionReason: reason,
          comments: updatedComments
        };
      }
      return t;
    }));
  };

  const addTaskComment = (taskId: string, text: string) => {
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 16);
    const newComment: TaskComment = {
      id: `tc-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.jobTitle,
      avatar: currentUser.avatar,
      text,
      timestamp: timestampStr
    };

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          comments: [...(t.comments || []), newComment]
        };
      }
      return t;
    }));
  };

  const updateTaskProgress = (taskId: string, progressPercent: number, newStatus?: TaskItem['status'], loggedHours?: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        // IMMUTABILITY DIRECTIVE: Once a task is marked as DONE, it cannot be undone, reopened, or modified
        if (t.status === 'DONE') {
          return t;
        }

        const isNowDone = progressPercent >= 100 || newStatus === 'DONE';
        const finalStatus: TaskItem['status'] = isNowDone ? 'DONE' : (newStatus || (progressPercent > 0 ? 'IN_PROGRESS' : t.status));
        const updatedTask: TaskItem = {
          ...t,
          progressPercent: isNowDone ? 100 : progressPercent,
          status: finalStatus,
          loggedHours: loggedHours !== undefined ? loggedHours : t.loggedHours,
          completedAt: isNowDone ? (t.completedAt || new Date().toISOString().split('T')[0]) : t.completedAt
        };

        if (isNowDone) {
          const nowStr = new Date().toISOString().split('T')[0];
          const pts = calculateEventPoints('PROJECT_TASK', t.dueDate, nowStr);
          
          setLeaderboard(lPrev => {
            const updated = lPrev.map(entry => {
              if (entry.userId === t.assigneeId) {
                const newTotal = entry.totalScore + pts.totalPoints;
                return {
                  ...entry,
                  totalScore: newTotal,
                  completedCount: entry.completedCount + 1,
                  onTimeCount: pts.breakdown.isOnTime ? entry.onTimeCount + 1 : entry.onTimeCount,
                  overdueCount: !pts.breakdown.isOnTime ? entry.overdueCount + 1 : entry.overdueCount
                };
              }
              return entry;
            });
            return updated.sort((a, b) => b.totalScore - a.totalScore).map((item, idx) => ({ ...item, rankPosition: idx + 1 }));
          });
        }

        return updatedTask;
      }
      return t;
    }));
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskItem['status']) => {
    // IMMUTABILITY DIRECTIVE: Cannot alter or undo status of an already completed task
    setTasks(prev => {
      const existing = prev.find(t => t.id === taskId);
      if (existing && existing.status === 'DONE') {
        return prev;
      }
      return prev;
    });
    updateTaskProgress(taskId, newStatus === 'DONE' ? 100 : newStatus === 'IN_PROGRESS' ? 50 : 0, newStatus);
  };

  const createSupportTicket = (ticketData: Omit<SupportTicket, 'id' | 'ticketNumber' | 'requesterId' | 'requesterName' | 'requesterDept' | 'createdAt'>) => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newTicket: SupportTicket = {
      ...ticketData,
      id: `tkt-${Date.now()}`,
      ticketNumber: `REQ-2026-${randomNum}`,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterDept: currentUser.departmentName || 'Operations',
      status: 'SUBMITTED',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setTickets(prev => [newTicket, ...prev]);

    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'SUPPORT_REQUEST_SUBMITTED',
      targetType: 'Support Ticket',
      targetId: newTicket.ticketNumber,
      details: `[${newTicket.category}] ${newTicket.subject}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const submitLeaveRequest = (leaveData: Omit<LeaveItem, 'id' | 'userId' | 'userName' | 'status' | 'createdAt'>) => {
    const newLeave: LeaveItem = {
      ...leaveData,
      id: `lv-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      status: 'PENDING',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setLeaveRequests(prev => [newLeave, ...prev]);
  };

  const updateLeaveStatus = (leaveId: string, status: LeaveItem['status']) => {
    setLeaveRequests(prev => prev.map(l => l.id === leaveId ? { ...l, status } : l));
  };

  const updateUserStatus = (userId: string, status: 'ACTIVE' | 'DEACTIVATED') => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: status === 'ACTIVE' ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      targetType: 'User Account',
      targetId: userId,
      details: `Account status updated to ${status}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const updateUserRole = (userId: string, functionalRole: any, accessTier: any, managementTier: any) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, functionalRole, accessTier, managementTier } : u));
    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'USER_PERMISSIONS_CHANGED',
      targetType: 'User Permissions',
      targetId: userId,
      details: `Role: ${functionalRole}, AccessTier: ${accessTier}, MgmtTier: ${managementTier}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const bulkImportUsers = (records: Array<{
    name: string;
    email: string;
    jobTitle: string;
    departmentName: string;
    functionalRole?: any;
    accessTier?: any;
    managementTier?: any;
    managerEmail?: string;
    phone?: string;
    location?: string;
    skills?: string[];
    certificationsList?: string[];
  }>) => {
    let successCount = 0;
    const errors: string[] = [];
    const newUsersList: UserProfile[] = [];

    const getDeptId = (dept: string) => {
      const d = dept.toLowerCase();
      if (d.includes('exec')) return 'dept-exec';
      if (d.includes('geotech') || d.includes('geophys')) return 'dept-geotech';
      if (d.includes('env') || d.includes('esia')) return 'dept-env';
      if (d.includes('gis') || d.includes('survey')) return 'dept-gis';
      if (d.includes('qa') || d.includes('quality')) return 'dept-qa';
      if (d.includes('it') || d.includes('digital')) return 'dept-it';
      if (d.includes('hr') || d.includes('human')) return 'dept-hr';
      if (d.includes('fin') || d.includes('account')) return 'dept-finance';
      return 'dept-ops';
    };

    records.forEach((rec, idx) => {
      if (!rec.name?.trim() || !rec.email?.trim() || !rec.jobTitle?.trim()) {
        errors.push(`Row ${idx + 1}: Name, email, and job title are required.`);
        return;
      }

      const emailLower = rec.email.toLowerCase().trim();
      const duplicateExisting = allUsers.some(u => u.email.toLowerCase() === emailLower);
      const duplicateBatch = newUsersList.some(u => u.email.toLowerCase() === emailLower);
      if (duplicateExisting || duplicateBatch) {
        errors.push(`Row ${idx + 1}: Email "${rec.email}" is already registered.`);
        return;
      }

      let managerId: string | undefined;
      let managerName: string | undefined;
      if (rec.managerEmail?.trim()) {
        const mgr = allUsers.find(u => u.email.toLowerCase() === rec.managerEmail?.toLowerCase().trim());
        if (mgr) {
          managerId = mgr.id;
          managerName = mgr.name;
        }
      }

      const newId = `usr-${Date.now()}-${idx + 1}`;
      const defaultAvatar = `https://images.unsplash.com/photo-${1500000000000 + (idx * 1234567) % 80000000000}?w=150&auto=format&fit=crop&q=80`;

      const newUser: UserProfile = {
        id: newId,
        email: emailLower,
        name: rec.name.trim(),
        avatar: defaultAvatar,
        jobTitle: rec.jobTitle.trim(),
        departmentId: getDeptId(rec.departmentName || 'Operations'),
        departmentName: rec.departmentName?.trim() || 'General Operations',
        functionalRole: rec.functionalRole || 'TECHNICAL_CONSULTANT',
        accessTier: rec.accessTier || 'STANDARD',
        managementTier: rec.managementTier || 'NONE',
        managerId,
        managerName,
        status: 'ACTIVE',
        createdAt: new Date().toISOString().split('T')[0],
        phone: rec.phone?.trim() || '+234 803 000 0000',
        location: rec.location?.trim() || 'Lekki Phase 1 HQ, Lagos',
        skills: rec.skills || ['Technical Reporting', 'Consulting Advisory'],
        certificationsList: rec.certificationsList || []
      };

      newUsersList.push(newUser);
      successCount++;
    });

    if (newUsersList.length > 0) {
      setAllUsers(prev => [...prev, ...newUsersList]);

      const audit: AuditRecord = {
        id: `aud-${Date.now()}`,
        actorId: currentUser.id,
        actorName: currentUser.name,
        action: 'STAFF_BATCH_IMPORTED',
        targetType: 'Staff Roster',
        targetId: `batch-${Date.now()}`,
        details: `Batch imported ${newUsersList.length} staff member accounts via CSV spreadsheet.`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      setAuditLogs(prev => [audit, ...prev]);
    }

    return { successCount, errors };
  };

  const createOpportunity = (oppData: Omit<OpportunityItem, 'id' | 'createdAt'>) => {
    const isHighValue = (oppData.currency === 'NGN' && oppData.estimatedValue >= 50000000) ||
                        (oppData.currency !== 'NGN' && oppData.estimatedValue >= 100000);

    const newOpp: OpportunityItem = {
      ...oppData,
      id: `opp-${Date.now()}`,
      requiresLeadershipApproval: isHighValue,
      isApprovedByLeadership: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setOpportunities(prev => [newOpp, ...prev]);

    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'OPPORTUNITY_CREATED',
      targetType: 'Opportunity',
      targetId: newOpp.id,
      details: `Logged tender "${newOpp.title}" for ${newOpp.clientName} (${newOpp.currency} ${newOpp.estimatedValue.toLocaleString()}).`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const updateOpportunityStage = (oppId: string, newStage: OpportunityStage, reason?: string, competitor?: string) => {
    const opp = opportunities.find(o => o.id === oppId);
    if (!opp) return { success: false };

    if (newStage === 'SUBMITTED' && opp.requiresLeadershipApproval && !opp.isApprovedByLeadership) {
      return { success: false, requiresApproval: true };
    }

    setOpportunities(prev => prev.map(o => {
      if (o.id === oppId) {
        return {
          ...o,
          stage: newStage,
          winLossReason: reason || o.winLossReason,
          winningCompetitor: competitor || o.winningCompetitor,
          decisionDate: (newStage === 'WON' || newStage === 'LOST') ? new Date().toISOString().split('T')[0] : o.decisionDate
        };
      }
      return o;
    }));

    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'OPPORTUNITY_STAGE_CHANGED',
      targetType: 'Opportunity',
      targetId: oppId,
      details: `Opportunity "${opp.title}" stage changed from ${opp.stage} to ${newStage}.${reason ? ` Reason: ${reason}` : ''}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);

    return { success: true };
  };

  const approveHighValueBid = (oppId: string) => {
    setOpportunities(prev => prev.map(o => o.id === oppId ? { ...o, isApprovedByLeadership: true } : o));
    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'HIGH_VALUE_BID_APPROVED',
      targetType: 'Opportunity',
      targetId: oppId,
      details: `Managing Consultant signed off proposal submission.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const convertWonToProject = (oppId: string) => {
    const opp = opportunities.find(o => o.id === oppId);
    if (!opp) return '';

    const newProjectCode = `PRJ-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newProject: ProjectRecord = {
      id: `prj-${Date.now()}`,
      projectCode: newProjectCode,
      title: opp.title,
      clientId: opp.clientId,
      clientName: opp.clientName,
      serviceLines: opp.serviceLines,
      contractValue: opp.estimatedValue,
      currency: opp.currency,
      status: 'MOBILIZATION',
      health: 'ON_TRACK',
      healthReason: 'Newly initialized from won proposal.',
      startDate: new Date().toISOString().split('T')[0],
      targetEndDate: '2026-12-31',
      leadPmId: opp.technicalLeadId || 'usr-4',
      leadPmName: opp.technicalLeadName || 'Engr. Femi Adebayo',
      progressPercent: 0,
      budgetSpent: 0,
      vaultStorageTier: 'ACTIVE_VAULT',
      storageSizeGb: 1.5,
      workstreams: opp.serviceLines.map((sl, idx) => ({
        id: `ws-${Date.now()}-${idx}`,
        serviceLine: sl,
        leadName: opp.technicalLeadName || 'Project Lead',
        progressPercent: 0,
        milestones: [
          { id: `m-${Date.now()}-1`, name: `${sl} Inception & Kickoff`, workstream: sl, targetDate: '2026-09-30', status: 'PENDING', isGatePrerequisite: true, deliverablesCount: 1 },
          { id: `m-${Date.now()}-2`, name: `${sl} Field & Analytical Execution`, workstream: sl, targetDate: '2026-10-31', status: 'PENDING', deliverablesCount: 4 },
          { id: `m-${Date.now()}-3`, name: `${sl} Final Deliverable Sign-off`, workstream: sl, targetDate: '2026-12-15', status: 'PENDING', deliverablesCount: 1 }
        ]
      })),
      createdAt: new Date().toISOString().split('T')[0]
    };

    setProjects(prev => [newProject, ...prev]);
    setOpportunities(prev => prev.map(o => o.id === oppId ? { ...o, convertedProjectId: newProjectCode } : o));

    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'WON_BID_CONVERTED_TO_PROJECT',
      targetType: 'Project Record',
      targetId: newProjectCode,
      details: `Auto-initialized project "${opp.title}" for ${opp.clientName} (Contract Value: ${opp.currency} ${opp.estimatedValue.toLocaleString()}).`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);

    return newProjectCode;
  };

  const createProject = (projectData: Omit<ProjectRecord, 'id' | 'createdAt'>) => {
    const newProj: ProjectRecord = {
      ...projectData,
      id: `prj-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProjects(prev => [newProj, ...prev]);

    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'PROJECT_CREATED',
      targetType: 'Project Record',
      targetId: newProj.projectCode,
      details: `Initialized project "${newProj.title}" (${newProj.serviceLines.join(', ')}).`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const closeOutAndArchiveProject = (projectId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          status: 'CLOSED_OUT',
          vaultStorageTier: 'COLD_ARCHIVE',
          progressPercent: 100,
          health: 'ON_TRACK',
          healthReason: 'Completed, released to client, and archived to 50% Cold Archive volume.'
        };
      }
      return p;
    }));

    const proj = projects.find(p => p.id === projectId);
    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'PROJECT_ARCHIVED_TO_COLD_VAULT',
      targetType: 'AquaEarth Vault Storage',
      targetId: proj?.projectCode,
      details: `Project "${proj?.title}" compressed and migrated from Active Vault to 50% Cold Archive tier.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const createFieldRecord = (recordData: Omit<FieldRecordItem, 'id' | 'timestamp' | 'watermarkText'>) => {
    const now = new Date();
    const timestampStr = now.toISOString().replace('T', ' ').substring(0, 16);
    const watermark = `${recordData.projectName} | ${recordData.samplePointId} | ${recordData.gps.lat.toFixed(4)}°N, ${recordData.gps.lng.toFixed(4)}°E | ${timestampStr} | ${recordData.technicianName}`;

    const newRecord: FieldRecordItem = {
      ...recordData,
      id: `fld-${Date.now()}`,
      timestamp: timestampStr,
      watermarkText: watermark
    };

    setFieldRecords(prev => [newRecord, ...prev]);

    const pts = calculateEventPoints('FIELD_FORM', now.toISOString().split('T')[0], now.toISOString().split('T')[0]);
    setLeaderboard(lPrev => {
      const updated = lPrev.map(entry => {
        if (entry.userId === recordData.technicianId) {
          return {
            ...entry,
            totalScore: entry.totalScore + pts.totalPoints,
            completedCount: entry.completedCount + 1,
            onTimeCount: entry.onTimeCount + 1
          };
        }
        return entry;
      });
      return updated.sort((a, b) => b.totalScore - a.totalScore).map((item, idx) => ({ ...item, rankPosition: idx + 1 }));
    });

    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'FIELD_DATA_CAPTURED_AND_LOCKED',
      targetType: 'Field Record',
      targetId: newRecord.samplePointId,
      details: `Submitted ${newRecord.formType} with auto-GPS (${recordData.gps.lat}, ${recordData.gps.lng}). Awarded +${pts.totalPoints} pts.`,
      timestamp: now.toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const uploadDocument = (docData: Omit<DocumentItem, 'id' | 'documentNumber' | 'uploadedAt'>) => {
    const docNum = `DOC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newDoc: DocumentItem = {
      ...docData,
      id: `doc-${Date.now()}`,
      documentNumber: docNum,
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setDocuments(prev => [newDoc, ...prev]);

    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'DOCUMENT_UPLOADED',
      targetType: 'Document',
      targetId: docNum,
      details: `Uploaded "${newDoc.title}" (${newDoc.version}, ${newDoc.category}).`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const submitForQa = (docId: string, peerReviewerId: string, qaLeadId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    const peer = allUsers.find(u => u.id === peerReviewerId);
    const qaLead = allUsers.find(u => u.id === qaLeadId);

    const newQa: QaReviewItem = {
      id: `qa-${Date.now()}`,
      documentId: doc.id,
      documentTitle: doc.title,
      projectCode: doc.projectId || 'PRJ-2026-001',
      authorId: currentUser.id,
      authorName: currentUser.name,
      stage: 'PEER_REVIEW',
      slaDeadline: '48h SLA Active',
      isOverdue: false,
      peerReviewerId,
      peerReviewerName: peer?.name || 'Peer Reviewer',
      qaLeadId,
      qaLeadName: qaLead?.name || 'QA Lead',
      managingConsultantSigned: false,
      reviewNotes: [
        {
          author: currentUser.name,
          role: 'Lead Author',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          comment: 'Submitted technical draft into QA pipeline for rigorous verification.',
          action: 'APPROVED'
        }
      ],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setQaReviews(prev => [newQa, ...prev]);
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, qaStatus: 'IN_REVIEW' } : d));

    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'QA_REVIEW_INITIATED',
      targetType: 'QA Review',
      targetId: newQa.id,
      details: `Initiated 4-stage QA review chain for "${doc.title}".`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const advanceQaReview = (qaId: string, action: 'APPROVED' | 'REJECTED', comment: string) => {
    setQaReviews(prev => prev.map(qa => {
      if (qa.id === qaId) {
        let nextStage: QaReviewStage = qa.stage;
        let isComplete = false;

        if (action === 'REJECTED') {
          nextStage = 'REVISION_REQUESTED';
        } else {
          if (qa.stage === 'AUTHOR_SUBMITTED' || qa.stage === 'PEER_REVIEW') {
            nextStage = 'QA_LEAD_REVIEW';
          } else if (qa.stage === 'QA_LEAD_REVIEW') {
            nextStage = 'LEADERSHIP_SIGNOFF';
          } else if (qa.stage === 'LEADERSHIP_SIGNOFF') {
            nextStage = 'APPROVED_RELEASED';
            isComplete = true;
          }
        }

        const updatedNotes = [
          ...qa.reviewNotes,
          {
            author: currentUser.name,
            role: currentUser.functionalRole.replace('_', ' '),
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            comment,
            action
          }
        ];

        if (isComplete) {
          const pts = calculateEventPoints('QA_REVIEW', new Date().toISOString().split('T')[0], new Date().toISOString().split('T')[0]);
          setLeaderboard(lPrev => {
            const updated = lPrev.map(entry => {
              if (entry.userId === qa.authorId || entry.userId === currentUser.id) {
                return {
                  ...entry,
                  totalScore: entry.totalScore + pts.totalPoints,
                  completedCount: entry.completedCount + 1,
                  onTimeCount: entry.onTimeCount + 1
                };
              }
              return entry;
            });
            return updated.sort((a, b) => b.totalScore - a.totalScore).map((item, idx) => ({ ...item, rankPosition: idx + 1 }));
          });

          setDocuments(dPrev => dPrev.map(d => d.id === qa.documentId ? { ...d, qaStatus: 'RELEASED_TO_CLIENT', version: 'v1.0 Final' } : d));
        }

        return {
          ...qa,
          stage: nextStage,
          managingConsultantSigned: isComplete ? true : qa.managingConsultantSigned,
          tamperProofCertificateHash: isComplete ? `SHA256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}` : qa.tamperProofCertificateHash,
          reviewNotes: updatedNotes
        };
      }
      return qa;
    }));

    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: `QA_REVIEW_${action}`,
      targetType: 'QA Review',
      targetId: qaId,
      details: `${currentUser.name} (${currentUser.functionalRole}): ${comment}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const renewCompliancePermit = (permitId: string) => {
    setCompliancePermits(prev => prev.map(p => {
      if (p.id === permitId) {
        const currentYear = parseInt(p.expiryDate.split('-')[0]) || 2026;
        const newExpiry = `${currentYear + p.cycleDurationYears}-12-31`;
        return {
          ...p,
          status: 'ACTIVE',
          issueDate: new Date().toISOString().split('T')[0],
          expiryDate: newExpiry,
          daysRemaining: p.cycleDurationYears * 365,
          feeReconciled: true
        };
      }
      return p;
    }));

    const permit = compliancePermits.find(p => p.id === permitId);
    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'STATUTORY_PERMIT_RENEWED',
      targetType: 'Compliance Permit',
      targetId: permit?.permitNumber,
      details: `Renewed statutory permit "${permit?.permitTitle}" with ${permit?.regulatoryBody} (Fee: ₦${permit?.statutoryFeeNgn.toLocaleString()}).`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const createInvoice = (invData: Omit<InvoiceItem, 'id' | 'invoiceNumber' | 'vatAmountNgn' | 'whtDeductionNgn' | 'netPayableNgn' | 'issuedDate'>) => {
    const vat = (invData.subtotalNgn * invData.vatRatePercent) / 100;
    const wht = (invData.subtotalNgn * invData.whtRatePercent) / 100;
    const net = invData.subtotalNgn + vat - wht;

    const newInv: InvoiceItem = {
      ...invData,
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      vatAmountNgn: vat,
      whtDeductionNgn: wht,
      netPayableNgn: net,
      issuedDate: new Date().toISOString().split('T')[0]
    };

    setInvoices(prev => [newInv, ...prev]);

    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'INVOICE_ISSUED',
      targetType: 'Invoice Record',
      targetId: newInv.invoiceNumber,
      details: `Issued milestone invoice to ${newInv.clientName} (Subtotal: ₦${newInv.subtotalNgn.toLocaleString()}, 7.5% VAT: ₦${vat.toLocaleString()}, 5% WHT: ₦${wht.toLocaleString()}).`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const markInvoicePaid = (invoiceId: string, whtCreditNumber?: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: 'PAID',
          paidDate: new Date().toISOString().split('T')[0],
          whtCreditNoteReceived: !!whtCreditNumber,
          whtCreditNoteNumber: whtCreditNumber || inv.whtCreditNoteNumber
        };
      }
      return inv;
    }));

    const inv = invoices.find(i => i.id === invoiceId);
    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'PAYMENT_RECORDED',
      targetType: 'Invoice Record',
      targetId: inv?.invoiceNumber,
      details: `Recorded payment for ${inv?.invoiceNumber} (Net: ₦${inv?.netPayableNgn.toLocaleString()})${whtCreditNumber ? ` with WHT Credit Note ${whtCreditNumber}` : ''}.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const updateDigestRecipients = (recipients: string[]) => {
    setDigestConfig(prev => ({
      ...prev,
      emailRecipients: recipients
    }));

    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'EXECUTIVE_DIGEST_CONFIG_UPDATED',
      targetType: 'System Configuration',
      targetId: 'ExecutiveDigest',
      details: `Updated Monday 8AM executive email digest recipients to: ${recipients.join(', ')}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const createDesignRequest = (reqData: Omit<DesignRequest, 'id' | 'requestNumber' | 'status' | 'createdAt'>) => {
    const newReq: DesignRequest = {
      ...reqData,
      id: `dsg-${Date.now()}`,
      requestNumber: `DSG-2026-${Math.floor(100 + Math.random() * 900)}`,
      status: 'PENDING',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setDesignRequests(prev => [newReq, ...prev]);

    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'DESIGN_REQUEST_CREATED',
      targetType: 'Design Queue',
      targetId: newReq.requestNumber,
      details: `[${newReq.is24hRush ? '24H RUSH' : 'STANDARD'}] ${newReq.title}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const submitAccessRequest = (reqData: Omit<AccessRequestItem, 'id' | 'status' | 'createdAt'>) => {
    const newReq: AccessRequestItem = {
      ...reqData,
      id: `req-acc-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setAccessRequests(prev => [newReq, ...prev]);

    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: 'system',
      actorName: 'Self-Service Portal',
      action: 'ACCESS_REQUEST_SUBMITTED',
      targetType: 'Onboarding Request',
      targetId: newReq.id,
      details: `${newReq.fullName} (${newReq.email}) submitted access request for ${newReq.departmentName}.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const approveAccessRequest = (reqId: string) => {
    setAccessRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'APPROVED' } : r));
    const req = accessRequests.find(r => r.id === reqId);
    if (!req) return;

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: req.email,
      name: req.fullName,
      jobTitle: req.jobTitle,
      functionalRole: 'FIELD_STAFF',
      accessTier: 'STANDARD',
      managementTier: 'NONE',
      departmentName: req.departmentName,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setAllUsers(prev => [newUser, ...prev]);

    const audit: AuditRecord = {
      id: `aud-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'ACCESS_REQUEST_APPROVED',
      targetType: 'User Account',
      targetId: newUser.id,
      details: `Provisioned active account for ${newUser.name} (${newUser.email}) in ${newUser.departmentName}.`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const executeNotificationAction = (notifId: string) => {
    const notif = notifications.find(n => n.id === notifId);
    if (!notif) return;

    if (notif.actionType === 'APPROVE_BID' && notif.actionTargetId) {
      approveHighValueBid(notif.actionTargetId);
    } else if (notif.actionType === 'RENEW_PERMIT' && notif.actionTargetId) {
      renewCompliancePermit(notif.actionTargetId);
    }

    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true, actionDone: true } : n));
  };

  const addClientCommunication = (clientId: string, logData: { author: string; channel: string; summary: string; projectTag?: string }) => {
    const newLog = {
      id: `com-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      ...logData
    };

    setClients(prev => prev.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          status: 'ACTIVE',
          lastActivityDate: new Date().toISOString().split('T')[0],
          communicationsLog: [newLog, ...c.communicationsLog]
        };
      }
      return c;
    }));
  };

  return (
    <AuthContext.Provider value={{
      theme,
      toggleTheme,
      isLoading,
      loadingMessage,
      isAuthenticated,
      currentUser,
      allUsers,
      tasks,
      tickets,
      leaveRequests,
      certifications,
      leaderboard,
      auditLogs,
      opportunities,
      clients,
      projects,
      fieldRecords,
      documents,
      qaReviews,
      compliancePermits,
      invoices,
      hardwareAssets,
      subscriptions,
      designRequests,
      digestConfig,
      accessRequests,
      notifications,
      attendanceRecords,
      todayAttendance,
      clockIn,
      clockOut,
      loginAsUser,
      logout,
      switchUser,
      updateTaskStatus,
      createTaskForApproval,
      approveTask,
      rejectTask,
      addTaskComment,
      updateTaskProgress,
      createSupportTicket,
      submitLeaveRequest,
      updateLeaveStatus,
      updateUserStatus,
      updateUserRole,
      bulkImportUsers,
      createOpportunity,
      updateOpportunityStage,
      approveHighValueBid,
      convertWonToProject,
      addClientCommunication,
      createProject,
      closeOutAndArchiveProject,
      createFieldRecord,
      uploadDocument,
      submitForQa,
      advanceQaReview,
      renewCompliancePermit,
      createInvoice,
      markInvoicePaid,
      updateDigestRecipients,
      createDesignRequest,
      submitAccessRequest,
      approveAccessRequest,
      markNotificationRead,
      markAllNotificationsRead,
      executeNotificationAction
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
