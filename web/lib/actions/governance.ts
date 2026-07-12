"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAuth, getCurrentUserId } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { createNotification, createNotifications } from "@/lib/actions/notifications";
import { ok, fail, fromZodError, type ActionResult } from "@/lib/schemas/shared";
import { PolicySchema, AuditSchema, ComplianceIssueSchema } from "@/lib/schemas/governance";
import type { PolicyInput, AuditInput, ComplianceIssueInput } from "@/lib/schemas/governance";

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Governance score (rule-based) for a department — 0 to 100 */
export async function computeGovernanceScore(deptId: string): Promise<number> {
  const now = new Date();
  const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);

  // 1. Policy acknowledgement rate (40% weight)
  const [totalAck, acknowledgedAck] = await Promise.all([
    prisma.policyAcknowledgement.count({ where: { employee: { departmentId: deptId } } }),
    prisma.policyAcknowledgement.count({
      where: { employee: { departmentId: deptId }, acknowledgedAt: { not: null } },
    }),
  ]);
  const ackRate = totalAck > 0 ? acknowledgedAck / totalAck : 1;

  // 2. Open/overdue compliance issue ratio (30% weight) — lower is better
  const [totalIssues, openIssues] = await Promise.all([
    prisma.complianceIssue.count({ where: { departmentId: deptId } }),
    prisma.complianceIssue.count({
      where: { departmentId: deptId, status: { in: ["OPEN", "OVERDUE"] } },
    }),
  ]);
  const issueRatio = totalIssues > 0 ? 1 - openIssues / totalIssues : 1;

  // 3. Audit completion rate this quarter (30% weight)
  const [totalAudits, completedAudits] = await Promise.all([
    prisma.audit.count({ where: { departmentId: deptId, date: { gte: quarterStart } } }),
    prisma.audit.count({
      where: { departmentId: deptId, date: { gte: quarterStart }, status: "COMPLETED" },
    }),
  ]);
  const auditRate = totalAudits > 0 ? completedAudits / totalAudits : 1;

  const score = (ackRate * 40 + issueRatio * 30 + auditRate * 30);
  return Math.round(Math.min(100, Math.max(0, score)));
}

// ─── POLICIES ─────────────────────────────────────────────────────────────────

export async function getPolicies() {
  const policies = await prisma.eSGPolicy.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { acknowledgements: true } },
      acknowledgements: { where: { acknowledgedAt: { not: null } }, select: { id: true } },
    },
  });

  const totalEmployees = await prisma.employee.count({ where: { user: { role: "EMPLOYEE" } } });

  return policies.map((p) => ({
    ...p,
    totalEmployees,
    acknowledgedCount: p.acknowledgements.length,
  }));
}

export async function getPolicyById(id: string) {
  return prisma.eSGPolicy.findUnique({
    where: { id },
    include: {
      acknowledgements: {
        include: {
          employee: { include: { department: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function createPolicy(data: PolicyInput): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const userId = await getCurrentUserId();

  const parsed = PolicySchema.safeParse(data);
  if (!parsed.success) return fromZodError(parsed.error);

  const policy = await prisma.eSGPolicy.create({
    data: { ...parsed.data, version: 1, createdBy: userId! },
  });

  // Pre-create acknowledgement records for all employees (pending state)
  const employees = await prisma.employee.findMany({ select: { id: true } });
  if (employees.length > 0) {
    await prisma.policyAcknowledgement.createMany({
      data: employees.map((e) => ({ policyId: policy.id, employeeId: e.id })),
    });
  }

  revalidatePath("/governance/policies");
  return ok({ id: policy.id });
}

export async function updatePolicy(id: string, data: PolicyInput): Promise<ActionResult<void>> {
  await requireAdmin();
  const parsed = PolicySchema.safeParse(data);
  if (!parsed.success) return fromZodError(parsed.error);

  await prisma.eSGPolicy.update({
    where: { id },
    data: { ...parsed.data, version: { increment: 1 } },
  });

  revalidatePath("/governance/policies");
  revalidatePath(`/governance/policies/${id}`);
  return ok(undefined);
}

export async function deletePolicy(id: string): Promise<ActionResult<void>> {
  await requireAdmin();
  await prisma.policyAcknowledgement.deleteMany({ where: { policyId: id } });
  await prisma.eSGPolicy.delete({ where: { id } });
  revalidatePath("/governance/policies");
  return ok(undefined);
}

// ─── ACKNOWLEDGEMENTS ─────────────────────────────────────────────────────────

export async function acknowledgePolicy(policyId: string): Promise<ActionResult<void>> {
  const session = await requireAuth();
  const employeeId = session.user.employeeId;
  if (!employeeId) return fail("No employee record linked to your account");

  await prisma.policyAcknowledgement.upsert({
    where: { employeeId_policyId: { employeeId, policyId } },
    update: { acknowledgedAt: new Date() },
    create: { policyId, employeeId, acknowledgedAt: new Date() },
  });

  revalidatePath(`/governance/policies/${policyId}`);
  revalidatePath("/governance/acknowledgements");
  return ok(undefined);
}

export async function sendAcknowledgementReminders(policyId: string): Promise<ActionResult<{ sent: number }>> {
  await requireAdmin();

  const policy = await prisma.eSGPolicy.findUnique({ where: { id: policyId } });
  if (!policy) return fail("Policy not found");

  // Find employees who haven't acknowledged
  const pending = await prisma.policyAcknowledgement.findMany({
    where: { policyId, acknowledgedAt: null },
    include: { employee: { include: { user: { select: { id: true } } } } },
  });

  if (pending.length === 0) return ok({ sent: 0 });

  await createNotifications(
    pending.map((pa) => ({
      userId: pa.employee.user.id,
      type: "POLICY_REMINDER" as const,
      title: `Policy acknowledgement required`,
      body: `Please read and acknowledge: "${policy.title}"`,
      link: `/governance/policies/${policyId}`,
    }))
  );

  return ok({ sent: pending.length });
}

export async function getAcknowledgementStatus(policyId: string) {
  return prisma.policyAcknowledgement.findMany({
    where: { policyId },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          department: { select: { name: true } },
        },
      },
    },
    orderBy: [{ acknowledgedAt: "asc" }],
  });
}

export async function getMyPendingPolicies() {
  const session = await requireAuth();
  const employeeId = session.user.employeeId;
  if (!employeeId) return [];

  return prisma.eSGPolicy.findMany({
    where: {
      acknowledgements: {
        some: { employeeId, acknowledgedAt: null },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── AUDITS ───────────────────────────────────────────────────────────────────

export async function getAudits() {
  return prisma.audit.findMany({
    orderBy: { date: "desc" },
    include: {
      department: { select: { name: true } },
      _count: { select: { complianceIssues: true } },
    },
  });
}

export async function getAuditById(id: string) {
  return prisma.audit.findUnique({
    where: { id },
    include: {
      department: { select: { name: true } },
      complianceIssues: {
        include: { department: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function createAudit(data: AuditInput): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const userId = await getCurrentUserId();

  const parsed = AuditSchema.safeParse(data);
  if (!parsed.success) return fromZodError(parsed.error);

  const audit = await prisma.audit.create({
    data: { ...parsed.data, createdBy: userId! },
  });

  revalidatePath("/governance/audits");
  return ok({ id: audit.id });
}

export async function updateAuditStatus(
  id: string,
  status: "SCHEDULED" | "COMPLETED" | "UNDER_REVIEW"
): Promise<ActionResult<void>> {
  await requireAdmin();
  await prisma.audit.update({ where: { id }, data: { status } });
  revalidatePath("/governance/audits");
  revalidatePath(`/governance/audits/${id}`);
  return ok(undefined);
}

// ─── COMPLIANCE ISSUES ────────────────────────────────────────────────────────

/** Returns all issues with isOverdue computed on the fly */
export async function getComplianceIssues() {
  const now = new Date();
  const issues = await prisma.complianceIssue.findMany({
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    include: {
      audit: { select: { title: true } },
      department: { select: { name: true } },
    },
  });

  // Auto-flag overdue in DB if needed (best-effort, no cron required)
  const toFlag = issues
    .filter((i) => i.status === "OPEN" && i.dueDate < now)
    .map((i) => i.id);

  if (toFlag.length > 0) {
    await prisma.complianceIssue.updateMany({
      where: { id: { in: toFlag } },
      data: { status: "OVERDUE" },
    });
  }

  return issues.map((i) => ({
    ...i,
    isOverdue: i.status === "OVERDUE" || (i.status === "OPEN" && i.dueDate < now),
  }));
}

export async function getComplianceIssueById(id: string) {
  return prisma.complianceIssue.findUnique({
    where: { id },
    include: {
      audit: { select: { id: true, title: true } },
      department: { select: { name: true } },
    },
  });
}

export async function createComplianceIssue(
  data: ComplianceIssueInput
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const userId = await getCurrentUserId();

  const parsed = ComplianceIssueSchema.safeParse(data);
  if (!parsed.success) return fromZodError(parsed.error);

  const issue = await prisma.complianceIssue.create({
    data: { ...parsed.data, status: "OPEN", createdBy: userId! },
  });

  // Notify the owner
  const ownerUser = await prisma.user.findUnique({ where: { id: parsed.data.ownerId } });
  if (ownerUser) {
    await createNotification({
      userId: ownerUser.id,
      type: "COMPLIANCE_ISSUE",
      title: `New ${parsed.data.severity} compliance issue assigned`,
      body: parsed.data.description.slice(0, 120) + (parsed.data.description.length > 120 ? "…" : ""),
      link: `/governance/compliance/${issue.id}`,
    });
  }

  revalidatePath("/governance/compliance");
  return ok({ id: issue.id });
}

export async function resolveComplianceIssue(id: string): Promise<ActionResult<void>> {
  const session = await requireAuth();
  const userId = session.user.id;

  const issue = await prisma.complianceIssue.findUnique({ where: { id } });
  if (!issue) return fail("Issue not found");

  // Allow owner or admin to resolve
  const role = session.user.role;
  if (issue.ownerId !== userId && role !== "ADMIN") {
    return fail("You are not authorised to resolve this issue");
  }

  await prisma.complianceIssue.update({
    where: { id },
    data: { status: "RESOLVED", resolvedAt: new Date(), resolvedBy: userId },
  });

  revalidatePath("/governance/compliance");
  revalidatePath(`/governance/compliance/${id}`);
  return ok(undefined);
}

// ─── GOVERNANCE SUMMARY (for dashboard) ──────────────────────────────────────

export async function getGovernanceSummary() {
  const now = new Date();
  const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);

  const [
    totalPolicies,
    totalAcknowledgements,
    acknowledgedCount,
    openIssues,
    overdueIssues,
    totalAuditsQ,
    completedAuditsQ,
    deptScores,
  ] = await Promise.all([
    prisma.eSGPolicy.count(),
    prisma.policyAcknowledgement.count(),
    prisma.policyAcknowledgement.count({ where: { acknowledgedAt: { not: null } } }),
    prisma.complianceIssue.count({ where: { status: "OPEN" } }),
    prisma.complianceIssue.count({ where: { status: "OVERDUE" } }),
    prisma.audit.count({ where: { date: { gte: quarterStart } } }),
    prisma.audit.count({ where: { date: { gte: quarterStart }, status: "COMPLETED" } }),
    prisma.departmentScore.findMany({ select: { governance: true } }),
  ]);

  const ackRate = totalAcknowledgements > 0
    ? Math.round((acknowledgedCount / totalAcknowledgements) * 100)
    : 100;

  const avgGovScore =
    deptScores.length > 0
      ? Math.round(deptScores.reduce((s, d) => s + d.governance, 0) / deptScores.length)
      : 0;

  return {
    totalPolicies,
    ackRate,
    openIssues,
    overdueIssues,
    totalAuditsQ,
    completedAuditsQ,
    auditCompletionRate: totalAuditsQ > 0 ? Math.round((completedAuditsQ / totalAuditsQ) * 100) : 0,
    avgGovScore,
  };
}

export async function getIssuesBySeverity() {
  const groups = await prisma.complianceIssue.groupBy({
    by: ["severity"],
    _count: { _all: true },
  });
  return groups.map((g) => ({ severity: g.severity, count: g._count._all }));
}

export async function getPolicyAckTrend() {
  // Last 4 weeks of acknowledgements
  const weeks = 4;
  const result: { week: string; acknowledged: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - (i + 1) * 7);
    const end = new Date();
    end.setDate(end.getDate() - i * 7);

    const count = await prisma.policyAcknowledgement.count({
      where: { acknowledgedAt: { gte: start, lt: end } },
    });
    result.push({ week: `W-${i}`, acknowledged: count });
  }
  return result;
}
