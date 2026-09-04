import { executeIndustrySync } from "@/app/api/live/industry/route";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!isAuthorizedCronRequest(authHeader, cronSecret)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await executeIndustrySync();
    if (!result.success) {
      return Response.json({ error: result.error || "Sync failed" }, { status: 500 });
    }

    const payload = result.payload;
    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      checkedAt: payload.checkedAt,
      discoveredCount: payload.discoveredCount || 0,
      activeVacanciesCount: payload.items?.length || 0,
      archivedVacanciesCount: payload.archivedItems?.length || 0,
      message: "Nightly sync completed. All vacancies are pre-computed and stored in database for instant UI access.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync error";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
