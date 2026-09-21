const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AquaEarth Cloud Database on Neon...');

  // 1. Departments
  const departments = [
    { id: 'dept-exec', name: 'Executive Leadership', code: 'EXEC', description: 'Executive Strategy, Governance & Client Advisory' },
    { id: 'dept-it', name: 'IT & Digital Operations', code: 'IT', description: 'Digital Infrastructure, SOC2 Security & Cloud' },
    { id: 'dept-hr', name: 'Human Resources', code: 'HR', description: 'Talent Acquisition, Compliance & Workforce Governance' },
    { id: 'dept-geotech', name: 'Geotechnical & Geophysics', code: 'GEOTECH', description: 'Deep Offshore CPT, Soil Mechanics & Foundation Engineering' },
    { id: 'dept-env', name: 'Environmental & Social (ESIA)', code: 'ENV', description: 'Environmental Impact Assessments & FMEnv Regulatory Audits' },
    { id: 'dept-bd', name: 'Commercial & BD', code: 'BD', description: 'Tendering, Bid Governance & Client Relations' },
    { id: 'dept-finance', name: 'Finance & Accounts', code: 'FIN', description: 'Milestone Invoicing, Multi-Currency Treasury & Tax' },
    { id: 'dept-survey', name: 'Geoinformatics & Survey', code: 'SURVEY', description: 'Drone LiDAR, Bathymetry & Hydrographic Surveys' },
    { id: 'dept-qa', name: 'Quality Assurance (QA/QC)', code: 'QA', description: 'Technical QA, Peer Review & Engineering Sign-offs' },
    { id: 'dept-commercial', name: 'Project Management & Commercial', code: 'COMM', description: 'Commercial Project Management & Contract Delivery' },
    { id: 'dept-gis', name: 'Geoinformatics & Survey', code: 'GIS', description: 'GIS Mapping, Bathymetry & Cartography' }
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: { name: dept.name, description: dept.description },
      create: dept,
    });
  }
  console.log('✔ All 11 Departments seeded');

  // 2. All 14 Corporate Personnel
  const users = [
    {
      id: 'usr-1',
      email: 'kaine.edike@aquaearth.com',
      passwordHash: 'AquaEarth@2026!',
      name: 'Kaine Edike',
      avatar: '/avatars/kaine-edike.png',
      jobTitle: 'Founder & Managing Consultant',
      functionalRole: 'MANAGING_CONSULTANT',
      accessTier: 'SUPERADMIN',
      managementTier: 'DEPT_HEAD',
      departmentId: 'dept-exec',
      phone: '+234 803 123 4567',
      location: 'Lekki Phase 1 HQ, Lagos',
      bio: 'Principal Lead & Founder of AquaEarth Consulting. Specialist in offshore geotechnical investigation, FIDIC contractual governance, and FMEnv regulatory compliance.',
      status: 'ACTIVE',
    },
    {
      id: 'usr-2',
      email: 'chidi.okafor@aquaearth.com',
      passwordHash: 'AquaEarth@2026!',
      name: 'Chidi Okafor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      jobTitle: 'IT Team Lead & Systems Admin',
      functionalRole: 'IT_LEAD',
      accessTier: 'SUPERADMIN',
      managementTier: 'TEAM_LEAD',
      departmentId: 'dept-it',
      phone: '+234 802 987 6543',
      location: 'Lekki Phase 1 HQ, Lagos',
      bio: 'IT Operations & Infrastructure Lead directing cloud architecture, Starlink maritime telemetry, and SOC2 cybersecurity.',
      status: 'ACTIVE',
    },
    {
      id: 'usr-3',
      email: 'amina.bello@aquaearth.com',
      passwordHash: 'AquaEarth@2026!',
      name: 'Amina Bello',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      jobTitle: 'HR Administrator & Talent Lead',
      functionalRole: 'HR_ADMIN',
      accessTier: 'ADMIN',
      managementTier: 'LINE_MANAGER',
      departmentId: 'dept-hr',
      phone: '+234 805 345 6789',
      location: 'Lekki Phase 1 HQ, Lagos',
      bio: 'Chartered HR Practitioner leading talent operations, CIPM compliance, and performance appraisal cycles across all engineering departments.',
      status: 'ACTIVE',
    },
    {
      id: 'usr-4',
      email: 'femi.adebayo@aquaearth.com',
      passwordHash: 'AquaEarth@2026!',
      name: 'Engr. Femi Adebayo',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      jobTitle: 'Head of Geotechnical Engineering',
      functionalRole: 'PROJECT_MANAGER',
      accessTier: 'ADMIN',
      managementTier: 'LINE_MANAGER',
      departmentId: 'dept-geotech',
      phone: '+234 809 456 7890',
      location: 'Lekki Phase 1 HQ, Lagos',
      bio: 'Senior Geotechnical Specialist managing offshore borehole campaigns, cone penetration testing (CPT), and foundation engineering.',
      status: 'ACTIVE',
    },
    {
      id: 'usr-5',
      email: 'ngozi.eze@aquaearth.com',
      passwordHash: 'AquaEarth@2026!',
      name: 'Dr. Ngozi Eze',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      jobTitle: 'Lead Environmental Consultant (ESIA)',
      functionalRole: 'PROJECT_MANAGER',
      accessTier: 'ADMIN',
      managementTier: 'LINE_MANAGER',
      departmentId: 'dept-env',
      phone: '+234 803 789 0123',
      location: 'Lekki Phase 1 HQ, Lagos',
      bio: 'Lead Environmental Consultant overseeing Environmental and Social Impact Assessments (ESIA) and FMEnv regulatory accreditations.',
      status: 'ACTIVE',
    },
    {
      id: 'usr-6',
      email: 'tunde.bakare@aquaearth.com',
      passwordHash: 'AquaEarth@2026!',
      name: 'Tunde Bakare',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      jobTitle: 'Senior Field Geologist & Borehole Specialist',
      functionalRole: 'FIELD_STAFF',
      accessTier: 'STANDARD',
      managementTier: 'NONE',
      departmentId: 'dept-geotech',
      phone: '+234 818 234 5678',
      location: 'Escravos Field Base / Lekki HQ',
      bio: 'Senior Field Geologist logging borehole stratigraphy and operating offshore CPT rigs across Niger Delta operational blocks.',
      status: 'ACTIVE',
    },
    {
      id: 'usr-7',
      email: 'halima.yusuf@aquaearth.com',
      passwordHash: 'AquaEarth@2026!',
      name: 'Halima Yusuf',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
      jobTitle: 'GIS & Bathymetric Survey Analyst',
      functionalRole: 'FIELD_STAFF',
      accessTier: 'STANDARD',
      managementTier: 'NONE',
      departmentId: 'dept-gis',
      phone: '+234 807 567 8901',
      location: 'Bonny Island Channel Base / Lekki HQ',
      bio: 'Hydrographic surveyor and drone LiDAR operator generating digital bathymetric terrain models for coastal navigation channels.',
      status: 'ACTIVE',
    },
    {
      id: 'usr-8',
      email: 'emeka.nnamdi@aquaearth.com',
      passwordHash: 'AquaEarth@2026!',
      name: 'Emeka Nnamdi',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      jobTitle: 'Senior QA/QC Reviewer',
      functionalRole: 'QA_LEAD',
      accessTier: 'STANDARD',
      managementTier: 'TEAM_LEAD',
      departmentId: 'dept-qa',
      phone: '+234 812 678 9012',
      location: 'Lekki Phase 1 HQ, Lagos',
      bio: 'Lead Quality Assurance Auditor enforcing ISO 9001 and ASTM geotechnical standards across all project deliverables.',
      status: 'ACTIVE',
    },
    {
      id: 'usr-9',
      email: 'blessing.john@aquaearth.com',
      passwordHash: 'AquaEarth@2026!',
      name: 'Blessing John',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      jobTitle: 'Creative & Brand Design Officer',
      functionalRole: 'IT_DESIGN_OFFICER',
      accessTier: 'STANDARD',
      managementTier: 'NONE',
      departmentId: 'dept-it',
      phone: '+234 816 789 0123',
      location: 'Lekki Phase 1 HQ, Lagos',
      bio: 'Digital design officer formatting engineering bid packages, executive presentations, and cartographic reports.',
      status: 'ACTIVE',
    },
    {
      id: 'usr-10',
      email: 'bibi@aquaearth.com',
      passwordHash: 'AquaEarth@2026!',
      name: 'Bibi',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
      jobTitle: 'Executive Director (2nd in Command)',
      functionalRole: 'DEPUTY_MANAGING_CONSULTANT',
      accessTier: 'SUPERADMIN',
      managementTier: 'DEPT_HEAD',
      departmentId: 'dept-exec',
      phone: '+234 803 222 9988',
      location: 'Lekki Phase 1 HQ, Lagos',
      bio: 'Executive Director steering strategic negotiations, joint-venture partnerships, and executive risk governance.',
      status: 'ACTIVE',
    },
    {
      id: 'usr-11',
      email: 'erica@aquaearth.com',
      passwordHash: 'AquaEarth@2026!',
      name: 'Erica',
      avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&auto=format&fit=crop&q=80',
      jobTitle: 'Chief Financial Officer (CFO)',
      functionalRole: 'CFO',
      accessTier: 'SUPERADMIN',
      managementTier: 'DEPT_HEAD',
      departmentId: 'dept-finance',
      phone: '+234 802 333 4455',
      location: 'Lekki Phase 1 HQ, Lagos',
      bio: 'Chief Financial Officer overseeing corporate financial planning, FIDIC milestone billing, foreign exchange treasury, and audited accounts.',
      status: 'ACTIVE',
    },
    {
      id: 'usr-12',
      email: 'ozioma@aquaearth.com',
      passwordHash: 'AquaEarth@2026!',
      name: 'Miss Ozioma',
      avatar: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=150&auto=format&fit=crop&q=80',
      jobTitle: 'Senior Consultant & Commercial Liaison',
      functionalRole: 'SENIOR_CONSULTANT',
      accessTier: 'SUPERADMIN',
      managementTier: 'LINE_MANAGER',
      departmentId: 'dept-commercial',
      phone: '+234 806 777 8899',
      location: 'Lekki Phase 1 HQ, Lagos',
      bio: 'Senior Commercial Consultant coordinating high-value tender submissions, stakeholder relations, and FIDIC contract milestones.',
      status: 'ACTIVE',
    },
    {
      id: 'usr-13',
      email: 'gift@aquaearth.com',
      passwordHash: 'AquaEarth@2026!',
      name: 'Gift',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
      jobTitle: 'Finance Officer (Collation & Petty Cash Lead)',
      functionalRole: 'FINANCE_OFFICER',
      accessTier: 'STANDARD',
      managementTier: 'NONE',
      departmentId: 'dept-finance',
      phone: '+234 814 111 2233',
      location: 'Lekki Phase 1 HQ, Lagos',
      bio: 'Finance Officer in charge of budget collation, petty cash disbursement vouchers, and expenditure reconciliations.',
      status: 'ACTIVE',
    },
    {
      id: 'usr-14',
      email: 'marvelous@aquaearth.com',
      passwordHash: 'AquaEarth@2026!',
      name: 'Marvelous',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      jobTitle: 'Finance Officer (Invoicing Lead & Petty Cash)',
      functionalRole: 'FINANCE_OFFICER',
      accessTier: 'STANDARD',
      managementTier: 'NONE',
      departmentId: 'dept-finance',
      phone: '+234 815 222 3344',
      location: 'Lekki Phase 1 HQ, Lagos',
      bio: 'Finance & Invoicing Officer handling milestone billing preparations, petty cash funds, and multi-currency bank reconciliations.',
      status: 'ACTIVE',
    }
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: u,
      create: u,
    });
  }
  console.log('✔ All 14 Corporate Personnel seeded');

  // 3. Clients
  const clients = [
    {
      id: 'cli-1',
      name: 'Shell Petroleum Development Company (SPDC)',
      type: 'CLIENT',
      industry: 'Oil & Gas Exploration & Production',
      contactPerson: 'Engr. Tare Biu',
      email: 't.biu@spdc-shell.com',
      phone: '+234 803 555 1212',
      address: 'Shell Industrial Area, Port Harcourt, Rivers State',
      status: 'ACTIVE',
    },
    {
      id: 'cli-2',
      name: 'TotalEnergies EP Nigeria',
      type: 'CLIENT',
      industry: 'Energy & Offshore Operations',
      contactPerson: 'Sophie Legrand',
      email: 'sophie.legrand@totalenergies.com',
      phone: '+234 802 777 3434',
      address: 'Total House, Victoria Island, Lagos',
      status: 'ACTIVE',
    },
    {
      id: 'cli-3',
      name: 'Chevron Nigeria Limited (CNL)',
      type: 'CLIENT',
      industry: 'Deepwater & Shallow Offshore',
      contactPerson: 'Babatunde Alabi',
      email: 'balabi@chevron.com',
      phone: '+234 809 111 2233',
      address: 'Chevron Drive, Lekki Peninsula, Lagos',
      status: 'ACTIVE',
    },
    {
      id: 'cli-4',
      name: 'Federal Ministry of Environment (FMEnv)',
      type: 'STAKEHOLDER',
      industry: 'Federal Regulatory Agency',
      contactPerson: 'Dr. (Mrs.) K. Olatunji',
      email: 'eia_division@fmenv.gov.ng',
      phone: '+234 9 460 3000',
      address: 'Mabushi Federal Secretariat, Abuja',
      status: 'ACTIVE',
    },
    {
      id: 'cli-5',
      name: 'Nigeria LNG Limited (NLNG)',
      type: 'CLIENT',
      industry: 'Liquefied Natural Gas Processing & Export',
      contactPerson: 'Godwin Nwafor',
      email: 'g.nwafor@nlng.com',
      phone: '+234 803 888 1100',
      address: 'NLNG Plant Complex, Bonny Island, Rivers State',
      status: 'ACTIVE',
    }
  ];

  for (const c of clients) {
    await prisma.client.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
  }
  console.log('✔ All 5 Core Clients & Regulators seeded');

  // 4. Projects
  const projects = [
    {
      id: 'prj-1',
      projectCode: 'PRJ-2026-001',
      title: 'Escravos Deep Offshore Geotechnical & Seabed Survey Campaign',
      clientId: 'cli-3',
      clientName: 'Chevron Nigeria Limited (CNL)',
      serviceLinesJson: JSON.stringify(['Geotechnical Drilling', 'CPT Sounding', 'Metocean']),
      contractValue: 145000000,
      currency: 'NGN',
      status: 'ACTIVE',
      health: 'ON_TRACK',
      startDate: new Date('2026-08-01'),
      targetEndDate: new Date('2026-11-30'),
      leadPmName: 'Engr. Femi Adebayo',
      vaultStorageTier: 'ACTIVE_VAULT',
    },
    {
      id: 'prj-2',
      projectCode: 'PRJ-2026-002',
      title: 'Bonny Island Channel Navigation Drone Bathymetric Survey',
      clientId: 'cli-5',
      clientName: 'Nigeria LNG Limited (NLNG)',
      serviceLinesJson: JSON.stringify(['GIS, Hydrographic & Topographic Survey']),
      contractValue: 58000000,
      currency: 'NGN',
      status: 'ACTIVE',
      health: 'ON_TRACK',
      startDate: new Date('2026-08-15'),
      targetEndDate: new Date('2026-10-15'),
      leadPmName: 'Engr. Femi Adebayo',
      vaultStorageTier: 'ACTIVE_VAULT',
    },
    {
      id: 'prj-3',
      projectCode: 'PRJ-2026-003',
      title: 'Obite Gas Processing Plant Environmental Audit & Ground Water Modeling',
      clientId: 'cli-2',
      clientName: 'TotalEnergies EP Nigeria',
      serviceLinesJson: JSON.stringify(['Environmental Impact Assessment (EIA)', 'Groundwater Modeling']),
      contractValue: 82500000,
      currency: 'NGN',
      status: 'ACTIVE',
      health: 'ON_TRACK',
      startDate: new Date('2026-07-01'),
      targetEndDate: new Date('2026-12-15'),
      leadPmName: 'Kaine Edike',
      vaultStorageTier: 'ACTIVE_VAULT',
    }
  ];

  for (const p of projects) {
    await prisma.project.upsert({
      where: { projectCode: p.projectCode },
      update: p,
      create: p,
    });
  }
  console.log('✔ Projects seeded');

  // 5. Initial Key Tasks
  const tasks = [
    {
      id: 'tsk-101',
      title: 'Complete Borehole Log Analysis for Chevron Escravos (BH-04 & BH-05)',
      description: 'Compile ASTM soil classification and SPT N-values for deep strata foundation analysis.',
      moduleOrigin: 'PROJECT',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date('2026-09-22'),
      assigneeId: 'usr-6',
      projectId: 'prj-1',
      projectName: 'Escravos Deep Offshore Geotechnical & Seabed Survey Campaign'
    },
    {
      id: 'tsk-102',
      title: 'FMEnv Terms of Reference Review for Obite EIA Panel Session',
      description: 'Align public consultation minutes and air dispersion modelling with FMEnv Sectoral Guidelines.',
      moduleOrigin: 'COMPLIANCE',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      dueDate: new Date('2026-09-20'),
      assigneeId: 'usr-5',
      projectId: 'prj-3',
      projectName: 'Obite Gas Processing Plant Environmental Audit'
    },
    {
      id: 'tsk-103',
      title: 'Process Bonny Channel LiDAR Point Cloud & Hydrographic Contours',
      description: 'Generate high-resolution digital bathymetric charts (0.5m grid spacing) for navigation simulation.',
      moduleOrigin: 'PROJECT',
      status: 'NOT_STARTED',
      priority: 'MEDIUM',
      dueDate: new Date('2026-09-28'),
      assigneeId: 'usr-7',
      projectId: 'prj-2',
      projectName: 'Bonny Island Channel Navigation Drone Bathymetric Survey'
    }
  ];

  for (const t of tasks) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: t,
      create: t,
    });
  }
  console.log('✔ Active Engineering Tasks seeded');

  // 6. BD Opportunities & Tenders
  const opportunities = [
    {
      id: 'opp-1',
      title: 'Escravos Deep Offshore Geotechnical Campaign — Phase II',
      clientName: 'Chevron Nigeria Limited (CNL)',
      serviceLinesJson: JSON.stringify(['Geotechnical Drilling', 'CPT Sounding', 'Metocean']),
      estimatedValue: 145000000,
      currency: 'NGN',
      stage: 'WON',
      source: 'DIRECT_INVITE',
      submissionDeadline: new Date('2026-07-15'),
      decisionDate: new Date('2026-07-28'),
      bdOwnerName: 'Miss Ozioma',
      technicalLeadName: 'Engr. Femi Adebayo',
      convertedProjectId: 'prj-1'
    },
    {
      id: 'opp-2',
      title: 'Bonny Island Channel Drone Bathymetry & Sediment Transport Study',
      clientName: 'Nigeria LNG Limited (NLNG)',
      serviceLinesJson: JSON.stringify(['GIS, Hydrographic & Topographic Survey']),
      estimatedValue: 58000000,
      currency: 'NGN',
      stage: 'WON',
      source: 'RFP_PORTAL',
      submissionDeadline: new Date('2026-08-01'),
      decisionDate: new Date('2026-08-10'),
      bdOwnerName: 'Miss Ozioma',
      technicalLeadName: 'Halima Yusuf',
      convertedProjectId: 'prj-2'
    },
    {
      id: 'opp-3',
      title: 'Bonga South West Aparo (BSWA) Subsea Soil Mechanics Advisory',
      clientName: 'Shell Petroleum Development Company (SPDC)',
      serviceLinesJson: JSON.stringify(['Geotechnical Drilling', 'CPT Sounding']),
      estimatedValue: 220000000,
      currency: 'NGN',
      stage: 'PROPOSAL_DRAFTING',
      source: 'NIPEX_TENDER',
      submissionDeadline: new Date('2026-10-15'),
      bdOwnerName: 'Miss Ozioma',
      technicalLeadName: 'Engr. Femi Adebayo'
    },
    {
      id: 'opp-4',
      title: 'Egina FPSO Nearshore Environmental Baseline Verification',
      clientName: 'TotalEnergies EP Nigeria',
      serviceLinesJson: JSON.stringify(['Environmental Impact Assessment (EIA)']),
      estimatedValue: 42000000,
      currency: 'NGN',
      stage: 'QUALIFYING',
      source: 'REFERRAL',
      submissionDeadline: new Date('2026-10-30'),
      bdOwnerName: 'Kaine Edike',
      technicalLeadName: 'Dr. Ngozi Eze'
    }
  ];

  for (const opp of opportunities) {
    await prisma.opportunity.upsert({
      where: { id: opp.id },
      update: opp,
      create: opp,
    });
  }
  console.log('✔ BD Opportunities & Pipeline seeded');

  // 7. Staff Leave Requests
  const leaveRequests = [
    {
      id: 'lev-1',
      userId: 'usr-6', // Tunde Bakare
      leaveType: 'ANNUAL',
      startDate: new Date('2026-10-01'),
      endDate: new Date('2026-10-12'),
      daysCount: 10,
      status: 'PENDING',
      reason: 'Annual family leave following Escravos offshore campaign.',
      approvedById: null,
      reviewComments: null,
    },
    {
      id: 'lev-2',
      userId: 'usr-7', // Halima Yusuf
      leaveType: 'STUDY',
      startDate: new Date('2026-11-05'),
      endDate: new Date('2026-11-09'),
      daysCount: 5,
      status: 'APPROVED',
      reason: 'Hydrographic surveying technical certification workshop.',
      approvedById: 'usr-4', // Engr. Femi Adebayo
      reviewComments: 'Approved. Essential for Q4 coastal hydrographic deliverables.',
      reviewedAt: new Date('2026-09-10'),
    },
    {
      id: 'lev-3',
      userId: 'usr-9', // Blessing John
      leaveType: 'CASUAL',
      startDate: new Date('2026-09-25'),
      endDate: new Date('2026-09-26'),
      daysCount: 2,
      status: 'APPROVED',
      reason: 'Personal medical checkup.',
      approvedById: 'usr-2', // Chidi Okafor
      reviewComments: 'Approved by IT Lead.',
      reviewedAt: new Date('2026-09-15'),
    }
  ];

  for (const lr of leaveRequests) {
    await prisma.leaveRequest.upsert({
      where: { id: lr.id },
      update: lr,
      create: lr,
    });
  }
  console.log('✔ Staff Leave Requests seeded');

  // 8. Support Requests (IT & Design Ops)
  const supportRequests = [
    {
      id: 'sup-1',
      ticketNumber: 'TKT-2026-001',
      requesterId: 'usr-6',
      category: 'HARDWARE',
      subject: 'Toughbook Field Tablet Battery Replacement for Offshore CPT Rig',
      description: 'Panasonic Toughbook battery degradation below 40% capacity while in field at Escravos.',
      priority: 'HIGH',
      status: 'RESOLVED',
      assignedToId: 'usr-2',
    },
    {
      id: 'sup-2',
      ticketNumber: 'TKT-2026-002',
      requesterId: 'usr-12',
      category: 'DESIGN',
      subject: 'High-Value SPDC Bonga Tender Document Master Formatting',
      description: 'Format 120-page technical bid proposal with ISO corporate typography, infographics, and covers.',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      assignedToId: 'usr-9',
    }
  ];

  for (const sr of supportRequests) {
    await prisma.supportRequest.upsert({
      where: { id: sr.id },
      update: sr,
      create: sr,
    });
  }
  console.log('✔ Support Tickets seeded');

  // 9. Initial Attendance Records
  const attendanceRecords = [
    {
      id: 'att-1',
      userId: 'usr-1',
      date: '2026-09-18',
      clockInTime: '07:45:00',
      clockOutTime: null,
      locationTag: 'Lekki HQ',
      status: 'PRESENT',
      kpiAwarded: 10,
      notes: 'Punctual executive arrival'
    },
    {
      id: 'att-2',
      userId: 'usr-2',
      date: '2026-09-18',
      clockInTime: '07:58:00',
      clockOutTime: null,
      locationTag: 'Lekki HQ',
      status: 'PRESENT',
      kpiAwarded: 10,
      notes: 'IT Infrastructure monitoring shift'
    },
    {
      id: 'att-3',
      userId: 'usr-6',
      date: '2026-09-18',
      clockInTime: '08:05:00',
      clockOutTime: null,
      locationTag: 'Escravos Field Base',
      status: 'PRESENT',
      kpiAwarded: 10,
      notes: 'Offshore geotechnical muster'
    }
  ];

  for (const att of attendanceRecords) {
    await prisma.attendanceRecord.upsert({
      where: { id: att.id },
      update: att,
      create: att,
    });
  }
  console.log('✔ Attendance records seeded');

  // 10. Initial Project Expenses
  const projectExpenses = [
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
      date: new Date('2026-08-25'),
      vendor: 'Oceanic Marine Offshore Logistics Ltd',
      receiptNumber: 'INV-OML-8921',
      status: 'PAID',
      paymentMethod: 'BANK_TRANSFER',
      recordedById: 'usr-4',
      recordedByName: 'Bibi Adeyeye',
      approvedByName: 'Kaine Edike',
      notes: 'Approved under Master Service Agreement with Chevron Escravos operations.'
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
      date: new Date('2026-09-02'),
      vendor: 'Fugro Subsurface Nigeria Ltd',
      receiptNumber: 'FUG-NG-2026-441',
      status: 'PAID',
      paymentMethod: 'BANK_TRANSFER',
      recordedById: 'usr-4',
      recordedByName: 'Bibi Adeyeye',
      approvedByName: 'Engr. Femi Adebayo',
      notes: 'Standard certified geotechnical laboratory report.'
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
      date: new Date('2026-08-18'),
      vendor: 'Marine Safety Systems Nigeria',
      receiptNumber: 'MSS-REC-1092',
      status: 'PAID',
      paymentMethod: 'CORPORATE_CARD',
      recordedById: 'usr-6',
      recordedByName: 'Marvelous Ojo',
      approvedByName: 'Kaine Edike',
      notes: 'Required for Chevron offshore terminal site access permit.'
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
      date: new Date('2026-08-14'),
      vendor: 'Nigerian Ports Authority (NPA)',
      receiptNumber: 'NPA-ESC-8812',
      status: 'PAID',
      paymentMethod: 'BANK_TRANSFER',
      recordedById: 'usr-4',
      recordedByName: 'Bibi Adeyeye',
      approvedByName: 'Kaine Edike',
      notes: 'Statutory maritime port clearance.'
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
      date: new Date('2026-08-28'),
      vendor: 'Trimble Navigation West Africa',
      receiptNumber: 'TNW-2026-551',
      status: 'PAID',
      paymentMethod: 'BANK_TRANSFER',
      recordedById: 'usr-4',
      recordedByName: 'Bibi Adeyeye',
      approvedByName: 'Engr. Femi Adebayo',
      notes: 'NLNG Bonny terminal perimeter calibration.'
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
      date: new Date('2026-09-08'),
      vendor: 'Bonny Marine Transport Cooperative',
      receiptNumber: 'BMTC-7721',
      status: 'PAID',
      paymentMethod: 'PETTY_CASH',
      recordedById: 'usr-4',
      recordedByName: 'Bibi Adeyeye',
      approvedByName: 'Kaine Edike',
      notes: 'Covers 8 riverine survey days.'
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
      date: new Date('2026-07-22'),
      vendor: 'SGS Analytics Nigeria',
      receiptNumber: 'SGS-PH-2026-102',
      status: 'PAID',
      paymentMethod: 'BANK_TRANSFER',
      recordedById: 'usr-4',
      recordedByName: 'Bibi Adeyeye',
      approvedByName: 'Kaine Edike',
      notes: 'TotalEnergies quarterly baseline reporting standard.'
    }
  ];

  for (const exp of projectExpenses) {
    await prisma.projectExpense.upsert({
      where: { expenseNumber: exp.expenseNumber },
      update: exp,
      create: exp,
    });
  }
  console.log('✔ Project direct expenses seeded');

  // 11. Initial Client Receipts
  const clientReceipts = [
    {
      id: 'cr-101',
      receiptNumber: 'REC-2026-001',
      projectId: 'prj-1',
      projectName: 'Chevron Escravos Terminal Expansion - Geotech & Metocean Campaign',
      clientId: 'cli-1',
      clientName: 'Chevron Nigeria Limited',
      amountNgn: 37500000,
      currency: 'NGN',
      paymentDate: new Date('2026-08-11'),
      paymentReference: 'NIBSS-CHEV-2026-081192',
      milestoneDescription: 'Advance Mobilization Payment (30% Contract Value)',
      whtDeductedNgn: 1875000,
      vatPaidNgn: 2812500,
      bankAccount: 'Zenith Bank - 1014882910 (Corporate Operations)',
      recordedById: 'usr-4',
      recordedByName: 'Bibi Adeyeye',
      notes: 'Initial mobilization credit confirmed via corporate treasury.'
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
      paymentDate: new Date('2026-09-05'),
      paymentReference: 'NIBSS-CHEV-2026-090544',
      milestoneDescription: 'Milestone 1 Settlement: Completion of Seabed Bathymetry & CPT Campaign',
      whtDeductedNgn: 1250000,
      vatPaidNgn: 1875000,
      bankAccount: 'Zenith Bank - 1014882910 (Corporate Operations)',
      recordedById: 'usr-4',
      recordedByName: 'Bibi Adeyeye',
      notes: 'Chevron Joint Venture Accounts confirmation.'
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
      paymentDate: new Date('2026-08-20'),
      paymentReference: 'NLNG-WIRE-2026-082012',
      milestoneDescription: 'Advance Mobilization Payment (40% Contract Value)',
      whtDeductedNgn: 1160000,
      vatPaidNgn: 1740000,
      bankAccount: 'Zenith Bank - 1014882910 (Corporate Operations)',
      recordedById: 'usr-4',
      recordedByName: 'Bibi Adeyeye',
      notes: 'Direct wire transfer from NLNG Finima treasury account.'
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
      paymentDate: new Date('2026-07-15'),
      paymentReference: 'TEPNG-WIRE-2026-071533',
      milestoneDescription: 'Contract Execution & Scoping Mobilization (30%)',
      whtDeductedNgn: 1237500,
      vatPaidNgn: 1856250,
      bankAccount: 'Access Bank - 0029384812 (Treasury)',
      recordedById: 'usr-4',
      recordedByName: 'Bibi Adeyeye',
      notes: 'Advance receipt under SAP contract ref TEPNG-44021.'
    }
  ];

  for (const rec of clientReceipts) {
    await prisma.clientReceipt.upsert({
      where: { receiptNumber: rec.receiptNumber },
      update: rec,
      create: rec,
    });
  }
  console.log('✔ Client receipts & payments seeded');

  // 12. Compliance Permits
  const compliancePermits = [
    {
      id: 'perm-1',
      permitTitle: 'FMEnv Environmental Impact Assessment (EIA) Approval Permit',
      permitNumber: 'FMENV/EIA/2026/0419',
      regulatoryBody: 'FMEnv',
      projectId: 'prj-3',
      projectName: 'Dangote Lekki Refinery Phase 2 ESIA',
      status: 'ACTIVE',
      issueDate: new Date('2026-08-01'),
      expiryDate: new Date('2027-07-31'),
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
      issueDate: new Date('2023-10-01'),
      expiryDate: new Date('2026-09-30'),
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
      issueDate: new Date('2026-07-15'),
      expiryDate: new Date('2027-01-14'),
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
      issueDate: new Date('2026-01-10'),
      expiryDate: new Date('2026-12-31'),
      daysRemaining: 121,
      statutoryFeeNgn: 650000,
      feeReconciled: true,
      isRecurringCycle: true,
      cycleDurationYears: 1,
      officerInCharge: 'Dr. Ngozi Eze'
    }
  ];

  for (const permit of compliancePermits) {
    await prisma.compliancePermit.upsert({
      where: { permitNumber: permit.permitNumber },
      update: permit,
      create: permit,
    });
  }
  console.log('✔ Compliance permits seeded');

  console.log('✨ All 14 Personnel, 11 Departments, 5 Clients, 3 Projects, 3 Tasks, 4 Bids, 3 Leaves & Support Tickets successfully seeded in Neon!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

