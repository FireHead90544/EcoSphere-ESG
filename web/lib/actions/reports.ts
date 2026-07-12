import { prisma } from "@/lib/prisma";

export async function getGovernanceReportData() {
  const policies = await prisma.eSGPolicy.findMany({
    include: {
      acknowledgements: {
        include: { employee: { include: { department: true } } },
      },
    },
  });

  const allEmployees = await prisma.employee.findMany({
    include: { department: true },
  });

  const depts = await prisma.department.findMany({
    where: { status: "ACTIVE" },
  });

  // 1. Policy compliance by dept
  const complianceByDept = depts.map((d) => {
    const deptEmployees = allEmployees.filter((e) => e.departmentId === d.id);
    const totalExpected = policies.length * deptEmployees.length;
    let acks = 0;
    
    policies.forEach((p) => {
      const ackedEmpIds = p.acknowledgements.map((a) => a.employeeId);
      acks += deptEmployees.filter((e) => ackedEmpIds.includes(e.id)).length;
    });

    return {
      department: d.name,
      ackRate: totalExpected > 0 ? (acks / totalExpected) * 100 : 0,
    };
  });

  // 2. Audit summary
  const audits = await prisma.audit.findMany();
  const auditSummary = {
    scheduled: audits.filter((a) => a.status === "SCHEDULED").length,
    underReview: audits.filter((a) => a.status === "UNDER_REVIEW").length,
    completed: audits.filter((a) => a.status === "COMPLETED").length,
  };

  // 3. Compliance issues by severity
  const issues = await prisma.complianceIssue.findMany();
  const issuesBySeverity = [
    { severity: "CRITICAL", count: issues.filter((i) => i.severity === "CRITICAL").length, fill: "var(--color-critical)" },
    { severity: "HIGH", count: issues.filter((i) => i.severity === "HIGH").length, fill: "var(--color-high)" },
    { severity: "MEDIUM", count: issues.filter((i) => i.severity === "MEDIUM").length, fill: "var(--color-medium)" },
    { severity: "LOW", count: issues.filter((i) => i.severity === "LOW").length, fill: "var(--color-low)" },
  ];

  // 4. Governance Scores
  const scores = await prisma.departmentScore.findMany({
    include: { department: true },
  });
  const govScores = scores.map((s) => ({
    department: s.department.name,
    score: Math.round(s.governance),
  }));

  return { complianceByDept, auditSummary, issuesBySeverity, govScores, policies };
}
