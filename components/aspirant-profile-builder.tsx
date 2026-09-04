"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  GraduationCap,
  Bell,
  CheckCircle2,
  AlertCircle,
  Save,
  Send,
  Building2,
  FileCheck,
  User,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { ASSAM_DISTRICTS } from "@/lib/assam-job-classifier";
import type { AspirantProfile } from "@/lib/firebase/firestore-service";

export function AspirantProfileBuilder({ onSaved }: { onSaved?: () => void }) {
  const { user, profile, updateProfile, requestPushNotifications, fcmToken, isConfigured } = useAuth();
  const [draft, setDraft] = useState<AspirantProfile>(profile);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pushStatus, setPushStatus] = useState<string | null>(null);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSavedStatus(null);
    try {
      const ok = await updateProfile(draft);
      if (ok) {
        setSavedStatus("Profile successfully updated in Cloud Firestore!");
        setTimeout(() => setSavedStatus(null), 4000);
        if (onSaved) onSaved();
      } else {
        setSavedStatus("Profile updated locally.");
      }
    } catch {
      setSavedStatus("Failed to save profile. Please check connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnablePush = async () => {
    setPushStatus("Requesting notification permission...");
    try {
      const token = await requestPushNotifications();
      if (token) {
        setPushStatus("🔔 Push notifications active! You will receive alerts for 80%+ matching vacancies.");
      } else {
        setPushStatus("⚠️ Permission denied or unsupported by browser.");
      }
    } catch {
      setPushStatus("⚠️ Could not register for push notifications.");
    }
  };

  const AGENCIES = [
    "APSC CCE",
    "APSC (Technical/Dept)",
    "SLRC ADRE (Grade III/IV)",
    "Assam Secretariat",
    "Police & Uniformed (SLPRB)",
    "Forest & Allied (SLPRB)",
    "Health (DME/DHS/NHM)",
    "Education & TET (SEBA/DEE)",
    "APDCL / Power Sector",
    "Judiciary / High Court",
    "Banking (SBI/IBPS/AGVB)",
    "Oil / PSU (Assam)",
  ];

  return (
    <form onSubmit={handleSave} className="aspirant-profile-form" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={22} style={{ color: "var(--accent-color, #10b981)" }} />
            <h2 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>Aspirant Academic Profile & Eligibility</h2>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
            Your qualifications and social quotas automatically evaluate every Assam vacancy with a 0–100% Fit Score and deal-breaker check.
          </p>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="button button-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <Save size={15} /> {isSaving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {savedStatus && (
        <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "var(--text-bright)", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckCircle2 size={16} style={{ color: "#10b981" }} />
          <span>{savedStatus}</span>
        </div>
      )}

      {/* Basic Aspirant Details */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
        <label>
          <span style={{ fontSize: "12px", fontWeight: 500 }}>Full Name</span>
          <input
            type="text"
            value={draft.fullName || ""}
            onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
            placeholder="e.g. Anupam Sharma"
            style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-subtle)" }}
          />
        </label>

        <label>
          <span style={{ fontSize: "12px", fontWeight: 500 }}>Email Address</span>
          <input
            type="email"
            value={draft.email || (user?.email || "")}
            onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            placeholder="aspirant@gmail.com"
            style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-subtle)" }}
          />
        </label>

        <label>
          <span style={{ fontSize: "12px", fontWeight: 500 }}>Phone / WhatsApp No.</span>
          <input
            type="tel"
            value={draft.phoneNumber || ""}
            onChange={(e) => setDraft({ ...draft, phoneNumber: e.target.value })}
            placeholder="+91 98765 43210"
            style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-subtle)" }}
          />
        </label>
      </div>

      {/* Academic Qualifications */}
      <div style={{ padding: "16px", background: "var(--bg-subtle)", borderRadius: "10px", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
          <GraduationCap size={18} />
          <h3 style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>Academic Credentials</h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          <label>
            <span style={{ fontSize: "12px", fontWeight: 500 }}>Highest Qualification</span>
            <select
              value={draft.education || "Graduate"}
              onChange={(e) => setDraft({ ...draft, education: e.target.value })}
              style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              <option value="Graduate">Graduate (BA / BSc / BCom / BBA / BCA)</option>
              <option value="12th / HSSLC">12th / HSSLC (Higher Secondary)</option>
              <option value="10th / HSLC">10th / HSLC (Matriculation)</option>
              <option value="Post Graduate">Post Graduate (MA / MSc / MCom / MBA / MCA)</option>
              <option value="B.Tech / BE">B.Tech / BE (Engineering)</option>
              <option value="Diploma">Diploma (Polytechnic)</option>
              <option value="ITI">ITI (NCVT / SCVT Certificate)</option>
              <option value="B.Ed / D.El.Ed / TET">B.Ed / D.El.Ed / TET (Teaching)</option>
              <option value="Medical / Nursing">Medical / Nursing (MBBS / GNM / ANM)</option>
              <option value="Law / LLB">Law / LLB (Advocate / Legal)</option>
            </select>
          </label>

          <label>
            <span style={{ fontSize: "12px", fontWeight: 500 }}>Stream / Specialization</span>
            <input
              type="text"
              value={draft.stream || ""}
              onChange={(e) => setDraft({ ...draft, stream: e.target.value })}
              placeholder="e.g. Computer Science / Arts / Commerce / Civil"
              style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-card)" }}
            />
          </label>

          <label>
            <span style={{ fontSize: "12px", fontWeight: 500 }}>Passing Year</span>
            <input
              type="text"
              value={draft.passingYear || ""}
              onChange={(e) => setDraft({ ...draft, passingYear: e.target.value })}
              placeholder="e.g. 2024"
              style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-card)" }}
            />
          </label>

          <label>
            <span style={{ fontSize: "12px", fontWeight: 500 }}>Aggregate % or CGPA</span>
            <input
              type="text"
              value={draft.percentageOrCgpa || ""}
              onChange={(e) => setDraft({ ...draft, percentageOrCgpa: e.target.value })}
              placeholder="e.g. 74.5% or 8.2 CGPA"
              style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-card)" }}
            />
          </label>
        </div>
      </div>

      {/* Reservation & Assam Domicile Details */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
        <label>
          <span style={{ fontSize: "12px", fontWeight: 500 }}>Social Category / Quota</span>
          <select
            value={draft.category || "General"}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-subtle)" }}
          >
            <option value="General">General / Unreserved (UR)</option>
            <option value="OBC/MOBC">OBC / MOBC (Assam State List)</option>
            <option value="SC">SC (Scheduled Caste)</option>
            <option value="ST(P)">ST(P) (Scheduled Tribe Plains)</option>
            <option value="ST(H)">ST(H) (Scheduled Tribe Hills)</option>
            <option value="EWS">EWS (Economically Weaker Section)</option>
          </select>
        </label>

        <label>
          <span style={{ fontSize: "12px", fontWeight: 500 }}>Home District (Assam)</span>
          <select
            value={draft.homeDistrict || "Guwahati"}
            onChange={(e) => setDraft({ ...draft, homeDistrict: e.target.value })}
            style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-subtle)" }}
          >
            {ASSAM_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Employment Exchange Section */}
      <div style={{ padding: "14px", background: "var(--bg-subtle)", borderRadius: "10px", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="checkbox"
            id="hasEmpEx"
            checked={draft.hasEmploymentExchange ?? true}
            onChange={(e) => setDraft({ ...draft, hasEmploymentExchange: e.target.checked })}
            style={{ width: "16px", height: "16px" }}
          />
          <label htmlFor="hasEmpEx" style={{ fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
            Active Assam Employment Exchange Registration Card
          </label>
        </div>

        {draft.hasEmploymentExchange && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "10px" }}>
            <label>
              <span style={{ fontSize: "11px" }}>Employment Exchange Reg No.</span>
              <input
                type="text"
                value={draft.employmentExchangeNumber || ""}
                onChange={(e) => setDraft({ ...draft, employmentExchangeNumber: e.target.value })}
                placeholder="e.g. EER/GHY/2023/84912"
                style={{ width: "100%", padding: "6px", marginTop: "2px", borderRadius: "4px", border: "1px solid var(--border)" }}
              />
            </label>
            <label>
              <span style={{ fontSize: "11px" }}>Valid Till / Renewal Date</span>
              <input
                type="text"
                value={draft.employmentExchangeDate || ""}
                onChange={(e) => setDraft({ ...draft, employmentExchangeDate: e.target.value })}
                placeholder="e.g. Dec 2027"
                style={{ width: "100%", padding: "6px", marginTop: "2px", borderRadius: "4px", border: "1px solid var(--border)" }}
              />
            </label>
          </div>
        )}
      </div>

      {/* Target Recruitment Boards */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
          <Building2 size={16} />
          <span style={{ fontSize: "13px", fontWeight: 600 }}>Preferred Conducting Bodies & Boards</span>
        </div>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 10px 0" }}>
          Selected bodies receive a +30 points match bonus in your personalized Fit Score.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {AGENCIES.map((agency) => {
            const isSelected = (draft.preferredDepartments || []).includes(agency);
            return (
              <button
                key={agency}
                type="button"
                className={isSelected ? "button button-primary" : "button button-ghost"}
                style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "14px" }}
                onClick={() => {
                  const current = draft.preferredDepartments || [];
                  const next = isSelected
                    ? current.filter((a) => a !== agency)
                    : [...current, agency];
                  setDraft({ ...draft, preferredDepartments: next });
                }}
              >
                {isSelected ? "✓ " : "+ "}
                {agency}
              </button>
            );
          })}
        </div>
      </div>

      {/* Push Notifications Card */}
      <div style={{ padding: "14px", background: "rgba(59, 130, 246, 0.08)", borderRadius: "10px", border: "1px solid rgba(59, 130, 246, 0.25)", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Bell size={18} style={{ color: "#3b82f6" }} />
            <div>
              <span style={{ fontWeight: 600, fontSize: "13px" }}>Web Push Exam & Vacancy Alerts</span>
              <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                Receive instant browser notifications when high-match (80%+) openings or admit cards are posted.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="button button-ghost"
            onClick={handleEnablePush}
            style={{ fontSize: "12px", padding: "6px 12px" }}
          >
            {fcmToken ? "✓ Alerts Active" : "🔔 Enable Push Alerts"}
          </button>
        </div>
        {pushStatus && (
          <span style={{ fontSize: "12px", color: "var(--text-bright)", marginTop: "4px" }}>
            {pushStatus}
          </span>
        )}
      </div>

      {/* Save Button Bar */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
        <button
          type="submit"
          disabled={isSaving}
          className="button button-primary"
          style={{ padding: "8px 20px" }}
        >
          <Save size={16} /> {isSaving ? "Saving..." : "Save Aspirant Profile"}
        </button>
      </div>
    </form>
  );
}
