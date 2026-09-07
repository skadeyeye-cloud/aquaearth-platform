import { UserProfile, TaskItem, SupportTicket, CertificationItem, LeaveItem, KpiLeaderboardEntry, AuditRecord } from './types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    email: 'kaine.edike@aquaearth.com',
    name: 'Kaine Edike',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'Founder & Managing Consultant',
    functionalRole: 'MANAGING_CONSULTANT',
    accessTier: 'SUPERADMIN',
    managementTier: 'DEPT_HEAD',
    departmentId: 'dept-exec',
    departmentName: 'Executive Leadership',
    phone: '+234 803 123 4567',
    location: 'Lekki Phase 1 HQ, Lagos',
    skills: ['Bidding Strategy', 'FMEnv Regulatory Advisory', 'Executive Governance', 'Offshore Energy', 'FIDIC Contracts'],
    certificationsList: ['COREN Registered', 'COMEG Licensed', 'Fellow NMGS'],
    emergencyContact: { name: 'Dr. Sarah Edike', phone: '+234 803 999 1122', relation: 'Spouse' },
    status: 'ACTIVE',
    createdAt: '2016-01-15'
  },
  {
    id: 'usr-2',
    email: 'chidi.okafor@aquaearth.com',
    name: 'Chidi Okafor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'IT Team Lead & Systems Admin',
    functionalRole: 'IT_LEAD',
    accessTier: 'SUPERADMIN',
    managementTier: 'TEAM_LEAD',
    departmentId: 'dept-it',
    departmentName: 'IT & Digital Operations',
    managerId: 'usr-1',
    managerName: 'Kaine Edike',
    phone: '+234 802 987 6543',
    location: 'Lekki Phase 1 HQ, Lagos',
    skills: ['Starlink Maritime Networking', 'Cloud Architecture', 'SOC2 Governance', 'Full-Stack Engineering'],
    certificationsList: ['CISSP Certified', 'AWS Solutions Architect Professional'],
    emergencyContact: { name: 'Obinna Okafor', phone: '+234 802 111 4455', relation: 'Brother' },
    status: 'ACTIVE',
    createdAt: '2020-03-10'
  },
  {
    id: 'usr-3',
    email: 'amina.bello@aquaearth.com',
    name: 'Amina Bello',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'HR Administrator & Talent Lead',
    functionalRole: 'HR_ADMIN',
    accessTier: 'ADMIN',
    managementTier: 'LINE_MANAGER',
    departmentId: 'dept-hr',
    departmentName: 'Human Resources',
    managerId: 'usr-1',
    managerName: 'Kaine Edike',
    phone: '+234 805 345 6789',
    location: 'Lekki Phase 1 HQ, Lagos',
    skills: ['Competency Frameworks', 'CIPM Talent Governance', 'Nigerian Labour Law', 'HSE Training Matrices'],
    certificationsList: ['CIPM Chartered Member', 'SHRM-SCP Senior Certified'],
    emergencyContact: { name: 'Alhaji Usman Bello', phone: '+234 805 777 8899', relation: 'Father' },
    status: 'ACTIVE',
    createdAt: '2021-06-01'
  },
  {
    id: 'usr-4',
    email: 'femi.adebayo@aquaearth.com',
    name: 'Engr. Femi Adebayo',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'Head of Geotechnical Engineering',
    functionalRole: 'PROJECT_MANAGER',
    accessTier: 'ADMIN',
    managementTier: 'LINE_MANAGER',
    departmentId: 'dept-geotech',
    departmentName: 'Geotechnical & Geophysics',
    managerId: 'usr-1',
    managerName: 'Kaine Edike',
    phone: '+234 809 456 7890',
    location: 'Lekki Phase 1 HQ, Lagos',
    skills: ['Deep Offshore CPT', 'ASTM D1586 Soil Mechanics', 'Foundation Settlement Analysis', 'Plaxis 3D Modeling'],
    certificationsList: ['COREN Registered Engineer', 'COMEG Licensed Geologist', 'MNSE Member'],
    emergencyContact: { name: 'Mrs. Yemi Adebayo', phone: '+234 809 222 3344', relation: 'Spouse' },
    status: 'ACTIVE',
    createdAt: '2018-09-12'
  },
  {
    id: 'usr-5',
    email: 'ngozi.eze@aquaearth.com',
    name: 'Dr. Ngozi Eze',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'Lead Environmental Consultant (ESIA)',
    functionalRole: 'PROJECT_MANAGER',
    accessTier: 'ADMIN',
    managementTier: 'LINE_MANAGER',
    departmentId: 'dept-env',
    departmentName: 'Environmental & Social (ESIA)',
    managerId: 'usr-1',
    managerName: 'Kaine Edike',
    phone: '+234 803 789 0123',
    location: 'Lekki Phase 1 HQ, Lagos',
    skills: ['EIA Regulations', 'FMEnv Panel Reviews', 'Biodiversity Impact Assessment', 'EGASPIN Environmental Guidelines'],
    certificationsList: ['FMEnv Accredited EIA Lead Reviewer', 'Member CIEEM UK'],
    emergencyContact: { name: 'Engr. Emeka Eze', phone: '+234 803 444 5566', relation: 'Spouse' },
    status: 'ACTIVE',
    createdAt: '2019-11-20'
  },
  {
    id: 'usr-6',
    email: 'tunde.bakare@aquaearth.com',
    name: 'Tunde Bakare',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'Senior Field Geologist & Borehole Specialist',
    functionalRole: 'FIELD_STAFF',
    accessTier: 'STANDARD',
    managementTier: 'NONE',
    departmentId: 'dept-geotech',
    departmentName: 'Geotechnical & Geophysics',
    managerId: 'usr-4',
    managerName: 'Engr. Femi Adebayo',
    phone: '+234 818 234 5678',
    location: 'Escravos Field Base / Lekki HQ',
    skills: ['Borehole Stratigraphy', 'Differential GPS RTK', 'Soil Core Logging', 'Mud Rotary Rig Operation'],
    certificationsList: ['COMEG Licensed Geoscientist', 'OPITO BOSIET Offshore Certified'],
    emergencyContact: { name: 'Folashade Bakare', phone: '+234 818 555 6677', relation: 'Sister' },
    status: 'ACTIVE',
    createdAt: '2022-02-14'
  },
  {
    id: 'usr-7',
    email: 'halima.yusuf@aquaearth.com',
    name: 'Halima Yusuf',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'GIS & Bathymetric Survey Analyst',
    functionalRole: 'FIELD_STAFF',
    accessTier: 'STANDARD',
    managementTier: 'NONE',
    departmentId: 'dept-gis',
    departmentName: 'Geoinformatics & Survey',
    managerId: 'usr-4',
    managerName: 'Engr. Femi Adebayo',
    phone: '+234 807 567 8901',
    location: 'Bonny Island Channel Base / Lekki HQ',
    skills: ['ArcGIS Pro / QGIS', 'Multibeam Bathymetry', 'Drone LiDAR Processing', 'Hydrographic Sounding Charts'],
    certificationsList: ['SURCON Registered Surveyor', 'Hydrographic Society Member'],
    emergencyContact: { name: 'Fatima Yusuf', phone: '+234 807 888 9900', relation: 'Mother' },
    status: 'ACTIVE',
    createdAt: '2023-01-10'
  },
  {
    id: 'usr-8',
    email: 'emeka.nnamdi@aquaearth.com',
    name: 'Emeka Nnamdi',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'Senior QA/QC Reviewer',
    functionalRole: 'QA_LEAD',
    accessTier: 'STANDARD',
    managementTier: 'TEAM_LEAD',
    departmentId: 'dept-qa',
    departmentName: 'Quality Control & Standards',
    managerId: 'usr-1',
    managerName: 'Kaine Edike',
    phone: '+234 812 678 9012',
    location: 'Lekki Phase 1 HQ, Lagos',
    skills: ['ISO 9001 / ISO 17025 Auditing', 'Tamper-Proof Sign-offs', 'ASTM Soil Standards Compliance', '48h SLA Tracking'],
    certificationsList: ['IRCA ISO 9001 Lead Auditor', 'Chartered Quality Institute (CQI)'],
    emergencyContact: { name: 'Chioma Nnamdi', phone: '+234 812 333 4455', relation: 'Spouse' },
    status: 'ACTIVE',
    createdAt: '2019-04-18'
  },
  {
    id: 'usr-9',
    email: 'blessing.john@aquaearth.com',
    name: 'Blessing John',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'Creative & Brand Design Officer',
    functionalRole: 'IT_DESIGN_OFFICER',
    accessTier: 'STANDARD',
    managementTier: 'NONE',
    departmentId: 'dept-it',
    departmentName: 'IT & Digital Operations',
    managerId: 'usr-2',
    managerName: 'Chidi Okafor',
    phone: '+234 816 789 0123',
    location: 'Lekki Phase 1 HQ, Lagos',
    skills: ['Technical Report Layout', 'Bid Presentation Design', 'GIS Cartography Typography', 'Brand Guidelines'],
    certificationsList: ['Adobe Certified Professional', 'Design Engineering Specialist'],
    emergencyContact: { name: 'David John', phone: '+234 816 111 2233', relation: 'Brother' },
    status: 'ACTIVE',
    createdAt: '2023-08-01'
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'tsk-101',
    title: 'Complete Borehole Log Analysis for Chevron Escravos (BH-04 & BH-05)',
    description: 'Compile ASTM soil classification and SPT N-values for deep strata foundation analysis.',
    moduleOrigin: 'PROJECT',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-09-05',
    assigneeId: 'usr-6',
    assigneeName: 'Tunde Bakare',
    projectId: 'prj-1',
    projectName: 'Chevron Escravos Terminal Expansion - Geotech Study',
    estimatedHours: 16,
    loggedHours: 10,
    approvalStatus: 'APPROVED',
    progressPercent: 65,
    managerId: 'usr-4',
    managerName: 'Engr. Femi Adebayo',
    comments: [
      {
        id: 'tc-1',
        authorId: 'usr-4',
        authorName: 'Engr. Femi Adebayo',
        authorRole: 'Line Manager (Head of Geotech)',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        text: 'Approved. Make sure to cross-verify the SPT refusal threshold at 28.5m depth with the offshore seismic cone penetration data.',
        timestamp: '2026-09-01 09:15'
      },
      {
        id: 'tc-2',
        authorId: 'usr-6',
        authorName: 'Tunde Bakare',
        authorRole: 'Assignee (Senior Field Geologist)',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
        text: 'Understood Engr. Femi. Laboratory triaxial shear results just arrived from the Lekki HQ lab; incorporating into the stratum chart now.',
        timestamp: '2026-09-01 14:20'
      }
    ]
  },
  {
    id: 'tsk-102',
    title: 'Drone Bathymetric Orthomosaic Processing - Bonny River',
    description: 'Process GeoTIFF rasters and generate high-resolution seabed bathymetry contours.',
    moduleOrigin: 'FIELD',
    status: 'NOT_STARTED',
    priority: 'URGENT',
    dueDate: '2026-09-04',
    assigneeId: 'usr-7',
    assigneeName: 'Halima Yusuf',
    projectId: 'prj-2',
    projectName: 'Bonny Island Channel Navigation Survey',
    estimatedHours: 12,
    loggedHours: 0,
    approvalStatus: 'APPROVED',
    progressPercent: 0,
    managerId: 'usr-4',
    managerName: 'Engr. Femi Adebayo',
    comments: [
      {
        id: 'tc-3',
        authorId: 'usr-4',
        authorName: 'Engr. Femi Adebayo',
        authorRole: 'Line Manager (Head of Geotech)',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        text: 'Please prioritize tidal datum reduction with the Bonny LNG tide gauge readings before exporting the multibeam mesh.',
        timestamp: '2026-09-01 10:00'
      }
    ]
  },
  {
    id: 'tsk-103',
    title: 'Technical Review: TotalEnergies Offshore Metocean Draft v1.2',
    description: 'Perform formal QA/QC sign-off review on extreme wave modeling and sensor calibrations.',
    moduleOrigin: 'QA',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-09-03',
    assigneeId: 'usr-8',
    assigneeName: 'Emeka Nnamdi',
    projectId: 'prj-3',
    projectName: 'TotalEnergies OML-130 Metocean Criteria Assessment',
    estimatedHours: 6,
    loggedHours: 3,
    approvalStatus: 'APPROVED',
    progressPercent: 50,
    managerId: 'usr-1',
    managerName: 'Kaine Edike',
    comments: [
      {
        id: 'tc-4',
        authorId: 'usr-1',
        authorName: 'Kaine Edike',
        authorRole: 'Managing Consultant',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        text: 'Double check Section 4.3 regarding 100-year wave height extremes against Shell Bonga benchmarking data.',
        timestamp: '2026-08-31 16:30'
      }
    ]
  },
  {
    id: 'tsk-104',
    title: 'Deliverable Template: 2026 ESIA Inception Report Format',
    description: 'Design unified Word & PPTX branded template and publish to Module 6 template store.',
    moduleOrigin: 'DESIGN',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    dueDate: '2026-09-06',
    assigneeId: 'usr-9',
    assigneeName: 'Blessing John',
    estimatedHours: 8,
    loggedHours: 4,
    approvalStatus: 'APPROVED',
    progressPercent: 40,
    managerId: 'usr-2',
    managerName: 'Chidi Okafor',
    comments: []
  },
  {
    id: 'tsk-105',
    title: 'Diagnostic & Firmware Upgrade for DGPS Rover - Unit #TB-08',
    description: 'Diagnostic check on GNSS antenna connection and reload offline sync cache.',
    moduleOrigin: 'IT',
    status: 'NOT_STARTED',
    priority: 'MEDIUM',
    dueDate: '2026-09-04',
    assigneeId: 'usr-2',
    assigneeName: 'Chidi Okafor',
    estimatedHours: 2,
    loggedHours: 0,
    approvalStatus: 'APPROVED',
    progressPercent: 0,
    managerId: 'usr-1',
    managerName: 'Kaine Edike',
    comments: []
  },
  {
    id: 'tsk-106',
    title: 'FMEnv Scoping Notification & Site Inspection Booking',
    description: 'Submit formal notification letter and pay statutory filing fee receipt.',
    moduleOrigin: 'COMPLIANCE',
    status: 'DONE',
    priority: 'HIGH',
    dueDate: '2026-08-28',
    completedAt: '2026-08-27',
    assigneeId: 'usr-5',
    assigneeName: 'Dr. Ngozi Eze',
    projectId: 'prj-4',
    projectName: 'Dangote Refinery Lekki Expansion EIA',
    estimatedHours: 5,
    loggedHours: 4,
    approvalStatus: 'APPROVED',
    progressPercent: 100,
    managerId: 'usr-1',
    managerName: 'Kaine Edike',
    comments: [
      {
        id: 'tc-5',
        authorId: 'usr-5',
        authorName: 'Dr. Ngozi Eze',
        authorRole: 'Lead Environmental Consultant',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        text: 'FMEnv Scoping Inspection receipt and confirmation letter issued. Task concluded on time.',
        timestamp: '2026-08-27 15:45'
      }
    ]
  },
  {
    id: 'tsk-107',
    title: 'Escravos Jetty Sub-bottom Profiling Survey & Strata Logging',
    description: 'Autonomous acoustic sub-bottom profiling along 3 transects at Escravos jetty approach.',
    moduleOrigin: 'FIELD',
    status: 'NOT_STARTED',
    priority: 'HIGH',
    dueDate: '2026-09-08',
    assigneeId: 'usr-6',
    assigneeName: 'Tunde Bakare',
    projectId: 'prj-1',
    projectName: 'Chevron Escravos Terminal Expansion - Geotech Study',
    estimatedHours: 14,
    loggedHours: 0,
    approvalStatus: 'PENDING_APPROVAL',
    progressPercent: 0,
    managerId: 'usr-4',
    managerName: 'Engr. Femi Adebayo',
    comments: [
      {
        id: 'tc-6',
        authorId: 'usr-6',
        authorName: 'Tunde Bakare',
        authorRole: 'Assignee (Senior Field Geologist)',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
        text: 'Created task for approval by Line Manager. Mobilizing sub-bottom transducer and mounting frame to survey launch vessel.',
        timestamp: '2026-09-02 08:00'
      }
    ]
  }
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-01',
    ticketNumber: 'REQ-2026-089',
    requesterId: 'usr-6',
    requesterName: 'Tunde Bakare',
    requesterDept: 'Geotechnical & Geophysics',
    category: 'REPAIR',
    subject: 'Field Drone DJI Matrice 300 - Propeller Sensor Error',
    description: 'During pre-flight checklist on Escravos site, obstacle sensor port showed intermittent fault.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedToId: 'usr-2',
    assignedToName: 'Chidi Okafor',
    assetId: 'AST-DRN-002',
    createdAt: '2026-09-01 09:30'
  },
  {
    id: 'tkt-02',
    ticketNumber: 'REQ-2026-090',
    requesterId: 'usr-5',
    requesterName: 'Dr. Ngozi Eze',
    requesterDept: 'Environmental & Social (ESIA)',
    category: 'DESIGN',
    subject: 'Public Consultation Hearing Poster & Executive Factsheet',
    description: 'Need branded 2-page A3 infographic poster for community liaison meeting in Bonny.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedToId: 'usr-9',
    assignedToName: 'Blessing John',
    createdAt: '2026-09-01 10:15'
  }
];

export const INITIAL_CERTIFICATIONS: CertificationItem[] = [
  {
    id: 'crt-1',
    userId: 'usr-4',
    userName: 'Engr. Femi Adebayo',
    name: 'COREN Registered Engineer (Council for the Regulation of Engineering in Nigeria)',
    issuingBody: 'COREN',
    issueDate: '2016-04-10',
    expiryDate: '2026-12-31',
    certNumber: 'R.32450/ENG',
    verified: true,
    daysUntilExpiry: 121
  },
  {
    id: 'crt-2',
    userId: 'usr-6',
    userName: 'Tunde Bakare',
    name: 'COMEG Certified Geoscientist',
    issuingBody: 'COMEG',
    issueDate: '2022-03-01',
    expiryDate: '2026-09-30',
    certNumber: 'GEM-9821-NG',
    verified: true,
    daysUntilExpiry: 29
  },
  {
    id: 'crt-3',
    userId: 'usr-5',
    userName: 'Dr. Ngozi Eze',
    name: 'EIA Specialist Accreditation (FMEnv)',
    issuingBody: 'Federal Ministry of Environment',
    issueDate: '2020-07-15',
    expiryDate: '2027-07-15',
    certNumber: 'FMENV-EIA-402',
    verified: true,
    daysUntilExpiry: 317
  }
];

export const INITIAL_LEAVE: LeaveItem[] = [
  {
    id: 'lv-1',
    userId: 'usr-7',
    userName: 'Halima Yusuf',
    leaveType: 'ANNUAL',
    startDate: '2026-09-15',
    endDate: '2026-09-22',
    daysCount: 6,
    status: 'PENDING',
    reason: 'Annual family break following completion of offshore survey campaign.',
    createdAt: '2026-08-30'
  },
  {
    id: 'lv-2',
    userId: 'usr-6',
    userName: 'Tunde Bakare',
    leaveType: 'CASUAL',
    startDate: '2026-09-08',
    endDate: '2026-09-09',
    daysCount: 2,
    status: 'APPROVED',
    reason: 'Personal engagement in Lagos.',
    createdAt: '2026-08-25'
  }
];

export const INITIAL_KPI_LEADERBOARD: KpiLeaderboardEntry[] = [
  {
    userId: 'usr-5',
    name: 'Dr. Ngozi Eze',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'Lead Environmental Consultant',
    departmentName: 'Environmental & Social',
    totalScore: 485,
    completedCount: 14,
    onTimeCount: 13,
    overdueCount: 0,
    rankPosition: 1,
    monthYear: '2026-09'
  },
  {
    userId: 'usr-6',
    name: 'Tunde Bakare',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'Senior Field Geologist',
    departmentName: 'Geotechnical & Geophysics',
    totalScore: 440,
    completedCount: 12,
    onTimeCount: 11,
    overdueCount: 1,
    rankPosition: 2,
    monthYear: '2026-09'
  },
  {
    userId: 'usr-8',
    name: 'Emeka Nnamdi',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'Senior QA/QC Reviewer',
    departmentName: 'Quality Control',
    totalScore: 390,
    completedCount: 10,
    onTimeCount: 9,
    overdueCount: 0,
    rankPosition: 3,
    monthYear: '2026-09'
  },
  {
    userId: 'usr-9',
    name: 'Blessing John',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'Brand Design Officer',
    departmentName: 'IT & Digital Operations',
    totalScore: 320,
    completedCount: 9,
    onTimeCount: 8,
    overdueCount: 1,
    rankPosition: 4,
    monthYear: '2026-09'
  },
  {
    userId: 'usr-7',
    name: 'Halima Yusuf',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'GIS & Bathymetric Analyst',
    departmentName: 'Geoinformatics & Survey',
    totalScore: 310,
    completedCount: 8,
    onTimeCount: 8,
    overdueCount: 0,
    rankPosition: 5,
    monthYear: '2026-09'
  }
];

export const INITIAL_AUDIT_LOGS: AuditRecord[] = [
  {
    id: 'aud-101',
    actorId: 'usr-1',
    actorName: 'Kaine Edike (Managing Consultant)',
    action: 'USER_ROLE_UPDATED',
    targetType: 'User Account',
    targetId: 'usr-4',
    details: 'Assigned Management Tier: LINE_MANAGER for Geotechnical & Geophysics Dept.',
    timestamp: '2026-09-01 08:30:12'
  },
  {
    id: 'aud-102',
    actorId: 'usr-2',
    actorName: 'Chidi Okafor (IT Lead)',
    action: 'VAULT_PARTITION_CHECK',
    targetType: 'AquaEarth Vault Storage',
    targetId: 'srv-node-lagos-01',
    details: 'Verified 50% Cold Archive (500GB) / 25% Runtime (250GB) / 25% Active Vault (250GB) mount integrity.',
    timestamp: '2026-09-01 09:00:00'
  },
  {
    id: 'aud-103',
    actorId: 'usr-8',
    actorName: 'Emeka Nnamdi (QA Lead)',
    action: 'QA_SIGN_OFF',
    targetType: 'Project Deliverable',
    targetId: 'deliv-2026-44',
    details: 'Approved EIA Scoping Terms of Reference v1.0 for Dangote Refinery Lekki Expansion.',
    timestamp: '2026-08-31 16:45:22'
  }
];

export const INITIAL_OPPORTUNITIES: import('./types').OpportunityItem[] = [
  {
    id: 'opp-1',
    title: 'Chevron Escravos Gas Plant Expansion - Geotech & Metocean Campaign',
    clientId: 'cli-1',
    clientName: 'Chevron Nigeria Limited',
    serviceLines: ['Geotechnical Investigations', 'Metocean Planning & Studies'],
    estimatedValue: 125000000,
    currency: 'NGN',
    stage: 'PROPOSAL_DRAFTING',
    source: 'Public Tender RFP',
    submissionDeadline: '2026-09-08 17:00',
    bdOwnerId: 'usr-1',
    bdOwnerName: 'Kaine Edike',
    technicalLeadId: 'usr-4',
    technicalLeadName: 'Engr. Femi Adebayo',
    requiresLeadershipApproval: true,
    isApprovedByLeadership: false,
    proposalDocName: 'Chevron_Escravos_Technical_Proposal_Draft_v2.docx',
    createdAt: '2026-08-20'
  },
  {
    id: 'opp-2',
    title: 'TotalEnergies OML-130 Deepwater Seabed & Bathymetric Survey',
    clientId: 'cli-2',
    clientName: 'TotalEnergies E&P Nigeria',
    serviceLines: ['GIS, Hydrographic & Topographic Survey'],
    estimatedValue: 180000,
    currency: 'USD',
    stage: 'QUALIFYING',
    source: 'Existing Client Referral',
    submissionDeadline: '2026-09-14 12:00',
    bdOwnerId: 'usr-1',
    bdOwnerName: 'Kaine Edike',
    technicalLeadId: 'usr-7',
    technicalLeadName: 'Halima Yusuf',
    requiresLeadershipApproval: true,
    isApprovedByLeadership: false,
    createdAt: '2026-08-28'
  },
  {
    id: 'opp-3',
    title: 'Dangote Lekki Refinery Phase 2 Environmental & Social Impact Assessment (ESIA)',
    clientId: 'cli-3',
    clientName: 'Dangote Petrochemical Industries',
    serviceLines: ['ESIA / EIA Studies', 'Environmental Auditing & Compliance'],
    estimatedValue: 85000000,
    currency: 'NGN',
    stage: 'SUBMITTED',
    source: 'Direct Client Inquiry',
    submissionDeadline: '2026-08-30 16:00',
    decisionDate: '2026-09-15',
    bdOwnerId: 'usr-1',
    bdOwnerName: 'Kaine Edike',
    technicalLeadId: 'usr-5',
    technicalLeadName: 'Dr. Ngozi Eze',
    requiresLeadershipApproval: true,
    isApprovedByLeadership: true,
    proposalDocName: 'Dangote_Lekki_Phase2_EIA_Signed_Proposal.pdf',
    createdAt: '2026-08-10'
  },
  {
    id: 'opp-4',
    title: 'Shell Nigeria Bonga North Subsea Pipeline Geohazard Evaluation',
    clientId: 'cli-4',
    clientName: 'Shell Petroleum Development Company (SPDC)',
    serviceLines: ['Geotechnical Investigations', 'Engineering & Environmental Geophysics'],
    estimatedValue: 240000,
    currency: 'USD',
    stage: 'WON',
    source: 'Framework Contract Tendering',
    submissionDeadline: '2026-08-15 17:00',
    decisionDate: '2026-08-25',
    bdOwnerId: 'usr-1',
    bdOwnerName: 'Kaine Edike',
    technicalLeadId: 'usr-4',
    technicalLeadName: 'Engr. Femi Adebayo',
    convertedProjectId: 'PRJ-2026-042',
    createdAt: '2026-07-20'
  },
  {
    id: 'opp-5',
    title: 'NLNG Train 7 Bonny Island Ambient Noise & Metocean Study',
    clientId: 'cli-5',
    clientName: 'Nigeria LNG Limited (NLNG)',
    serviceLines: ['Metocean Planning & Studies'],
    estimatedValue: 45000000,
    currency: 'NGN',
    stage: 'LOST',
    source: 'Competitive Tender',
    submissionDeadline: '2026-07-30 15:00',
    decisionDate: '2026-08-12',
    bdOwnerId: 'usr-1',
    bdOwnerName: 'Kaine Edike',
    winLossReason: 'Price: Competitor offered lower mobilization rate using existing vessel in Bonny anchorage.',
    winningCompetitor: 'Fugro NV',
    createdAt: '2026-07-01'
  }
];

export const INITIAL_CLIENTS: import('./types').ClientAccount[] = [
  {
    id: 'cli-1',
    name: 'Chevron Nigeria Limited',
    type: 'CLIENT',
    industry: 'Oil & Gas Upstream / Midstream',
    primaryContact: {
      name: 'Engr. Babatunde Jinadu',
      role: 'Head of Facilities & Civil Engineering',
      email: 'bjinadu@chevron.com',
      phone: '+234 803 555 0192',
      preferredChannel: 'EMAIL'
    },
    address: 'Chevron Drive, Lekki Peninsula, Lagos, Nigeria',
    activeProjectsCount: 2,
    totalRevenueBilled: 210000000,
    status: 'ACTIVE',
    lastActivityDate: '2026-08-29',
    communicationsLog: [
      {
        id: 'com-1',
        date: '2026-08-29 14:30',
        author: 'Kaine Edike',
        channel: 'Meeting (Lekki HQ)',
        summary: 'Clarification meeting on Escravos terminal soil strata parameters and CPT testing depth.',
        projectTag: 'Chevron Escravos'
      },
      {
        id: 'com-2',
        date: '2026-08-20 10:15',
        author: 'Kaine Edike',
        channel: 'Email',
        summary: 'Received official RFP document package for Escravos Gas Plant Expansion.',
        projectTag: 'Chevron Escravos'
      }
    ]
  },
  {
    id: 'cli-2',
    name: 'TotalEnergies E&P Nigeria',
    type: 'CLIENT',
    industry: 'Deepwater Exploration & Production',
    primaryContact: {
      name: 'Claire Dupont',
      role: 'Offshore Geosciences Lead',
      email: 'claire.dupont@totalenergies.com',
      phone: '+234 814 555 8820',
      preferredChannel: 'EMAIL'
    },
    address: 'Plot 25, Trans Amadi Industrial Layout, Port Harcourt',
    activeProjectsCount: 1,
    totalRevenueBilled: 350000,
    status: 'ACTIVE',
    lastActivityDate: '2026-08-28',
    communicationsLog: [
      {
        id: 'com-3',
        date: '2026-08-28 11:00',
        author: 'Halima Yusuf',
        channel: 'Teams Call',
        summary: 'Discussed bathymetric chart grid resolution (0.5m) and multibeam sonar calibration requirements.',
        projectTag: 'OML-130 Survey'
      }
    ]
  },
  {
    id: 'reg-1',
    name: 'National Environmental Standards and Regulations Enforcement Agency (NESREA)',
    type: 'REGULATOR',
    industry: 'Federal Environmental Regulator',
    primaryContact: {
      name: 'Dr. Kabir Mohammed',
      role: 'Director of Environmental Quality Control',
      email: 'k.mohammed@nesrea.gov.ng',
      phone: '+234 802 333 4410',
      preferredChannel: 'IN_PERSON'
    },
    address: 'NESREA Headquarters, Central Business District, Abuja, FCT',
    activeProjectsCount: 4,
    totalRevenueBilled: 0,
    status: 'ACTIVE',
    lastActivityDate: '2026-08-27',
    communicationsLog: [
      {
        id: 'com-4',
        date: '2026-08-27 09:30',
        author: 'Dr. Ngozi Eze',
        channel: 'Official Submission & Stamp',
        summary: 'Submitted Environmental Audit Report (EAR) verification filing and received stamped acknowledgment.',
        projectTag: 'Statutory Filing'
      }
    ]
  },
  {
    id: 'reg-2',
    name: 'Federal Ministry of Environment (FMEnv)',
    type: 'REGULATOR',
    industry: 'Federal Ministry',
    primaryContact: {
      name: 'Mrs. Folashade Adeyemi',
      role: 'Director, Environmental Assessment Department',
      email: 'eia_filings@environment.gov.ng',
      phone: '+234 803 777 9922',
      preferredChannel: 'IN_PERSON'
    },
    address: 'Mabushi Federal Secretariat, Abuja, Nigeria',
    activeProjectsCount: 3,
    totalRevenueBilled: 0,
    status: 'ACTIVE',
    lastActivityDate: '2026-08-25',
    communicationsLog: [
      {
        id: 'com-5',
        date: '2026-08-25 15:00',
        author: 'Dr. Ngozi Eze',
        channel: 'Meeting (Abuja)',
        summary: 'EIA Panel Review pre-meeting for Dangote Lekki Refinery Phase 2 scoping verification.',
        projectTag: 'Dangote Lekki EIA'
      }
    ]
  },
  {
    id: 'cli-6',
    name: 'Lekki Free Zone Development Company',
    type: 'CLIENT',
    industry: 'Infrastructure & Port Development',
    primaryContact: {
      name: 'Mr. Zhang Wei / Engr. Kunle Coker',
      role: 'Infrastructure Director',
      email: 'kcoker@lfzdc.org',
      phone: '+234 809 111 2233',
      preferredChannel: 'PHONE'
    },
    address: 'Lekki Coastal Road, Ibeju Lekki, Lagos',
    activeProjectsCount: 0,
    totalRevenueBilled: 75000000,
    status: 'DORMANT',
    lastActivityDate: '2026-05-10',
    communicationsLog: [
      {
        id: 'com-6',
        date: '2026-05-10 12:00',
        author: 'Kaine Edike',
        channel: 'Phone Call',
        summary: 'Discussed coastal protection study close-out. No subsequent engagements logged for >110 days.',
        projectTag: 'Coastal Protection'
      }
    ]
  }
];

export const INITIAL_PROJECTS: import('./types').ProjectRecord[] = [
  {
    id: 'prj-1',
    projectCode: 'PRJ-2026-001',
    title: 'Chevron Escravos Terminal Expansion - Geotech & Metocean Campaign',
    clientId: 'cli-1',
    clientName: 'Chevron Nigeria Limited',
    serviceLines: ['Geotechnical Investigations', 'Metocean Planning & Studies'],
    contractValue: 125000000,
    currency: 'NGN',
    status: 'ACTIVE',
    health: 'ON_TRACK',
    healthReason: 'All onshore drilling logs submitted on schedule; wave buoys calibrated.',
    startDate: '2026-08-01',
    targetEndDate: '2026-11-30',
    leadPmId: 'usr-4',
    leadPmName: 'Engr. Femi Adebayo',
    progressPercent: 42,
    budgetSpent: 48500000,
    vaultStorageTier: 'ACTIVE_VAULT',
    storageSizeGb: 42.8,
    workstreams: [
      {
        id: 'ws-1',
        serviceLine: 'Geotechnical Investigations',
        leadName: 'Tunde Bakare',
        progressPercent: 55,
        milestones: [
          { id: 'm-1', name: 'Drilling Rig Mobilization', workstream: 'Geotechnical', targetDate: '2026-08-10', actualDate: '2026-08-09', status: 'COMPLETED', isGatePrerequisite: true, deliverablesCount: 2 },
          { id: 'm-2', name: '10x Borehole Logs & SPT Testing', workstream: 'Geotechnical', targetDate: '2026-09-15', status: 'IN_PROGRESS', isGatePrerequisite: true, deliverablesCount: 10 },
          { id: 'm-3', name: 'Laboratory Soil Mechanics Testing', workstream: 'Geotechnical', targetDate: '2026-10-10', status: 'PENDING', deliverablesCount: 4 },
          { id: 'm-4', name: 'Final Geotech Engineering Interpretative Report', workstream: 'Geotechnical', targetDate: '2026-11-15', status: 'PENDING', deliverablesCount: 1 }
        ]
      },
      {
        id: 'ws-2',
        serviceLine: 'Metocean Planning & Studies',
        leadName: 'Engr. Femi Adebayo',
        progressPercent: 30,
        milestones: [
          { id: 'm-5', name: 'Wave Buoy & Acoustic Doppler Profiler Deployment', workstream: 'Metocean', targetDate: '2026-08-25', actualDate: '2026-08-24', status: 'COMPLETED', deliverablesCount: 1 },
          { id: 'm-6', name: '60-Day Current & Tidal Stream Data Ingestion', workstream: 'Metocean', targetDate: '2026-10-25', status: 'IN_PROGRESS', deliverablesCount: 2 },
          { id: 'm-7', name: 'Extreme Wave Height (100-yr return) Modeling Report', workstream: 'Metocean', targetDate: '2026-11-20', status: 'PENDING', deliverablesCount: 1 }
        ]
      }
    ],
    createdAt: '2026-07-25'
  },
  {
    id: 'prj-2',
    projectCode: 'PRJ-2026-002',
    title: 'Bonny Island Channel Navigation Drone Bathymetric Survey',
    clientId: 'cli-5',
    clientName: 'Nigeria LNG Limited (NLNG)',
    serviceLines: ['GIS, Hydrographic & Topographic Survey'],
    contractValue: 58000000,
    currency: 'NGN',
    status: 'ACTIVE',
    health: 'AT_RISK',
    healthReason: 'Weather delays in Bonny estuary delayed drone lidar flight window by 4 days.',
    startDate: '2026-08-15',
    targetEndDate: '2026-10-15',
    leadPmId: 'usr-4',
    leadPmName: 'Engr. Femi Adebayo',
    progressPercent: 35,
    budgetSpent: 22000000,
    vaultStorageTier: 'ACTIVE_VAULT',
    storageSizeGb: 68.4,
    workstreams: [
      {
        id: 'ws-3',
        serviceLine: 'GIS & Bathymetric Survey',
        leadName: 'Halima Yusuf',
        progressPercent: 35,
        milestones: [
          { id: 'm-8', name: 'Differential GPS Ground Control Network Setup', workstream: 'GIS', targetDate: '2026-08-20', actualDate: '2026-08-21', status: 'COMPLETED', deliverablesCount: 1 },
          { id: 'm-9', name: 'High-Res Multibeam Sonar & Drone Orthophoto Capture', workstream: 'GIS', targetDate: '2026-09-05', status: 'IN_PROGRESS', deliverablesCount: 3 },
          { id: 'm-10', name: 'Digital Elevation Model (DEM) & Bathymetry Charts', workstream: 'GIS', targetDate: '2026-09-28', status: 'PENDING', deliverablesCount: 5 }
        ]
      }
    ],
    createdAt: '2026-08-05'
  },
  {
    id: 'prj-3',
    projectCode: 'PRJ-2026-003',
    title: 'Dangote Lekki Refinery Phase 2 Environmental & Social Impact Assessment (ESIA)',
    clientId: 'cli-3',
    clientName: 'Dangote Petrochemical Industries',
    serviceLines: ['ESIA / EIA Studies', 'Environmental Auditing & Compliance'],
    contractValue: 85000000,
    currency: 'NGN',
    status: 'MOBILIZATION',
    health: 'ON_TRACK',
    healthReason: 'Scoping stage completed with FMEnv. Baseline ecological field campaign commencing.',
    startDate: '2026-09-01',
    targetEndDate: '2027-01-31',
    leadPmId: 'usr-5',
    leadPmName: 'Dr. Ngozi Eze',
    progressPercent: 10,
    budgetSpent: 8500000,
    vaultStorageTier: 'ACTIVE_VAULT',
    storageSizeGb: 8.5,
    workstreams: [
      {
        id: 'ws-4',
        serviceLine: 'ESIA Regulatory Studies',
        leadName: 'Dr. Ngozi Eze',
        progressPercent: 15,
        milestones: [
          { id: 'm-11', name: 'FMEnv EIA Terms of Reference Approval', workstream: 'ESIA', targetDate: '2026-09-10', status: 'IN_PROGRESS', isGatePrerequisite: true, deliverablesCount: 1 },
          { id: 'm-12', name: 'Wet-Season Baseline Air & Water Quality Sampling', workstream: 'ESIA', targetDate: '2026-10-15', status: 'PENDING', deliverablesCount: 8 },
          { id: 'm-13', name: 'Host Community Socio-Economic Surveys & Public Hearing', workstream: 'ESIA', targetDate: '2026-11-20', status: 'PENDING', deliverablesCount: 2 },
          { id: 'm-14', name: 'Draft Environmental Impact Statement (EIS) Submission', workstream: 'ESIA', targetDate: '2026-12-15', status: 'PENDING', deliverablesCount: 1 }
        ]
      }
    ],
    createdAt: '2026-08-25'
  },
  {
    id: 'prj-4',
    projectCode: 'PRJ-2025-089',
    title: 'Dangote Lekki Refinery Phase 1 Post-Commissioning Environmental Audit',
    clientId: 'cli-3',
    clientName: 'Dangote Petrochemical Industries',
    serviceLines: ['Environmental Auditing & Compliance'],
    contractValue: 35000000,
    currency: 'NGN',
    status: 'CLOSED_OUT',
    health: 'ON_TRACK',
    healthReason: 'Project formally delivered; regulatory NESREA clearance issued; data archived to Cold Archive tier.',
    startDate: '2025-09-01',
    targetEndDate: '2026-03-31',
    leadPmId: 'usr-5',
    leadPmName: 'Dr. Ngozi Eze',
    progressPercent: 100,
    budgetSpent: 26400000,
    vaultStorageTier: 'COLD_ARCHIVE',
    storageSizeGb: 14.2,
    workstreams: [
      {
        id: 'ws-5',
        serviceLine: 'Environmental Audit',
        leadName: 'Dr. Ngozi Eze',
        progressPercent: 100,
        milestones: [
          { id: 'm-15', name: 'Final Stamped NESREA Compliance Audit Certificate', workstream: 'Audit', targetDate: '2026-03-20', actualDate: '2026-03-18', status: 'COMPLETED', deliverablesCount: 1 }
        ]
      }
    ],
    createdAt: '2025-08-15'
  }
];

export const INITIAL_FIELD_RECORDS: import('./types').FieldRecordItem[] = [
  {
    id: 'fld-101',
    formType: 'BOREHOLE_LOG',
    projectId: 'prj-1',
    projectName: 'Chevron Escravos Terminal Expansion',
    samplePointId: 'BH-04 (Escravos Tank Farm)',
    technicianId: 'usr-6',
    technicianName: 'Tunde Bakare',
    timestamp: '2026-09-01 11:30',
    gps: {
      lat: 5.5892,
      lng: 5.1843,
      elevationM: 2.4,
      accuracyM: 0.04
    },
    payload: {
      depthM: '18.5m',
      strataClassification: 'Firm to stiff grey silty CLAY (ASTM D2487: CH)',
      waterStrikeDepth: '2.1m below GL',
      sptNValue: 'N = 18 (15cm: 5, 15cm: 6, 15cm: 7)',
      sampleTubeNo: 'U100-TB-04'
    },
    photoUrls: ['https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=400'],
    watermarkText: 'PRJ-2026-001 | BH-04 | 5.5892°N, 5.1843°E | 2026-09-01 11:30 | Tunde Bakare',
    syncStatus: 'SYNCED',
    isLockedForQA: true
  },
  {
    id: 'fld-102',
    formType: 'WATER_SAMPLING',
    projectId: 'prj-3',
    projectName: 'Dangote Lekki Refinery Phase 2 ESIA',
    samplePointId: 'SW-02 (Lekki Lagoon Outfall)',
    technicianId: 'usr-5',
    technicianName: 'Dr. Ngozi Eze',
    timestamp: '2026-09-01 14:15',
    gps: {
      lat: 6.4281,
      lng: 4.0924,
      elevationM: 1.1,
      accuracyM: 0.08
    },
    payload: {
      medium: 'Surface Estuarine Water',
      pH: 7.42,
      dissolvedOxygenMgL: 6.18,
      temperatureC: 28.4,
      conductivityMicroS: 18450,
      turbidityNtu: 8.3,
      chainOfCustodyBarcode: 'COC-FMENV-2026-9041'
    },
    photoUrls: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=400'],
    watermarkText: 'PRJ-2026-003 | SW-02 | 6.4281°N, 4.0924°E | 2026-09-01 14:15 | Dr. Ngozi Eze',
    syncStatus: 'SYNCED',
    isLockedForQA: false
  }
];

export const INITIAL_DOCUMENTS: import('./types').DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Chevron Escravos Gas Plant Expansion - Draft Geotechnical Interpretative Report',
    documentNumber: 'DOC-2026-081',
    projectId: 'prj-1',
    projectName: 'Chevron Escravos Terminal Expansion',
    category: 'TECHNICAL_REPORT',
    version: 'v0.9 Draft',
    fileSizeMb: 18.4,
    authorName: 'Tunde Bakare',
    qaStatus: 'IN_REVIEW',
    storageTier: 'ACTIVE_VAULT',
    uploadedAt: '2026-09-01 09:30',
    downloadUrl: '/vault/downloads/DOC-2026-081-DRAFT.pdf'
  },
  {
    id: 'doc-2',
    title: 'Dangote Lekki Refinery Phase 2 ESIA Draft Terms of Reference (TOR)',
    documentNumber: 'DOC-2026-079',
    projectId: 'prj-3',
    projectName: 'Dangote Lekki Refinery Phase 2 ESIA',
    category: 'TECHNICAL_REPORT',
    version: 'v1.0 Final',
    fileSizeMb: 12.8,
    authorName: 'Dr. Ngozi Eze',
    qaStatus: 'RELEASED_TO_CLIENT',
    storageTier: 'ACTIVE_VAULT',
    uploadedAt: '2026-08-28 16:00',
    downloadUrl: '/vault/downloads/DOC-2026-079-FINAL-SIGNED.pdf'
  },
  {
    id: 'doc-3',
    title: 'Bonny Island Channel Multi-Beam Bathymetry & Digital Elevation Map (DEM)',
    documentNumber: 'DOC-2026-085',
    projectId: 'prj-2',
    projectName: 'Bonny Island Channel Navigation Drone Bathymetric Survey',
    category: 'GIS_MAP',
    version: 'v0.2 Work-in-Progress',
    fileSizeMb: 145.2,
    authorName: 'Halima Yusuf',
    qaStatus: 'DRAFT_WATERMARKED',
    storageTier: 'ACTIVE_VAULT',
    uploadedAt: '2026-09-01 15:45',
    downloadUrl: '/vault/downloads/DOC-2026-085-DRAFT.pdf'
  },
  {
    id: 'doc-4',
    title: 'Dangote Lekki Phase 1 Post-Commissioning NESREA Audit Clearance Certificate',
    documentNumber: 'DOC-2026-012',
    projectId: 'prj-4',
    projectName: 'Dangote Lekki Refinery Phase 1 Environmental Audit',
    category: 'REGULATORY_PERMIT',
    version: 'v1.0 Stamped Final',
    fileSizeMb: 4.2,
    authorName: 'Dr. Ngozi Eze',
    qaStatus: 'RELEASED_TO_CLIENT',
    storageTier: 'COLD_ARCHIVE',
    uploadedAt: '2026-03-25 11:00',
    downloadUrl: '/vault/downloads/DOC-2026-012-STAMPED.pdf'
  }
];

export const INITIAL_QA_REVIEWS: import('./types').QaReviewItem[] = [
  {
    id: 'qa-1',
    documentId: 'doc-1',
    documentTitle: 'Chevron Escravos Gas Plant Expansion - Draft Geotechnical Interpretative Report',
    projectCode: 'PRJ-2026-001',
    authorId: 'usr-6',
    authorName: 'Tunde Bakare',
    stage: 'PEER_REVIEW',
    slaDeadline: '2026-09-03 17:00',
    isOverdue: false,
    peerReviewerId: 'usr-4',
    peerReviewerName: 'Engr. Femi Adebayo',
    qaLeadId: 'usr-3',
    qaLeadName: 'Amina Bello',
    managingConsultantSigned: false,
    tamperProofCertificateHash: 'SHA256:8f4c2e8a719d3b5e4f2a1b9c8d7e6f5a4b3c2d1e0f',
    reviewNotes: [
      {
        author: 'Tunde Bakare',
        role: 'Lead Author / Senior Geologist',
        timestamp: '2026-09-01 09:30',
        comment: 'Submitted for peer review with all 10 borehole stratigraphy profiles and lab CPT correlation curves.',
        action: 'APPROVED'
      }
    ],
    createdAt: '2026-09-01'
  },
  {
    id: 'qa-2',
    documentId: 'doc-2',
    documentTitle: 'Dangote Lekki Refinery Phase 2 ESIA Draft Terms of Reference (TOR)',
    projectCode: 'PRJ-2026-003',
    authorId: 'usr-5',
    authorName: 'Dr. Ngozi Eze',
    stage: 'APPROVED_RELEASED',
    slaDeadline: '2026-08-28 17:00',
    isOverdue: false,
    peerReviewerId: 'usr-4',
    peerReviewerName: 'Engr. Femi Adebayo',
    qaLeadId: 'usr-3',
    qaLeadName: 'Amina Bello',
    managingConsultantSigned: true,
    tamperProofCertificateHash: 'SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    reviewNotes: [
      {
        author: 'Dr. Ngozi Eze',
        role: 'Lead Author',
        timestamp: '2026-08-26 10:00',
        comment: 'Initial submission of TOR matching FMEnv Sectoral Guidelines for Oil & Gas Refineries.',
        action: 'APPROVED'
      },
      {
        author: 'Engr. Femi Adebayo',
        role: 'Peer Reviewer',
        timestamp: '2026-08-27 14:00',
        comment: 'Cross-checked sampling grid coordinates against satellite imagery. Scope looks sound.',
        action: 'APPROVED'
      },
      {
        author: 'Amina Bello',
        role: 'QA Lead',
        timestamp: '2026-08-28 11:30',
        comment: 'Formatting, citations, and executive summary verified. QA Gate passed.',
        action: 'APPROVED'
      },
      {
        author: 'Kaine Edike',
        role: 'Managing Consultant',
        timestamp: '2026-08-28 15:45',
        comment: 'Final release sign-off approved for client distribution and FMEnv official submission.',
        action: 'APPROVED'
      }
    ],
    createdAt: '2026-08-26'
  }
];

export const INITIAL_COMPLIANCE_PERMITS: import('./types').CompliancePermit[] = [
  {
    id: 'perm-1',
    permitTitle: 'FMEnv Environmental Impact Assessment (EIA) Approval Permit',
    permitNumber: 'FMENV/EIA/2026/0419',
    regulatoryBody: 'FMEnv',
    projectId: 'prj-3',
    projectName: 'Dangote Lekki Refinery Phase 2 ESIA',
    status: 'ACTIVE',
    issueDate: '2026-08-01',
    expiryDate: '2027-07-31',
    daysRemaining: 333,
    statutoryFeeNgn: 4500000,
    feeReconciled: true,
    isRecurringCycle: false,
    cycleDurationYears: 1,
    officerInCharge: 'Dr. Ngozi Eze',
    stampedCertificateUrl: '/vault/permits/FMENV-0419-STAMPED.pdf'
  },
  {
    id: 'perm-2',
    permitTitle: 'NESREA Triennial Environmental Audit Certification (EAR Renewal)',
    permitNumber: 'NESREA/EAR/TRI-2023-882',
    regulatoryBody: 'NESREA',
    projectId: 'prj-4',
    projectName: 'Dangote Lekki Refinery Phase 1 Environmental Audit',
    status: 'EXPIRING_SOON',
    issueDate: '2023-10-01',
    expiryDate: '2026-09-30',
    daysRemaining: 29,
    statutoryFeeNgn: 1850000,
    feeReconciled: true,
    isRecurringCycle: true,
    cycleDurationYears: 3,
    officerInCharge: 'Dr. Ngozi Eze',
    stampedCertificateUrl: '/vault/permits/NESREA-EAR-2023.pdf'
  },
  {
    id: 'perm-3',
    permitTitle: 'NUPRC Offshore Baseline & Effluent Discharge Permit (EGASPIN)',
    permitNumber: 'NUPRC/ENV/OFF-2026-019',
    regulatoryBody: 'NUPRC',
    projectId: 'prj-1',
    projectName: 'Chevron Escravos Terminal Expansion',
    status: 'ACTIVE',
    issueDate: '2026-07-15',
    expiryDate: '2027-01-14',
    daysRemaining: 135,
    statutoryFeeNgn: 2750000,
    feeReconciled: true,
    isRecurringCycle: true,
    cycleDurationYears: 1,
    officerInCharge: 'Engr. Femi Adebayo',
    stampedCertificateUrl: '/vault/permits/NUPRC-EGASPIN-2026.pdf'
  },
  {
    id: 'perm-4',
    permitTitle: 'Lagos State LASEPA Industrial Air Emissions & Effluent Permit',
    permitNumber: 'LASEPA/IND/2026/1102',
    regulatoryBody: 'STATE_MOE',
    status: 'ACTIVE',
    issueDate: '2026-01-10',
    expiryDate: '2026-12-31',
    daysRemaining: 121,
    statutoryFeeNgn: 650000,
    feeReconciled: true,
    isRecurringCycle: true,
    cycleDurationYears: 1,
    officerInCharge: 'Dr. Ngozi Eze'
  }
];

export const INITIAL_INVOICES: import('./types').InvoiceItem[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-041',
    projectId: 'prj-1',
    projectName: 'Chevron Escravos Terminal Expansion',
    clientId: 'cli-1',
    clientName: 'Chevron Nigeria Limited',
    milestoneDescription: 'Milestone 1: Drilling Rig Mobilization & Desktop Inception Sign-off (30%)',
    subtotalNgn: 37500000,
    vatRatePercent: 7.5,
    vatAmountNgn: 2812500,
    whtRatePercent: 5.0,
    whtDeductionNgn: 1875000,
    netPayableNgn: 38437500,
    whtCreditNoteReceived: true,
    whtCreditNoteNumber: 'WHT-FIRS-2026-99014',
    status: 'PAID',
    issuedDate: '2026-08-12',
    dueDate: '2026-08-26',
    paidDate: '2026-08-24',
    currency: 'NGN'
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-048',
    projectId: 'prj-1',
    projectName: 'Chevron Escravos Terminal Expansion',
    clientId: 'cli-1',
    clientName: 'Chevron Nigeria Limited',
    milestoneDescription: 'Milestone 2: Completion of 10x Onshore & Nearshore Borehole Logs (40%)',
    subtotalNgn: 50000000,
    vatRatePercent: 7.5,
    vatAmountNgn: 3750000,
    whtRatePercent: 5.0,
    whtDeductionNgn: 2500000,
    netPayableNgn: 51250000,
    whtCreditNoteReceived: false,
    status: 'ISSUED',
    issuedDate: '2026-09-01',
    dueDate: '2026-09-15',
    currency: 'NGN'
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-045',
    projectId: 'prj-2',
    projectName: 'Bonny Island Channel Navigation Drone Bathymetric Survey',
    clientId: 'cli-5',
    clientName: 'Nigeria LNG Limited (NLNG)',
    milestoneDescription: 'Milestone 1: Differential GPS Ground Control Network & Inception Setup (40%)',
    subtotalNgn: 23200000,
    vatRatePercent: 7.5,
    vatAmountNgn: 1740000,
    whtRatePercent: 5.0,
    whtDeductionNgn: 1160000,
    netPayableNgn: 23780000,
    whtCreditNoteReceived: false,
    status: 'ISSUED',
    issuedDate: '2026-08-22',
    dueDate: '2026-09-05',
    currency: 'NGN'
  }
];

export const INITIAL_HARDWARE_ASSETS: import('./types').HardwareAsset[] = [
  {
    id: 'ast-1',
    assetTag: 'AE-HW-001',
    name: 'Trimble R12i GNSS Differential GPS RTK Base & Rover System',
    category: 'SURVEY_DGPS',
    assignedToName: 'Halima Yusuf',
    assignedToDept: 'Geoinformatics & Survey',
    purchaseDate: '2025-06-15',
    status: 'OPERATIONAL',
    location: 'Bonny Island Field Base'
  },
  {
    id: 'ast-2',
    assetTag: 'AE-HW-002',
    name: 'DJI Matrice 300 RTK Industrial Survey Drone with Zenmuse L1 LiDAR',
    category: 'DRONE',
    assignedToName: 'Halima Yusuf',
    assignedToDept: 'Geoinformatics & Survey',
    purchaseDate: '2025-08-20',
    status: 'OPERATIONAL',
    location: 'Lekki HQ Survey Lab'
  },
  {
    id: 'ast-3',
    assetTag: 'AE-HW-003',
    name: 'YSI ProDSS Multi-Parameter Water Quality Probing Meter with Optical DO',
    category: 'WATER_PROBE',
    assignedToName: 'Dr. Ngozi Eze',
    assignedToDept: 'Environmental & Social Studies (ESIA)',
    purchaseDate: '2025-03-10',
    status: 'OPERATIONAL',
    location: 'Lekki Environmental Lab'
  },
  {
    id: 'ast-4',
    assetTag: 'AE-HW-004',
    name: 'Dell Precision 7780 Mobile Workstation (64GB RAM, RTX 4000 Ada)',
    category: 'LAPTOP',
    assignedToName: 'Tunde Bakare',
    assignedToDept: 'Geotechnical Engineering',
    purchaseDate: '2025-11-01',
    status: 'OPERATIONAL',
    location: 'Escravos Site Office'
  }
];

export const INITIAL_SUBSCRIPTIONS: import('./types').SubscriptionItem[] = [
  {
    id: 'sub-1',
    serviceName: 'Starlink Business High-Performance Maritime Terminal (Escravos)',
    provider: 'Starlink Nigeria',
    category: 'CONNECTIVITY',
    renewalDate: '2026-09-28',
    daysRemaining: 27,
    monthlyCostNgn: 450000,
    assignedUnit: 'Escravos Barge Node',
    status: 'EXPIRING_SOON'
  },
  {
    id: 'sub-2',
    serviceName: 'MTN Business 5G Enterprise Data Pool (500GB)',
    provider: 'MTN Nigeria',
    category: 'CONNECTIVITY',
    renewalDate: '2026-09-30',
    daysRemaining: 29,
    monthlyCostNgn: 185000,
    assignedUnit: 'Lekki HQ Router',
    status: 'ACTIVE'
  },
  {
    id: 'sub-3',
    serviceName: 'ESRI ArcGIS Pro Advanced Floating Licenses (5 Seats)',
    provider: 'Sambus Geospatial (ESRI Distributor)',
    category: 'SOFTWARE_LICENSE',
    renewalDate: '2027-04-30',
    daysRemaining: 241,
    monthlyCostNgn: 1200000,
    assignedUnit: 'GIS Department',
    status: 'ACTIVE'
  }
];

export const INITIAL_DESIGN_REQUESTS: import('./types').DesignRequest[] = [
  {
    id: 'dsg-1',
    requestNumber: 'DSG-2026-024',
    title: 'Chevron Escravos Subsea 3D Geological Stratigraphy Profile Block Diagram',
    projectId: 'prj-1',
    requesterName: 'Tunde Bakare',
    is24hRush: true,
    status: 'IN_PROGRESS',
    createdAt: '2026-09-01 10:00'
  },
  {
    id: 'dsg-2',
    requestNumber: 'DSG-2026-021',
    title: 'Dangote Lekki Phase 2 Baseline Sensitive Habitat & Vegetation Buffer Map (A0 Format)',
    projectId: 'prj-3',
    requesterName: 'Dr. Ngozi Eze',
    is24hRush: false,
    status: 'COMPLETED',
    deliverableUrl: '/vault/maps/Dangote-Lekki-Habitats-A0.pdf',
    createdAt: '2026-08-29 11:30'
  }
];

export const INITIAL_EXECUTIVE_DIGEST_CONFIG: import('./types').ExecutiveDigestConfig = {
  emailRecipients: [
    'kaine.edike@aquaearth.ng',
    'board_distribution@aquaearth.ng',
    'femi.adebayo@aquaearth.ng',
    'ngozi.eze@aquaearth.ng'
  ],
  scheduleDay: 'MONDAY',
  scheduleTime: '08:00 WAT',
  lastSentTimestamp: '2026-08-31 08:00',
  activeMetrics: [
    'Total Active Pipeline NGN Eq.',
    'Weighted Win Rate %',
    'Portfolio RAG Health Distribution',
    'Cash Collection vs Outstanding VAT/WHT',
    'Departmental Staff Utilization %',
    'Top 3 KPI Performers'
  ]
};

export const INITIAL_ACCESS_REQUESTS: import('./types').AccessRequestItem[] = [
  {
    id: 'req-acc-1',
    fullName: 'Chibuike Okonkwo',
    email: 'c.okonkwo@aquaearth.ng',
    jobTitle: 'Junior Geotechnical Drilling Tech',
    departmentName: 'Geotechnical Engineering',
    professionalLicense: 'COREN Graduate Member',
    assignedProjectCode: 'PRJ-2026-001',
    justification: 'Assigned to Escravos drilling campaign to log onshore CPT penetration testing data.',
    status: 'PENDING',
    createdAt: '2026-09-01 08:30'
  }
];

export const INITIAL_NOTIFICATIONS: import('./types').NotificationItem[] = [
  {
    id: 'notif-1',
    category: 'APPROVAL',
    title: 'High-Value Bid Sign-Off Gate',
    message: 'Chevron Escravos Gas Plant Expansion tender (₦125,000,000) is ready for submission and requires Managing Consultant sign-off.',
    timestamp: '10m ago',
    isRead: false,
    priority: 'URGENT',
    actionType: 'APPROVE_BID',
    actionTargetId: 'opp-1',
    actionLabel: 'Review Bid Dossier',
    actionUrl: '/bd/pipeline',
    actionDone: false
  },
  {
    id: 'notif-2',
    category: 'QA_REVIEW',
    title: '48h Technical Review SLA Active',
    message: 'Chevron Escravos Draft Geotech Interpretative Report is pending Peer Review by Engr. Femi Adebayo (38h remaining).',
    timestamp: '1h ago',
    isRead: false,
    priority: 'HIGH',
    actionType: 'REVIEW_QA',
    actionTargetId: 'qa-1',
    actionLabel: 'Enter QA Gate',
    actionUrl: '/qa',
    actionDone: false
  },
  {
    id: 'notif-3',
    category: 'COMPLIANCE',
    title: 'NESREA Statutory Audit Renewal Alert',
    message: 'Dangote Lekki Phase 1 Triennial Environmental Audit Certificate expires in 29 days (Sept 30, 2026).',
    timestamp: '3h ago',
    isRead: false,
    priority: 'HIGH',
    actionType: 'RENEW_PERMIT',
    actionTargetId: 'perm-2',
    actionLabel: 'Initiate Renewal Cycle',
    actionUrl: '/compliance',
    actionDone: false
  },
  {
    id: 'notif-4',
    category: 'KPI_ALERT',
    title: 'KPI Point Awarded',
    message: 'Tunde Bakare submitted Borehole Log BH-04 with differential GPS (+30 pts). Currently #3 on leaderboard.',
    timestamp: '4h ago',
    isRead: false,
    priority: 'NORMAL',
    actionLabel: 'View KPI Leaderboard',
    actionUrl: '/kpi/leaderboard'
  },
  {
    id: 'notif-5',
    category: 'DEADLINE',
    title: 'Target Milestone Approaching (24h SLA)',
    message: 'Total E&P OML-58 Metocean Wave & Current Baseline report submission is due tomorrow at 17:00 WAT.',
    timestamp: '5h ago',
    isRead: false,
    priority: 'URGENT',
    actionLabel: 'Inspect Deliverables',
    actionUrl: '/projects'
  },
  {
    id: 'notif-6',
    category: 'SYSTEM',
    title: 'Sovereign Vault Archive Synchronized',
    message: 'Nightly cryptographic snapshot of closed project documents completed. SHA-256 integrity check verified 100%.',
    timestamp: '8h ago',
    isRead: true,
    priority: 'NORMAL',
    actionLabel: 'Inspect Vault Health',
    actionUrl: '/vault'
  }
];

export const INITIAL_ATTENDANCE: import('./types').AttendanceRecordItem[] = [
  {
    id: 'att-1',
    userId: 'usr-1',
    userName: 'Kaine Edike',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    date: '2026-09-01',
    clockInTime: '07:48:22',
    clockOutTime: undefined,
    locationTag: 'Lekki HQ',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E'
  },
  {
    id: 'att-2',
    userId: 'usr-4',
    userName: 'Engr. Femi Adebayo',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    date: '2026-09-01',
    clockInTime: '08:02:14',
    clockOutTime: undefined,
    locationTag: 'Escravos Field Base',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '5.5833°N, 5.1667°E'
  },
  {
    id: 'att-3',
    userId: 'usr-5',
    userName: 'Dr. Ngozi Eze',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    date: '2026-09-01',
    clockInTime: '07:55:00',
    clockOutTime: undefined,
    locationTag: 'Lekki Environmental Lab',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E'
  },
  {
    id: 'att-4',
    userId: 'usr-6',
    userName: 'Tunde Bakare',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    date: '2026-09-01',
    clockInTime: '08:35:10',
    clockOutTime: undefined,
    locationTag: 'Escravos Barge',
    status: 'LATE',
    kpiAwarded: 0,
    coordinates: '5.5833°N, 5.1667°E',
    notes: 'Helicopter transfer delayed by weather.'
  }
];
