/**
 * EcoSphere Seed Script
 * Run: npx prisma db seed
 *
 * Creates a compelling demo dataset:
 * - Manufacturing dept: high emissions, needs attention
 * - Logistics dept: improving, on-track
 * - Corporate dept: best performer
 *
 * Admin: admin@ecosphere.dev / admin123
 * Employees: employee1-4@ecosphere.dev / employee123
 */

import "dotenv/config";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding EcoSphere database…");

  // ─── ESG Config (singleton) ─────────────────────────────────────────────────
  const esgConfig = await prisma.eSGConfig.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      envWeight: 0.4,
      socialWeight: 0.3,
      govWeight: 0.3,
      autoEmission: true,
      requireEvidence: true,
      autoBadgeAward: true,
      emailAlerts: false,
      xpToCoinRatio: 1,
    },
  });
  console.log("  ✓ ESGConfig singleton");

  // ─── Departments ────────────────────────────────────────────────────────────
  const deptMfg = await prisma.department.upsert({
    where: { code: "MFG" },
    update: {},
    create: { name: "Manufacturing", code: "MFG", status: "ACTIVE" },
  });
  const deptLog = await prisma.department.upsert({
    where: { code: "LOG" },
    update: {},
    create: { name: "Logistics", code: "LOG", status: "ACTIVE" },
  });
  const deptCor = await prisma.department.upsert({
    where: { code: "COR" },
    update: {},
    create: { name: "Corporate", code: "COR", status: "ACTIVE" },
  });
  const deptRnD = await prisma.department.upsert({
    where: { code: "RND" },
    update: {},
    create: { name: "R&D", code: "RND", parentId: deptCor.id, status: "ACTIVE" },
  });
  console.log("  ✓ Departments (MFG, LOG, COR, RND)");

  // ─── Users & Employees ──────────────────────────────────────────────────────
  const adminPw = await bcrypt.hash("admin123", 12);
  const empPw = await bcrypt.hash("employee123", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@ecosphere.dev" },
    update: {},
    create: {
      email: "admin@ecosphere.dev",
      passwordHash: adminPw,
      role: "ADMIN",
    },
  });

  // Employee accounts
  const employeeData = [
    { email: "priya.sharma@ecosphere.dev", name: "Priya Sharma", deptId: deptMfg.id, gender: "F" },
    { email: "karan.shah@ecosphere.dev", name: "Karan Shah", deptId: deptLog.id, gender: "M" },
    { email: "aditya.rao@ecosphere.dev", name: "Aditya Rao", deptId: deptCor.id, gender: "M" },
    { email: "neha.iyer@ecosphere.dev", name: "Neha Iyer", deptId: deptRnD.id, gender: "F" },
    { email: "rohit.verma@ecosphere.dev", name: "Rohit Verma", deptId: deptMfg.id, gender: "M" },
    { email: "ananya.nair@ecosphere.dev", name: "Ananya Nair", deptId: deptLog.id, gender: "F" },
  ];

  const employees: { id: string; userId: string; deptId: string }[] = [];

  for (const emp of employeeData) {
    const user = await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: { email: emp.email, passwordHash: empPw, role: "EMPLOYEE" },
    });
    const employee = await prisma.employee.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        name: emp.name,
        departmentId: emp.deptId,
        xp: Math.floor(Math.random() * 800) + 100,
        level: Math.floor(Math.random() * 4) + 1,
        ecoCoins: Math.floor(Math.random() * 300) + 50,
        gender: emp.gender,
      },
    });
    employees.push({ id: employee.id, userId: user.id, deptId: emp.deptId });
  }
  console.log(`  ✓ Users & Employees (1 admin + ${employeeData.length} employees)`);

  // ─── Categories ─────────────────────────────────────────────────────────────
  const catTreePlant = await prisma.category.upsert({
    where: { id: "cat-tree-planting" },
    update: {},
    create: { id: "cat-tree-planting", name: "Tree Planting", type: "CSR_ACTIVITY", status: "ACTIVE" },
  });
  const catBloodDon = await prisma.category.upsert({
    where: { id: "cat-blood-donation" },
    update: {},
    create: { id: "cat-blood-donation", name: "Blood Donation", type: "CSR_ACTIVITY", status: "ACTIVE" },
  });
  const catBeachClean = await prisma.category.upsert({
    where: { id: "cat-beach-cleanup" },
    update: {},
    create: { id: "cat-beach-cleanup", name: "Beach Cleanup", type: "CSR_ACTIVITY", status: "ACTIVE" },
  });
  const catZeroWaste = await prisma.category.upsert({
    where: { id: "cat-zero-waste" },
    update: {},
    create: { id: "cat-zero-waste", name: "Zero Waste", type: "CHALLENGE", status: "ACTIVE" },
  });
  const catCommute = await prisma.category.upsert({
    where: { id: "cat-green-commute" },
    update: {},
    create: { id: "cat-green-commute", name: "Green Commute", type: "CHALLENGE", status: "ACTIVE" },
  });
  const catRecycle = await prisma.category.upsert({
    where: { id: "cat-recycling" },
    update: {},
    create: { id: "cat-recycling", name: "Recycling", type: "CHALLENGE", status: "ACTIVE" },
  });
  console.log("  ✓ Categories");

  // ─── Emission Factors ───────────────────────────────────────────────────────
  const efDiesel = await prisma.emissionFactor.upsert({
    where: { id: "ef-diesel" },
    update: {},
    create: {
      id: "ef-diesel",
      activity: "Diesel",
      factorKgCO2: 2.68,
      unit: "litre",
      source: "IPCC AR6",
    },
  });
  const efElec = await prisma.emissionFactor.upsert({
    where: { id: "ef-electricity" },
    update: {},
    create: {
      id: "ef-electricity",
      activity: "Electricity (Grid)",
      factorKgCO2: 0.82,
      unit: "kWh",
      source: "CEA India 2023",
    },
  });
  const efGas = await prisma.emissionFactor.upsert({
    where: { id: "ef-natural-gas" },
    update: {},
    create: {
      id: "ef-natural-gas",
      activity: "Natural Gas",
      factorKgCO2: 2.02,
      unit: "m³",
      source: "IPCC AR6",
    },
  });
  const efFlight = await prisma.emissionFactor.upsert({
    where: { id: "ef-flights" },
    update: {},
    create: {
      id: "ef-flights",
      activity: "Air Travel (economy)",
      factorKgCO2: 0.255,
      unit: "km",
      source: "BEIS UK 2023",
    },
  });
  const efFleet = await prisma.emissionFactor.upsert({
    where: { id: "ef-fleet" },
    update: {},
    create: {
      id: "ef-fleet",
      activity: "Fleet Vehicle (petrol)",
      factorKgCO2: 0.171,
      unit: "km",
      source: "BEIS UK 2023",
    },
  });
  console.log("  ✓ Emission Factors");

  // ─── Product ESG Profiles ───────────────────────────────────────────────────
  await prisma.productESGProfile.createMany({
    data: [
      { id: "prod-1", productName: "Steel Beam (1t)", co2PerUnit: 1850, recyclable: true },
      { id: "prod-2", productName: "Packaging Box (100 units)", co2PerUnit: 12.4, recyclable: true },
      { id: "prod-3", productName: "Diesel Generator (hr)", co2PerUnit: 5.2, recyclable: false },
    ],
  });
  console.log("  ✓ Product ESG Profiles");

  // ─── Carbon Transactions (12 months of data) ─────────────────────────────
  const now = new Date();
  const carbonTxns = [];
  for (let m = 11; m >= 0; m--) {
    const date = new Date(now.getFullYear(), now.getMonth() - m, 15);

    // Manufacturing — high, volatile
    carbonTxns.push({
      departmentId: deptMfg.id,
      sourceType: "MANUFACTURING" as const,
      quantity: 8000 + Math.random() * 3000 - 1500 * (11 - m) / 11,
      emissionFactorId: efElec.id,
      co2Kg: 0, // will compute below
      autoGenerated: true,
      date,
    });

    // Logistics — moderate, improving
    carbonTxns.push({
      departmentId: deptLog.id,
      sourceType: "FLEET" as const,
      quantity: 15000 - m * 300 + Math.random() * 2000,
      emissionFactorId: efFleet.id,
      co2Kg: 0,
      autoGenerated: true,
      date,
    });

    // Corporate — low, stable
    carbonTxns.push({
      departmentId: deptCor.id,
      sourceType: "EXPENSE" as const,
      quantity: 2000 + Math.random() * 400,
      emissionFactorId: efElec.id,
      co2Kg: 0,
      autoGenerated: true,
      date,
    });
  }

  // Compute co2Kg for each
  const factorMap: Record<string, number> = {
    [efDiesel.id]: 2.68,
    [efElec.id]: 0.82,
    [efGas.id]: 2.02,
    [efFlight.id]: 0.255,
    [efFleet.id]: 0.171,
  };
  for (const tx of carbonTxns) {
    tx.co2Kg = tx.quantity * factorMap[tx.emissionFactorId];
  }

  await prisma.carbonTransaction.createMany({ data: carbonTxns });
  console.log(`  ✓ Carbon Transactions (${carbonTxns.length} records across 12 months)`);

  // ─── Environmental Goals ─────────────────────────────────────────────────
  await prisma.environmentalGoal.createMany({
    data: [
      {
        id: "goal-1",
        name: "Reduce Fleet Emissions",
        departmentId: deptLog.id,
        targetCO2Kg: 5000,
        currentCO2Kg: 3300,
        deadline: new Date(now.getFullYear(), now.getMonth() + 3, 31),
        status: "ON_TRACK",
      },
      {
        id: "goal-2",
        name: "Cut Packaging Waste",
        departmentId: deptMfg.id,
        targetCO2Kg: 1200,
        currentCO2Kg: 980,
        deadline: new Date(now.getFullYear(), now.getMonth() + 2, 30),
        status: "ON_TRACK",
      },
      {
        id: "goal-3",
        name: "Office Energy Cut",
        departmentId: deptCor.id,
        targetCO2Kg: 800,
        currentCO2Kg: 800,
        deadline: new Date(now.getFullYear(), now.getMonth() + 1, 30),
        status: "COMPLETED",
      },
      {
        id: "goal-4",
        name: "Zero Net Emissions Q4",
        departmentId: deptMfg.id,
        targetCO2Kg: 20000,
        currentCO2Kg: 18500,
        deadline: new Date(now.getFullYear(), 11, 31),
        status: "AT_RISK",
      },
    ],
  });
  console.log("  ✓ Environmental Goals");

  // ─── CSR Activities ───────────────────────────────────────────────────────
  const csrAct1 = await prisma.cSRActivity.upsert({
    where: { id: "csr-1" },
    update: {},
    create: {
      id: "csr-1",
      title: "Tree Plantation Drive",
      categoryId: catTreePlant.id,
      description: "Plant 500 trees across the campus and local parks to offset carbon emissions.",
      departmentId: null,
      evidenceRequired: true,
      xpReward: 80,
      status: "OPEN",
      createdBy: adminUser.id,
    },
  });
  const csrAct2 = await prisma.cSRActivity.upsert({
    where: { id: "csr-2" },
    update: {},
    create: {
      id: "csr-2",
      title: "Blood Donation Camp",
      categoryId: catBloodDon.id,
      description: "Annual blood donation drive in partnership with Red Cross.",
      departmentId: deptMfg.id,
      evidenceRequired: true,
      xpReward: 60,
      status: "OPEN",
      createdBy: adminUser.id,
    },
  });
  const csrAct3 = await prisma.cSRActivity.upsert({
    where: { id: "csr-3" },
    update: {},
    create: {
      id: "csr-3",
      title: "Beach Cleanup Weekend",
      categoryId: catBeachClean.id,
      description: "Volunteer cleanup of Juhu beach — bags and gloves provided.",
      departmentId: deptCor.id,
      evidenceRequired: false,
      xpReward: 50,
      status: "OPEN",
      createdBy: adminUser.id,
    },
  });
  const csrAct4 = await prisma.cSRActivity.upsert({
    where: { id: "csr-4" },
    update: {},
    create: {
      id: "csr-4",
      title: "ESG Awareness Workshop",
      categoryId: catTreePlant.id,
      description: "Internal workshop on ESG principles and sustainability reporting.",
      departmentId: null,
      evidenceRequired: false,
      xpReward: 40,
      status: "CLOSED",
      createdBy: adminUser.id,
    },
  });
  console.log("  ✓ CSR Activities");

  // ─── Employee Participations (CSR) ────────────────────────────────────────
  await prisma.employeeParticipation.createMany({
    data: [
      {
        id: "ep-1",
        employeeId: employees[0].id,
        activityId: csrAct1.id,
        proofUrl: "/uploads/proofs/priya-trees.jpg",
        approval: "APPROVED",
        pointsEarned: 80,
        completedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        reviewedBy: adminUser.id,
        reviewedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        id: "ep-2",
        employeeId: employees[1].id,
        activityId: csrAct1.id,
        proofUrl: "/uploads/proofs/karan-trees.pdf",
        approval: "PENDING",
        pointsEarned: 0,
      },
      {
        id: "ep-3",
        employeeId: employees[2].id,
        activityId: csrAct3.id,
        approval: "APPROVED",
        pointsEarned: 50,
        completedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: "ep-4",
        employeeId: employees[3].id,
        activityId: csrAct2.id,
        proofUrl: "/uploads/proofs/neha-blood.jpg",
        approval: "REJECTED",
        pointsEarned: 0,
      },
    ],
  });
  console.log("  ✓ Employee Participations");

  // ─── Training Records ─────────────────────────────────────────────────────
  await prisma.trainingRecord.createMany({
    data: [
      { id: "tr-1", employeeId: employees[0].id, title: "ESG Fundamentals", completed: true, completedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) },
      { id: "tr-2", employeeId: employees[1].id, title: "ESG Fundamentals", completed: true, completedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) },
      { id: "tr-3", employeeId: employees[2].id, title: "ESG Fundamentals", completed: false },
      { id: "tr-4", employeeId: employees[0].id, title: "Carbon Accounting Basics", completed: true, completedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
      { id: "tr-5", employeeId: employees[3].id, title: "Governance & Compliance", completed: true, completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
    ],
  });
  console.log("  ✓ Training Records");

  // ─── ESG Policies ─────────────────────────────────────────────────────────
  const policy1 = await prisma.eSGPolicy.upsert({
    where: { id: "pol-1" },
    update: {},
    create: {
      id: "pol-1",
      title: "Anti-Corruption & Bribery Policy",
      body: "EcoSphere maintains a zero-tolerance policy toward corruption and bribery in all business dealings. All employees must report any suspected violations to the Compliance Officer immediately.\n\n1. No employee shall offer, pay, request, or accept any bribe.\n2. Facilitation payments are prohibited under all circumstances.\n3. Gifts exceeding ₹5,000 in value must be disclosed to management.\n4. Annual training on anti-corruption is mandatory for all employees.",
      version: 2,
      createdBy: adminUser.id,
    },
  });
  const policy2 = await prisma.eSGPolicy.upsert({
    where: { id: "pol-2" },
    update: {},
    create: {
      id: "pol-2",
      title: "Environmental Sustainability Policy",
      body: "EcoSphere is committed to reducing its environmental footprint across all operations.\n\n1. Carbon emissions are tracked monthly using approved emission factors.\n2. All departments must set and maintain at least one environmental goal per quarter.\n3. Waste reduction targets of 20% year-on-year must be achieved.\n4. Renewable energy sourcing is prioritised for electricity procurement.",
      version: 1,
      createdBy: adminUser.id,
    },
  });
  const policy3 = await prisma.eSGPolicy.upsert({
    where: { id: "pol-3" },
    update: {},
    create: {
      id: "pol-3",
      title: "Data Privacy & Information Security",
      body: "All personal data processed by EcoSphere must comply with applicable data protection laws.\n\n1. Employee and customer data must not be shared externally without written consent.\n2. Data breaches must be reported within 72 hours of discovery.\n3. All devices must use approved endpoint security solutions.\n4. Annual data privacy training is mandatory.",
      version: 1,
      createdBy: adminUser.id,
    },
  });
  console.log("  ✓ ESG Policies");

  // ─── Policy Acknowledgements ──────────────────────────────────────────────
  await prisma.policyAcknowledgement.createMany({
    data: [
      { id: "pa-1", policyId: policy1.id, employeeId: employees[0].id, acknowledgedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
      { id: "pa-2", policyId: policy1.id, employeeId: employees[1].id, acknowledgedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
      { id: "pa-3", policyId: policy1.id, employeeId: employees[2].id }, // not yet acknowledged
      { id: "pa-4", policyId: policy2.id, employeeId: employees[0].id, acknowledgedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) },
      { id: "pa-5", policyId: policy2.id, employeeId: employees[2].id, acknowledgedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
    ],
  });
  console.log("  ✓ Policy Acknowledgements");

  // ─── Audits ───────────────────────────────────────────────────────────────
  const audit1 = await prisma.audit.upsert({
    where: { id: "aud-1" },
    update: {},
    create: {
      id: "aud-1",
      title: "Q2 Waste Audit",
      departmentId: deptMfg.id,
      auditorName: "S. Nair",
      date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      findingsSummary: "2 minor issues found: MSDS sheets missing for 3 chemicals, lab ventilation below standard.",
      status: "COMPLETED",
      createdBy: adminUser.id,
    },
  });
  const audit2 = await prisma.audit.upsert({
    where: { id: "aud-2" },
    update: {},
    create: {
      id: "aud-2",
      title: "Vendor Compliance Check",
      departmentId: deptLog.id,
      auditorName: "R. Iyer",
      date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      findingsSummary: "1 open issue: vendor disclosure forms incomplete.",
      status: "UNDER_REVIEW",
      createdBy: adminUser.id,
    },
  });
  await prisma.audit.upsert({
    where: { id: "aud-3" },
    update: {},
    create: {
      id: "aud-3",
      title: "Annual Governance Review",
      departmentId: deptCor.id,
      auditorName: "A. Mehta",
      date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      status: "SCHEDULED",
      createdBy: adminUser.id,
    },
  });
  console.log("  ✓ Audits");

  // ─── Compliance Issues ────────────────────────────────────────────────────
  await prisma.complianceIssue.createMany({
    data: [
      {
        id: "ci-1",
        auditId: audit1.id,
        departmentId: deptMfg.id,
        severity: "HIGH",
        description: "Missing MSDS (Material Safety Data Sheets) for 3 chemical substances used in production. Risk of regulatory penalty.",
        ownerId: employees[0].userId,
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: "OPEN",
        createdBy: adminUser.id,
      },
      {
        id: "ci-2",
        auditId: audit2.id,
        departmentId: deptLog.id,
        severity: "MEDIUM",
        description: "Vendor disclosure forms incomplete for 2 third-party logistics partners.",
        ownerId: employees[1].userId,
        dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        status: "OPEN",
        createdBy: adminUser.id,
      },
      {
        id: "ci-3",
        auditId: audit1.id,
        departmentId: deptMfg.id,
        severity: "MEDIUM",
        description: "Lab ventilation system below required standard — upgrade order placed.",
        ownerId: employees[4].userId,
        dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // overdue
        status: "OVERDUE",
        createdBy: adminUser.id,
      },
      {
        id: "ci-4",
        departmentId: deptCor.id,
        severity: "LOW",
        description: "Board meeting minutes not filed within the required 48-hour window.",
        ownerId: employees[2].userId,
        dueDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        status: "RESOLVED",
        resolvedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        resolvedBy: employees[2].userId,
        createdBy: adminUser.id,
      },
    ],
  });
  console.log("  ✓ Compliance Issues");

  // ─── Challenges ───────────────────────────────────────────────────────────
  const ch1 = await prisma.challenge.upsert({
    where: { id: "ch-1" },
    update: {},
    create: {
      id: "ch-1",
      title: "Sustainability Sprint",
      categoryId: catZeroWaste.id,
      description: "Reduce your department's waste by 30% over 30 days. Track and submit weekly waste logs.",
      xp: 700,
      difficulty: "HARD",
      evidenceRequired: true,
      deadline: new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
      createdBy: adminUser.id,
    },
  });
  const ch2 = await prisma.challenge.upsert({
    where: { id: "ch-2" },
    update: {},
    create: {
      id: "ch-2",
      title: "Recycle Challenge",
      categoryId: catRecycle.id,
      description: "Separate recyclables from general waste for an entire month and submit photo proof.",
      xp: 180,
      difficulty: "EASY",
      evidenceRequired: true,
      deadline: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
      createdBy: adminUser.id,
    },
  });
  const ch3 = await prisma.challenge.upsert({
    where: { id: "ch-3" },
    update: {},
    create: {
      id: "ch-3",
      title: "Commute Green Week",
      categoryId: catCommute.id,
      description: "Use public transport, cycle, or walk to work for 5 consecutive days.",
      xp: 120,
      difficulty: "MEDIUM",
      evidenceRequired: false,
      deadline: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
      status: "DRAFT",
      createdBy: adminUser.id,
    },
  });
  console.log("  ✓ Challenges");

  // ─── Challenge Participations ─────────────────────────────────────────────
  await prisma.challengeParticipation.createMany({
    data: [
      {
        id: "cp-1",
        challengeId: ch1.id,
        employeeId: employees[0].id,
        progress: 65,
        proofUrl: "/uploads/proofs/priya-sprint.jpg",
        approval: "PENDING",
        xpAwarded: 0,
      },
      {
        id: "cp-2",
        challengeId: ch2.id,
        employeeId: employees[1].id,
        progress: 100,
        proofUrl: "/uploads/proofs/karan-recycle.jpg",
        approval: "APPROVED",
        xpAwarded: 180,
        completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: "cp-3",
        challengeId: ch2.id,
        employeeId: employees[2].id,
        progress: 40,
        approval: "PENDING",
        xpAwarded: 0,
      },
    ],
  });
  console.log("  ✓ Challenge Participations");

  // ─── Badges ───────────────────────────────────────────────────────────────
  const badge1 = await prisma.badge.upsert({
    where: { id: "badge-1" },
    update: {},
    create: {
      id: "badge-1",
      name: "Green Beginner",
      description: "Earned your first 100 XP on the EcoSphere platform.",
      icon: "Leaf",
      unlockRule: JSON.stringify({ type: "XP_THRESHOLD", value: 100 }),
    },
  });
  const badge2 = await prisma.badge.upsert({
    where: { id: "badge-2" },
    update: {},
    create: {
      id: "badge-2",
      name: "Carbon Saver",
      description: "Completed 3 or more environmental challenges.",
      icon: "CloudOff",
      unlockRule: JSON.stringify({ type: "CHALLENGE_COUNT", value: 3 }),
    },
  });
  const badge3 = await prisma.badge.upsert({
    where: { id: "badge-3" },
    update: {},
    create: {
      id: "badge-3",
      name: "Sustainability Champion",
      description: "Reached 500 XP — a true ESG leader.",
      icon: "Trophy",
      unlockRule: JSON.stringify({ type: "XP_THRESHOLD", value: 500 }),
    },
  });
  const badge4 = await prisma.badge.upsert({
    where: { id: "badge-4" },
    update: {},
    create: {
      id: "badge-4",
      name: "Team Player",
      description: "Participated in 3 or more CSR activities.",
      icon: "Users",
      unlockRule: JSON.stringify({ type: "CSR_COUNT", value: 3 }),
    },
  });
  console.log("  ✓ Badges");

  // ─── Employee Badges ──────────────────────────────────────────────────────
  await prisma.employeeBadge.createMany({
    data: [
      { id: "eb-1", employeeId: employees[0].id, badgeId: badge1.id, unlockedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) },
      { id: "eb-2", employeeId: employees[0].id, badgeId: badge3.id, unlockedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
      { id: "eb-3", employeeId: employees[1].id, badgeId: badge1.id, unlockedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000) },
      { id: "eb-4", employeeId: employees[2].id, badgeId: badge1.id, unlockedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000) },
    ],
  });
  console.log("  ✓ Employee Badges");

  // ─── Rewards ──────────────────────────────────────────────────────────────
  await prisma.reward.createMany({
    data: [
      { id: "rew-1", name: "EcoBag", description: "Reusable tote bag made from 100% recycled materials.", pointsRequired: 100, stock: 50, status: "ACTIVE" },
      { id: "rew-2", name: "Plant a Tree (on your behalf)", description: "We plant a real tree in a reforestation zone.", pointsRequired: 200, stock: -1, status: "ACTIVE" },
      { id: "rew-3", name: "EcoSphere Green Mug", description: "Insulated bamboo travel mug, EcoSphere branded.", pointsRequired: 150, stock: 30, status: "ACTIVE" },
      { id: "rew-4", name: "1-Day WFH Pass", description: "Approved work-from-home day — redeemable with manager sign-off.", pointsRequired: 300, stock: 20, status: "ACTIVE" },
    ],
  });
  console.log("  ✓ Rewards");

  // ─── Shop Items ────────────────────────────────────────────────────────────
  await prisma.shopItem.createMany({
    data: [
      { id: "shop-1", name: "Water Can", type: "WATER", costCoins: 10, stock: null, status: "ACTIVE" },
      { id: "shop-2", name: "Oak Seed", type: "SEED", costCoins: 25, stock: 100, status: "ACTIVE" },
      { id: "shop-3", name: "Pine Seed", type: "SEED", costCoins: 20, stock: 150, status: "ACTIVE" },
      { id: "shop-4", name: "Fertilizer", type: "FERTILIZER", costCoins: 15, stock: null, status: "ACTIVE" },
      { id: "shop-5", name: "Bamboo Decoration", type: "DECORATION", costCoins: 30, stock: 50, status: "ACTIVE" },
    ],
  });
  console.log("  ✓ Shop Items");

  // ─── Gardens & Trees ──────────────────────────────────────────────────────
  for (let i = 0; i < Math.min(employees.length, 4); i++) {
    const emp = employees[i];
    const garden = await prisma.garden.upsert({
      where: { employeeId: emp.id },
      update: {},
      create: {
        employeeId: emp.id,
        growthScore: Math.floor(Math.random() * 500) + 100,
        waterLevel: Math.floor(Math.random() * 40) + 60,
        lastWatered: new Date(now.getTime() - Math.random() * 3 * 24 * 60 * 60 * 1000),
      },
    });
    // Add some trees
    await prisma.tree.createMany({
      data: [
        {
          id: `tree-${i}-1`,
          gardenId: garden.id,
          species: "Oak",
          stage: i === 0 ? "MATURE" : i === 1 ? "YOUNG" : "SAPLING",
          carePoints: (i === 0 ? 100 : i === 1 ? 60 : 30),
          plantedAt: new Date(now.getTime() - (30 - i * 5) * 24 * 60 * 60 * 1000),
        },
        {
          id: `tree-${i}-2`,
          gardenId: garden.id,
          species: "Pine",
          stage: "SEED",
          carePoints: 5,
          plantedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        },
      ],
    });
  }
  console.log("  ✓ Gardens & Trees");

  // ─── Department Scores (initial) ──────────────────────────────────────────
  await prisma.departmentScore.createMany({
    data: [
      { id: "ds-mfg", departmentId: deptMfg.id, environmental: 58, social: 72, governance: 81, total: 68.8, isFallback: true },
      { id: "ds-log", departmentId: deptLog.id, environmental: 74, social: 78, governance: 85, total: 78.4, isFallback: true },
      { id: "ds-cor", departmentId: deptCor.id, environmental: 88, social: 82, governance: 91, total: 87.5, isFallback: true },
      { id: "ds-rnd", departmentId: deptRnD.id, environmental: 79, social: 76, governance: 83, total: 79.3, isFallback: true },
    ],
  });
  console.log("  ✓ Department Scores (initial seed values)");

  // ─── Notifications ─────────────────────────────────────────────────────────
  // Only create for admin user for now
  await prisma.notification.createMany({
    data: [
      {
        id: "notif-1",
        userId: adminUser.id,
        type: "COMPLIANCE_ISSUE",
        title: "New compliance issue raised",
        body: "A HIGH severity issue was raised in Manufacturing: Missing MSDS sheets.",
        read: false,
        link: "/governance/compliance",
      },
      {
        id: "notif-2",
        userId: adminUser.id,
        type: "CSR_APPROVAL",
        title: "CSR activity pending approval",
        body: "Karan Shah submitted proof for Tree Plantation Drive.",
        read: false,
        link: "/social/participation",
      },
      {
        id: "notif-3",
        userId: adminUser.id,
        type: "POLICY_REMINDER",
        title: "Policy acknowledgement pending",
        body: "3 employees have not acknowledged the Anti-Corruption Policy.",
        read: true,
        link: "/governance/acknowledgements",
      },
    ],
  });

  // Notify employees of badge unlocks
  await prisma.notification.createMany({
    data: [
      {
        id: "notif-4",
        userId: employees[0].userId,
        type: "BADGE_UNLOCK",
        title: "Badge unlocked: Sustainability Champion",
        body: "You reached 500 XP. Keep up the great work!",
        read: false,
        link: "/gamification/badges",
      },
    ],
  });
  console.log("  ✓ Notifications");

  console.log("\n✅ Seed complete! Login credentials:");
  console.log("   Admin:    admin@ecosphere.dev / admin123");
  console.log("   Employee: priya.sharma@ecosphere.dev / employee123");
  console.log("   Employee: karan.shah@ecosphere.dev / employee123");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("Seed error:", e);
    prisma.$disconnect();
    process.exit(1);
  });
