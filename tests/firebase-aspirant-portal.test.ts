import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_ASPIRANT_PROFILE,
  type AspirantProfile,
  type AspirantDocument,
} from "../lib/firebase/firestore-service";
import { extractJobMetadata } from "../lib/assam-job-classifier";

test("validates default aspirant profile structure and notification settings", () => {
  assert.equal(DEFAULT_ASPIRANT_PROFILE.education, "Graduate");
  assert.equal(DEFAULT_ASPIRANT_PROFILE.notificationsEnabled, true);
  assert.equal(DEFAULT_ASPIRANT_PROFILE.minFitScoreAlert, 80);
  assert.equal(DEFAULT_ASPIRANT_PROFILE.hasEmploymentExchange, true);
  assert.ok(DEFAULT_ASPIRANT_PROFILE.preferredDepartments.length > 0);
});

test("evaluates personalized fit for student profile matching high-match vacancy", () => {
  const aspirant: AspirantProfile = {
    ...DEFAULT_ASPIRANT_PROFILE,
    fullName: "Rituraj Borah",
    education: "B.Tech / BE",
    category: "OBC/MOBC",
    homeDistrict: "Guwahati",
    preferredDepartments: ["APDCL / Power Sector", "APSC (Technical/Dept)"],
  };

  const job = extractJobMetadata(
    "APDCL Recruitment 2026: Assistant Manager & Junior Manager Engineering Vacancies in Guwahati",
    "Assam Power Distribution Company Limited invites applications from B.Tech/BE Engineering degree holders. Total Posts: 250.",
    aspirant
  );

  assert.equal(job.isRecruitment, true);
  assert.ok(job.fitResult);
  assert.equal(job.fitResult.level, "high");
  assert.ok(job.fitResult.score >= 80);
  assert.equal(job.fitResult.dealBreakers.length, 0);
  assert.ok(job.fitResult.reasons.some((r) => r.includes("B.Tech / BE") || r.includes("Engineering")));
});

test("flags deal breaker for aspirant without specialized nursing qualification", () => {
  const engineeringAspirant: AspirantProfile = {
    ...DEFAULT_ASPIRANT_PROFILE,
    education: "B.Tech / BE",
  };

  const nurseJob = extractJobMetadata(
    "DHS Assam Staff Nurse Recruitment 2026: 600 Posts",
    "Directorate of Health Services requires GNM or B.Sc Nursing registered candidates.",
    engineeringAspirant
  );

  assert.equal(nurseJob.isRecruitment, true);
  assert.ok(nurseJob.fitResult);
  assert.equal(nurseJob.fitResult.level, "mismatch");
  assert.ok(nurseJob.fitResult.dealBreakers.length > 0);
});

test("serializes aspirant documents metadata correctly", () => {
  const doc: AspirantDocument = {
    id: "doc-12345",
    type: "prc",
    title: "Permanent Resident Certificate",
    fileName: "prc_assam_2024.pdf",
    fileSize: 204850,
    fileUrl: "https://storage.googleapis.com/test-bucket/prc_assam_2024.pdf",
    uploadedAt: new Date().toISOString(),
  };

  assert.equal(doc.type, "prc");
  assert.equal(doc.fileName, "prc_assam_2024.pdf");
  assert.ok(doc.fileSize && doc.fileSize > 0);
  assert.ok(doc.fileUrl.startsWith("https://"));
});
