import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeVacancyDocId,
  liveStoryToPermanentVacancy,
  type PermanentVacancy,
} from "../lib/firebase/firestore-service";
import type { LiveStory } from "../lib/types";

describe("Firestore Permanent Vacancy Service", () => {
  it("sanitizes document IDs by stripping invalid Firestore characters", () => {
    const rawItem = {
      id: "industry:https://example.com/jobs/adre-grade-3?id=123#ref",
      url: "https://example.com/jobs/adre-grade-3",
      title: "ADRE Grade III 5000 Posts",
    };
    const sanitized = sanitizeVacancyDocId(rawItem);
    assert.match(sanitized, /^[a-zA-Z0-9_-]+$/);
    assert.ok(!sanitized.includes("/"));
    assert.ok(!sanitized.includes(":"));
    assert.ok(!sanitized.includes("?"));
    assert.ok(!sanitized.includes("#"));
  });

  it("converts LiveStory to PermanentVacancy maintaining all recruitment metadata", () => {
    const story: LiveStory = {
      id: "industry:apsc-cce-2026",
      title: "APSC CCE 2026 Notification Released for 384 Posts",
      summary: "Assam Public Service Commission invites applications for Combined Competitive Exam.",
      url: "https://apsc.nic.in/cce2026",
      source: "APSC Official",
      publishedAt: "2026-09-01T10:00:00.000Z",
      discoveredAt: "2026-09-01T10:05:00.000Z",
      importanceScore: 95,
      importanceReason: "Major Assam Civil Services recruitment",
      jobMetadata: {
        isRecruitment: true,
        category: "state-govt",
        categoryLabel: "State Govt (APSC/ADRE)",
        stage: "new-vacancy",
        stageLabel: "New Vacancy",
        totalPosts: 384,
        qualificationTags: ["Graduate"],
        department: "General Administration",
        lastDate: "2026-09-30",
        isUrgent: false,
      },
    };

    const permanent: PermanentVacancy = liveStoryToPermanentVacancy(story);

    assert.equal(permanent.id, "industry:apsc-cce-2026");
    assert.equal(permanent.title, story.title);
    assert.equal(permanent.url, story.url);
    assert.equal(permanent.source, story.source);
    assert.equal(permanent.isPermanent, true);
    assert.equal(permanent.jobMetadata?.department, "General Administration");
    assert.equal(permanent.jobMetadata?.totalPosts, 384);
    assert.equal(permanent.jobMetadata?.lastDate, "2026-09-30");
  });

  it("provides sensible defaults when optional fields are absent", () => {
    const minimalStory: LiveStory = {
      id: "",
      title: "SLRC ADRE Grade IV Recruitment",
      summary: "8th and 10th pass vacancies announced",
      url: "https://sebaonline.org/adre4",
      source: "State Level Recruitment Commission",
      publishedAt: "",
    };

    const permanent = liveStoryToPermanentVacancy(minimalStory);
    assert.ok(permanent.id.length > 0);
    assert.ok(permanent.publishedAt.length > 0);
    assert.ok(permanent.discoveredAt.length > 0);
    assert.equal(permanent.isPermanent, true);
  });
});
