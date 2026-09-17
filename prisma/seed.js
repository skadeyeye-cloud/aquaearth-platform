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

  console.log('✨ All 14 Users, 11 Departments, 5 Clients, 3 Projects & Tasks seeded in Neon!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
