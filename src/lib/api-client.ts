/**
 * AquaEarth Cloud Database API Client
 * Interfaces with Next.js API routes backed by Neon PostgreSQL.
 * Provides resilient network handling, optimistic responses, and graceful fallback.
 */

export const apiClient = {
  // Leave Requests
  async getLeaveRequests(userId?: string) {
    try {
      const url = userId ? `/api/leave?userId=${encodeURIComponent(userId)}` : '/api/leave';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.success ? data.leaves : null;
    } catch (err) {
      console.warn('[apiClient] getLeaveRequests fallback:', err);
      return null;
    }
  },

  async createLeaveRequest(payload: {
    userId: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    daysCount: number;
    reason?: string;
  }) {
    try {
      const res = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] createLeaveRequest failed:', err);
      return { success: false, error: String(err) };
    }
  },

  async updateLeaveStatus(payload: {
    id: string;
    status: 'APPROVED' | 'REJECTED' | 'CANCELLED';
    approvedById?: string;
    reviewComments?: string;
  }) {
    try {
      const res = await fetch('/api/leave', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] updateLeaveStatus failed:', err);
      return { success: false, error: String(err) };
    }
  },

  // Tasks
  async getTasks(params?: { assigneeId?: string; assignedById?: string; departmentId?: string }) {
    try {
      const search = new URLSearchParams();
      if (params?.assigneeId) search.set('assigneeId', params.assigneeId);
      if (params?.assignedById) search.set('assignedById', params.assignedById);
      if (params?.departmentId) search.set('departmentId', params.departmentId);
      const url = search.toString() ? `/api/tasks?${search.toString()}` : '/api/tasks';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.success ? data.tasks : null;
    } catch (err) {
      console.warn('[apiClient] getTasks fallback:', err);
      return null;
    }
  },

  async createTask(payload: {
    title: string;
    description?: string;
    moduleOrigin?: string;
    priority?: string;
    dueDate: string;
    assigneeId?: string;
    assigneeIds?: string[];
    assigneeNames?: string[];
    assignmentType?: 'INDIVIDUAL' | 'MULTIPLE' | 'DEPARTMENT';
    departmentId?: string;
    departmentName?: string;
    assignedById?: string;
    assignedByName?: string;
    managerId?: string;
    managerName?: string;
    projectId?: string;
    projectName?: string;
    estimatedHours?: number;
  }) {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] createTask failed:', err);
      return { success: false, error: String(err) };
    }
  },

  async updateTask(id: string, updates: { 
    status?: string; 
    loggedHours?: number; 
    blockedReason?: string;
    completedById?: string;
    completedByName?: string;
    completionNotes?: string;
  }) {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] updateTask failed:', err);
      return { success: false, error: String(err) };
    }
  },

  // BD Opportunities
  async getOpportunities() {
    try {
      const res = await fetch('/api/pipeline');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.success ? data.opportunities : null;
    } catch (err) {
      console.warn('[apiClient] getOpportunities fallback:', err);
      return null;
    }
  },

  async updateOpportunity(id: string, updates: { stage?: string; winLossReason?: string; winningCompetitor?: string }) {
    try {
      const res = await fetch('/api/pipeline', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] updateOpportunity failed:', err);
      return { success: false, error: String(err) };
    }
  },

  // Attendance
  async getAttendance(userId?: string, date?: string) {
    try {
      const params = new URLSearchParams();
      if (userId) params.set('userId', userId);
      if (date) params.set('date', date);
      const res = await fetch(`/api/attendance?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.success ? data.records : null;
    } catch (err) {
      console.warn('[apiClient] getAttendance fallback:', err);
      return null;
    }
  },

  async recordAttendance(payload: {
    action: 'CLOCK_IN' | 'CLOCK_OUT';
    userId: string;
    locationTag?: string;
    coordinates?: string;
    notes?: string;
  }) {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] recordAttendance failed:', err);
      return { success: false, error: String(err) };
    }
  },

  // Users & Profiles
  async getUsers() {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.success ? data.users : null;
    } catch (err) {
      console.warn('[apiClient] getUsers fallback:', err);
      return null;
    }
  },

  async updateUserProfile(id: string, payload: {
    phone?: string;
    location?: string;
    bio?: string;
    avatar?: string;
    skills?: string[];
    emergencyContact?: any;
  }) {
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...payload })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] updateUserProfile failed:', err);
      return { success: false, error: String(err) };
    }
  },

  // Support & IT Requests
  async getSupportTickets(category?: string) {
    try {
      const url = category ? `/api/support?category=${encodeURIComponent(category)}` : '/api/support';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.success ? data.tickets : null;
    } catch (err) {
      console.warn('[apiClient] getSupportTickets fallback:', err);
      return null;
    }
  },

  async createSupportTicket(payload: {
    requesterId: string;
    category: string;
    subject: string;
    description: string;
    priority: string;
  }) {
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] createSupportTicket failed:', err);
      return { success: false, error: String(err) };
    }
  },

  // Milestone Invoices & Finance
  async getInvoices() {
    try {
      const res = await fetch('/api/finance');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.success ? data.invoices : null;
    } catch (err) {
      console.warn('[apiClient] getInvoices fallback:', err);
      return null;
    }
  },

  async createInvoice(payload: {
    projectId: string;
    projectName: string;
    clientId: string;
    clientName: string;
    milestoneDescription: string;
    subtotalNgn: number;
    vatRatePercent?: number;
    whtRatePercent?: number;
    dueDate: string;
  }) {
    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] createInvoice failed:', err);
      return { success: false, error: String(err) };
    }
  },

  async updateInvoice(id: string, updates: {
    status?: string;
    paidDate?: string;
    whtCreditNoteReceived?: boolean;
    whtCreditNoteNumber?: string;
  }) {
    try {
      const res = await fetch('/api/finance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] updateInvoice failed:', err);
      return { success: false, error: String(err) };
    }
  },

  // Budget Requests
  async getBudgetRequests(params?: { department?: string; status?: string; approvalStage?: string; requestedById?: string }) {
    try {
      const search = new URLSearchParams();
      if (params?.department) search.set('department', params.department);
      if (params?.status) search.set('status', params.status);
      if (params?.approvalStage) search.set('approvalStage', params.approvalStage);
      if (params?.requestedById) search.set('requestedById', params.requestedById);
      const url = search.toString() ? `/api/budgets?${search.toString()}` : '/api/budgets';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.success ? data.budgets : null;
    } catch (err) {
      console.warn('[apiClient] getBudgetRequests fallback:', err);
      return null;
    }
  },

  async createBudgetRequest(payload: Record<string, any>) {
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] createBudgetRequest failed:', err);
      return { success: false, error: String(err) };
    }
  },

  async updateBudgetRequest(id: string, updates: Record<string, any>) {
    try {
      const res = await fetch('/api/budgets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] updateBudgetRequest failed:', err);
      return { success: false, error: String(err) };
    }
  },

  // Petty Cash
  async getPettyCash() {
    try {
      const res = await fetch('/api/petty-cash');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.success ? data : null;
    } catch (err) {
      console.warn('[apiClient] getPettyCash fallback:', err);
      return null;
    }
  },

  async logPettyCashTransaction(payload: Record<string, any>) {
    try {
      const res = await fetch('/api/petty-cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'TRANSACTION', ...payload })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] logPettyCashTransaction failed:', err);
      return { success: false, error: String(err) };
    }
  },

  async topUpPettyCash(payload: Record<string, any>) {
    try {
      const res = await fetch('/api/petty-cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'TOPUP', ...payload })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] topUpPettyCash failed:', err);
      return { success: false, error: String(err) };
    }
  },

  async createPettyCashAnalysis(payload: Record<string, any>) {
    try {
      const res = await fetch('/api/petty-cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ANALYSIS', ...payload })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] createPettyCashAnalysis failed:', err);
      return { success: false, error: String(err) };
    }
  },

  async approvePettyCashReplenishment(id: string, notes?: string) {
    try {
      const res = await fetch('/api/petty-cash', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'APPROVE_REPLENISHMENT', id, notes })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] approvePettyCashReplenishment failed:', err);
      return { success: false, error: String(err) };
    }
  },

  // QA Reviews
  async getQaReviews(params?: { documentId?: string; stage?: string }) {
    try {
      const search = new URLSearchParams();
      if (params?.documentId) search.set('documentId', params.documentId);
      if (params?.stage) search.set('stage', params.stage);
      const url = search.toString() ? `/api/qa-reviews?${search.toString()}` : '/api/qa-reviews';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.success ? data.reviews : null;
    } catch (err) {
      console.warn('[apiClient] getQaReviews fallback:', err);
      return null;
    }
  },

  async createQaReview(payload: Record<string, any>) {
    try {
      const res = await fetch('/api/qa-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] createQaReview failed:', err);
      return { success: false, error: String(err) };
    }
  },

  async updateQaReview(id: string, updates: Record<string, any>) {
    try {
      const res = await fetch('/api/qa-reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] updateQaReview failed:', err);
      return { success: false, error: String(err) };
    }
  },

  // Compliance Permits
  async getCompliancePermits() {
    try {
      const res = await fetch('/api/compliance');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.success ? data.permits : null;
    } catch (err) {
      console.warn('[apiClient] getCompliancePermits fallback:', err);
      return null;
    }
  },

  async updateCompliancePermit(id: string, updates: Record<string, any>) {
    try {
      const res = await fetch('/api/compliance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] updateCompliancePermit failed:', err);
      return { success: false, error: String(err) };
    }
  },

  // Payroll
  async getPayrollRecords(params?: { monthYear?: string; staffId?: string }) {
    try {
      const search = new URLSearchParams();
      if (params?.monthYear) search.set('monthYear', params.monthYear);
      if (params?.staffId) search.set('staffId', params.staffId);
      const url = search.toString() ? `/api/payroll?${search.toString()}` : '/api/payroll';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.success ? data.records : null;
    } catch (err) {
      console.warn('[apiClient] getPayrollRecords fallback:', err);
      return null;
    }
  },

  async createPayrollRun(records: Record<string, any>[]) {
    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] createPayrollRun failed:', err);
      return { success: false, error: String(err) };
    }
  },

  async updatePayrollRecord(id: string, updates: Record<string, any>) {
    try {
      const res = await fetch('/api/payroll', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] updatePayrollRecord failed:', err);
      return { success: false, error: String(err) };
    }
  },

  // Candidates
  async getCandidates(params?: { currentStage?: string }) {
    try {
      const search = new URLSearchParams();
      if (params?.currentStage) search.set('currentStage', params.currentStage);
      const url = search.toString() ? `/api/candidates?${search.toString()}` : '/api/candidates';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.success ? data.candidates : null;
    } catch (err) {
      console.warn('[apiClient] getCandidates fallback:', err);
      return null;
    }
  },

  async createCandidate(payload: Record<string, any>) {
    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] createCandidate failed:', err);
      return { success: false, error: String(err) };
    }
  },

  async updateCandidate(id: string, updates: Record<string, any>) {
    try {
      const res = await fetch('/api/candidates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] updateCandidate failed:', err);
      return { success: false, error: String(err) };
    }
  },

  // Documents & Vault
  async getDocuments(params?: { projectId?: string; qaStatus?: string }) {
    try {
      const search = new URLSearchParams();
      if (params?.projectId) search.set('projectId', params.projectId);
      if (params?.qaStatus) search.set('qaStatus', params.qaStatus);
      const url = search.toString() ? `/api/documents?${search.toString()}` : '/api/documents';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.success ? data.documents : null;
    } catch (err) {
      console.warn('[apiClient] getDocuments fallback:', err);
      return null;
    }
  },

  async createDocument(payload: Record<string, any>) {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] createDocument failed:', err);
      return { success: false, error: String(err) };
    }
  },

  async updateDocument(id: string, updates: Record<string, any>) {
    try {
      const res = await fetch('/api/documents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] updateDocument failed:', err);
      return { success: false, error: String(err) };
    }
  },

  async getDocumentFolders() {
    try {
      const res = await fetch('/api/document-folders');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.success ? data.folders : null;
    } catch (err) {
      console.warn('[apiClient] getDocumentFolders fallback:', err);
      return null;
    }
  },

  async createDocumentFolder(payload: Record<string, any>) {
    try {
      const res = await fetch('/api/document-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] createDocumentFolder failed:', err);
      return { success: false, error: String(err) };
    }
  },

  // Hardware Assets
  async getHardwareAssets(params?: { status?: string; assignedToId?: string }) {
    try {
      const search = new URLSearchParams();
      if (params?.status) search.set('status', params.status);
      if (params?.assignedToId) search.set('assignedToId', params.assignedToId);
      const url = search.toString() ? `/api/hardware-assets?${search.toString()}` : '/api/hardware-assets';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.success ? data.assets : null;
    } catch (err) {
      console.warn('[apiClient] getHardwareAssets fallback:', err);
      return null;
    }
  },

  async createHardwareAsset(payload: Record<string, any>) {
    try {
      const res = await fetch('/api/hardware-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] createHardwareAsset failed:', err);
      return { success: false, error: String(err) };
    }
  },

  async updateHardwareAsset(id: string, updates: Record<string, any>) {
    try {
      const res = await fetch('/api/hardware-assets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] updateHardwareAsset failed:', err);
      return { success: false, error: String(err) };
    }
  },

  // KPI Config
  async getKpiConfig() {
    try {
      const res = await fetch('/api/kpi-config');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.success ? data.config : null;
    } catch (err) {
      console.warn('[apiClient] getKpiConfig fallback:', err);
      return null;
    }
  },

  async saveKpiConfig(config: Record<string, any>, updatedBy?: string) {
    try {
      const res = await fetch('/api/kpi-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, updatedBy })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] saveKpiConfig failed:', err);
      return { success: false, error: String(err) };
    }
  },

  // Staff Queries
  async getStaffQueries(params?: { staffId?: string; status?: string }) {
    try {
      const search = new URLSearchParams();
      if (params?.staffId) search.set('staffId', params.staffId);
      if (params?.status) search.set('status', params.status);
      const url = search.toString() ? `/api/staff-queries?${search.toString()}` : '/api/staff-queries';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.success ? data.queries : null;
    } catch (err) {
      console.warn('[apiClient] getStaffQueries fallback:', err);
      return null;
    }
  },

  async createStaffQuery(payload: Record<string, any>) {
    try {
      const res = await fetch('/api/staff-queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] createStaffQuery failed:', err);
      return { success: false, error: String(err) };
    }
  },

  async updateStaffQuery(id: string, updates: Record<string, any>) {
    try {
      const res = await fetch('/api/staff-queries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[apiClient] updateStaffQuery failed:', err);
      return { success: false, error: String(err) };
    }
  }
};
