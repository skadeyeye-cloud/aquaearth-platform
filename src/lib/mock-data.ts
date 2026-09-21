import { 
  UserProfile, 
  TaskItem, 
  SupportTicket, 
  CertificationItem, 
  LeaveItem, 
  KpiLeaderboardEntry, 
  AuditRecord,
  DocumentFolder,
  BudgetRequest,
  StaffQuery,
  PayrollRecord,
  CandidateApplication,
  PettyCashFund,
  PettyCashTransaction,
  PettyCashAnalysis,
  PettyCashTopUpRecord,
  ProjectType,
  ProjectTemplateDefinition,
  TemplateTaskDefinition,
  ProjectExpenseItem,
  ClientReceiptItem
} from './types';

export const DEFAULT_CORPORATE_PASSWORD = 'AquaEarth@2026!';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    email: 'kaine.edike@aquaearth.com',
    password: DEFAULT_CORPORATE_PASSWORD,
    name: 'Kaine Edike',
    avatar: '/avatars/kaine-edike.png',
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
  },
  {
    id: 'usr-10',
    email: 'bibi@aquaearth.com',
    name: 'Bibi',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'Executive Director (2nd in Command)',
    functionalRole: 'DEPUTY_MANAGING_CONSULTANT',
    accessTier: 'SUPERADMIN',
    managementTier: 'DEPT_HEAD',
    departmentId: 'dept-exec',
    departmentName: 'Executive Leadership',
    managerId: 'usr-1',
    managerName: 'Kaine Edike',
    phone: '+234 803 222 9988',
    location: 'Lekki Phase 1 HQ, Lagos',
    skills: ['Alternative Executive Governance', 'High-Stakes Negotiations', 'Corporate Strategy', 'Risk Management'],
    certificationsList: ['Fellow IoD Nigeria', 'MBA Oxford'],
    emergencyContact: { name: 'Folarin Davies', phone: '+234 803 111 2233', relation: 'Spouse' },
    status: 'ACTIVE',
    createdAt: '2017-04-12'
  },
  {
    id: 'usr-11',
    email: 'erica@aquaearth.com',
    name: 'Erica',
    avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'Chief Financial Officer (CFO)',
    functionalRole: 'CFO',
    accessTier: 'SUPERADMIN',
    managementTier: 'DEPT_HEAD',
    departmentId: 'dept-finance',
    departmentName: 'Finance & Accounts',
    managerId: 'usr-1',
    managerName: 'Kaine Edike',
    phone: '+234 802 333 4455',
    location: 'Lekki Phase 1 HQ, Lagos',
    skills: ['Budget Oversight', 'Financial Projection', 'Treasury & Capex Planning', 'Tax Structuring (WHT/VAT)', 'Cost Control'],
    certificationsList: ['FCA Chartered Accountant (ICAN)', 'ACCA Fellow'],
    emergencyContact: { name: 'Engr. Michael Erica', phone: '+234 802 999 8877', relation: 'Spouse' },
    status: 'ACTIVE',
    createdAt: '2018-01-10'
  },
  {
    id: 'usr-12',
    email: 'ozioma@aquaearth.com',
    name: 'Miss Ozioma',
    avatar: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'Senior Consultant & Commercial Liaison',
    functionalRole: 'SENIOR_CONSULTANT',
    accessTier: 'SUPERADMIN',
    managementTier: 'LINE_MANAGER',
    departmentId: 'dept-commercial',
    departmentName: 'Project Management & Commercial',
    managerId: 'usr-1',
    managerName: 'Kaine Edike',
    phone: '+234 806 777 8899',
    location: 'Lekki Phase 1 HQ, Lagos',
    skills: ['Client-Facing Budget Projection', 'Commercial Tendering', 'Stakeholder Engagement', 'Project Milestones'],
    certificationsList: ['PMP Certified', 'Member Nigerian Environmental Society (NES)'],
    emergencyContact: { name: 'Chisom Ozioma', phone: '+234 806 555 4433', relation: 'Sister' },
    status: 'ACTIVE',
    createdAt: '2019-08-15'
  },
  {
    id: 'usr-13',
    email: 'gift@aquaearth.com',
    name: 'Gift',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'Finance Officer (Collation & Petty Cash Lead)',
    functionalRole: 'FINANCE_OFFICER',
    accessTier: 'STANDARD',
    managementTier: 'NONE',
    departmentId: 'dept-finance',
    departmentName: 'Finance & Accounts',
    managerId: 'usr-11',
    managerName: 'Erica',
    phone: '+234 814 111 2233',
    location: 'Lekki Phase 1 HQ, Lagos',
    skills: ['Budget Collation', 'Petty Cash Fund Custody', 'Monthly Financial Analysis', 'Fund Retirement Vouching'],
    certificationsList: ['ACA in View', 'B.Sc Accounting (Unilag)'],
    emergencyContact: { name: 'Grace Gift', phone: '+234 814 999 0011', relation: 'Mother' },
    status: 'ACTIVE',
    createdAt: '2022-05-15'
  },
  {
    id: 'usr-14',
    email: 'marvelous@aquaearth.com',
    name: 'Marvelous',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'Finance Officer (Invoicing Lead & Petty Cash)',
    functionalRole: 'FINANCE_OFFICER',
    accessTier: 'STANDARD',
    managementTier: 'NONE',
    departmentId: 'dept-finance',
    departmentName: 'Finance & Accounts',
    managerId: 'usr-11',
    managerName: 'Erica',
    phone: '+234 815 222 3344',
    location: 'Lekki Phase 1 HQ, Lagos',
    skills: ['Milestone Invoicing Preparation', 'Petty Cash Fund Custody', 'Multi-Currency Billing (NGN/USD)', 'Accounts Reconciliation'],
    certificationsList: ['ICAN Member', 'B.Sc Banking & Finance'],
    emergencyContact: { name: 'Peter Marvelous', phone: '+234 815 888 7766', relation: 'Brother' },
    status: 'ACTIVE',
    createdAt: '2022-06-01'
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
        avatar: '/avatars/kaine-edike.png',
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
  },
  {
    id: 'tsk-108',
    title: 'Cone Penetration Test (CPT-03) Soil Stratum Logging - Lekki Deep Sea Port',
    description: 'Execute deep electrical piezocone penetration testing to 30m depth and log pore water pressure dissipation.',
    moduleOrigin: 'FIELD',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-09-28',
    assigneeId: 'usr-6',
    assigneeName: 'Tunde Bakare',
    projectId: 'prj-1',
    projectName: 'Chevron Escravos Terminal Expansion - Geotech Study',
    estimatedHours: 16,
    loggedHours: 7,
    approvalStatus: 'APPROVED',
    progressPercent: 45,
    managerId: 'usr-4',
    managerName: 'Engr. Femi Adebayo',
    comments: [
      {
        id: 'tc-108-1',
        authorId: 'usr-4',
        authorName: 'Engr. Femi Adebayo',
        authorRole: 'Line Manager (Head of Geotech)',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        text: 'Ensure friction sleeve readings are normalized against overburden stress for the clay layer.',
        timestamp: '2026-09-18 10:15'
      }
    ]
  },
  {
    id: 'tsk-109',
    title: 'Multibeam Sonar Bathymetric Surface Interpolation - Escravos Navigation Fairway',
    description: 'Process multibeam point cloud and compute navigational draft safety clearance contours.',
    moduleOrigin: 'PROJECT',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-09-26',
    assigneeId: 'usr-7',
    assigneeName: 'Halima Yusuf',
    projectId: 'prj-2',
    projectName: 'Bonny Island Channel Navigation Survey',
    estimatedHours: 14,
    loggedHours: 8,
    approvalStatus: 'APPROVED',
    progressPercent: 60,
    managerId: 'usr-4',
    managerName: 'Engr. Femi Adebayo',
    comments: []
  },
  {
    id: 'tsk-110',
    title: 'Technical Executive Summary Infographics - TotalEnergies OML-130 Metocean Report',
    description: 'Design executive summary data visualizations, extreme wave probability graphs, and branded map layouts.',
    moduleOrigin: 'DESIGN',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    dueDate: '2026-09-24',
    assigneeId: 'usr-9',
    assigneeName: 'Blessing John',
    projectId: 'prj-3',
    projectName: 'TotalEnergies OML-130 Metocean Criteria Assessment',
    estimatedHours: 10,
    loggedHours: 7,
    approvalStatus: 'APPROVED',
    progressPercent: 70,
    managerId: 'usr-2',
    managerName: 'Chidi Okafor',
    comments: []
  },
  {
    id: 'tsk-111',
    title: 'QA/QC Verification of Geotechnical Laboratory Triaxial Shear Test Records',
    description: 'Verify Mohr-Coulomb shear strength envelopes and validate consolidation test results from Lekki HQ lab.',
    moduleOrigin: 'QA',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-09-27',
    assigneeId: 'usr-8',
    assigneeName: 'Emeka Nnamdi',
    projectId: 'prj-1',
    projectName: 'Chevron Escravos Terminal Expansion - Geotech Study',
    estimatedHours: 8,
    loggedHours: 3,
    approvalStatus: 'APPROVED',
    progressPercent: 40,
    managerId: 'usr-1',
    managerName: 'Kaine Edike',
    comments: []
  },
  {
    id: 'tsk-112',
    title: 'DGPS Trimble Geo7X Rover Firmware Synchronization & RTK Base Station Check',
    description: 'Synchronize satellite almanacs, check RTK UHF radio link telemetry, and calibrate geoid models.',
    moduleOrigin: 'IT',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    dueDate: '2026-09-25',
    assigneeId: 'usr-2',
    assigneeName: 'Chidi Okafor',
    estimatedHours: 6,
    loggedHours: 3,
    approvalStatus: 'APPROVED',
    progressPercent: 50,
    managerId: 'usr-1',
    managerName: 'Kaine Edike',
    comments: []
  },
  {
    id: 'tsk-113',
    title: 'Dangote Refinery ESIA Air Quality Dispersion Modeling & Baseline Verification',
    description: 'Run AERMOD simulation for stack emissions and correlate with dry-season ambient PM2.5 monitoring stations.',
    moduleOrigin: 'PROJECT',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-09-29',
    assigneeId: 'usr-5',
    assigneeName: 'Dr. Ngozi Eze',
    projectId: 'prj-4',
    projectName: 'Dangote Refinery Lekki Expansion EIA',
    estimatedHours: 20,
    loggedHours: 11,
    approvalStatus: 'APPROVED',
    progressPercent: 55,
    managerId: 'usr-1',
    managerName: 'Kaine Edike',
    comments: []
  },
  {
    id: 'tsk-114',
    title: 'High-Resolution 2D Seismic Sub-bottom Profile Stratigraphic Horizon Mapping',
    description: 'Correlate acoustic reflection reflectors with deep borehole logs to identify palaeochannels and gas pockets.',
    moduleOrigin: 'PROJECT',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-09-30',
    assigneeId: 'usr-1788770206554-1',
    assigneeName: 'Babatunde Adeleke',
    projectId: 'prj-1',
    projectName: 'Chevron Escravos Terminal Expansion - Geotech Study',
    estimatedHours: 18,
    loggedHours: 6,
    approvalStatus: 'APPROVED',
    progressPercent: 35,
    managerId: 'usr-4',
    managerName: 'Engr. Femi Adebayo',
    comments: []
  },
  {
    id: 'tsk-115',
    title: 'Aquifer Pumping Test Hydrogeological Drawdown & Transmissivity Analysis',
    description: 'Calculate Cooper-Jacob aquifer hydraulic conductivity and evaluate saline intrusion risk from coastal wells.',
    moduleOrigin: 'PROJECT',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    dueDate: '2026-09-28',
    assigneeId: 'usr-1788770206559-2',
    assigneeName: 'Dr. Kelechi Okonkwo',
    projectId: 'prj-2',
    projectName: 'Bonny Island Channel Navigation Survey',
    estimatedHours: 14,
    loggedHours: 7,
    approvalStatus: 'APPROVED',
    progressPercent: 50,
    managerId: 'usr-4',
    managerName: 'Engr. Femi Adebayo',
    comments: []
  },
  {
    id: 'tsk-116',
    title: 'Field HSE JSA Audit & Offshore Survey Vessel Life-Saving Appliances Inspection',
    description: 'Conduct pre-mobilization safety briefing, test MOB beacons, and audit gas detectors on survey tug.',
    moduleOrigin: 'COMPLIANCE',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-09-25',
    assigneeId: 'usr-1788770206559-3',
    assigneeName: 'Fatima Mohammed',
    projectId: 'prj-1',
    projectName: 'Chevron Escravos Terminal Expansion - Geotech Study',
    estimatedHours: 8,
    loggedHours: 5,
    approvalStatus: 'APPROVED',
    progressPercent: 65,
    managerId: 'usr-1',
    managerName: 'Kaine Edike',
    comments: []
  },
  {
    id: 'tsk-117',
    title: 'Borehole BH-06 Core Recovery & In-Situ Vane Shear Field Testing',
    description: 'Drill marine borehole to 25m below seabed and perform automated shear vane tests at 1.5m intervals.',
    moduleOrigin: 'FIELD',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: '2026-09-29',
    assigneeId: 'usr-6',
    assigneeName: 'Tunde Bakare',
    projectId: 'prj-1',
    projectName: 'Chevron Escravos Terminal Expansion - Geotech Study',
    estimatedHours: 12,
    loggedHours: 3,
    approvalStatus: 'APPROVED',
    progressPercent: 25,
    managerId: 'usr-4',
    managerName: 'Engr. Femi Adebayo',
    comments: []
  },
  {
    id: 'tsk-118',
    title: 'AquaEarth 2026 Sustainability & HSE Field Guidelines Brochure Layout',
    description: 'Typeset field safety guidelines, emergency contacts, and environmental protocols in print-ready booklet.',
    moduleOrigin: 'DESIGN',
    status: 'IN_PROGRESS',
    priority: 'LOW',
    dueDate: '2026-09-30',
    assigneeId: 'usr-9',
    assigneeName: 'Blessing John',
    estimatedHours: 8,
    loggedHours: 2,
    approvalStatus: 'APPROVED',
    progressPercent: 30,
    managerId: 'usr-2',
    managerName: 'Chidi Okafor',
    comments: []
  },
  {
    id: 'tsk-119',
    title: 'Coastal Erosion GIS Transect Mapping & Shoreline Retreat Vector Analysis',
    description: 'Digitize multi-temporal satellite imagery from 2010 to 2026 and compute coastal retreat rates in DSAS.',
    moduleOrigin: 'FIELD',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    dueDate: '2026-09-27',
    assigneeId: 'usr-7',
    assigneeName: 'Halima Yusuf',
    projectId: 'prj-2',
    projectName: 'Bonny Island Channel Navigation Survey',
    estimatedHours: 12,
    loggedHours: 5,
    approvalStatus: 'APPROVED',
    progressPercent: 40,
    managerId: 'usr-4',
    managerName: 'Engr. Femi Adebayo',
    comments: []
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
    userDepartment: 'HSE & Quality Control',
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
    userDepartment: 'Geotechnical & Geophysics',
    leaveType: 'CASUAL',
    startDate: '2026-09-08',
    endDate: '2026-09-09',
    daysCount: 2,
    status: 'APPROVED',
    reason: 'Personal engagement in Lagos.',
    createdAt: '2026-08-25',
    approvedById: 'usr-4',
    approvedByName: 'Engr. Femi Adebayo',
    approverRole: 'Head of Geotechnical Engineering',
    approvalDate: '2026-08-26',
    approverComments: 'Approved. Core sampling roster covered by junior field engineers.'
  },
  {
    id: 'lv-3',
    userId: 'usr-14',
    userName: 'Babatunde Adeleke',
    userDepartment: 'Geotechnical & Geophysics',
    leaveType: 'ANNUAL',
    startDate: '2026-09-24',
    endDate: '2026-10-02',
    daysCount: 7,
    status: 'PENDING',
    reason: 'Post-fieldwork annual vacation break.',
    createdAt: '2026-09-12'
  },
  {
    id: 'lv-4',
    userId: 'usr-10',
    userName: 'Segun Alabi',
    userDepartment: 'Environmental & Social (ESIA)',
    leaveType: 'SICK',
    startDate: '2026-09-10',
    endDate: '2026-09-12',
    daysCount: 3,
    status: 'APPROVED',
    reason: 'Medical recovery following malaria fever treatment.',
    createdAt: '2026-09-09',
    approvedById: 'usr-5',
    approvedByName: 'Dr. Ngozi Eze',
    approverRole: 'Lead Environmental Consultant (ESIA)',
    approvalDate: '2026-09-09',
    approverComments: 'Approved. Get well soon; report handover confirmed.'
  },
  {
    id: 'lv-5',
    userId: 'usr-9',
    userName: 'Kehinde Johnson',
    userDepartment: 'IT & Digital Operations',
    leaveType: 'ANNUAL',
    startDate: '2026-10-05',
    endDate: '2026-10-12',
    daysCount: 6,
    status: 'PENDING',
    reason: 'Annual leave & family commitment.',
    createdAt: '2026-09-14'
  },
  {
    id: 'lv-6',
    userId: 'usr-12',
    userName: 'Grace Danjuma',
    userDepartment: 'Commercial & BD',
    leaveType: 'CASUAL',
    startDate: '2026-09-18',
    endDate: '2026-09-19',
    daysCount: 2,
    status: 'PENDING',
    reason: 'Professional energy transition legal and regulatory seminar.',
    createdAt: '2026-09-15'
  },
  {
    id: 'lv-7',
    userId: 'usr-3',
    userName: 'Amina Bello',
    userDepartment: 'Human Resources',
    leaveType: 'ANNUAL',
    startDate: '2026-12-20',
    endDate: '2026-12-28',
    daysCount: 6,
    status: 'APPROVED',
    reason: 'Year-end vacation break.',
    createdAt: '2026-09-01',
    approvedById: 'usr-1',
    approvedByName: 'Kaine Edike',
    approverRole: 'Managing Consultant (MD)',
    approvalDate: '2026-09-02',
    approverComments: 'Approved in alignment with holiday coverage schedule.'
  }
];

export const INITIAL_KPI_LEADERBOARD: KpiLeaderboardEntry[] = [
  {
    userId: 'usr-1',
    name: 'Kaine Edike',
    avatar: '/avatars/kaine-edike.png',
    jobTitle: 'Founder & Managing Consultant',
    departmentName: 'Executive Leadership',
    totalScore: 520,
    completedCount: 16,
    onTimeCount: 15,
    overdueCount: 0,
    rankPosition: 1,
    monthYear: '2026-09'
  },
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
    rankPosition: 2,
    monthYear: '2026-09'
  },
  {
    userId: 'usr-4',
    name: 'Engr. Femi Adebayo',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    jobTitle: 'Head of Geotechnical Engineering',
    departmentName: 'Geotechnical & Geophysics',
    totalScore: 465,
    completedCount: 13,
    onTimeCount: 12,
    overdueCount: 0,
    rankPosition: 3,
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
    rankPosition: 4,
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
    rankPosition: 5,
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
    rankPosition: 6,
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
    rankPosition: 7,
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
    actionUrl: '/projects',
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
    actionUrl: '/projects',
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
  // September 2026 (Current Month & Today)
  {
    id: 'att-2026-09-17-kaine',
    userId: 'usr-1',
    userName: 'Kaine Edike',
    userAvatar: '/avatars/kaine-edike.png',
    date: '2026-09-17',
    clockInTime: '07:44:18',
    clockOutTime: '18:10:45',
    locationTag: 'Lekki HQ (Executive Suite)',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E',
    notes: 'Presided over Board prep & Finance review.'
  },
  {
    id: 'att-2026-09-17-bibi',
    userId: 'usr-2',
    userName: 'Bibi',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    date: '2026-09-17',
    clockInTime: '07:51:30',
    clockOutTime: '17:45:00',
    locationTag: 'Lekki HQ (Operations Deck)',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E',
    notes: 'Executive oversight on Total E&P ESIA submission.'
  },
  {
    id: 'att-2026-09-17-erica',
    userId: 'usr-3',
    userName: 'Erica',
    userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    date: '2026-09-17',
    clockInTime: '08:02:10',
    clockOutTime: '17:30:15',
    locationTag: 'Lekki HQ (Finance Wing)',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E',
    notes: 'CFO budget vetting & imprest balance audit.'
  },
  {
    id: 'att-2026-09-17-ozioma',
    userId: 'usr-10',
    userName: 'Miss Ozioma',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    date: '2026-09-17',
    clockInTime: '08:05:40',
    clockOutTime: undefined,
    locationTag: 'Lekki HQ (Commercial)',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E'
  },
  {
    id: 'att-2026-09-17-femi',
    userId: 'usr-4',
    userName: 'Engr. Femi Adebayo',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    date: '2026-09-17',
    clockInTime: '07:58:20',
    clockOutTime: undefined,
    locationTag: 'Escravos Field Base',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '5.5833°N, 5.1667°E'
  },
  {
    id: 'att-2026-09-17-ngozi',
    userId: 'usr-5',
    userName: 'Dr. Ngozi Eze',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    date: '2026-09-17',
    clockInTime: '07:49:15',
    clockOutTime: undefined,
    locationTag: 'Lekki Environmental Lab',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E'
  },
  {
    id: 'att-2026-09-17-tunde',
    userId: 'usr-6',
    userName: 'Tunde Bakare',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    date: '2026-09-17',
    clockInTime: '08:22:45',
    clockOutTime: undefined,
    locationTag: 'Escravos Barge',
    status: 'LATE',
    kpiAwarded: 0,
    coordinates: '5.5833°N, 5.1667°E',
    notes: 'Tide level held safety launch vessel 15 mins.'
  },
  {
    id: 'att-2026-09-17-gift',
    userId: 'usr-9',
    userName: 'Gift',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    date: '2026-09-17',
    clockInTime: '07:55:00',
    clockOutTime: undefined,
    locationTag: 'Lekki HQ (Finance)',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E'
  },
  {
    id: 'att-2026-09-17-marvelous',
    userId: 'usr-8',
    userName: 'Marvelous',
    userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    date: '2026-09-17',
    clockInTime: '08:01:25',
    clockOutTime: undefined,
    locationTag: 'Lekki HQ (Finance)',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E'
  },
  {
    id: 'att-2026-09-15-kaine',
    userId: 'usr-1',
    userName: 'Kaine Edike',
    userAvatar: '/avatars/kaine-edike.png',
    date: '2026-09-15',
    clockInTime: '07:42:00',
    clockOutTime: '18:40:00',
    locationTag: 'Lekki HQ',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E'
  },
  {
    id: 'att-2026-09-15-femi',
    userId: 'usr-4',
    userName: 'Engr. Femi Adebayo',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    date: '2026-09-15',
    clockInTime: '08:04:12',
    clockOutTime: '17:20:00',
    locationTag: 'Escravos Field Base',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '5.5833°N, 5.1667°E'
  },
  {
    id: 'att-2026-09-14-ngozi',
    userId: 'usr-5',
    userName: 'Dr. Ngozi Eze',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    date: '2026-09-14',
    clockInTime: '07:48:30',
    clockOutTime: '17:15:00',
    locationTag: 'Lekki Environmental Lab',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E'
  },
  {
    id: 'att-2026-09-10-tunde',
    userId: 'usr-6',
    userName: 'Tunde Bakare',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    date: '2026-09-10',
    clockInTime: '07:56:00',
    clockOutTime: '17:50:00',
    locationTag: 'Escravos Field Base',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '5.5833°N, 5.1667°E'
  },
  // August 2026 (Q3 / H2)
  {
    id: 'att-2026-08-28-kaine',
    userId: 'usr-1',
    userName: 'Kaine Edike',
    userAvatar: '/avatars/kaine-edike.png',
    date: '2026-08-28',
    clockInTime: '07:39:10',
    clockOutTime: '19:00:00',
    locationTag: 'Lekki HQ',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E'
  },
  {
    id: 'att-2026-08-28-bibi',
    userId: 'usr-2',
    userName: 'Bibi',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    date: '2026-08-28',
    clockInTime: '07:50:11',
    clockOutTime: '17:40:00',
    locationTag: 'Lekki HQ',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E'
  },
  {
    id: 'att-2026-08-20-femi',
    userId: 'usr-4',
    userName: 'Engr. Femi Adebayo',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    date: '2026-08-20',
    clockInTime: '08:01:00',
    clockOutTime: '17:10:00',
    locationTag: 'Escravos Field Base',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '5.5833°N, 5.1667°E'
  },
  {
    id: 'att-2026-08-14-ngozi',
    userId: 'usr-5',
    userName: 'Dr. Ngozi Eze',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    date: '2026-08-14',
    clockInTime: '07:52:19',
    clockOutTime: '17:25:00',
    locationTag: 'Lekki Environmental Lab',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E'
  },
  {
    id: 'att-2026-08-04-tunde',
    userId: 'usr-6',
    userName: 'Tunde Bakare',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    date: '2026-08-04',
    clockInTime: '08:29:40',
    clockOutTime: '17:45:00',
    locationTag: 'Escravos Barge',
    status: 'LATE',
    kpiAwarded: 0,
    coordinates: '5.5833°N, 5.1667°E',
    notes: 'Fuel barge bunkering delay.'
  },
  // July 2026 (Q3 / H2)
  {
    id: 'att-2026-07-29-kaine',
    userId: 'usr-1',
    userName: 'Kaine Edike',
    userAvatar: '/avatars/kaine-edike.png',
    date: '2026-07-29',
    clockInTime: '07:45:00',
    clockOutTime: '18:15:00',
    locationTag: 'Lekki HQ',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E'
  },
  {
    id: 'att-2026-07-15-erica',
    userId: 'usr-3',
    userName: 'Erica',
    userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    date: '2026-07-15',
    clockInTime: '07:59:00',
    clockOutTime: '17:35:00',
    locationTag: 'Lekki HQ',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E'
  },
  {
    id: 'att-2026-07-03-femi',
    userId: 'usr-4',
    userName: 'Engr. Femi Adebayo',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    date: '2026-07-03',
    clockInTime: '08:00:30',
    clockOutTime: '17:05:00',
    locationTag: 'Escravos Field Base',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '5.5833°N, 5.1667°E'
  },
  // June 2026 (Q2 / H1)
  {
    id: 'att-2026-06-25-kaine',
    userId: 'usr-1',
    userName: 'Kaine Edike',
    userAvatar: '/avatars/kaine-edike.png',
    date: '2026-06-25',
    clockInTime: '07:38:00',
    clockOutTime: '18:30:00',
    locationTag: 'Lekki HQ',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E'
  },
  {
    id: 'att-2026-06-15-bibi',
    userId: 'usr-2',
    userName: 'Bibi',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    date: '2026-06-15',
    clockInTime: '07:54:10',
    clockOutTime: '17:20:00',
    locationTag: 'Lekki HQ',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E'
  },
  {
    id: 'att-2026-06-02-ngozi',
    userId: 'usr-5',
    userName: 'Dr. Ngozi Eze',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    date: '2026-06-02',
    clockInTime: '07:46:00',
    clockOutTime: '17:15:00',
    locationTag: 'Lekki Environmental Lab',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E'
  },
  // May 2026 (Q2 / H1)
  {
    id: 'att-2026-05-20-femi',
    userId: 'usr-4',
    userName: 'Engr. Femi Adebayo',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    date: '2026-05-20',
    clockInTime: '07:58:00',
    clockOutTime: '17:00:00',
    locationTag: 'Escravos Field Base',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '5.5833°N, 5.1667°E'
  },
  {
    id: 'att-2026-05-08-tunde',
    userId: 'usr-6',
    userName: 'Tunde Bakare',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    date: '2026-05-08',
    clockInTime: '08:01:10',
    clockOutTime: '17:30:00',
    locationTag: 'Escravos Field Base',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '5.5833°N, 5.1667°E'
  },
  // April 2026 (Q2 / H1)
  {
    id: 'att-2026-04-22-kaine',
    userId: 'usr-1',
    userName: 'Kaine Edike',
    userAvatar: '/avatars/kaine-edike.png',
    date: '2026-04-22',
    clockInTime: '07:41:00',
    clockOutTime: '18:25:00',
    locationTag: 'Lekki HQ',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E'
  },
  {
    id: 'att-2026-04-10-erica',
    userId: 'usr-3',
    userName: 'Erica',
    userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    date: '2026-04-10',
    clockInTime: '07:58:30',
    clockOutTime: '17:40:00',
    locationTag: 'Lekki HQ',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E'
  },
  // March 2026 (Q1 / H1)
  {
    id: 'att-2026-03-27-ngozi',
    userId: 'usr-5',
    userName: 'Dr. Ngozi Eze',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    date: '2026-03-27',
    clockInTime: '07:50:00',
    clockOutTime: '17:10:00',
    locationTag: 'Lekki Environmental Lab',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E'
  },
  {
    id: 'att-2026-03-12-kaine',
    userId: 'usr-1',
    userName: 'Kaine Edike',
    userAvatar: '/avatars/kaine-edike.png',
    date: '2026-03-12',
    clockInTime: '07:40:00',
    clockOutTime: '18:50:00',
    locationTag: 'Lekki HQ',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E'
  },
  // February 2026 (Q1 / H1)
  {
    id: 'att-2026-02-18-bibi',
    userId: 'usr-2',
    userName: 'Bibi',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    date: '2026-02-18',
    clockInTime: '07:52:00',
    clockOutTime: '17:35:00',
    locationTag: 'Lekki HQ',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E'
  },
  {
    id: 'att-2026-02-05-femi',
    userId: 'usr-4',
    userName: 'Engr. Femi Adebayo',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    date: '2026-02-05',
    clockInTime: '08:03:00',
    clockOutTime: '17:15:00',
    locationTag: 'Escravos Field Base',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '5.5833°N, 5.1667°E'
  },
  // January 2026 (Q1 / H1)
  {
    id: 'att-2026-01-22-kaine',
    userId: 'usr-1',
    userName: 'Kaine Edike',
    userAvatar: '/avatars/kaine-edike.png',
    date: '2026-01-22',
    clockInTime: '07:44:00',
    clockOutTime: '18:30:00',
    locationTag: 'Lekki HQ',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '6.4698°N, 3.5852°E'
  },
  {
    id: 'att-2026-01-08-tunde',
    userId: 'usr-6',
    userName: 'Tunde Bakare',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    date: '2026-01-08',
    clockInTime: '07:59:00',
    clockOutTime: '17:20:00',
    locationTag: 'Escravos Field Base',
    status: 'PRESENT',
    kpiAwarded: 10,
    coordinates: '5.5833°N, 5.1667°E'
  }
];

export const INITIAL_DOCUMENT_FOLDERS: DocumentFolder[] = [
  {
    id: 'fld-1',
    name: 'Corporate Governance & HSE',
    department: 'Executive Leadership',
    description: 'Corporate charter, board resolutions, and HSE manual standards',
    createdById: 'usr-1',
    createdByName: 'Kaine Edike',
    createdAt: '2026-01-10',
    isRestricted: false
  },
  {
    id: 'fld-2',
    name: 'FMEnv Environmental Templates',
    department: 'Environmental & Social',
    description: 'Federal Ministry of Environment approved ESIA templates & checklists',
    createdById: 'usr-2',
    createdByName: 'Chidi Okafor',
    createdAt: '2026-02-14',
    isRestricted: false
  },
  {
    id: 'fld-3',
    name: 'Employee Handbook & SOPs',
    department: 'Human Resources',
    description: 'Standard operating procedures, code of conduct, and personnel benefits',
    createdById: 'usr-2',
    createdByName: 'Chidi Okafor',
    createdAt: '2026-03-01',
    isRestricted: false
  },
  {
    id: 'fld-4',
    name: 'Geotechnical Laboratory Manuals',
    department: 'Geotechnical & Geophysics',
    description: 'ASTM, BS1377 soil mechanics testing protocols and calibration certificates',
    createdById: 'usr-1',
    createdByName: 'Kaine Edike',
    createdAt: '2026-04-18',
    isRestricted: false
  },
  {
    id: 'fld-5',
    name: 'IT Security & Encryption Keys',
    department: 'IT & Digital Operations',
    description: 'Restricted root certificate documentation, VPN configs, and disaster recovery plan',
    createdById: 'usr-2',
    createdByName: 'Chidi Okafor',
    createdAt: '2026-05-20',
    isRestricted: true
  }
];

export const INITIAL_BUDGET_REQUESTS: BudgetRequest[] = [
  {
    id: 'bgt-1',
    requestNumber: 'BGT-2026-001',
    title: 'Escravos Offshore Geotechnical Jack-Up Rig Mobilization',
    department: 'Geotechnical & Geophysics',
    requestedById: 'usr-4',
    requestedByName: 'Engr. Femi Adebayo',
    amountNgn: 18500000,
    category: 'FIELD_EXPEDITION',
    justification: 'Mobilization of Jack-Up Rig 04 for Chevron Escravos Channel Bathymetry & Deep Soil Boreholes. Required for contractual start date.',
    status: 'PENDING_APPROVAL',
    budgetType: 'DEPARTMENTAL',
    frequency: 'PER_PROJECT',
    collatedById: 'usr-13',
    collatedByName: 'Gift',
    collationNotes: 'Collated by Gift. Fuel surcharge & barge day-rates verified against Shell master contract pricing.',
    cfoReviewStatus: 'CFO_VETTED',
    cfoReviewNotes: 'Vetted by Erica (CFO). Cash flow allows 50% advance now and 50% upon milestone completion. Projected for Dr. K approval.',
    presentedToMdBy: 'ERICA',
    approvalStage: 'MD_PENDING',
    miscellaneousAmountNgn: 1850000,
    miscellaneousJustification: 'Unforeseen sea-state weather standby and emergency tugboat escort.',
    createdAt: '2026-09-02 09:30'
  },
  {
    id: 'bgt-2',
    requestNumber: 'BGT-2026-002',
    title: 'TotalEnergies OML-58 Deep Water Environmental Sampling & Habitat Mapping',
    department: 'Environmental & Social (ESIA)',
    requestedById: 'usr-5',
    requestedByName: 'Dr. Ngozi Eze',
    amountNgn: 8200000,
    category: 'CLIENT_PROJECT_DELIVERY',
    justification: 'Comprehensive baseline benthic sampling and heavy metal laboratory analysis for TotalEnergies offshore development EIA.',
    status: 'APPROVED',
    budgetType: 'CLIENT_FACING',
    frequency: 'PER_PROJECT',
    collatedById: 'usr-12',
    collatedByName: 'Miss Ozioma',
    collationNotes: 'Client proposal approved milestone breakdown. Projected directly to Dr. K by Miss Ozioma.',
    presentedToMdBy: 'OZIOMA',
    approvalStage: 'APPROVED',
    approvedById: 'usr-1',
    approvedByName: 'Dr. Kaine Edike',
    reviewComments: 'Approved by Dr. K during budget projection meeting. Erica took meeting notes; verified and signed.',
    reviewedAt: '2026-09-03 14:15',
    miscellaneousAmountNgn: 820000,
    miscellaneousJustification: 'Contingency for extended community liaison boat escorts in Niger Delta creeks.',
    createdAt: '2026-09-02 11:00'
  },
  {
    id: 'bgt-3',
    requestNumber: 'BGT-2026-003',
    title: 'Weekly Field Vehicle Maintenance & Fuel Imprest (Warri & Lekki)',
    department: 'Geotechnical & Geophysics',
    requestedById: 'usr-4',
    requestedByName: 'Engr. Femi Adebayo',
    amountNgn: 1450000,
    category: 'OPERATIONAL_EXPENSE',
    justification: 'Weekly scheduled routine servicing of 4WD Hilux utility field trucks and generator diesel delivery for Lekki HQ soil mechanics lab.',
    status: 'PENDING_APPROVAL',
    budgetType: 'DEPARTMENTAL',
    frequency: 'WEEKLY',
    collatedById: 'usr-14',
    collatedByName: 'Marvelous',
    collationNotes: 'Collated by Marvelous. Attached previous week odometer logs and pump station receipts.',
    cfoReviewStatus: 'PENDING',
    approvalStage: 'CFO_REVIEW',
    createdAt: '2026-09-03 16:45'
  },
  {
    id: 'bgt-4',
    requestNumber: 'BGT-2026-004',
    title: 'Q3 Offshore DGPS Firmware Calibration & Satellite Positioning Corrections',
    department: 'Geoinformatics & Survey',
    requestedById: 'usr-7',
    requestedByName: 'Halima Yusuf',
    amountNgn: 3800000,
    category: 'SOFTWARE_LICENSES',
    justification: 'Trimble CenterPoint RTX subscription and GNSS receiver multi-frequency real-time kinematic satellite corrections.',
    status: 'APPROVED',
    budgetType: 'DEPARTMENTAL',
    frequency: 'PER_PROJECT',
    collatedById: 'usr-13',
    collatedByName: 'Gift',
    cfoReviewStatus: 'CFO_VETTED',
    cfoReviewNotes: 'Vetted by Erica. Essential for ongoing Bonny channel survey.',
    presentedToMdBy: 'ERICA',
    approvalStage: 'APPROVED',
    approvedById: 'usr-10',
    approvedByName: 'Bibi',
    approvedOnBehalfOfDrK: true,
    drKNotified: true,
    reviewComments: 'Approved on Dr. K behalf by Bibi (2nd in Command) while Dr. K was on offshore sea-trial inspection. Dr. K notified.',
    reviewedAt: '2026-09-05 11:30',
    createdAt: '2026-09-04 08:30'
  }
];

// Petty Cash Funds (SOP Section 4)
export const INITIAL_PETTY_CASH_FUNDS: PettyCashFund[] = [
  {
    id: 'pcf-gift',
    custodian: 'GIFT',
    custodianName: 'Gift',
    allocatedAmountNgn: 300000,
    currentBalanceNgn: 212000,
    allocatedBy: 'Dr. Kaine Edike',
    lastReplenishedDate: '2026-09-01'
  },
  {
    id: 'pcf-marvelous',
    custodian: 'MARVELOUS',
    custodianName: 'Marvelous',
    allocatedAmountNgn: 300000,
    currentBalanceNgn: 184500,
    allocatedBy: 'Dr. Kaine Edike',
    lastReplenishedDate: '2026-09-01'
  }
];

export const INITIAL_PETTY_CASH_TRANSACTIONS: PettyCashTransaction[] = [
  {
    id: 'pct-1',
    fundCustodian: 'MARVELOUS',
    date: '2026-09-04',
    amountNgn: 15000,
    category: 'WATER_PURCHASE',
    description: 'Purchased 15 dispensers of pure bottled drinking water for Lekki HQ office and lab staff.',
    receiptUrl: '/receipts/water-sep4.pdf',
    approvedByName: 'Marvelous',
    createdAt: '2026-09-04 10:15'
  },
  {
    id: 'pct-2',
    fundCustodian: 'MARVELOUS',
    date: '2026-09-06',
    amountNgn: 38500,
    category: 'TRANSPORTATION_UBER',
    description: 'Uber dispatch logistics for courier delivery of sealed soil testing samples to Lagos State Materials Testing Lab in Ojodu.',
    receiptUrl: '/receipts/uber-sep6.pdf',
    approvedByName: 'Marvelous',
    createdAt: '2026-09-06 14:30'
  },
  {
    id: 'pct-3',
    fundCustodian: 'GIFT',
    date: '2026-09-05',
    amountNgn: 24000,
    category: 'MINOR_OPERATIONAL',
    description: 'Emergency replacement diesel fuel filter and battery terminal lugs for backup standby generator.',
    receiptUrl: '/receipts/generator-parts.pdf',
    approvedByName: 'Gift',
    createdAt: '2026-09-05 16:20'
  },
  {
    id: 'pct-4',
    fundCustodian: 'GIFT',
    date: '2026-09-08',
    amountNgn: 18000,
    category: 'OFFICE_SUPPLIES',
    description: 'Heavy duty archival document storage boxes and tamper-evident document envelopes for DPR permit filings.',
    receiptUrl: '/receipts/stationery.pdf',
    approvedByName: 'Gift',
    createdAt: '2026-09-08 09:45'
  },
  {
    id: 'pct-5',
    fundCustodian: 'MARVELOUS',
    date: '2026-09-10',
    amountNgn: 62000,
    category: 'EMERGENCY_FIELD',
    description: 'Emergency speedboat outboard engine oil and jerrycan fuel top-up for Bonny Island survey field crew.',
    receiptUrl: '/receipts/bonny-boat-fuel.pdf',
    approvedByName: 'Marvelous',
    createdAt: '2026-09-10 11:00'
  },
  {
    id: 'pct-6',
    fundCustodian: 'GIFT',
    date: '2026-09-11',
    amountNgn: 46000,
    category: 'MINOR_OPERATIONAL',
    description: 'Procured PPE high-visibility reflective vests and replacement safety helmets for visiting client delegation.',
    receiptUrl: '/receipts/ppe-client.pdf',
    approvedByName: 'Gift',
    createdAt: '2026-09-11 13:10'
  }
];

export const INITIAL_PETTY_CASH_TOPUPS: PettyCashTopUpRecord[] = [
  {
    id: 'topup-1',
    fundCustodian: 'GIFT',
    amountNgn: 100000,
    fundingSource: 'GTBank Corporate Wire (Operating Acct)',
    referenceNumber: 'GTB-TRF-882190',
    notes: 'Approved mid-month imprest top-up for laboratory sample shipping and courier fees.',
    authorizedByName: 'Mrs. Erica Okonkwo (CFO)',
    date: '2026-09-08',
    createdAt: '2026-09-08 11:30'
  },
  {
    id: 'topup-2',
    fundCustodian: 'MARVELOUS',
    amountNgn: 80000,
    fundingSource: 'Zenith Bank Petty Imprest Cheque',
    referenceNumber: 'CHQ-ZEN-004921',
    notes: 'Emergency logistics funding for offshore geotechnical mobilization in Escravos.',
    authorizedByName: 'Dr. Kaine Edike (MD)',
    date: '2026-09-09',
    createdAt: '2026-09-09 14:15'
  }
];

export const INITIAL_PETTY_CASH_ANALYSES: PettyCashAnalysis[] = [
  {
    id: 'pca-2026-08',
    monthYear: '2026-08',
    analyzedById: 'usr-13',
    analyzedByName: 'Gift',
    isPrimaryGift: true,
    giftOpeningBalanceNgn: 300000,
    giftDisbursedNgn: 142000,
    giftClosingBalanceNgn: 158000,
    marvelousOpeningBalanceNgn: 300000,
    marvelousDisbursedNgn: 168500,
    marvelousClosingBalanceNgn: 131500,
    totalDisbursedNgn: 310500,
    replenishmentRequestedNgn: 310500,
    status: 'APPROVED',
    approvedByDrK: true,
    drKNotes: 'Approved. Disbursed ₦310,500 total to replenish both funds back to ₦300,000 threshold on Sep 1.',
    createdAt: '2026-08-31 17:00'
  }
];

export const INITIAL_STAFF_QUERIES: StaffQuery[] = [
  {
    id: 'qry-1',
    queryNumber: 'QRY-2026-088',
    staffId: 'usr-6',
    staffName: 'Tunde Bakare',
    staffDepartment: 'Geotechnical & Geophysics',
    issuedById: 'usr-3',
    issuedByName: 'Amina Bello',
    title: 'Delay in Escravos Water Sampling Laboratory Transmission',
    allegationDetails: 'Failure to transmit sealed chain-of-custody borehole water samples within the mandatory 48-hour cold chain window following the August 24 offshore campaign.',
    incidentDate: '2026-08-25',
    issuedDate: '2026-08-27',
    responseDeadline: '2026-08-29 17:00',
    status: 'RESOLVED',
    staffResponse: 'Helicopter transfer from Escravos Barge was grounded due to tropical storm warnings by NCAA. Samples were maintained in refrigerated laboratory containers at 4°C with temperature log intact.',
    respondedAt: '2026-08-28 11:30',
    resolution: 'CANCELLED',
    resolutionNotes: 'Exonerated after review of meteorological log and cold chain telemetry. Procedural compliance maintained under adverse weather.',
    resolvedAt: '2026-08-29 09:15',
    resolvedById: 'usr-3',
    resolvedByName: 'Amina Bello'
  },
  {
    id: 'qry-2',
    queryNumber: 'QRY-2026-089',
    staffId: 'usr-6',
    staffName: 'Tunde Bakare',
    staffDepartment: 'Geotechnical & Geophysics',
    issuedById: 'usr-3',
    issuedByName: 'Amina Bello',
    title: 'Unnotified Late Departure from Bonny Offshore Mobilization',
    allegationDetails: 'Departed base without counter-signed departure manifest from Lead Geologist on duty.',
    incidentDate: '2026-09-01',
    issuedDate: '2026-09-03',
    responseDeadline: '2026-09-10 17:00',
    status: 'ISSUED'
  }
];

export const INITIAL_PAYROLL_RECORDS: PayrollRecord[] = [
  // September 2026 (Current Cycle)
  {
    id: 'pay-2026-09-usr-1',
    staffId: 'usr-1',
    staffName: 'Kaine Edike',
    department: 'Executive Leadership',
    jobTitle: 'Founder & Managing Consultant',
    baseSalaryNgn: 4500000,
    hazardAllowanceNgn: 0,
    fieldPerDiemNgn: 250000,
    performanceBonusNgn: 750000,
    customBenefits: [
      { id: 'cb-1-1', name: 'Executive Medical Shield', amountNgn: 250000 },
      { id: 'cb-1-2', name: 'Board Advisory Retainer', amountNgn: 300000 }
    ],
    pensionDeductionNgn: 360000,
    taxPayeNgn: 850000,
    netPayNgn: 4840000,
    monthYear: '2026-09',
    paymentStatus: 'APPROVED'
  },
  {
    id: 'pay-2026-09-usr-10',
    staffId: 'usr-10',
    staffName: 'Bibi',
    department: 'Executive Leadership',
    jobTitle: 'Executive Director (2nd in Command)',
    baseSalaryNgn: 3800000,
    hazardAllowanceNgn: 0,
    fieldPerDiemNgn: 200000,
    performanceBonusNgn: 600000,
    customBenefits: [
      { id: 'cb-10-1', name: 'Executive Health Cover', amountNgn: 200000 }
    ],
    pensionDeductionNgn: 304000,
    taxPayeNgn: 680000,
    netPayNgn: 3816000,
    monthYear: '2026-09',
    paymentStatus: 'APPROVED'
  },
  {
    id: 'pay-2026-09-usr-11',
    staffId: 'usr-11',
    staffName: 'Erica',
    department: 'Finance & Accounts',
    jobTitle: 'Chief Financial Officer (CFO)',
    baseSalaryNgn: 3500000,
    hazardAllowanceNgn: 0,
    fieldPerDiemNgn: 150000,
    performanceBonusNgn: 500000,
    customBenefits: [
      { id: 'cb-11-1', name: 'ICAN Fellowship & Dues', amountNgn: 75000 }
    ],
    pensionDeductionNgn: 280000,
    taxPayeNgn: 620000,
    netPayNgn: 3325000,
    monthYear: '2026-09',
    paymentStatus: 'APPROVED'
  },
  {
    id: 'pay-2026-09-usr-12',
    staffId: 'usr-12',
    staffName: 'Miss Ozioma',
    department: 'Project Management & Commercial',
    jobTitle: 'Senior Consultant & Commercial Liaison',
    baseSalaryNgn: 2900000,
    hazardAllowanceNgn: 150000,
    fieldPerDiemNgn: 350000,
    performanceBonusNgn: 450000,
    customBenefits: [
      { id: 'cb-12-1', name: 'Commercial Travel Subsidy', amountNgn: 100000 }
    ],
    pensionDeductionNgn: 232000,
    taxPayeNgn: 510000,
    netPayNgn: 3208000,
    monthYear: '2026-09',
    paymentStatus: 'APPROVED'
  },
  {
    id: 'pay-2026-09-usr-4',
    staffId: 'usr-4',
    staffName: 'Engr. Femi Adebayo',
    department: 'Geotechnical & Geophysics',
    jobTitle: 'Head of Geotechnical Engineering',
    baseSalaryNgn: 2800000,
    hazardAllowanceNgn: 350000,
    fieldPerDiemNgn: 400000,
    performanceBonusNgn: 400000,
    customBenefits: [
      { id: 'cb-4-1', name: 'Offshore Hazard Insurance', amountNgn: 150000 }
    ],
    pensionDeductionNgn: 224000,
    taxPayeNgn: 480000,
    netPayNgn: 3396000,
    monthYear: '2026-09',
    paymentStatus: 'APPROVED'
  },
  {
    id: 'pay-2026-09-usr-5',
    staffId: 'usr-5',
    staffName: 'Dr. Ngozi Eze',
    department: 'Environmental & Social',
    jobTitle: 'Lead Environmental Consultant',
    baseSalaryNgn: 2600000,
    hazardAllowanceNgn: 200000,
    fieldPerDiemNgn: 300000,
    performanceBonusNgn: 485000,
    customBenefits: [
      { id: 'cb-5-1', name: 'Field Ecology Equipment Stipend', amountNgn: 80000 }
    ],
    pensionDeductionNgn: 208000,
    taxPayeNgn: 440000,
    netPayNgn: 3017000,
    monthYear: '2026-09',
    paymentStatus: 'APPROVED'
  },
  {
    id: 'pay-2026-09-usr-2',
    staffId: 'usr-2',
    staffName: 'Chidi Okafor',
    department: 'IT & Digital Operations',
    jobTitle: 'IT Team Lead & Systems Admin',
    baseSalaryNgn: 2200000,
    hazardAllowanceNgn: 0,
    fieldPerDiemNgn: 100000,
    performanceBonusNgn: 300000,
    customBenefits: [
      { id: 'cb-2-1', name: 'Starlink Maritime Hub Subsidy', amountNgn: 60000 }
    ],
    pensionDeductionNgn: 176000,
    taxPayeNgn: 350000,
    netPayNgn: 2134000,
    monthYear: '2026-09',
    paymentStatus: 'APPROVED'
  },
  {
    id: 'pay-2026-09-usr-3',
    staffId: 'usr-3',
    staffName: 'Amina Bello',
    department: 'Human Resources',
    jobTitle: 'HR Administrator & Talent Lead',
    baseSalaryNgn: 2100000,
    hazardAllowanceNgn: 0,
    fieldPerDiemNgn: 50000,
    performanceBonusNgn: 250000,
    customBenefits: [
      { id: 'cb-3-1', name: 'CIPM Continuing Professional Grant', amountNgn: 40000 }
    ],
    pensionDeductionNgn: 168000,
    taxPayeNgn: 320000,
    netPayNgn: 1952000,
    monthYear: '2026-09',
    paymentStatus: 'APPROVED'
  },
  {
    id: 'pay-2026-09-usr-6',
    staffId: 'usr-6',
    staffName: 'Tunde Bakare',
    department: 'Geotechnical & Geophysics',
    jobTitle: 'Senior Field Geologist',
    baseSalaryNgn: 1600000,
    hazardAllowanceNgn: 450000,
    fieldPerDiemNgn: 500000,
    performanceBonusNgn: 220000,
    customBenefits: [
      { id: 'cb-6-1', name: 'Escravos Camp Subsidy', amountNgn: 90000 }
    ],
    pensionDeductionNgn: 128000,
    taxPayeNgn: 240000,
    netPayNgn: 2492000,
    monthYear: '2026-09',
    paymentStatus: 'DRAFT'
  },
  {
    id: 'pay-2026-09-usr-7',
    staffId: 'usr-7',
    staffName: 'Halima Yusuf',
    department: 'Geoinformatics & Survey',
    jobTitle: 'GIS & Bathymetric Analyst',
    baseSalaryNgn: 1400000,
    hazardAllowanceNgn: 150000,
    fieldPerDiemNgn: 200000,
    performanceBonusNgn: 200000,
    customBenefits: [
      { id: 'cb-7-1', name: 'GIS Cloud Compute Allowance', amountNgn: 50000 }
    ],
    pensionDeductionNgn: 112000,
    taxPayeNgn: 190000,
    netPayNgn: 1698000,
    monthYear: '2026-09',
    paymentStatus: 'DRAFT'
  },
  {
    id: 'pay-2026-09-usr-13',
    staffId: 'usr-13',
    staffName: 'Gift',
    department: 'Finance & Accounts',
    jobTitle: 'Finance Officer (Collation Lead)',
    baseSalaryNgn: 1500000,
    hazardAllowanceNgn: 0,
    fieldPerDiemNgn: 80000,
    performanceBonusNgn: 180000,
    customBenefits: [
      { id: 'cb-13-1', name: 'Accounting Professional Dev', amountNgn: 50000 }
    ],
    pensionDeductionNgn: 120000,
    taxPayeNgn: 210000,
    netPayNgn: 1480000,
    monthYear: '2026-09',
    paymentStatus: 'DRAFT'
  },
  {
    id: 'pay-2026-09-usr-14',
    staffId: 'usr-14',
    staffName: 'Marvelous',
    department: 'Finance & Accounts',
    jobTitle: 'Finance Officer (Invoicing Lead)',
    baseSalaryNgn: 1500000,
    hazardAllowanceNgn: 0,
    fieldPerDiemNgn: 80000,
    performanceBonusNgn: 180000,
    customBenefits: [
      { id: 'cb-14-1', name: 'Invoicing & Treasury Training', amountNgn: 50000 }
    ],
    pensionDeductionNgn: 120000,
    taxPayeNgn: 210000,
    netPayNgn: 1480000,
    monthYear: '2026-09',
    paymentStatus: 'DRAFT'
  },

  // August 2026 (Completed & Disbursed Cycle)
  {
    id: 'pay-2026-08-usr-1',
    staffId: 'usr-1',
    staffName: 'Kaine Edike',
    department: 'Executive Leadership',
    jobTitle: 'Founder & Managing Consultant',
    baseSalaryNgn: 4500000,
    hazardAllowanceNgn: 0,
    fieldPerDiemNgn: 220000,
    performanceBonusNgn: 700000,
    customBenefits: [
      { id: 'cb-aug-1-1', name: 'Executive Medical Shield', amountNgn: 250000 }
    ],
    pensionDeductionNgn: 360000,
    taxPayeNgn: 850000,
    netPayNgn: 4460000,
    monthYear: '2026-08',
    paymentStatus: 'DISBURSED'
  },
  {
    id: 'pay-2026-08-usr-10',
    staffId: 'usr-10',
    staffName: 'Bibi',
    department: 'Executive Leadership',
    jobTitle: 'Executive Director (2nd in Command)',
    baseSalaryNgn: 3800000,
    hazardAllowanceNgn: 0,
    fieldPerDiemNgn: 180000,
    performanceBonusNgn: 550000,
    customBenefits: [
      { id: 'cb-aug-10-1', name: 'Executive Health Cover', amountNgn: 200000 }
    ],
    pensionDeductionNgn: 304000,
    taxPayeNgn: 680000,
    netPayNgn: 3746000,
    monthYear: '2026-08',
    paymentStatus: 'DISBURSED'
  },
  {
    id: 'pay-2026-08-usr-11',
    staffId: 'usr-11',
    staffName: 'Erica',
    department: 'Finance & Accounts',
    jobTitle: 'Chief Financial Officer (CFO)',
    baseSalaryNgn: 3500000,
    hazardAllowanceNgn: 0,
    fieldPerDiemNgn: 120000,
    performanceBonusNgn: 480000,
    customBenefits: [
      { id: 'cb-aug-11-1', name: 'ICAN Fellowship & Dues', amountNgn: 75000 }
    ],
    pensionDeductionNgn: 280000,
    taxPayeNgn: 620000,
    netPayNgn: 3275000,
    monthYear: '2026-08',
    paymentStatus: 'DISBURSED'
  },
  {
    id: 'pay-2026-08-usr-4',
    staffId: 'usr-4',
    staffName: 'Engr. Femi Adebayo',
    department: 'Geotechnical & Geophysics',
    jobTitle: 'Head of Geotechnical Engineering',
    baseSalaryNgn: 2800000,
    hazardAllowanceNgn: 350000,
    fieldPerDiemNgn: 380000,
    performanceBonusNgn: 380000,
    customBenefits: [
      { id: 'cb-aug-4-1', name: 'Offshore Hazard Insurance', amountNgn: 150000 }
    ],
    pensionDeductionNgn: 224000,
    taxPayeNgn: 480000,
    netPayNgn: 3356000,
    monthYear: '2026-08',
    paymentStatus: 'DISBURSED'
  },
  {
    id: 'pay-2026-08-usr-5',
    staffId: 'usr-5',
    staffName: 'Dr. Ngozi Eze',
    department: 'Environmental & Social',
    jobTitle: 'Lead Environmental Consultant',
    baseSalaryNgn: 2600000,
    hazardAllowanceNgn: 200000,
    fieldPerDiemNgn: 280000,
    performanceBonusNgn: 450000,
    customBenefits: [
      { id: 'cb-aug-5-1', name: 'Field Ecology Equipment Stipend', amountNgn: 80000 }
    ],
    pensionDeductionNgn: 208000,
    taxPayeNgn: 440000,
    netPayNgn: 2962000,
    monthYear: '2026-08',
    paymentStatus: 'DISBURSED'
  },

  // July 2026 (Historical Disbursed Cycle)
  {
    id: 'pay-2026-07-usr-1',
    staffId: 'usr-1',
    staffName: 'Kaine Edike',
    department: 'Executive Leadership',
    jobTitle: 'Founder & Managing Consultant',
    baseSalaryNgn: 4500000,
    hazardAllowanceNgn: 0,
    fieldPerDiemNgn: 200000,
    performanceBonusNgn: 650000,
    customBenefits: [
      { id: 'cb-jul-1-1', name: 'Executive Medical Shield', amountNgn: 250000 }
    ],
    pensionDeductionNgn: 360000,
    taxPayeNgn: 850000,
    netPayNgn: 4390000,
    monthYear: '2026-07',
    paymentStatus: 'DISBURSED'
  },
  {
    id: 'pay-2026-07-usr-4',
    staffId: 'usr-4',
    staffName: 'Engr. Femi Adebayo',
    department: 'Geotechnical & Geophysics',
    jobTitle: 'Head of Geotechnical Engineering',
    baseSalaryNgn: 2800000,
    hazardAllowanceNgn: 350000,
    fieldPerDiemNgn: 350000,
    performanceBonusNgn: 350000,
    customBenefits: [
      { id: 'cb-jul-4-1', name: 'Offshore Hazard Insurance', amountNgn: 150000 }
    ],
    pensionDeductionNgn: 224000,
    taxPayeNgn: 480000,
    netPayNgn: 3296000,
    monthYear: '2026-07',
    paymentStatus: 'DISBURSED'
  }
];

export const INITIAL_CANDIDATE_APPLICATIONS: CandidateApplication[] = [
  {
    id: 'cand-1',
    candidateNumber: 'CND-2026-041',
    fullName: 'Engr. Osasogie Ighodaro',
    email: 'o.ighodaro@offshoregeotech.ng',
    phone: '+234 803 555 7788',
    appliedRole: 'Senior Offshore Hydrographic Surveyor',
    department: 'Geoinformatics & Survey',
    currentStage: 'INTERVIEW_2',
    yearsExperience: 8,
    expectedSalaryNgn: 2200000,
    notes: [
      {
        stage: 'INTERVIEW_1',
        interviewerId: 'usr-3',
        interviewerName: 'Amina Bello',
        date: '2026-08-22',
        rating: 4,
        technicalCompetency: 'High mastery of Kongsberg multibeam echo-sounders and QPS QINSy data acquisition.',
        culturalFit: 'Strong HSE mindset; extensive deepwater Shell/Total contractor experience.',
        recommendation: 'ADVANCE',
        comments: 'Recommended for technical review with Head of Survey.'
      }
    ],
    documents: [
      {
        id: 'cdoc-1',
        title: 'CV & Hydrographic Survey Portfolio.pdf',
        stage: 'PROSPECTIVE',
        fileType: 'PDF',
        fileSizeMb: 4.8,
        uploadedAt: '2026-08-18',
        downloadUrl: '/vault/candidates/cand-1-cv.pdf'
      },
      {
        id: 'cdoc-2',
        title: 'SURCON Registration & Degree Certificate.pdf',
        stage: 'INTERVIEW_1',
        fileType: 'PDF',
        fileSizeMb: 2.1,
        uploadedAt: '2026-08-22',
        downloadUrl: '/vault/candidates/cand-1-cert.pdf'
      }
    ],
    vaultFolderId: 'vlt-cand-1',
    createdAt: '2026-08-18'
  },
  {
    id: 'cand-2',
    candidateNumber: 'CND-2026-042',
    fullName: 'Aisha Danjuma',
    email: 'aisha.danjuma@ecoresearch.org',
    phone: '+234 812 444 9911',
    appliedRole: 'Senior Environmental Microbiologist',
    department: 'Environmental & Social',
    currentStage: 'INTERVIEW_3',
    yearsExperience: 6,
    expectedSalaryNgn: 1800000,
    notes: [
      {
        stage: 'INTERVIEW_1',
        interviewerId: 'usr-3',
        interviewerName: 'Amina Bello',
        date: '2026-08-25',
        rating: 5,
        technicalCompetency: 'Exceptional knowledge of benthic macroinvertebrates and hydrocarbon fingerprinting.',
        culturalFit: 'Collaborative, research-focused, proactive communicator.',
        recommendation: 'ADVANCE',
        comments: 'Outstanding screening scorecard.'
      },
      {
        stage: 'INTERVIEW_2',
        interviewerId: 'usr-5',
        interviewerName: 'Dr. Ngozi Eze',
        date: '2026-09-01',
        rating: 5,
        technicalCompetency: 'FMEnv certified accredited analyst. Flawless grasp of DPR EGASPIN regulatory standards.',
        culturalFit: 'Ready for offshore mobilization and environmental impact assessment leadership.',
        recommendation: 'ADVANCE',
        comments: 'Strongest ESIA analyst interviewed this quarter. Advanced to Managing Consultant final gate.'
      }
    ],
    documents: [
      {
        id: 'cdoc-3',
        title: 'Aisha_Danjuma_Curriculum_Vitae.pdf',
        stage: 'PROSPECTIVE',
        fileType: 'PDF',
        fileSizeMb: 3.2,
        uploadedAt: '2026-08-20',
        downloadUrl: '/vault/candidates/cand-2-cv.pdf'
      },
      {
        id: 'cdoc-4',
        title: 'Published Papers & FMEnv Accreditation.pdf',
        stage: 'INTERVIEW_2',
        fileType: 'PDF',
        fileSizeMb: 8.5,
        uploadedAt: '2026-09-01',
        downloadUrl: '/vault/candidates/cand-2-papers.pdf'
      }
    ],
    vaultFolderId: 'vlt-cand-2',
    createdAt: '2026-08-20'
  },
  {
    id: 'cand-3',
    candidateNumber: 'CND-2026-043',
    fullName: 'Babajide Cole',
    email: 'b.cole@geotechpros.com',
    phone: '+234 805 777 3322',
    appliedRole: 'Geotechnical Soil Mechanics Technician',
    department: 'Geotechnical & Geophysics',
    currentStage: 'PROBATIONARY',
    yearsExperience: 4,
    expectedSalaryNgn: 1100000,
    notes: [
      {
        stage: 'INTERVIEW_3',
        interviewerId: 'usr-1',
        interviewerName: 'Kaine Edike',
        date: '2026-09-03',
        rating: 4,
        technicalCompetency: 'Proficient in CPTu (Piezocone Penetrometer) and triaxial shear testing.',
        culturalFit: 'Field-ready, disciplined approach to lab QA/QC.',
        recommendation: 'OFFER_PROBATION',
        comments: '3-Month probationary employment offer extended. Station at Escravos Field Lab.'
      }
    ],
    documents: [
      {
        id: 'cdoc-5',
        title: 'Babajide_Cole_Credentials.pdf',
        stage: 'PROSPECTIVE',
        fileType: 'PDF',
        fileSizeMb: 3.9,
        uploadedAt: '2026-08-15',
        downloadUrl: '/vault/candidates/cand-3-cv.pdf'
      },
      {
        id: 'cdoc-6',
        title: 'Signed_Probationary_Offer_Letter.pdf',
        stage: 'PROBATIONARY',
        fileType: 'PDF',
        fileSizeMb: 1.5,
        uploadedAt: '2026-09-04',
        downloadUrl: '/vault/candidates/cand-3-offer.pdf'
      }
    ],
    outcome: 'PROBATIONARY',
    outcomeDate: '2026-09-04',
    vaultFolderId: 'vlt-cand-3',
    createdAt: '2026-08-15'
  }
];

// ==========================================
// Slate Labs V1.2 Project Milestone Templates
// ==========================================

export const TEMPLATE_A_TASKS: TemplateTaskDefinition[] = [
  // Step 01 Contracting / kick-off
  { stage: '01 Contracting / kick-off', title: 'Kick-off meeting with client (scope, timeline, team, responsibilities)', taskType: 'STANDARD', suggestedRole: 'LEAD', dueOffsetDays: 3 },
  { stage: '01 Contracting / kick-off', title: 'Desktop and literature review', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 7 },
  // Step 02 Preliminary / pre-mobilisation
  { stage: '02 Preliminary / pre-mobilisation', title: 'SOW / ToR approval', taskType: 'APPROVAL_GATE', suggestedRole: 'LEAD', dueOffsetDays: 14, isApprovalGate: true, gateBlocks: ['04 Data gathering'] },
  { stage: '02 Preliminary / pre-mobilisation', title: 'CASHES management plan', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 18 },
  { stage: '02 Preliminary / pre-mobilisation', title: 'Field Activities Plan (FAP)', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 21 },
  { stage: '02 Preliminary / pre-mobilisation', title: 'Job Hazard Analysis (JHA)', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 23 },
  { stage: '02 Preliminary / pre-mobilisation', title: 'Equipment calibration', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 25 },
  // Step 03 Reconnaissance visit
  { stage: '03 Reconnaissance visit', title: 'Mobilise to site', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 28 },
  { stage: '03 Reconnaissance visit', title: 'Site visit', taskType: 'STANDARD', suggestedRole: 'LEAD', dueOffsetDays: 32 },
  { stage: '03 Reconnaissance visit', title: 'Demobilise', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 35 },
  { stage: '03 Reconnaissance visit', title: 'Reconnaissance data analysis', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 40 },
  // Step 04 Data gathering (Blocked until Step 02 SOW / ToR approval is complete)
  { stage: '04 Data gathering', title: 'Mobilise to site', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 45 },
  { stage: '04 Data gathering', title: 'Ecological, socio-economic and health data collection', taskType: 'STANDARD', suggestedRole: 'LEAD', dueOffsetDays: 55 },
  { stage: '04 Data gathering', title: 'Laboratory analysis', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 65 },
  { stage: '04 Data gathering', title: 'Result QA/QC', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 72 },
  { stage: '04 Data gathering', title: 'Result analysis', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 78 },
  // Step 05 Impact evaluation
  { stage: '05 Impact evaluation', title: 'Existing impact assessment', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 85 },
  { stage: '05 Impact evaluation', title: 'Cumulative impacts', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 92 },
  { stage: '05 Impact evaluation', title: 'Mitigation measures', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 98 },
  { stage: '05 Impact evaluation', title: 'Management plans', taskType: 'STANDARD', suggestedRole: 'LEAD', dueOffsetDays: 105 },
  // Step 06 Report
  { stage: '06 Report', title: 'Draft and final report development', taskType: 'REPORT', suggestedRole: 'DESIGNER', dueOffsetDays: 115 },
  { stage: '06 Report', title: 'Stakeholder review of draft', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 125 },
  { stage: '06 Report', title: 'Address review comments', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 132 },
  { stage: '06 Report', title: 'Issue final report', taskType: 'STANDARD', suggestedRole: 'LEAD', dueOffsetDays: 140 },
];

export const TEMPLATE_B_TASKS: TemplateTaskDefinition[] = [
  // Stage 1 Proposal / ToR
  { stage: '1 Proposal / ToR', title: 'Develop project proposal', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 5 },
  { stage: '1 Proposal / ToR', title: 'Develop EBS ToR', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 10 },
  { stage: '1 Proposal / ToR', title: 'Submit proposal and ToR for approval', taskType: 'APPROVAL_GATE', suggestedRole: 'LEAD', dueOffsetDays: 16, isApprovalGate: true, gateBlocks: ['3 Field data gathering'] },
  // Stage 2 Pre-mobilisation
  { stage: '2 Pre-mobilisation', title: 'Literature review / gap analysis', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 22 },
  { stage: '2 Pre-mobilisation', title: 'Develop field work plan', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 28 },
  { stage: '2 Pre-mobilisation', title: 'FTO arrangements with communities', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 35 },
  // Stage 3 Field data gathering (Blocked until ToR approval)
  { stage: '3 Field data gathering', title: 'Field sampling and measurement', taskType: 'STANDARD', suggestedRole: 'LEAD', dueOffsetDays: 45 },
  { stage: '3 Field data gathering', title: 'Observation and documentation', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 52 },
  // Stage 4 Analysis and interpretation
  { stage: '4 Analysis and interpretation', title: 'Laboratory analysis of samples', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 62 },
  { stage: '4 Analysis and interpretation', title: 'Interpretation of data', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 70 },
  { stage: '4 Analysis and interpretation', title: 'Existing environmental description (the baseline)', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 78 },
  // Stage 5 Reporting
  { stage: '5 Reporting', title: 'Draft and final report development', taskType: 'REPORT', suggestedRole: 'DESIGNER', dueOffsetDays: 90 },
  // Stage 6 Review
  { stage: '6 Review', title: 'Client, regulator, study team and stakeholder review', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 102 },
  { stage: '6 Review', title: 'Address review comments', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 110 },
  // All stages (Ongoing)
  { stage: 'All stages', title: 'Consultation with regulators, stakeholders and experts', taskType: 'ONGOING', suggestedRole: 'LEAD', dueOffsetDays: 120, isOngoing: true }
];

export const TEMPLATE_C_TASKS: TemplateTaskDefinition[] = [
  // Phase: Preliminary activities
  { stage: 'Preliminary activities', title: 'Project conception', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 5 },
  { stage: 'Preliminary activities', title: 'Notify the regulator of the EIA', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 10 },
  { stage: 'Preliminary activities', title: 'Project concept screening', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 15 },
  { stage: 'Preliminary activities', title: 'Environmental screening', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 20 },
  { stage: 'Preliminary activities', title: 'Preliminary environmental risk assessment (PERA)', taskType: 'DECISION_GATE', suggestedRole: 'LEAD', dueOffsetDays: 30, isDecisionGate: true },
  // Route 1: PERA approval (Option A)
  { stage: 'Route 1: PERA approval', title: 'Obtain PERA approval / environmental permit', taskType: 'STANDARD', suggestedRole: 'LEAD', dueOffsetDays: 45, route: 'ROUTE_1_PERA' },
  // Route 2: Detailed EIA (Option B)
  { stage: 'Route 2: Detailed EIA', title: 'ToR and sampling plan', taskType: 'APPROVAL_GATE', suggestedRole: 'LEAD', dueOffsetDays: 45, route: 'ROUTE_2_DETAILED_EIA', isApprovalGate: true, gateBlocks: ['Baseline data gathering'] },
  { stage: 'Route 2: Detailed EIA', title: 'Baseline data gathering', taskType: 'STANDARD', suggestedRole: 'LEAD', dueOffsetDays: 60, route: 'ROUTE_2_DETAILED_EIA' },
  { stage: 'Route 2: Detailed EIA', title: 'Laboratory analysis', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 75, route: 'ROUTE_2_DETAILED_EIA' },
  { stage: 'Route 2: Detailed EIA', title: 'Impact assessment and mitigation', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 90, route: 'ROUTE_2_DETAILED_EIA' },
  { stage: 'Route 2: Detailed EIA', title: 'Environmental management plan', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 100, route: 'ROUTE_2_DETAILED_EIA' },
  { stage: 'Route 2: Detailed EIA', title: 'Waste management plan', taskType: 'STANDARD', suggestedRole: 'CONTRIBUTOR', dueOffsetDays: 108, route: 'ROUTE_2_DETAILED_EIA' },
  { stage: 'Route 2: Detailed EIA', title: 'Draft and final EIA reports', taskType: 'REPORT', suggestedRole: 'DESIGNER', dueOffsetDays: 125, route: 'ROUTE_2_DETAILED_EIA' },
  { stage: 'Route 2: Detailed EIA', title: 'EIA approval / permit', taskType: 'STANDARD', suggestedRole: 'LEAD', dueOffsetDays: 140, route: 'ROUTE_2_DETAILED_EIA' }
];

export const PROJECT_TEMPLATES: Record<ProjectType, ProjectTemplateDefinition> = {
  EIA: {
    id: 'tmpl-eia',
    projectType: 'EIA',
    version: '1.2',
    name: 'Template A: Six-step study process (EIA)',
    description: 'EIA workflow with Step 05 carrying primary weight for impact prediction, mitigation and environmental management plans.',
    tasks: TEMPLATE_A_TASKS
  },
  ESIA: {
    id: 'tmpl-esia',
    projectType: 'ESIA',
    version: '1.2',
    name: 'Template A: Six-step study process (ESIA)',
    description: 'ESIA workflow with Step 04 adding socio-economic and health data alongside ecological baselines, and Step 05 social management measures.',
    tasks: TEMPLATE_A_TASKS
  },
  PIAR: {
    id: 'tmpl-piar',
    projectType: 'PIAR',
    version: '1.2',
    name: 'Template A: Six-step study process (PIAR)',
    description: 'Post-Impact Assessment Report workflow concentrating on impacted vs. reference conditions, recovery time, and site remediation.',
    tasks: TEMPLATE_A_TASKS
  },
  EBS: {
    id: 'tmpl-ebs',
    projectType: 'EBS',
    version: '1.2',
    name: 'Template B: Environmental Baseline Study (EBS)',
    description: 'Complete baseline environmental sampling and stakeholder consultation workflow with SOW/ToR approval gating.',
    tasks: TEMPLATE_B_TASKS
  },
  PERA_EIA_ROUTE: {
    id: 'tmpl-pera',
    projectType: 'PERA_EIA_ROUTE',
    version: '1.2',
    name: 'Template C: PERA and the EIA route',
    description: 'Regulatory route from project conception through preliminary risk screening with decision gating into PERA Approval or Detailed EIA.',
    tasks: TEMPLATE_C_TASKS
  }
};

export function generateStarterTasks(
  projectId: string,
  projectTitle: string,
  projectType: ProjectType,
  startDateStr: string,
  pmId: string,
  pmName: string
): TaskItem[] {
  const template = PROJECT_TEMPLATES[projectType];
  if (!template) return [];

  const baseDate = new Date(startDateStr || new Date().toISOString().split('T')[0]);

  return template.tasks.map((t, idx) => {
    const taskDueDate = new Date(baseDate.getTime() + t.dueOffsetDays * 86400000).toISOString().split('T')[0];
    const isStep4Blocked = t.stage === '04 Data gathering' || t.stage === '3 Field data gathering';
    const isReport = t.taskType === 'REPORT';

    return {
      id: `tsk-${projectId}-${idx + 1}`,
      title: t.title,
      description: `Stage: ${t.stage} • Template: ${template.name}`,
      moduleOrigin: 'PROJECT',
      status: 'SUGGESTED',
      confirmed: false,
      priority: t.isApprovalGate || t.isDecisionGate || isReport ? 'HIGH' : 'MEDIUM',
      dueDate: taskDueDate,
      originalDueDate: taskDueDate,
      currentDueDate: taskDueDate,
      assigneeId: pmId,
      assigneeName: pmName,
      projectId: projectId,
      projectName: projectTitle,
      taskType: t.taskType,
      stage: t.stage,
      gateBlocks: t.gateBlocks,
      isBlockedByGate: isStep4Blocked,
      isOngoing: t.isOngoing,
      route: t.route,
      suggestedRole: t.suggestedRole,
      departmentId: isReport ? 'dept-it-design' : undefined,
      departmentName: isReport ? 'IT & Creative Design' : undefined,
      taskAssignees: [
        {
          userId: pmId,
          userName: pmName,
          role: t.suggestedRole
        }
      ]
    };
  });
}

export const INITIAL_PROJECT_EXPENSES: ProjectExpenseItem[] = [
  {
    id: 'pex-101',
    expenseNumber: 'EXP-2026-001',
    projectId: 'prj-1',
    projectName: 'Chevron Escravos Terminal Expansion - Geotech & Metocean Campaign',
    category: 'EQUIPMENT_RENTAL',
    title: 'Offshore Support Vessel Charter (MV Taraba - 14 Days)',
    description: 'Specialized 45m DP-1 geotechnical survey vessel hire for seabed coring and CPT deployment in Escravos offshore block.',
    amountNgn: 14500000,
    currency: 'NGN',
    date: '2026-08-25',
    vendor: 'Oceanic Marine Offshore Logistics Ltd',
    receiptNumber: 'INV-OML-8921',
    status: 'PAID',
    paymentMethod: 'BANK_TRANSFER',
    recordedById: 'usr-4',
    recordedByName: 'Bibi Adeyeye',
    approvedByName: 'Kaine Edike',
    notes: 'Approved under Master Service Agreement with Chevron Escravos operations.',
    createdAt: '2026-08-25T11:00:00Z'
  },
  {
    id: 'pex-102',
    expenseNumber: 'EXP-2026-002',
    projectId: 'prj-1',
    projectName: 'Chevron Escravos Terminal Expansion - Geotech & Metocean Campaign',
    category: 'LAB_TESTING',
    title: 'Triaxial Shear & Atterberg Limits Subsurface Lab Testing',
    description: 'Laboratory analysis of 36 deep marine boreholes and seabed sediment core testing according to ASTM D2850 standards.',
    amountNgn: 4850000,
    currency: 'NGN',
    date: '2026-09-02',
    vendor: 'Fugro Subsurface Nigeria Ltd',
    receiptNumber: 'FUG-NG-2026-441',
    status: 'PAID',
    paymentMethod: 'BANK_TRANSFER',
    recordedById: 'usr-4',
    recordedByName: 'Bibi Adeyeye',
    approvedByName: 'Engr. Femi Adebayo',
    notes: 'Standard certified geotechnical laboratory report.',
    createdAt: '2026-09-02T14:30:00Z'
  },
  {
    id: 'pex-103',
    expenseNumber: 'EXP-2026-003',
    projectId: 'prj-1',
    projectName: 'Chevron Escravos Terminal Expansion - Geotech & Metocean Campaign',
    category: 'FIELD_OPERATIONS',
    title: 'Offshore Survival PPE & Marine Safety Consumables',
    description: 'Inflatable SOLAS lifejackets, immersion suits, and gas detection badges for offshore survey muster crew.',
    amountNgn: 1850000,
    currency: 'NGN',
    date: '2026-08-18',
    vendor: 'Marine Safety Systems Nigeria',
    receiptNumber: 'MSS-REC-1092',
    status: 'PAID',
    paymentMethod: 'CORPORATE_CARD',
    recordedById: 'usr-6',
    recordedByName: 'Marvelous Ojo',
    approvedByName: 'Kaine Edike',
    notes: 'Required for Chevron offshore terminal site access permit.',
    createdAt: '2026-08-18T09:15:00Z'
  },
  {
    id: 'pex-104',
    expenseNumber: 'EXP-2026-004',
    projectId: 'prj-1',
    projectName: 'Chevron Escravos Terminal Expansion - Geotech & Metocean Campaign',
    category: 'REGULATORY_PERMITS',
    title: 'NPA Channel Navigation & Maritime Pilotage Dues',
    description: 'Nigerian Ports Authority security corridor clearance and pilotage dues for Escravos fairway beacon operations.',
    amountNgn: 950000,
    currency: 'NGN',
    date: '2026-08-14',
    vendor: 'Nigerian Ports Authority (NPA)',
    receiptNumber: 'NPA-ESC-8812',
    status: 'PAID',
    paymentMethod: 'BANK_TRANSFER',
    recordedById: 'usr-4',
    recordedByName: 'Bibi Adeyeye',
    approvedByName: 'Kaine Edike',
    notes: 'Statutory maritime port clearance.',
    createdAt: '2026-08-14T16:00:00Z'
  },
  {
    id: 'pex-201',
    expenseNumber: 'EXP-2026-005',
    projectId: 'prj-2',
    projectName: 'Bonny Island Channel Navigation Drone Bathymetric Survey',
    category: 'EQUIPMENT_RENTAL',
    title: 'Dual-Frequency Multibeam Echo Sounder Calibration & Deployment',
    description: 'Trimble Marine high-resolution sonar calibration and drone LiDAR survey package for shallow channel navigation.',
    amountNgn: 2200000,
    currency: 'NGN',
    date: '2026-08-28',
    vendor: 'Trimble Navigation West Africa',
    receiptNumber: 'TNW-2026-551',
    status: 'PAID',
    paymentMethod: 'BANK_TRANSFER',
    recordedById: 'usr-4',
    recordedByName: 'Bibi Adeyeye',
    approvedByName: 'Engr. Femi Adebayo',
    notes: 'NLNG Bonny terminal perimeter calibration.',
    createdAt: '2026-08-28T10:00:00Z'
  },
  {
    id: 'pex-202',
    expenseNumber: 'EXP-2026-006',
    projectId: 'prj-2',
    projectName: 'Bonny Island Channel Navigation Drone Bathymetric Survey',
    category: 'LOGISTICS_TRAVEL',
    title: 'Bonny Waterway High-Speed Crew Boat & Escort Logistics',
    description: 'Marine charter for bathymetry team transit between Port Harcourt Naval Base and Finima creek stations.',
    amountNgn: 1800000,
    currency: 'NGN',
    date: '2026-09-08',
    vendor: 'Bonny Marine Transport Cooperative',
    receiptNumber: 'BMTC-7721',
    status: 'PAID',
    paymentMethod: 'PETTY_CASH',
    recordedById: 'usr-4',
    recordedByName: 'Bibi Adeyeye',
    approvedByName: 'Kaine Edike',
    notes: 'Covers 8 riverine survey days.',
    createdAt: '2026-09-08T08:30:00Z'
  },
  {
    id: 'pex-301',
    expenseNumber: 'EXP-2026-007',
    projectId: 'prj-3',
    projectName: 'Obite Gas Processing Plant Environmental Audit & Ground Water Modeling',
    category: 'LAB_TESTING',
    title: 'Heavy Metals ICP-MS & Dissolved Gas Chromatography Spectrometry',
    description: 'Analysis of 48 deep aquifer water samples across Obite gas plant monitoring boreholes.',
    amountNgn: 3600000,
    currency: 'NGN',
    date: '2026-07-22',
    vendor: 'SGS Analytics Nigeria',
    receiptNumber: 'SGS-PH-2026-102',
    status: 'PAID',
    paymentMethod: 'BANK_TRANSFER',
    recordedById: 'usr-4',
    recordedByName: 'Bibi Adeyeye',
    approvedByName: 'Kaine Edike',
    notes: 'TotalEnergies quarterly baseline reporting standard.',
    createdAt: '2026-07-22T13:45:00Z'
  }
];

export const INITIAL_CLIENT_RECEIPTS: ClientReceiptItem[] = [
  {
    id: 'cr-101',
    receiptNumber: 'REC-2026-001',
    projectId: 'prj-1',
    projectName: 'Chevron Escravos Terminal Expansion - Geotech & Metocean Campaign',
    clientId: 'cli-1',
    clientName: 'Chevron Nigeria Limited',
    amountNgn: 37500000,
    currency: 'NGN',
    paymentDate: '2026-08-11',
    paymentReference: 'NIBSS-CHEV-2026-081192',
    milestoneDescription: 'Advance Mobilization Payment (30% Contract Value)',
    whtDeductedNgn: 1875000,
    vatPaidNgn: 2812500,
    bankAccount: 'Zenith Bank - 1014882910 (Corporate Operations)',
    recordedById: 'usr-4',
    recordedByName: 'Bibi Adeyeye',
    notes: 'Initial mobilization credit confirmed via corporate treasury.',
    createdAt: '2026-08-11T10:00:00Z'
  },
  {
    id: 'cr-102',
    receiptNumber: 'REC-2026-002',
    projectId: 'prj-1',
    projectName: 'Chevron Escravos Terminal Expansion - Geotech & Metocean Campaign',
    clientId: 'cli-1',
    clientName: 'Chevron Nigeria Limited',
    amountNgn: 25000000,
    currency: 'NGN',
    paymentDate: '2026-09-05',
    paymentReference: 'NIBSS-CHEV-2026-090544',
    milestoneDescription: 'Milestone 1 Settlement: Completion of Seabed Bathymetry & CPT Campaign',
    whtDeductedNgn: 1250000,
    vatPaidNgn: 1875000,
    bankAccount: 'Zenith Bank - 1014882910 (Corporate Operations)',
    recordedById: 'usr-4',
    recordedByName: 'Bibi Adeyeye',
    notes: 'Chevron Joint Venture Accounts confirmation.',
    createdAt: '2026-09-05T15:20:00Z'
  },
  {
    id: 'cr-201',
    receiptNumber: 'REC-2026-003',
    projectId: 'prj-2',
    projectName: 'Bonny Island Channel Navigation Drone Bathymetric Survey',
    clientId: 'cli-5',
    clientName: 'Nigeria LNG Limited (NLNG)',
    amountNgn: 23200000,
    currency: 'NGN',
    paymentDate: '2026-08-20',
    paymentReference: 'NLNG-WIRE-2026-082012',
    milestoneDescription: 'Advance Mobilization Payment (40% Contract Value)',
    whtDeductedNgn: 1160000,
    vatPaidNgn: 1740000,
    bankAccount: 'Zenith Bank - 1014882910 (Corporate Operations)',
    recordedById: 'usr-4',
    recordedByName: 'Bibi Adeyeye',
    notes: 'Direct wire transfer from NLNG Finima treasury account.',
    createdAt: '2026-08-20T11:15:00Z'
  },
  {
    id: 'cr-301',
    receiptNumber: 'REC-2026-004',
    projectId: 'prj-3',
    projectName: 'Obite Gas Processing Plant Environmental Audit & Ground Water Modeling',
    clientId: 'cli-2',
    clientName: 'TotalEnergies EP Nigeria',
    amountNgn: 24750000,
    currency: 'NGN',
    paymentDate: '2026-07-15',
    paymentReference: 'TEPNG-WIRE-2026-071533',
    milestoneDescription: 'Contract Execution & Scoping Mobilization (30%)',
    whtDeductedNgn: 1237500,
    vatPaidNgn: 1856250,
    bankAccount: 'Access Bank - 0029384812 (Treasury)',
    recordedById: 'usr-4',
    recordedByName: 'Bibi Adeyeye',
    notes: 'Advance receipt under SAP contract ref TEPNG-44021.',
    createdAt: '2026-07-15T09:40:00Z'
  }
];


