import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getEnvironmentalReportData,
  getSocialReportData,
  getGovernanceReportData,
  getEsgSummaryData,
  getCustomReportData,
} from "@/lib/actions/reports";

// Dummy export generator for the hackathon — in a real app this would use
// libraries like pdfkit, exceljs, or csv-stringify to generate real files.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { type } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "csv";
  
  const filters = {
    departmentId: searchParams.get("dept") || undefined,
    fromDate: searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined,
    toDate: searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined,
    module: searchParams.get("module") || undefined,
  };

  let reportData;
  let filename = `${type}-report`;

  switch (type) {
    case "environmental":
      reportData = await getEnvironmentalReportData(filters);
      break;
    case "social":
      reportData = await getSocialReportData(filters);
      break;
    case "governance":
      reportData = await getGovernanceReportData(filters);
      break;
    case "esg-summary":
      reportData = await getEsgSummaryData({ departmentId: filters.departmentId });
      break;
    case "custom":
      reportData = await getCustomReportData(filters as any);
      break;
    default:
      return new NextResponse("Invalid report type", { status: 400 });
  }

  // Generate a very basic dummy file response based on format
  const dateStr = new Date().toISOString().split("T")[0];
  const fullFilename = `ecosphere-${filename}-${dateStr}.${format}`;

  let content = "";
  let contentType = "text/plain";

  if (format === "csv") {
    content = "Type,Status,Data\nReport,Generated,Success\n(This is a dummy CSV generated for hackathon demo)";
    contentType = "text/csv";
  } else if (format === "pdf") {
    content = "%PDF-1.4\n1 0 obj\n<< /Title (Dummy PDF) >>\nendobj\n(This is a dummy PDF generated for hackathon demo)";
    contentType = "application/pdf";
  } else if (format === "xlsx") {
    content = "PK\x03\x04(Dummy XLSX content for hackathon)";
    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${fullFilename}"`,
    },
  });
}
