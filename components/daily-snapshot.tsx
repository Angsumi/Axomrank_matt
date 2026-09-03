"use client";

import { ArrowUpRight, AtSign, Mail, Radio } from "lucide-react";
import type { BriefCategory, DailyBriefSnapshotSection } from "@/lib/types";
import styles from "./daily-snapshot.module.css";

const labels = {
  industry: "Latest Job Notifications",
  mentions: "Exam & Department Radar",
  newsletters: "News & Career Digests",
};
const icons = { industry: Radio, mentions: AtSign, newsletters: Mail };

export function DailySnapshot({ sections, onOpen }: {
  sections: DailyBriefSnapshotSection[];
  onOpen: (category: BriefCategory) => void;
}) {
  const urgentJobs = sections
    .flatMap((s) => s.items)
    .filter((item) => item.jobMetadata?.lastDate || item.jobMetadata?.isUrgent);

  return <div className={styles.grid}>
    {urgentJobs.length > 0 && (
      <div style={{
        gridColumn: "1 / -1",
        background: "color-mix(in srgb, var(--accent) 10%, transparent)",
        border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
        borderRadius: "8px",
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>⏰</span>
          <div>
            <b style={{ fontSize: "13px", color: "var(--ink)" }}>Upcoming Application Deadlines</b>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
              {urgentJobs.length} {urgentJobs.length === 1 ? "job requires" : "jobs require"} attention before closing.
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {urgentJobs.slice(0, 3).map((job) => (
            <a
              key={job.id}
              href={job.url}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: "11px",
                padding: "3px 8px",
                borderRadius: "4px",
                background: "var(--surface)",
                border: "1px solid var(--line)",
                color: "var(--ink)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>{job.title.slice(0, 30)}…</span>
              <span style={{ fontWeight: 600, color: "var(--accent)" }}>{job.jobMetadata?.lastDate || "Closing soon"}</span>
            </a>
          ))}
        </div>
      </div>
    )}
    {sections.map((section) => {
      const Icon = icons[section.category];
      return <section className={`${styles.section} ${styles[section.category]}`} key={section.category}>
        <div className={styles.header}>
          <span className={styles.icon}><Icon size={16} /></span>
          <div><h3>{labels[section.category]}</h3><span>Top {section.requestedCount} · {section.availableCount} available</span></div>
          <button type="button" onClick={() => onOpen(section.category)} aria-label={`Open ${labels[section.category]}`}><ArrowUpRight size={18} /></button>
        </div>
        {section.items.length ? <ol className={styles.list}>
          {section.items.map((item, index) => <li key={item.id}>
            <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
                {item.jobMetadata?.totalPosts && (
                  <span style={{ fontSize: "10px", fontWeight: "600", padding: "1px 6px", borderRadius: "4px", background: "color-mix(in srgb, var(--accent) 15%, transparent)", color: "var(--accent)" }}>
                    {item.jobMetadata.totalPosts.toLocaleString()} Posts
                  </span>
                )}
                {item.jobMetadata?.stageLabel && (
                  <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", background: "var(--line)", color: "var(--ink)" }}>
                    {item.jobMetadata.stageLabel}
                  </span>
                )}
                {item.jobMetadata?.department && (
                  <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", background: "var(--line)", color: "var(--muted)" }}>
                    {item.jobMetadata.department}
                  </span>
                )}
              </div>
              <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
              <p>{item.summary}</p>
              <small>{item.source} {item.jobMetadata?.lastDate ? `· Last Date: ${item.jobMetadata.lastDate}` : ""}</small>
            </div>
          </li>)}
        </ol> : <div className={styles.empty}>
          <b>{section.configured ? "Nothing new in this queue" : "No saved results yet"}</b>
          <p>{section.configured ? "Archived stories stay out of your brief." : "Add your sources or run the first refresh in this tab."}</p>
        </div>}
        <div className={styles.footer}>
          <span>{section.checkedAt ? `${section.stale ? "Last saved" : "Saved"} ${new Date(section.checkedAt).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}` : "Waiting for first collection"}</span>
          <button type="button" onClick={() => onOpen(section.category)}>See all <ArrowUpRight size={12} /></button>
        </div>
      </section>;
    })}
  </div>;
}
