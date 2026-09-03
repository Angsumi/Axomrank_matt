import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluateJobFit,
  extractJobMetadata,
  type CandidateProfile,
  DEFAULT_CANDIDATE_PROFILE,
} from "../lib/assam-job-classifier";

test("evaluates high fit for Graduate profile matching APSC Administrative post", () => {
  const profile: CandidateProfile = {
    education: "Graduate",
    category: "General",
    homeDistrict: "Guwahati",
    hasEmploymentExchange: true,
    preferredDepartments: ["APSC", "ADRE / SLRC"],
  };

  const meta = extractJobMetadata(
    "APSC CCE 2026 Notification Out: Apply Online for 235 ACS & APS Posts in Guwahati",
    "Assam Public Service Commission invites online applications from eligible Graduates for 235 posts.",
    profile,
  );

  assert.equal(meta.isRecruitment, true);
  assert.ok(meta.fitResult, "Fit result should be present");
  assert.equal(meta.fitResult.level, "high");
  assert.ok(meta.fitResult.score >= 80, `Expected score >= 80, got ${meta.fitResult.score}`);
  assert.equal(meta.fitResult.dealBreakers.length, 0);
  assert.ok(meta.fitResult.reasons.some((r) => r.toLowerCase().includes("apsc")));
});

test("flags deal-breaker when candidate lacks specialized medical qualification", () => {
  const generalProfile: CandidateProfile = {
    education: "Graduate",
    category: "General",
    homeDistrict: "Jorhat",
    hasEmploymentExchange: true,
    preferredDepartments: ["APSC"],
  };

  const nursingMeta = extractJobMetadata(
    "DHS Assam Staff Nurse Recruitment 2026: 500 GNM / B.Sc Nursing Posts",
    "Directorate of Health Services invites applications for 500 Staff Nurse posts. Qualification: GNM or B.Sc Nursing.",
    generalProfile,
  );

  assert.equal(nursingMeta.isRecruitment, true);
  assert.ok(nursingMeta.fitResult);
  assert.equal(nursingMeta.fitResult.level, "mismatch");
  assert.ok(nursingMeta.fitResult.dealBreakers.length > 0);
  assert.ok(nursingMeta.fitResult.dealBreakers[0].includes("Medical / Nursing"));
  assert.ok(nursingMeta.fitResult.score < 50);
});

test("matches specialized TET qualification for candidate with TET education", () => {
  const teacherProfile: CandidateProfile = {
    education: "B.Ed / D.El.Ed / TET",
    category: "OBC/MOBC",
    homeDistrict: "Nagaon",
    hasEmploymentExchange: true,
    preferredDepartments: ["Education (DEE/DHE/SSA)"],
  };

  const tetMeta = extractJobMetadata(
    "Assam Special TET 2026 Notification for 3800 Assistant Teacher Posts in DEE",
    "Directorate of Elementary Education invites applications from candidates with B.Ed / TET qualification.",
    teacherProfile,
  );

  assert.equal(tetMeta.isRecruitment, true);
  assert.ok(tetMeta.fitResult);
  assert.equal(tetMeta.fitResult.level, "high");
  assert.ok(tetMeta.fitResult.reasons.some((r) => r.includes("Direct professional match")));
});

test("boosts score when job matches candidate home district", () => {
  const dibrugarhCandidate: CandidateProfile = {
    education: "Graduate",
    category: "General",
    homeDistrict: "Dibrugarh",
    hasEmploymentExchange: true,
    preferredDepartments: ["APSC"],
  };

  const guwahatiCandidate: CandidateProfile = {
    ...dibrugarhCandidate,
    homeDistrict: "Guwahati",
  };

  const dibrugarhJob = extractJobMetadata(
    "Dibrugarh University Recruitment: Apply for 12 Assistant Posts",
    "Applications invited for posts in Dibrugarh district.",
    dibrugarhCandidate,
  );

  const guwahatiJob = extractJobMetadata(
    "Dibrugarh University Recruitment: Apply for 12 Assistant Posts",
    "Applications invited for posts in Dibrugarh district.",
    guwahatiCandidate,
  );

  assert.ok(dibrugarhJob.fitResult!.score > guwahatiJob.fitResult!.score);
  assert.ok(dibrugarhJob.fitResult!.reasons.some((r) => r.includes("home district: Dibrugarh")));
});
