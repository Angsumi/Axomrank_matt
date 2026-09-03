import type { ReminderItem, WorkspaceState } from "@/lib/types";
import { getDatabase } from "@/lib/server/database";
import { hasWorkspaceState, readWorkspaceState, writeWorkspaceState } from "@/lib/workspace-store";
import { cleanTaskItems } from "@/lib/tasks";
import { legacyBrowserImportAllowed } from "@/lib/server/settings";

export const runtime = "nodejs";

function cleanId(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? value : crypto.randomUUID();
}

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function cleanReminders(value: unknown): ReminderItem[] {
  if (!Array.isArray(value)) throw new Error("Reminders must be a list.");
  if (value.length > 10_000) throw new Error("The reminder list is too large.");
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as Partial<ReminderItem>;
    const title = cleanText(candidate.title).trim();
    if (!title) return [];
    const stage = candidate.applicationStage;
    const validStage = ["saved", "applied", "admit-card", "exam-done", "result"].includes(stage as string)
      ? (stage as ReminderItem["applicationStage"])
      : "saved";
    return [{
      id: cleanId(candidate.id),
      type: cleanText(candidate.type, candidate.url ? "Job" : "Saved"),
      title,
      source: cleanText(candidate.source, "Manual"),
      note: cleanText(candidate.note, "Tracked job application."),
      accent: cleanText(candidate.accent, "teal"),
      url: cleanText(candidate.url) || undefined,
      createdAt: cleanText(candidate.createdAt) || undefined,
      archivedAt: cleanText(candidate.archivedAt) || undefined,
      added: cleanText(candidate.added) || undefined,
      applicationStage: validStage,
      registrationNumber: cleanText(candidate.registrationNumber) || undefined,
      rollNumber: cleanText(candidate.rollNumber) || undefined,
      examDate: cleanText(candidate.examDate) || undefined,
      department: cleanText(candidate.department) || undefined,
      totalPosts: typeof candidate.totalPosts === "number" ? candidate.totalPosts : undefined,
      lastDate: cleanText(candidate.lastDate) || undefined,
    }];
  });
}

export async function GET() {
  try {
    const database = getDatabase();
    return Response.json({
      ...readWorkspaceState(database),
      initialized: hasWorkspaceState(database),
      legacyBrowserImportAllowed: legacyBrowserImportAllowed(),
    });
  } catch {
    return Response.json(
      { error: "Tasks and reminders could not be read safely. Restore the local database from a backup before making changes." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json() as Partial<WorkspaceState>;
    const state: WorkspaceState = {
      reminders: cleanReminders(body.reminders),
      tasks: cleanTaskItems(body.tasks),
    };
    return Response.json(writeWorkspaceState(getDatabase(), state));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not save the local workspace." }, { status: 400 });
  }
}
