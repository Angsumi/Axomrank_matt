export type JobCategory =
  | "state-govt"
  | "central-govt"
  | "banking-psu"
  | "police-defense"
  | "education-tet"
  | "health-medical"
  | "judiciary"
  | "admit-card"
  | "result"
  | "private-walkin"
  | "general";

export type JobStage =
  | "new-vacancy"
  | "admit-card"
  | "exam-date"
  | "result"
  | "answer-key"
  | "syllabus"
  | "corrigendum"
  | "apply-online";

export type CandidateProfile = {
  education: string;
  category: string;
  homeDistrict: string;
  hasEmploymentExchange: boolean;
  preferredDepartments: string[];
};

export const DEFAULT_CANDIDATE_PROFILE: CandidateProfile = {
  education: "Graduate",
  category: "General",
  homeDistrict: "Guwahati",
  hasEmploymentExchange: true,
  preferredDepartments: [
    "APSC",
    "ADRE / SLRC",
    "Assam Police / SLPRB",
    "Banking (SBI/IBPS/AGVB)",
    "Education (DEE/DHE/SSA)",
  ],
};

export type JobFitResult = {
  score: number;
  level: "high" | "medium" | "low" | "mismatch";
  label: string;
  reasons: string[];
  dealBreakers: string[];
};

export type JobMetadata = {
  category: JobCategory;
  categoryLabel: string;
  stage: JobStage;
  stageLabel: string;
  totalPosts?: number;
  qualificationTags: string[];
  department?: string;
  district?: string;
  lastDate?: string;
  isUrgent?: boolean;
  isRecruitment: boolean;
  directPdfUrl?: string;
  directApplyUrl?: string;
  fitResult?: JobFitResult;
};

export const NON_JOB_PATTERNS = /\b(?:suicide|suicidal|dies|died|death|killed|killing|murder|murdered|stabbed|shot\s*dead|rape|assault|accident|injured|injury|crash|drowned|body\s*found|arrest(?:ed|s)?|nabbed|apprehended|custody|remand|seized|smuggling|contraband|drugs|ganja|liquor|poaching|bribe|corruption|cbi\s*raid|cid\s*probe|police\s*probe|inquiry\s*ordered|accused|scam|encounter|theft|robbery|loot|fraud|politician|minister\s*visits|celebrat(?:e|es|ed|ion)|raksha\s*bandhan|puja|festival|party\s*worker|clash|protest|lottery|sambad|teer|shillong\s*teer|khanapara\s*teer|juwai\s*teer|jackpot|betting|gambling|casino|business\s*loan|personal\s*loan|home\s*loan|car\s*loan|credit\s*card|crypto|horoscope|astrology|rashifal|post[\s\-]*war|longest[\s\-]*serving|prime\s*minister|\bpm\b|president|parliament|foreign\s*minister|diplomat|bilateral|ukraine|russia|gaza|israel|iran|lebanon|syria|white\s*house|kremlin|donald\s*trump|\btrump\b|biden|putin|meloni|zelenskyy|bollywood|box\s*office|hollywood|actor|actress|cricket|bcci|icc|ipl|champions\s*trophy|world\s*cup|football|fifa|olympics|badminton|asian\s*games|tennis|grand\s*slam|wimbledon|weather|heavy\s*rainfall|flood\s*warning|earthquake|cyclone|sensex|nifty|stock\s*market)\b/i;

export const RECRUITMENT_INTENT_PATTERN = /\b(?:recruit(?:ment|ing)?|vacanc(?:y|ies)|openings?|admit\s*card|hall\s*ticket|call\s*letter|written\s*test|interview|skill\s*test|merit\s*list|selection\s*list|selected\s*candidates|result|cut[\s\-]*off|answer\s*key|syllabus|exam\s*date|exam\s*schedule|routine|time\s*table|cce|adre|slprb|apply\s*online|online\s*application|form\s*fillup|eligibility|walk[\s\-]*in|engagement|hiring|job\s*alert|sakori|chakar(?:i)?|posts?\s+of\b|\d+\s+posts?\b|vacant\s+posts?\b|teaching\s+posts?\b|non[\s\-]*teaching\s+posts?\b|technical\s+posts?\b|cadre\s+posts?\b|posts?\s+vacant\b|\bposts\b(?!\s*[\-\/](?:war|poll|mortem|match|budget|election|launch|independence|covid|harvest|graduate|doctoral|doctorate)))\b/i;

export function isRecruitmentUpdate(title: string, summary: string = ""): boolean {
  const text = `${title} ${summary}`;
  // Hard reject tragic/crime/accident/political/international non-job noise
  if (NON_JOB_PATTERNS.test(text)) {
    const hasExplicitHiring = /\b(?:apply\s*online|online\s*application|application\s*form|recruitment\s*notification|advertisement\s*no|notification\s*no|\d+\s*(?:posts|vacancies))\b/i.test(title);
    if (!hasExplicitHiring) return false;
  }
  // Must possess clear recruitment/exam intent
  return RECRUITMENT_INTENT_PATTERN.test(text);
}

export const ASSAM_DISTRICTS = [
  "Guwahati", "Kamrup", "Dibrugarh", "Silchar", "Jorhat", "Nagaon", "Tezpur",
  "Sonitpur", "Cachar", "Dhubri", "Barpeta", "Tinsukia", "Bongaigaon", "Kokrajhar",
  "Goalpara", "Karimganj", "Hailakandi", "Golaghat", "Sivasagar", "Darrang",
  "Morigaon", "Udalguri", "Karbi Anglong", "Dima Hasao", "Chirang", "Baksa",
  "Majuli", "Charaideo", "Hojai", "Biswanath", "South Salmara", "West Karbi Anglong",
  "Bajali", "Tamulpur"
];

// Common qualification patterns in Assam job notices
const QUALIFICATION_PATTERNS: Array<{ regex: RegExp; tag: string }> = [
  { regex: /\b(?:8th\s*pass|class\s*viii|class\s*8)\b/i, tag: "8th Pass" },
  { regex: /\b(?:10th\s*pass|hslc|class\s*x|class\s*10|matriculation)\b/i, tag: "10th / HSLC" },
  { regex: /\b(?:12th\s*pass|hsslc|class\s*xii|class\s*12|higher\s*secondary|10\+2)\b/i, tag: "12th / HSSLC" },
  { regex: /\b(?:graduate|graduation|degree|b\.?a|b\.?sc|b\.?com|bba|bca)\b/i, tag: "Graduate" },
  { regex: /\b(?:post\s*graduate|master(?:'s)?|m\.?a|m\.?sc|m\.?com|mba|mca)\b/i, tag: "Post Graduate" },
  { regex: /\b(?:b\.?e|b\.?tech|engineering)\b/i, tag: "B.Tech / BE" },
  { regex: /\b(?:diploma|polytechnic)\b/i, tag: "Diploma" },
  { regex: /\b(?:iti|ncvt|scvt)\b/i, tag: "ITI" },
  { regex: /\b(?:b\.?ed|d\.?el\.?ed|tet|ctet|atid)\b/i, tag: "B.Ed / D.El.Ed / TET" },
  { regex: /\b(?:anm|gnm|b\.?sc\s*nursing|m\.?b\.?b\.?s|bams|bhms)\b/i, tag: "Medical / Nursing" },
  { regex: /\b(?:llb|llm|law\s*graduate)\b/i, tag: "Law / LLB" },
];

// Department / Agency patterns in priority order
const DEPARTMENT_PATTERNS: Array<{ regex: RegExp; name: string; category: JobCategory }> = [
  { regex: /\b(?:apsc\s*cce|combined\s*competitive|assam\s*civil\s*service|acs|aps)\b/i, name: "APSC CCE", category: "state-govt" },
  { regex: /\b(?:apsc|assam\s*public\s*service\s*commission)\b/i, name: "APSC (Technical/Dept)", category: "state-govt" },
  { regex: /\b(?:slrc|adre|assam\s*direct\s*recruitment|grade\s*iii|grade\s*iv|junior\s*assistant|field\s*assistant|peon|chowkidar)\b/i, name: "SLRC ADRE (Grade III/IV)", category: "state-govt" },
  { regex: /\b(?:secretariat|janata\s*bhawan|junior\s*administrative\s*assistant|jaa\s*assam)\b/i, name: "Assam Secretariat", category: "state-govt" },
  { regex: /\b(?:dhs|dme|ayush|nhm\s*assam|national\s*health\s*mission|directorate\s*of\s*health|staff\s*nurse|paramedical|laboratory\s*technician|pharmacist|radiographer)\b/i, name: "Health (DME/DHS/NHM)", category: "health-medical" },
  { regex: /\b(?:slprb|assam\s*police|sub[\s\-]*inspector|\bsi\b|constable|armed\s*branch|\bab\b|unarmed\s*branch|\bub\b|commando|dgic|fire\s*(?:service|man|men)|jailor|assistant\s*jailor)\b/i, name: "Police & Uniformed (SLPRB)", category: "police-defense" },
  { regex: /\b(?:apdcl|aegcl|apgcl|assam\s*power|assistant\s*manager|junior\s*manager|sahayak)\b/i, name: "APDCL / Power Sector", category: "banking-psu" },
  { regex: /\b(?:oil\s*india|nrl|numaligarh|bcpl|ongc|iocl|bongaigaon)\b/i, name: "Oil / PSU (Assam)", category: "banking-psu" },
  { regex: /\b(?:gauhati\s*high\s*court|ghc|district\s*court|judicial|cjms|dhubri\s*court|kamrup\s*court|cachar\s*court)\b/i, name: "Judiciary / High Court", category: "judiciary" },
  { regex: /\b(?:ssa|samagra\s*shiksha|tet|assam\s*tet|seba|primary\s*teacher|upper\s*primary|lp\s*school|up\s*school|education\s*department|deeg|dee\s*assam|dhe\s*assam)\b/i, name: "Education & TET (SEBA/DEE)", category: "education-tet" },
  { regex: /\b(?:sbi|ibps|rrb\s*bank|assam\s*gramin\s*vikash|agvb|apex\s*bank|cooperative\s*bank)\b/i, name: "Banking (SBI/IBPS/AGVB)", category: "banking-psu" },
  { regex: /\b(?:forest\s*department|forest\s*guard|forester|kaziranga|manas)\b/i, name: "Forest & Allied (SLPRB)", category: "police-defense" },
  { regex: /\b(?:pnrd|panchayat|rural\s*development|gaoburha|lot\s*mandal|revenue)\b/i, name: "P&RD / Revenue", category: "state-govt" },
  { regex: /\b(?:astc|transport|irrigation|pwd|public\s*works|water\s*resources|soil\s*conservation|sericulture|handloom)\b/i, name: "Assam State Dept", category: "state-govt" },
  { regex: /\b(?:ssc|staff\s*selection|rrb\s*guwahati|railway|indian\s*army|agniveer|post\s*office|india\s*post|assam\s*rifles|crpf|bsf|cisf)\b/i, name: "Central Govt / Defense", category: "central-govt" },
];

export function evaluateJobFit(
  metadata: Omit<JobMetadata, "fitResult">,
  profile: CandidateProfile = DEFAULT_CANDIDATE_PROFILE,
): JobFitResult {
  if (!metadata.isRecruitment) {
    return {
      score: 0,
      level: "mismatch",
      label: "General / Non-Hiring",
      reasons: [],
      dealBreakers: ["Not a direct job recruitment opening"],
    };
  }

  let score = 0;
  const reasons: string[] = [];
  const dealBreakers: string[] = [];

  // 1. Qualification & Specialization Gate
  const candidateEdu = profile.education.toLowerCase();
  const specializedTags = [
    { tag: "Medical / Nursing", match: "medical" },
    { tag: "Law / LLB", match: "law" },
    { tag: "B.Ed / D.El.Ed / TET", match: "tet" },
    { tag: "ITI", match: "iti" },
    { tag: "B.Tech / BE", match: "tech" },
  ];

  for (const spec of specializedTags) {
    if (metadata.qualificationTags.includes(spec.tag)) {
      if (candidateEdu.includes(spec.match) || candidateEdu.includes(spec.tag.toLowerCase())) {
        score += 45;
        reasons.push(`Direct professional match: ${spec.tag}`);
      } else {
        dealBreakers.push(`Requires specialized qualification: ${spec.tag}`);
      }
    }
  }

  if (dealBreakers.length === 0) {
    if (metadata.qualificationTags.length === 0) {
      score += 35;
      reasons.push("Open eligibility or general state vacancy");
    } else if (metadata.qualificationTags.some((t) => candidateEdu.includes(t.toLowerCase()))) {
      score += 45;
      reasons.push(`Education matches: ${profile.education}`);
    } else if (candidateEdu.includes("graduate") || candidateEdu.includes("tech") || candidateEdu.includes("post graduate")) {
      if (metadata.qualificationTags.includes("10th / HSLC") || metadata.qualificationTags.includes("12th / HSSLC") || metadata.qualificationTags.includes("8th Pass")) {
        score += 40;
        reasons.push(`Eligible with degree for ${metadata.qualificationTags[0]} post`);
      } else {
        score += 30;
      }
    } else if (candidateEdu.includes("12th") && metadata.qualificationTags.includes("10th / HSLC")) {
      score += 40;
      reasons.push("12th pass eligible for 10th/HSLC post");
    } else {
      score += 25;
    }
  }

  // 2. Department & Agency Alignment
  if (metadata.department) {
    const isPreferred = profile.preferredDepartments.some(
      (dept) => dept.toLowerCase().includes(metadata.department!.toLowerCase()) || metadata.department!.toLowerCase().includes(dept.toLowerCase()),
    );
    if (isPreferred) {
      score += 30;
      reasons.push(`Preferred recruitment agency: ${metadata.department}`);
    } else {
      score += 15;
    }
  } else {
    score += 15;
  }

  // 3. District & Location Fit
  if (metadata.district) {
    if (metadata.district.toLowerCase() === profile.homeDistrict.toLowerCase()) {
      score += 15;
      reasons.push(`Located in your home district: ${metadata.district}`);
    } else {
      score += 10;
    }
  } else {
    score += 12;
    reasons.push("State-wide / all-Assam cadre");
  }

  // 4. Employment Exchange Gate
  if (profile.hasEmploymentExchange) {
    score += 10;
    reasons.push("Employment exchange requirement satisfied");
  }

  // Apply deal-breaker penalty if any hard professional barriers exist
  if (dealBreakers.length > 0) {
    score = Math.min(35, Math.max(10, score - 30));
  } else {
    score = Math.min(100, Math.max(20, score));
  }

  let level: JobFitResult["level"] = "low";
  let label = `${score}% Eligible`;

  if (dealBreakers.length > 0) {
    level = "mismatch";
    label = `⚠️ ${score}% Gap (${dealBreakers[0]})`;
  } else if (score >= 80) {
    level = "high";
    label = `🟢 ${score}% High Match`;
  } else if (score >= 60) {
    level = "medium";
    label = `🟡 ${score}% Good Fit`;
  }

  return {
    score,
    level,
    label,
    reasons,
    dealBreakers,
  };
}

export function extractJobMetadata(
  title: string,
  summary: string = "",
  profile: CandidateProfile = DEFAULT_CANDIDATE_PROFILE,
): JobMetadata {
  const text = `${title} ${summary}`;
  const isRecruitment = isRecruitmentUpdate(title, summary);

  // 1. Detect Stage
  let stage: JobStage = "new-vacancy";
  let stageLabel = "New Vacancy";

  if (!isRecruitment) {
    stage = "corrigendum";
    stageLabel = "General Update";
  } else if (/\b(?:admit\s*card|hall\s*ticket|call\s*letter)\b/i.test(text)) {
    stage = "admit-card";
    stageLabel = "Admit Card";
  } else if (/\b(?:result|merit\s*list|selection\s*list|selected\s*candidates|marksheet|rank\s*card)\b/i.test(text)) {
    stage = "result";
    stageLabel = "Result / Merit List";
  } else if (/\b(?:answer\s*key|key\s*sheet|solution)\b/i.test(text)) {
    stage = "answer-key";
    stageLabel = "Answer Key";
  } else if (/\b(?:exam\s*date|schedule|routine|time\s*table|written\s*test|pet\s*pst)\b/i.test(text)) {
    stage = "exam-date";
    stageLabel = "Exam Date / Schedule";
  } else if (/\b(?:syllabus|exam\s*pattern|previous\s*paper)\b/i.test(text)) {
    stage = "syllabus";
    stageLabel = "Syllabus";
  } else if (/\b(?:corrigendum|extension|date\s*extended|cancellation)\b/i.test(text)) {
    stage = "corrigendum";
    stageLabel = "Notice / Update";
  } else if (/\b(?:apply\s*online|online\s*application|form\s*fillup|portal\s*open)\b/i.test(text) && !/\b(?:notification|recruitment|posts?|vacanc(?:y|ies))\b/i.test(title)) {
    stage = "apply-online";
    stageLabel = "Apply Online";
  }

  // 2. Detect Department & Category
  let category: JobCategory = stage === "admit-card" ? "admit-card" : stage === "result" ? "result" : "state-govt";
  let department: string | undefined;

  for (const dept of DEPARTMENT_PATTERNS) {
    if (dept.regex.test(text)) {
      department = dept.name;
      if (stage !== "admit-card" && stage !== "result") {
        category = dept.category;
      }
      break;
    }
  }

  if (/\b(?:walk[\s\-]*in|private\s*job|company\s*recruitment|private\s*school|agency|urgent\s*requirement)\b/i.test(text)) {
    if (!department) category = "private-walkin";
  }

  const categoryLabels: Record<JobCategory, string> = {
    "state-govt": "State Govt",
    "central-govt": "Central Govt",
    "banking-psu": "Banking & PSU",
    "police-defense": "Police & Defense",
    "education-tet": "Education & TET",
    "health-medical": "Health & Medical",
    "judiciary": "Judiciary",
    "admit-card": "Admit Cards",
    "result": "Results & Keys",
    "private-walkin": "Private / Walk-in",
    "general": "Assam Jobs",
  };

  // 3. Extract Total Posts
  let totalPosts: number | undefined;
  if (isRecruitment) {
    const postMatch = text.match(/\b([0-9]{1,3}(?:,[0-9]{3})*|[0-9]{1,6})\s+(?:[a-z0-9\s\-\&,]{0,45}?)\s*(?:posts?|vacanc(?:y|ies)|openings?)\b/i);
    if (postMatch) {
      const rawNumber = postMatch[1].replace(/,/g, "");
      const parsed = parseInt(rawNumber, 10);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 500000) {
        totalPosts = parsed;
      }
    }
  }

  // 4. Extract Qualifications
  const qualificationTags: string[] = [];
  if (isRecruitment) {
    for (const qual of QUALIFICATION_PATTERNS) {
      if (qual.regex.test(text)) {
        qualificationTags.push(qual.tag);
      }
    }
  }

  // 5. Extract District / Region
  let district: string | undefined;
  for (const d of ASSAM_DISTRICTS) {
    if (new RegExp(`\\b${d}\\b`, "i").test(text)) {
      district = d;
      break;
    }
  }

  // 6. Extract Last Date / Deadline
  let lastDate: string | undefined;
  let isUrgent = false;

  const dateRegex = /(?:last\s*date(?:\s*for\s*apply|\s*to\s*apply|\s*of\s*submission)?|apply\s*(?:before|by|till)|deadline|closing\s*date)\s*[:\-]?\s*(\d{1,2}(?:st|nd|rd|th)?[\s\/\-\.](?:[a-z]{3,9}|\d{1,2})[\s\/\-\.]\d{2,4})/i;
  const dateMatch = text.match(dateRegex);
  if (dateMatch) {
    lastDate = dateMatch[1].trim();
  }

  if (/\b(?:last\s*day|closing\s*today|ends\s*tomorrow|urgent|last\s*date\s*reminder)\b/i.test(text)) {
    isUrgent = true;
  }

  // 7. Extract Direct PDF and Apply Links
  const pdfMatch = text.match(/\b(https?:\/\/[^\s"'<>]+\.pdf(?:\?[^\s"'<>]*)?)\b/i);
  const directPdfUrl = pdfMatch ? pdfMatch[1] : undefined;

  let directApplyUrl: string | undefined;
  const applyMatch = text.match(/\b(https?:\/\/(?:[a-z0-9-]+\.)*(?:apsc\.nic\.in|slprbassam\.in|sebaonline\.org|assam\.gov\.in|ibps\.in|sbi\.co\.in|recruitment\.[a-z0-9.-]+)[^\s"'<>]*)\b/i);
  if (applyMatch) {
    directApplyUrl = applyMatch[1];
  }

  const baseResult = {
    category,
    categoryLabel: categoryLabels[category] || "Assam Jobs",
    stage,
    stageLabel,
    totalPosts,
    qualificationTags,
    department,
    district,
    lastDate,
    isUrgent,
    isRecruitment,
    directPdfUrl,
    directApplyUrl,
  };

  const fitResult = evaluateJobFit(baseResult, profile);

  return {
    ...baseResult,
    fitResult,
  };
}
