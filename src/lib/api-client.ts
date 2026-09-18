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
  async getTasks(assigneeId?: string) {
    try {
      const url = assigneeId ? `/api/tasks?assigneeId=${encodeURIComponent(assigneeId)}` : '/api/tasks';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.success ? data.tasks : null;
    } catch (err) {
      console.warn('[apiClient] getTasks fallback:', err);
      return null;
    }
  },

  async updateTask(id: string, updates: { status?: string; loggedHours?: number; blockedReason?: string }) {
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
  }
};
