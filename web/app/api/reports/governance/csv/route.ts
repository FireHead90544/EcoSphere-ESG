import { NextResponse } from "next/server";
import { getGovernanceReportData } from "@/lib/actions/reports";
import { requireAuth } from "@/lib/auth-utils";

export async function GET() {
  try {
    await requireAuth();
    const data = await getGovernanceReportData();

    // Generate CSV content
    const rows = [
      ["Department", "Policy Acknowledgement Rate (%)", "Governance Score"],
    ];

    data.govScores.forEach((gs) => {
      const compliance = data.complianceByDept.find((c) => c.department === gs.department);
      rows.push([
        gs.department,
        compliance ? compliance.ackRate.toFixed(1) : "0.0",
        gs.score.toString(),
      ]);
    });

    const csvContent = rows.map((e) => e.join(",")).join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="governance_report.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
