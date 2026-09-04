import assert from "node:assert/strict";
import test from "node:test";
import { extractJobMetadata, isRecruitmentUpdate } from "../lib/assam-job-classifier";
import { scoreIndustryDiscovery } from "../lib/industry-curation";
import { evaluateMention } from "../lib/mention-filter";

test("strictly rejects suicide, tragedy, and crime news from job feeds", () => {
  const headlines = [
    "Assam Police constable dies by suicide at Guwahati quarters, probe on: Police",
    "'Disha Salian's body found 10 feet away': Lawyer raises doubts over suicide claim",
    "Politicians celebrate Raksha Bandhan; Love of ladki bahin is my greatest strength",
    "Assam police arrest 3 drug peddlers with contraband in Cachar",
    "Gauhati High Court reserves verdict in murder case, CID inquiry ordered",
    "Road accident on NH-37 near Nagaon: 2 killed, 4 injured",
    "Sikkim State Lottery Results Today - 3rd September - Lottery Sambad Live",
    "Juwai Teer Result today September 3 First and Second round number",
    "Business Loan Eligibility Criteria Every Entrepreneur Should Know",
  ];

  for (const headline of headlines) {
    const isRecruitment = isRecruitmentUpdate(headline, "");
    assert.equal(isRecruitment, false, `Headline should be rejected: ${headline}`);

    const metadata = extractJobMetadata(headline, "");
    assert.equal(metadata.isRecruitment, false);

    const scoreResult = scoreIndustryDiscovery({
      title: headline,
      summary: headline,
      source: "Hindustan Times",
      url: "https://hindustantimes.com/news/1234",
      kind: "topic",
    });
    assert.equal(scoreResult.score, 0, `Scored discovery should be 0 for: ${headline}`);
    assert.match(scoreResult.excludedReason || "", /Non-recruitment noise/);
  }
});

test("accurately accepts real Assam recruitment and admit card notifications", () => {
  const validPostings = [
    {
      title: "Assam Police Constable Recruitment 2026: Apply Online for 5,562 Posts",
      summary: "State Level Police Recruitment Board (SLPRB) Assam releases official advertisement for 5562 Constable vacancies. Last date to apply is 15/10/2026.",
      expectedStage: "new-vacancy",
      expectedPosts: 5562,
      expectedDept: "Police & Uniformed (SLPRB)",
    },
    {
      title: "ADRE Grade 3 Admit Card 2026 Download Link Out for Written Test",
      summary: "State Level Recruitment Commission conducts ADRE Grade 3 exam on 29th September. Download hall ticket from official portal.",
      expectedStage: "admit-card",
      expectedDept: "SLRC ADRE (Grade III/IV)",
    },
    {
      title: "APSC CCE Preliminary Result 2026 Declared: Check Selection List",
      summary: "Assam Public Service Commission publishes merit list and cutoff marks for Combined Competitive Examination.",
      expectedStage: "result",
      expectedDept: "APSC CCE",
    },
  ];

  for (const posting of validPostings) {
    assert.equal(isRecruitmentUpdate(posting.title, posting.summary), true);
    const meta = extractJobMetadata(posting.title, posting.summary);
    assert.equal(meta.isRecruitment, true);
    assert.equal(meta.stage, posting.expectedStage);
    if (posting.expectedPosts) {
      assert.equal(meta.totalPosts, posting.expectedPosts);
    }
    if (posting.expectedDept) {
      assert.equal(meta.department, posting.expectedDept);
    }
  }
});

test("extracts districts and direct PDF links accurately", () => {
  const item = {
    title: "Guwahati Court Recruitment 2026: Apply for 45 Peon and Process Server Posts",
    summary: "District and Sessions Judge, Kamrup Metro invites applications. Download notification at https://ghconline.gov.in/advt_kamrup.pdf before 20/09/2026.",
  };

  const meta = extractJobMetadata(item.title, item.summary);
  assert.equal(meta.district, "Guwahati");
  assert.equal(meta.directPdfUrl, "https://ghconline.gov.in/advt_kamrup.pdf");
  assert.equal(meta.totalPosts, 45);
});

test("evaluateMention rejects tragedy headlines when evaluating exam radar queries", () => {
  const mentionItem = {
    id: "mention-1",
    title: "Assam Police constable dies by suicide at Guwahati quarters, probe on: Police",
    summary: "Assam Police constable dies by suicide at Guwahati quarters",
    source: "Hindustan Times",
    url: "https://hindustantimes.com/india-news/assam-police-suicide-1234.html",
    publishedAt: new Date().toISOString(),
  };

  const evaluation = evaluateMention(
    mentionItem,
    "Assam Police Constable",
    ["Assam Police Constable", "Recruitment", "Notification"],
    ["Assam", "Guwahati", "Recruitment"],
    true,
    { negativeTerms: ["suicide", "murder", "dies", "death"] }
  );

  assert.equal(evaluation.accepted, false, "Tragic mention should not be accepted");
  assert.equal(evaluation.score, 0);
});
