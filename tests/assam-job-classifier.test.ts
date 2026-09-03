import test from "node:test";
import assert from "node:assert/strict";
import { extractJobMetadata } from "../lib/assam-job-classifier";

test("extracts APSC CCE new vacancy with post count and graduate qualification", () => {
  const meta = extractJobMetadata(
    "APSC CCE 2026 Notification: Apply Online for 235 Posts",
    "Assam Public Service Commission has released Combined Competitive Examination notification for Graduate candidates. Last Date: 25/09/2026."
  );

  assert.equal(meta.category, "state-govt");
  assert.equal(meta.stage, "new-vacancy");
  assert.equal(meta.department, "APSC");
  assert.equal(meta.totalPosts, 235);
  assert.ok(meta.qualificationTags.includes("Graduate"));
  assert.equal(meta.lastDate, "25/09/2026");
  assert.equal(meta.isUrgent, false);
});

test("extracts ADRE Grade 3 & Grade 4 Admit Card notice", () => {
  const meta = extractJobMetadata(
    "ADRE Admit Card 2026: Download SLRC Grade 3 & Grade 4 Hall Ticket",
    "State Level Recruitment Commission ADRE Grade III written exam call letter released on SEBA portal."
  );

  assert.equal(meta.category, "admit-card");
  assert.equal(meta.stage, "admit-card");
  assert.equal(meta.department, "ADRE / SLRC");
});

test("extracts Assam Police Constable with 10th/12th qualification and 5562 vacancies", () => {
  const meta = extractJobMetadata(
    "Assam Police Recruitment 2026: 5,562 Constable & Sub-Inspector Vacancies",
    "SLPRB Assam invites online application for 10th pass and 12th pass candidates. Last Date: 15-10-2026."
  );

  assert.equal(meta.category, "police-defense");
  assert.equal(meta.department, "Assam Police / SLPRB");
  assert.equal(meta.totalPosts, 5562);
  assert.ok(meta.qualificationTags.includes("10th / HSLC"));
  assert.ok(meta.qualificationTags.includes("12th / HSSLC"));
  assert.equal(meta.lastDate, "15-10-2026");
});

test("extracts DHS Assam Result and Merit List", () => {
  const meta = extractJobMetadata(
    "DHS Assam Result 2026: Grade 3 & Grade 4 Selection List Out",
    "Directorate of Health Services DHS Assam has declared the final merit list and cut off marks for Staff Nurse."
  );

  assert.equal(meta.category, "result");
  assert.equal(meta.stage, "result");
  assert.equal(meta.department, "Health (DHS/DME/NHM)");
});

test("extracts APDCL Junior Manager recruitment with engineering qualification", () => {
  const meta = extractJobMetadata(
    "APDCL Recruitment 2026 - 418 Assistant Accounts Officer & Junior Manager Posts",
    "Assam Power Distribution Company Limited APDCL requires Diploma and B.Tech Engineering candidates. Apply before 30.09.2026."
  );

  assert.equal(meta.category, "banking-psu");
  assert.equal(meta.department, "APDCL / AEGCL");
  assert.equal(meta.totalPosts, 418);
  assert.ok(meta.qualificationTags.includes("B.Tech / BE") || meta.qualificationTags.includes("Diploma"));
  assert.equal(meta.lastDate, "30.09.2026");
});

test("extracts urgency keyword reminder", () => {
  const meta = extractJobMetadata(
    "Assam TET Application Last Date Reminder: Apply Online Ends Tomorrow",
    "Urgent notification for elementary and secondary education candidates."
  );

  assert.equal(meta.isUrgent, true);
});
