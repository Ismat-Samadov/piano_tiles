import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getSession } from "@/lib/auth";
import { getBankBySlug, getApplicationsForExport, type ExportStatus } from "@/db/queries";

const STATUS_LABELS: Record<string, string> = {
  gozlemede: "Gözlənilir",
  baxilir: "Baxılır",
  tesdiq_edildi: "Təsdiq edildi",
  red_edildi: "Rədd edildi",
};

export async function GET(req: NextRequest) {
  // Auth — super admin only
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return NextResponse.json({ error: "İcazəsiz" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const slug = searchParams.get("slug");
  const statusParam = searchParams.get("status"); // comma-separated or "all"
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  if (!slug) {
    return NextResponse.json({ error: "slug tələb olunur" }, { status: 400 });
  }

  const bank = await getBankBySlug(slug);
  if (!bank) {
    return NextResponse.json({ error: "Bank tapılmadı" }, { status: 404 });
  }

  // Parse status filter
  const allStatuses: ExportStatus[] = ["gozlemede", "baxilir", "tesdiq_edildi", "red_edildi"];
  let statuses: ExportStatus[] | undefined;
  if (statusParam && statusParam !== "all") {
    statuses = statusParam.split(",").filter((s) => allStatuses.includes(s as ExportStatus)) as ExportStatus[];
    if (statuses.length === 0) statuses = undefined;
  }

  const rows = await getApplicationsForExport(bank.id, {
    statuses,
    dateFrom: dateFrom ? new Date(dateFrom) : undefined,
    dateTo: dateTo ? new Date(dateTo) : undefined,
  });

  // Build worksheet data
  const wsData = [
    [
      "№",
      "Telefon",
      "FİN kod",
      "Status",
      "Qeyd",
      "IP ünvan",
      "Cihaz",
      "Brauzer",
      "OS",
      "Dil",
      "Referer",
      "Baxılma tarixi",
      "Müraciət tarixi",
    ],
    ...rows.map((r, i) => [
      i + 1,
      r.phoneNumber,
      r.finCode,
      STATUS_LABELS[r.status] ?? r.status,
      r.notes ?? "",
      r.ipAddress ?? "",
      r.deviceType ?? "",
      r.browser ?? "",
      r.os ?? "",
      r.language ?? "",
      r.referer ?? "",
      r.reviewedAt ? new Date(r.reviewedAt).toLocaleString("az-AZ") : "",
      new Date(r.appliedAt).toLocaleString("az-AZ"),
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws["!cols"] = [
    { wch: 4 },  // №
    { wch: 16 }, // Telefon
    { wch: 10 }, // FİN
    { wch: 16 }, // Status
    { wch: 30 }, // Qeyd
    { wch: 16 }, // IP
    { wch: 10 }, // Cihaz
    { wch: 20 }, // Brauzer
    { wch: 18 }, // OS
    { wch: 6 },  // Dil
    { wch: 30 }, // Referer
    { wch: 20 }, // Baxılma tarixi
    { wch: 20 }, // Müraciət tarixi
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Müraciətlər");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `${slug}-muracietler-${dateStr}.xlsx`;

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
