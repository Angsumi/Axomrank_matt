"use client";

import React, { useState } from "react";
import {
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FilePlus,
  Lock,
} from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import type { AspirantDocument } from "@/lib/firebase/firestore-service";
import { getFirebaseStorageInstance } from "@/lib/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export function DocumentVault() {
  const { user, documents, addDocument, deleteDocument } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [docType, setDocType] = useState<AspirantDocument["type"]>("prc");
  const [docTitle, setDocTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const DOC_TYPES: Array<{ value: AspirantDocument["type"]; label: string; icon: string }> = [
    { value: "prc", label: "Permanent Resident Certificate (PRC)", icon: "🏛️" },
    { value: "employment_exchange", label: "Employment Exchange Card", icon: "🆔" },
    { value: "caste_certificate", label: "Caste / Quota Certificate (OBC/SC/ST/EWS)", icon: "📜" },
    { value: "marksheet_10th", label: "HSLC / 10th Marksheet & Admit", icon: "🎓" },
    { value: "marksheet_12th", label: "HSSLC / 12th Marksheet", icon: "🎓" },
    { value: "degree_certificate", label: "Graduation / Degree Certificate", icon: "📜" },
    { value: "other", label: "Other Certificate / Experience", icon: "📄" },
  ];

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please choose a file to upload.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setStatusMessage("Uploading document...");

    try {
      const docId = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      let fileUrl = "";

      const storage = getFirebaseStorageInstance();
      if (storage && user) {
        // Upload to Firebase Storage bucket
        const fileRef = ref(storage, `users/${user.uid}/documents/${docId}-${selectedFile.name}`);
        const snapshot = await uploadBytes(fileRef, selectedFile);
        fileUrl = await getDownloadURL(snapshot.ref);
      } else {
        // Local / Base64 Data URL fallback
        fileUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
      }

      const newDoc: AspirantDocument = {
        id: docId,
        type: docType,
        title: docTitle.trim() || DOC_TYPES.find((t) => t.value === docType)?.label || selectedFile.name,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileUrl,
        uploadedAt: new Date().toISOString(),
      };

      await addDocument(newDoc);
      setStatusMessage("Document securely saved to your vault!");
      setSelectedFile(null);
      setDocTitle("");
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload document. Please check file size.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="document-vault" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Lock size={20} style={{ color: "var(--accent-color, #3b82f6)" }} />
          <h2 style={{ fontSize: "18px", fontWeight: 600, margin: 0 }}>Aspirant Document Vault</h2>
        </div>
        <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-muted)" }}>
          Store your Permanent Resident Certificate (PRC), Employment Exchange card, educational marksheets, and quota certificates in one secure place.
        </p>
      </div>

      {statusMessage && (
        <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "var(--text-bright)", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckCircle2 size={16} style={{ color: "#10b981" }} />
          <span>{statusMessage}</span>
        </div>
      )}

      {error && (
        <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "var(--text-bright)", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertCircle size={16} style={{ color: "#ef4444" }} />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleUpload} style={{ padding: "16px", background: "var(--bg-subtle)", borderRadius: "10px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <FilePlus size={16} />
          <h3 style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>Add New Document to Vault</h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
          <label>
            <span style={{ fontSize: "12px", fontWeight: 500 }}>Document Category</span>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as AspirantDocument["type"])}
              style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-card)" }}
            >
              {DOC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span style={{ fontSize: "12px", fontWeight: 500 }}>Document Title (Optional)</span>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="e.g. Assam PRC 2024 or 10th Marksheet"
              style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-card)" }}
            />
          </label>

          <label>
            <span style={{ fontSize: "12px", fontWeight: 500 }}>Choose PDF / Image</span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              style={{ width: "100%", padding: "6px", marginTop: "4px", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-card)", fontSize: "12px" }}
            />
          </label>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
          <button
            type="submit"
            disabled={isUploading || !selectedFile}
            className="button button-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Upload size={15} /> {isUploading ? "Uploading..." : "Upload Document"}
          </button>
        </div>
      </form>

      {/* Uploaded Documents Grid */}
      <div>
        <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>
          Your Vault Documents ({documents.length})
        </h3>

        {documents.length === 0 ? (
          <div style={{ padding: "30px", textAlign: "center", background: "var(--bg-subtle)", borderRadius: "10px", border: "1px dashed var(--border)" }}>
            <FileText size={32} style={{ color: "var(--text-muted)", margin: "0 auto 8px auto" }} />
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 500 }}>No documents stored yet</p>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
              Upload your PRC, marks, and Employment Exchange card above for quick 1-click access during government application form fill-ups.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
            {documents.map((doc) => {
              const typeConfig = DOC_TYPES.find((t) => t.value === doc.type);
              return (
                <article
                  key={doc.id}
                  style={{
                    padding: "14px",
                    background: "var(--bg-subtle)",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "8px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
                      <span style={{ fontSize: "18px" }}>{typeConfig?.icon || "📄"}</span>
                      <button
                        type="button"
                        onClick={() => deleteDocument(doc.id)}
                        title="Delete document"
                        style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "2px" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <h4 style={{ fontSize: "14px", fontWeight: 600, margin: "6px 0 2px 0" }}>
                      {doc.title}
                    </h4>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>
                      {doc.fileName} {doc.fileSize ? `· ${formatFileSize(doc.fileSize)}` : ""}
                    </p>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px", paddingTop: "8px", borderTop: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="button button-ghost"
                      style={{ fontSize: "11px", padding: "3px 8px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      View / Download <ExternalLink size={12} />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
