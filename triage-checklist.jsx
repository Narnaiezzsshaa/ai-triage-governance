import { useState, useRef, useMemo, useCallback, useEffect } from "react";

const CHECKLIST = {
  version: "1.0-clinical-triage",
  citation: "Truong, N. (2026). External Auditor Checklist for AI-Supported Clinical Triage Governance Architecture. Soft Armor Labs. DOI: 10.5281/zenodo.18819348",
  license: "CC BY 4.0",
  sections: [
    {
      id: "s1", title: "Governance Structure & Accountability", weight: 1.2,
      severityIfFailed: "Tier 2–4 depending on drift from declared boundaries",
      evidence: "Governance charters; boundary maps; decision logs; oversight actions",
      subsections: [
        { label: "1.1 Declared Oversight", questions: [
          { id: "1.1.1", text: "Is there a documented owner for AI-mediated clinical decisions (e.g., CMO)?" },
          { id: "1.1.2", text: "Is the oversight structure documented in policies, charters, or governance diagrams?" },
          { id: "1.1.3", text: "Are approval pathways for model updates clearly defined and current?" },
          { id: "1.1.4", text: "Does the organization maintain a declared governance boundary map?" },
        ]},
        { label: "1.2 Observed Oversight", questions: [
          { id: "1.2.1", text: "Do observed decision logs match declared oversight?" },
          { id: "1.2.2", text: "Are there signs of shadow governance (ML team making decisions without authority)?" },
          { id: "1.2.3", text: "Are clinical overrides logged and reviewed?" },
          { id: "1.2.4", text: "Does the compliance office perform active—not passive—oversight?" },
        ]},
        { label: "1.3 Boundary Fidelity", questions: [
          { id: "1.3.1", text: "Is there a declared vs. observed boundary diff generated at least monthly?" },
          { id: "1.3.2", text: "Are deviations investigated and remediated?" },
          { id: "1.3.3", text: "Are responsibilities for AI decisions unambiguous?" },
        ]},
      ],
    },
    {
      id: "s2", title: "Model Lifecycle & Vendor Management", weight: 1.1,
      severityIfFailed: "Tier 1–3 depending on drift and transparency gaps",
      evidence: "Lineage logs; drift dashboards; vendor SLAs; assumption registry",
      subsections: [
        { label: "2.1 Model Lineage", questions: [
          { id: "2.1.1", text: "Is full lineage available for all deployed models?" },
          { id: "2.1.2", text: "Are version changes documented with timestamps and rationale?" },
          { id: "2.1.3", text: "Are downstream systems notified of updates?" },
        ]},
        { label: "2.2 Drift Monitoring", questions: [
          { id: "2.2.1", text: "Is drift monitored continuously or at defined intervals?" },
          { id: "2.2.2", text: "Are drift thresholds defined and approved?" },
          { id: "2.2.3", text: "Are drift alerts tied to escalation pathways?" },
        ]},
        { label: "2.3 Vendor Transparency", questions: [
          { id: "2.3.1", text: "Does the vendor provide drift logs, update delays, and evaluation results?" },
          { id: "2.3.2", text: "Are vendor assumptions documented and validated locally?" },
          { id: "2.3.3", text: "Are shared models used across sectors (e.g., insurance) tracked?" },
        ]},
      ],
    },
    {
      id: "s3", title: "Clinical Workflow Integrity", weight: 1.2,
      severityIfFailed: "Tier 2–4 depending on clinical impact",
      evidence: "Escalation logs; latency metrics; CDS safety logs; override logs",
      subsections: [
        { label: "3.1 Escalation Dynamics", questions: [
          { id: "3.1.1", text: "Are escalation rates monitored and trended?" },
          { id: "3.1.2", text: "Are surges investigated within defined timeframes?" },
          { id: "3.1.3", text: "Are nurse triage latency and load tracked?" },
        ]},
        { label: "3.2 Decision-Flow Fidelity", questions: [
          { id: "3.2.1", text: "Does the observed decision flow match the declared clinical workflow?" },
          { id: "3.2.2", text: "Are AI recommendations logged with context?" },
          { id: "3.2.3", text: "Are clinician overrides captured and reviewed?" },
        ]},
        { label: "3.3 Safety Controls", questions: [
          { id: "3.3.1", text: "Are CDS safety guardrails active and tested?" },
          { id: "3.3.2", text: "Are fallback procedures documented and rehearsed?" },
          { id: "3.3.3", text: "Is there a rollback mechanism for AI models?" },
        ]},
      ],
    },
    {
      id: "s4", title: "Assumption Lifecycle Management", weight: 1.0,
      severityIfFailed: "Tier 3–5 depending on propagation",
      evidence: "Assumption registry; validation logs; propagation maps",
      subsections: [
        { label: "4.1 Assumption Registry", questions: [
          { id: "4.1.1", text: "Is there a registry of all assumptions (e.g., A001)?" },
          { id: "4.1.2", text: "Are assumptions tied to specific components and substrates?" },
          { id: "4.1.3", text: "Are validation dates and methods documented?" },
        ]},
        { label: "4.2 Assumption Stress Testing", questions: [
          { id: "4.2.1", text: "Are assumptions tested under demographic, distributional, or operational shifts?" },
          { id: "4.2.2", text: "Are stressed or falsified assumptions retired promptly?" },
          { id: "4.2.3", text: "Are cross-substrate assumptions validated across all domains using them?" },
        ]},
        { label: "4.3 Cross-Sector Propagation", questions: [
          { id: "4.3.1", text: "Are shared assumptions tracked across healthcare, vendor, and insurance systems?" },
          { id: "4.3.2", text: "Are resonance clusters detected and escalated?" },
        ]},
      ],
    },
    {
      id: "s5", title: "Boundary Deformation & Shadow Governance", weight: 1.0,
      severityIfFailed: "Tier 3–4",
      evidence: "Oversight logs; anomaly reports; governance board minutes",
      subsections: [
        { label: "5.1 Responsibility Diffusion", questions: [
          { id: "5.1.1", text: "Are multiple actors effectively accountable for the same domain?" },
          { id: "5.1.2", text: "Are there signs of decision authority drifting to technical teams?" },
        ]},
        { label: "5.2 Oversight Gaps", questions: [
          { id: "5.2.1", text: "Are anomaly reports acted upon within defined timeframes?" },
          { id: "5.2.2", text: "Are oversight actions logged and auditable?" },
          { id: "5.2.3", text: 'Are there periods of "informed only" behavior by compliance?' },
        ]},
        { label: "5.3 Governance Drift", questions: [
          { id: "5.3.1", text: "Are governance boundaries reviewed quarterly?" },
          { id: "5.3.2", text: "Are deviations corrected with documented actions?" },
        ]},
      ],
    },
    {
      id: "s6", title: "Cross-Substrate Propagation Controls", weight: 1.0,
      severityIfFailed: "Tier 3–5",
      evidence: "Interface logs; anomaly clusters; propagation maps",
      subsections: [
        { label: "6.1 Interface Monitoring", questions: [
          { id: "6.1.1", text: "Are inference API errors, timeouts, and latency tracked?" },
          { id: "6.1.2", text: "Are interface strain thresholds defined?" },
        ]},
        { label: "6.2 Multi-Substrate Anomaly Detection", questions: [
          { id: "6.2.1", text: "Are anomalies correlated across healthcare, vendor, and insurance?" },
          { id: "6.2.2", text: "Are resonance clusters flagged automatically?" },
        ]},
        { label: "6.3 Propagation Path Mapping", questions: [
          { id: "6.3.1", text: "Is there a current propagation map showing model lineage, assumptions, and dependencies?" },
          { id: "6.3.2", text: "Are propagation paths reviewed after anomalies?" },
        ]},
      ],
    },
    {
      id: "s7", title: "Escalation Playbooks & Severity Tiers", weight: 1.1,
      severityIfFailed: "Tier 2–5 depending on missing playbooks",
      evidence: "Playbooks; severity definitions; evidence packets",
      subsections: [
        { label: "7.1 Tier Definitions", questions: [
          { id: "7.1.1", text: "Are severity tiers documented and approved?" },
          { id: "7.1.2", text: "Are they tied to structural signals (not incidents)?" },
        ]},
        { label: "7.2 Playbook Activation", questions: [
          { id: "7.2.1", text: "Are Tier 1 through Tier 5 playbooks available and current?" },
          { id: "7.2.2", text: "Are triggers automated or manual?" },
          { id: "7.2.3", text: "Are Tier 4 and Tier 5 actions rehearsed?" },
        ]},
        { label: "7.3 Evidence Generation", questions: [
          { id: "7.3.1", text: "Are evidence packets automatically generated at Tier 3 and above?" },
          { id: "7.3.2", text: "Are they complete (graph snapshots, logs, assumptions, boundaries)?" },
        ]},
      ],
    },
    {
      id: "s8", title: "Regulatory Alignment (OCR / ONC / CMS)", weight: 1.1,
      severityIfFailed: "Tier 3–5",
      evidence: "Risk analysis; CDS logs; patient safety metrics",
      subsections: [
        { label: "8.1 OCR (HIPAA Security Rule)", questions: [
          { id: "8.1.1", text: "Is risk analysis updated after drift or boundary deformation?" },
          { id: "8.1.2", text: "Are incident procedures followed?" },
          { id: "8.1.3", text: "Is disparate impact assessed?" },
        ]},
        { label: "8.2 ONC (AI Safety Rule)", questions: [
          { id: "8.2.1", text: "Is model lineage transparent?" },
          { id: "8.2.2", text: "Are assumptions validated?" },
          { id: "8.2.3", text: "Are CDS safety controls active?" },
        ]},
        { label: "8.3 CMS (Conditions of Participation)", questions: [
          { id: "8.3.1", text: "Are patient safety risks documented?" },
          { id: "8.3.2", text: "Are triage delays monitored?" },
          { id: "8.3.3", text: "Are sentinel-event thresholds defined?" },
        ]},
      ],
    },
    {
      id: "s9", title: "Documentation & Audit Trail Completeness", weight: 1.0,
      severityIfFailed: "Tier 2–4",
      evidence: "Logs; snapshots; disclosures; audit trail index",
      subsections: [
        { label: "9.1 Logs", questions: [
          { id: "9.1.1", text: "Are logs complete, immutable, and timestamped?" },
          { id: "9.1.2", text: "Are decision-flow deviations captured?" },
        ]},
        { label: "9.2 Evidence Artifacts", questions: [
          { id: "9.2.1", text: "Are graph snapshots stored?" },
          { id: "9.2.2", text: "Are assumption lifecycle logs complete?" },
          { id: "9.2.3", text: "Are vendor disclosures archived?" },
        ]},
        { label: "9.3 Audit Readiness", questions: [
          { id: "9.3.1", text: "Can the organization produce all required artifacts within 24 hours?" },
          { id: "9.3.2", text: "Are audit trails cross-referenced and consistent?" },
        ]},
      ],
    },
  ],
};

const STATUS_CONFIG = {
  governed: { label: "Governed", color: "#0d9459", bg: "#ecfdf3", border: "#a3e6c4" },
  partial:  { label: "Partially Governed", color: "#b45309", bg: "#fffbeb", border: "#fcd34d" },
  risk:     { label: "High Risk", color: "#c2200a", bg: "#fef2f2", border: "#fca5a5" },
  none:     { label: "Not Started", color: "#64748b", bg: "#f8fafc", border: "#cbd5e1" },
};

function getStatus(score) {
  if (score === null) return STATUS_CONFIG.none;
  if (score >= 90) return STATUS_CONFIG.governed;
  if (score >= 70) return STATUS_CONFIG.partial;
  return STATUS_CONFIG.risk;
}

function computeSectionScore(answers, section) {
  const allQs = section.subsections.flatMap(s => s.questions);
  let yes = 0, no = 0;
  allQs.forEach(q => {
    const a = answers[q.id];
    if (a === "yes") yes++;
    else if (a === "no") no++;
  });
  if (yes + no === 0) return null;
  return Math.round((yes / (yes + no)) * 100);
}

function computeOverallScore(answers) {
  let weightedSum = 0, totalWeight = 0;
  CHECKLIST.sections.forEach(sec => {
    const score = computeSectionScore(answers, sec);
    if (score !== null) {
      weightedSum += score * sec.weight;
      totalWeight += sec.weight;
    }
  });
  if (totalWeight === 0) return null;
  return Math.round(weightedSum / totalWeight);
}

function countAnswered(answers, section) {
  const allQs = section.subsections.flatMap(s => s.questions);
  return allQs.filter(q => answers[q.id]).length;
}

function totalQuestions(section) {
  return section.subsections.reduce((t, s) => t + s.questions.length, 0);
}

const FONT_LINK = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&display=swap";

export default function GovernanceChecklist() {
  const [answers, setAnswers] = useState({});
  const [comments, setComments] = useState({});
  const [activeSection, setActiveSection] = useState(0);
  const [meta, setMeta] = useState({ org: "", system: "", auditor: "", auditId: "" });
  const [showMeta, setShowMeta] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [mobileNav, setMobileNav] = useState(false);
  const [auditorDetermination, setAuditorDetermination] = useState({
    posture: "", severityTier: "", corrective: [], notes: ""
  });
  const mainRef = useRef(null);

  const setAnswer = useCallback((qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: prev[qId] === val ? undefined : val }));
  }, []);

  const setComment = useCallback((qId, val) => {
    setComments(prev => ({ ...prev, [qId]: val }));
  }, []);

  const overallScore = useMemo(() => computeOverallScore(answers), [answers]);
  const overallStatus = getStatus(overallScore);

  const totalAnswered = useMemo(() => {
    const allQs = CHECKLIST.sections.flatMap(s => s.subsections.flatMap(ss => ss.questions));
    return allQs.filter(q => answers[q.id]).length;
  }, [answers]);
  const grandTotal = CHECKLIST.sections.reduce((t, s) => t + totalQuestions(s), 0);

  const gaps = useMemo(() => {
    const g = [];
    CHECKLIST.sections.forEach(sec => {
      sec.subsections.forEach(sub => {
        sub.questions.forEach(q => {
          if (answers[q.id] === "no") {
            g.push({ section: sec.title, subsection: sub.label, question: q.text, comment: comments[q.id] || "" });
          }
        });
      });
    });
    return g;
  }, [answers, comments]);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSection]);

  const generateReport = () => {
    const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    let report = [];
    report.push("═".repeat(72));
    report.push("AI TRIAGE GOVERNANCE ASSESSMENT REPORT");
    report.push("═".repeat(72));
    report.push("");
    report.push(`Date:                ${date}`);
    report.push(`Organization:        ${meta.org || "—"}`);
    report.push(`System Under Review: ${meta.system || "—"}`);
    report.push(`Auditor:             ${meta.auditor || "—"}`);
    report.push(`Audit ID:            ${meta.auditId || "—"}`);
    report.push("");
    report.push(`Overall Score:       ${overallScore !== null ? overallScore + "%" : "Not started"}`);
    report.push(`Overall Status:      ${overallStatus.label}`);
    report.push("");
    report.push("─".repeat(72));
    report.push("SECTION SCORES");
    report.push("─".repeat(72));
    CHECKLIST.sections.forEach(sec => {
      const score = computeSectionScore(answers, sec);
      const status = getStatus(score);
      const answered = countAnswered(answers, sec);
      const total = totalQuestions(sec);
      report.push(`  ${sec.title}`);
      report.push(`    Score: ${score !== null ? score + "%" : "N/A"}  |  Status: ${status.label}  |  ${answered}/${total} answered`);
      report.push("");
    });
    if (gaps.length > 0) {
      report.push("─".repeat(72));
      report.push(`FINDINGS: ${gaps.length} GAP(S) IDENTIFIED`);
      report.push("─".repeat(72));
      gaps.forEach((g, i) => {
        report.push(`  [${i + 1}] ${g.section} → ${g.subsection}`);
        report.push(`      ${g.question}`);
        if (g.comment) report.push(`      Note: ${g.comment}`);
        report.push("");
      });
    }
    if (auditorDetermination.posture || auditorDetermination.notes) {
      report.push("─".repeat(72));
      report.push("AUDITOR DETERMINATION");
      report.push("─".repeat(72));
      if (auditorDetermination.posture) report.push(`  Governance Posture:  ${auditorDetermination.posture}`);
      if (auditorDetermination.severityTier) report.push(`  Severity Tier:       ${auditorDetermination.severityTier}`);
      if (auditorDetermination.corrective.length > 0) report.push(`  Corrective Actions:  ${auditorDetermination.corrective.join(", ")}`);
      if (auditorDetermination.notes) {
        report.push(`  Auditor Notes:`);
        report.push(`    ${auditorDetermination.notes}`);
      }
      report.push("");
    }
    report.push("─".repeat(72));
    report.push("INSTRUMENT REFERENCE");
    report.push("─".repeat(72));
    report.push(`  ${CHECKLIST.citation}`);
    report.push(`  License: ${CHECKLIST.license}`);
    report.push("");
    report.push("═".repeat(72));

    const blob = new Blob([report.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `governance-report-${meta.org ? meta.org.replace(/\s+/g, "-").toLowerCase() : "draft"}-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const section = CHECKLIST.sections[activeSection];
  const sectionScore = computeSectionScore(answers, section);
  const sectionStatus = getStatus(sectionScore);

  const postures = ["Fully Compliant", "Substantially Compliant", "Partially Compliant", "Non-Compliant"];
  const tiers = [
    "Tier 0: Baseline—Stable",
    "Tier 1: Localized Strain—Bending",
    "Tier 2: Layer-Internal Deformation—Stretching",
    "Tier 3: Cross-Layer Propagation—Cracking",
    "Tier 4: Triad Resonance—Resonance",
    "Tier 5: Systemic Breach—Rupture",
  ];
  const correctiveOptions = ["Immediate", "30-day", "90-day", "Annual"];

  return (
    <div style={{
      fontFamily: "'DM Sans', system-ui, sans-serif",
      background: "#0f172a",
      minHeight: "100vh",
      color: "#e2e8f0",
      display: "flex",
      flexDirection: "column",
    }}>
      <link href={FONT_LINK} rel="stylesheet" />

      {/* HEADER */}
      <header style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        borderBottom: "1px solid #334155",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700, color: "#fff",
          }}>▣</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em", color: "#f1f5f9" }}>
              AI Triage Governance Checklist
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>
              Soft Armor Labs · v{CHECKLIST.version} · CC BY 4.0
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Overall score pill */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: overallScore !== null ? overallStatus.bg : "#1e293b",
            border: `1px solid ${overallScore !== null ? overallStatus.border : "#475569"}`,
            borderRadius: 20, padding: "6px 14px",
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: overallScore !== null ? overallStatus.color : "#64748b",
              boxShadow: overallScore !== null ? `0 0 8px ${overallStatus.color}40` : "none",
            }} />
            <span style={{
              fontSize: 13, fontWeight: 600,
              color: overallScore !== null ? overallStatus.color : "#94a3b8",
            }}>
              {overallScore !== null ? `${overallScore}% ${overallStatus.label}` : "Not Started"}
            </span>
          </div>

          <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>
            {totalAnswered}/{grandTotal}
          </span>

          <button onClick={() => setShowMeta(!showMeta)} style={{
            background: "transparent", border: "1px solid #475569", borderRadius: 6,
            color: "#94a3b8", fontSize: 12, padding: "5px 10px", cursor: "pointer",
          }}>⚙ Meta</button>

          <button onClick={() => setShowExport(true)} style={{
            background: "linear-gradient(135deg, #3b82f6, #6366f1)", border: "none", borderRadius: 6,
            color: "#fff", fontSize: 12, fontWeight: 600, padding: "6px 14px", cursor: "pointer",
          }}>↓ Export</button>

          <button onClick={() => setMobileNav(!mobileNav)} style={{
            background: "transparent", border: "1px solid #475569", borderRadius: 6,
            color: "#94a3b8", fontSize: 14, padding: "4px 8px", cursor: "pointer",
            display: "none",
          }}>☰</button>
        </div>
      </header>

      {/* META PANEL */}
      {showMeta && (
        <div style={{
          background: "#1e293b", borderBottom: "1px solid #334155",
          padding: "16px 24px", display: "flex", gap: 12, flexWrap: "wrap",
        }}>
          {[
            ["org", "Organization"],
            ["system", "System Under Review"],
            ["auditor", "Auditor Name"],
            ["auditId", "Audit ID"],
          ].map(([key, label]) => (
            <input key={key} placeholder={label} value={meta[key]}
              onChange={e => setMeta(prev => ({ ...prev, [key]: e.target.value }))}
              style={{
                background: "#0f172a", border: "1px solid #334155", borderRadius: 6,
                color: "#e2e8f0", padding: "8px 12px", fontSize: 13, flex: "1 1 180px",
                fontFamily: "'DM Sans', sans-serif", outline: "none",
              }}
            />
          ))}
        </div>
      )}

      {/* BODY */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* LEFT NAV */}
        <nav style={{
          width: 280, minWidth: 280, background: "#1e293b",
          borderRight: "1px solid #334155", overflowY: "auto",
          padding: "12px 0", flexShrink: 0,
        }}>
          <div style={{ padding: "4px 16px 12px", fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Domains ({CHECKLIST.sections.length})
          </div>
          {CHECKLIST.sections.map((sec, i) => {
            const score = computeSectionScore(answers, sec);
            const status = getStatus(score);
            const answered = countAnswered(answers, sec);
            const total = totalQuestions(sec);
            const isActive = i === activeSection;
            return (
              <button key={sec.id} onClick={() => { setActiveSection(i); setMobileNav(false); }}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  width: "100%", textAlign: "left", padding: "10px 16px",
                  background: isActive ? "#334155" : "transparent",
                  border: "none", borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent",
                  cursor: "pointer", transition: "all 0.15s",
                }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", marginTop: 5, flexShrink: 0,
                  background: status.color,
                  boxShadow: score !== null ? `0 0 6px ${status.color}50` : "none",
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 12.5, fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#f1f5f9" : "#cbd5e1",
                    lineHeight: 1.35,
                  }}>{sec.title}</div>
                  <div style={{
                    fontSize: 11, color: "#64748b", marginTop: 2,
                    fontFamily: "'DM Mono', monospace",
                  }}>
                    {answered}/{total} · {score !== null ? `${score}%` : "—"}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Final Determination nav item */}
          <button onClick={() => { setActiveSection("determination"); setMobileNav(false); }}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", textAlign: "left", padding: "10px 16px",
              background: activeSection === "determination" ? "#334155" : "transparent",
              border: "none", borderLeft: activeSection === "determination" ? "3px solid #8b5cf6" : "3px solid transparent",
              borderTop: "1px solid #334155", marginTop: 8, cursor: "pointer",
            }}>
            <div style={{
              width: 8, height: 8, borderRadius: 2, marginTop: 1, flexShrink: 0,
              background: "#8b5cf6",
            }} />
            <div style={{ fontSize: 12.5, fontWeight: activeSection === "determination" ? 600 : 500, color: activeSection === "determination" ? "#f1f5f9" : "#cbd5e1" }}>
              Final Auditor Determination
            </div>
          </button>
        </nav>

        {/* MAIN CONTENT */}
        <main ref={mainRef} style={{
          flex: 1, overflowY: "auto", padding: "24px 32px 80px",
          background: "#0f172a",
        }}>
          {activeSection === "determination" ? (
            /* FINAL DETERMINATION VIEW */
            <div style={{ maxWidth: 720 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>
                10. Final Auditor Determination
              </h2>
              <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 28, lineHeight: 1.5 }}>
                Synthesize all domain ratings into an overall governance posture assessment.
              </p>

              {/* Overall Governance Posture */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1", marginBottom: 10 }}>Overall Governance Posture</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {postures.map(p => (
                    <button key={p} onClick={() => setAuditorDetermination(prev => ({ ...prev, posture: prev.posture === p ? "" : p }))}
                      style={{
                        padding: "8px 16px", borderRadius: 6, fontSize: 13, cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                        background: auditorDetermination.posture === p ? "#3b82f6" : "#1e293b",
                        border: `1px solid ${auditorDetermination.posture === p ? "#3b82f6" : "#475569"}`,
                        color: auditorDetermination.posture === p ? "#fff" : "#cbd5e1",
                      }}>{p}</button>
                  ))}
                </div>
              </div>

              {/* Severity Tier */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1", marginBottom: 10 }}>Severity Tier at Time of Audit</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {tiers.map(t => (
                    <button key={t} onClick={() => setAuditorDetermination(prev => ({ ...prev, severityTier: prev.severityTier === t ? "" : t }))}
                      style={{
                        padding: "8px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer",
                        textAlign: "left", fontFamily: "'DM Sans', sans-serif",
                        background: auditorDetermination.severityTier === t ? "#1e293b" : "transparent",
                        border: `1px solid ${auditorDetermination.severityTier === t ? "#3b82f6" : "#334155"}`,
                        color: auditorDetermination.severityTier === t ? "#93c5fd" : "#94a3b8",
                        fontWeight: auditorDetermination.severityTier === t ? 600 : 400,
                      }}>{t}</button>
                  ))}
                </div>
              </div>

              {/* Corrective Actions */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1", marginBottom: 10 }}>Required Corrective Actions</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {correctiveOptions.map(c => {
                    const selected = auditorDetermination.corrective.includes(c);
                    return (
                      <button key={c} onClick={() => setAuditorDetermination(prev => ({
                        ...prev,
                        corrective: selected ? prev.corrective.filter(x => x !== c) : [...prev.corrective, c],
                      }))}
                        style={{
                          padding: "8px 16px", borderRadius: 6, fontSize: 13, cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                          background: selected ? "#7c3aed" : "#1e293b",
                          border: `1px solid ${selected ? "#7c3aed" : "#475569"}`,
                          color: selected ? "#fff" : "#cbd5e1",
                          fontWeight: selected ? 600 : 400,
                        }}>{c}</button>
                    );
                  })}
                </div>
              </div>

              {/* Auditor Notes */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#cbd5e1", marginBottom: 10 }}>Auditor Notes</div>
                <textarea value={auditorDetermination.notes}
                  onChange={e => setAuditorDetermination(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Free-text field for structural observations, boundary drift, propagation risks, and governance maturity assessment..."
                  rows={6}
                  style={{
                    width: "100%", background: "#1e293b", border: "1px solid #334155",
                    borderRadius: 8, color: "#e2e8f0", padding: "12px 14px", fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif", resize: "vertical", outline: "none",
                    lineHeight: 1.6, boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Score Summary */}
              <div style={{
                background: "#1e293b", border: "1px solid #334155", borderRadius: 10,
                padding: 20,
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 14 }}>Domain Summary</div>
                {CHECKLIST.sections.map(sec => {
                  const score = computeSectionScore(answers, sec);
                  const st = getStatus(score);
                  return (
                    <div key={sec.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: st.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, fontSize: 12.5, color: "#cbd5e1" }}>{sec.title}</div>
                      <div style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: st.color, fontWeight: 600 }}>
                        {score !== null ? `${score}%` : "—"}
                      </div>
                    </div>
                  );
                })}
                <div style={{ borderTop: "1px solid #334155", marginTop: 12, paddingTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: overallStatus.color }} />
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>Overall</div>
                  <div style={{ fontSize: 14, fontFamily: "'DM Mono', monospace", color: overallStatus.color, fontWeight: 700 }}>
                    {overallScore !== null ? `${overallScore}%` : "—"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* SECTION QUESTION VIEW */
            <div style={{ maxWidth: 720 }}>
              {/* Section header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6, gap: 16 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
                  {activeSection + 1}. {section.title}
                </h2>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: sectionStatus.bg, border: `1px solid ${sectionStatus.border}`,
                  borderRadius: 16, padding: "4px 12px", flexShrink: 0,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: sectionStatus.color }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: sectionStatus.color }}>
                    {sectionScore !== null ? `${sectionScore}%` : "—"}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4, fontFamily: "'DM Mono', monospace" }}>
                Weight: {section.weight} · Severity if failed: {section.severityIfFailed}
              </div>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 28 }}>
                Evidence: {section.evidence}
              </div>

              {/* Subsections */}
              {section.subsections.map(sub => (
                <div key={sub.label} style={{ marginBottom: 28 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: "#94a3b8",
                    textTransform: "uppercase", letterSpacing: "0.04em",
                    borderBottom: "1px solid #1e293b", paddingBottom: 6, marginBottom: 14,
                  }}>{sub.label}</div>

                  {sub.questions.map(q => {
                    const val = answers[q.id];
                    const hasComment = expandedComments[q.id];
                    return (
                      <div key={q.id} style={{
                        background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
                        padding: "14px 16px", marginBottom: 10,
                        borderLeftColor: val === "yes" ? "#0d9459" : val === "no" ? "#c2200a" : val === "na" ? "#64748b" : "#334155",
                        borderLeftWidth: 3,
                      }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>{q.id} </span>
                            <span style={{ fontSize: 13.5, color: "#e2e8f0", lineHeight: 1.5 }}>{q.text}</span>
                          </div>
                          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                            {["yes", "no", "na"].map(opt => {
                              const active = val === opt;
                              const colors = {
                                yes: { bg: "#052e16", border: "#0d9459", text: "#4ade80" },
                                no: { bg: "#450a0a", border: "#c2200a", text: "#fca5a5" },
                                na: { bg: "#1e293b", border: "#64748b", text: "#94a3b8" },
                              };
                              const c = colors[opt];
                              return (
                                <button key={opt} onClick={() => setAnswer(q.id, opt)}
                                  style={{
                                    width: 40, height: 30, borderRadius: 5, fontSize: 11, fontWeight: 600,
                                    textTransform: "uppercase", cursor: "pointer",
                                    fontFamily: "'DM Mono', monospace",
                                    background: active ? c.bg : "transparent",
                                    border: `1.5px solid ${active ? c.border : "#475569"}`,
                                    color: active ? c.text : "#64748b",
                                    transition: "all 0.12s",
                                  }}>{opt === "na" ? "N/A" : opt}</button>
                              );
                            })}
                            <button onClick={() => setExpandedComments(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                              style={{
                                width: 30, height: 30, borderRadius: 5, fontSize: 13, cursor: "pointer",
                                background: comments[q.id] ? "#1e293b" : "transparent",
                                border: `1.5px solid ${comments[q.id] ? "#3b82f6" : "#475569"}`,
                                color: comments[q.id] ? "#3b82f6" : "#64748b",
                              }}>✎</button>
                          </div>
                        </div>
                        {hasComment && (
                          <textarea value={comments[q.id] || ""} onChange={e => setComment(q.id, e.target.value)}
                            placeholder="Auditor note..."
                            rows={2}
                            style={{
                              width: "100%", marginTop: 10, background: "#0f172a",
                              border: "1px solid #334155", borderRadius: 6, color: "#cbd5e1",
                              padding: "8px 10px", fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                              resize: "vertical", outline: "none", boxSizing: "border-box",
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Section nav */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, paddingTop: 20, borderTop: "1px solid #1e293b" }}>
                <button disabled={activeSection === 0}
                  onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                  style={{
                    padding: "8px 16px", borderRadius: 6, fontSize: 13, cursor: activeSection === 0 ? "default" : "pointer",
                    background: "transparent", border: "1px solid #334155",
                    color: activeSection === 0 ? "#334155" : "#94a3b8",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>← Previous</button>
                <button onClick={() => {
                  if (activeSection < CHECKLIST.sections.length - 1) setActiveSection(activeSection + 1);
                  else setActiveSection("determination");
                }}
                  style={{
                    padding: "8px 16px", borderRadius: 6, fontSize: 13, cursor: "pointer",
                    background: "linear-gradient(135deg, #3b82f6, #6366f1)", border: "none",
                    color: "#fff", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                  }}>
                  {activeSection < CHECKLIST.sections.length - 1 ? "Next →" : "Final Determination →"}
                </button>
              </div>
            </div>
          )}
        </main>

        {/* RIGHT SIDEBAR - Section scores */}
        <aside style={{
          width: 220, minWidth: 220, background: "#1e293b",
          borderLeft: "1px solid #334155", overflowY: "auto",
          padding: "16px 14px", flexShrink: 0,
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
            Assessment Summary
          </div>

          {/* Overall */}
          <div style={{
            background: "#0f172a", border: "1px solid #334155", borderRadius: 8,
            padding: 14, marginBottom: 16, textAlign: "center",
          }}>
            <div style={{
              fontSize: 32, fontWeight: 700, fontFamily: "'DM Mono', monospace",
              color: overallScore !== null ? overallStatus.color : "#475569",
            }}>{overallScore !== null ? `${overallScore}%` : "—"}</div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Overall Score</div>
            <div style={{
              fontSize: 11, fontWeight: 600, marginTop: 6, padding: "3px 10px",
              borderRadius: 10, display: "inline-block",
              background: overallScore !== null ? overallStatus.bg : "#1e293b",
              color: overallScore !== null ? overallStatus.color : "#64748b",
              border: `1px solid ${overallScore !== null ? overallStatus.border : "#334155"}`,
            }}>{overallStatus.label}</div>
          </div>

          {/* Per-section */}
          {CHECKLIST.sections.map((sec, i) => {
            const score = computeSectionScore(answers, sec);
            const st = getStatus(score);
            const pct = score || 0;
            return (
              <button key={sec.id} onClick={() => setActiveSection(i)}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  background: i === activeSection ? "#334155" : "transparent",
                  border: "none", borderRadius: 6, padding: "8px 10px",
                  marginBottom: 4, cursor: "pointer",
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "#cbd5e1", fontWeight: 500 }}>{i + 1}.</span>
                  <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: st.color, fontWeight: 600 }}>
                    {score !== null ? `${score}%` : "—"}
                  </span>
                </div>
                <div style={{
                  height: 3, background: "#0f172a", borderRadius: 2, overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", width: `${pct}%`, background: st.color,
                    borderRadius: 2, transition: "width 0.3s",
                  }} />
                </div>
              </button>
            );
          })}

          {/* Gaps count */}
          {gaps.length > 0 && (
            <div style={{
              marginTop: 16, padding: "10px 12px",
              background: "#450a0a40", border: "1px solid #7f1d1d",
              borderRadius: 8, textAlign: "center",
            }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fca5a5", fontFamily: "'DM Mono', monospace" }}>
                {gaps.length}
              </div>
              <div style={{ fontSize: 11, color: "#f87171" }}>Gap{gaps.length !== 1 ? "s" : ""} Identified</div>
            </div>
          )}

          {/* Legend */}
          <div style={{ marginTop: 20, padding: "10px 0", borderTop: "1px solid #334155" }}>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Legend</div>
            {[
              { ...STATUS_CONFIG.governed, range: "≥ 90%" },
              { ...STATUS_CONFIG.partial, range: "70–89%" },
              { ...STATUS_CONFIG.risk, range: "< 70%" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                <span style={{ fontSize: 11, color: "#94a3b8" }}>{item.label}</span>
                <span style={{ fontSize: 10, color: "#64748b", fontFamily: "'DM Mono', monospace", marginLeft: "auto" }}>{item.range}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* EXPORT MODAL */}
      {showExport && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
        }} onClick={() => setShowExport(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#1e293b", border: "1px solid #334155", borderRadius: 12,
            padding: 28, maxWidth: 440, width: "90%",
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 6, marginTop: 0 }}>Export Assessment Report</h3>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20, lineHeight: 1.5 }}>
              Downloads a structured text report with metadata, per-domain scores, identified gaps with auditor notes, and final determination.
            </p>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
              <div>Questions answered: <strong style={{ color: "#cbd5e1" }}>{totalAnswered}/{grandTotal}</strong></div>
              <div>Gaps identified: <strong style={{ color: "#fca5a5" }}>{gaps.length}</strong></div>
              <div>Overall: <strong style={{ color: overallStatus.color }}>{overallScore !== null ? `${overallScore}% ${overallStatus.label}` : "Not started"}</strong></div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowExport(false)} style={{
                flex: 1, padding: "10px", borderRadius: 6, border: "1px solid #475569",
                background: "transparent", color: "#94a3b8", fontSize: 13, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}>Cancel</button>
              <button onClick={() => { generateReport(); setShowExport(false); }} style={{
                flex: 1, padding: "10px", borderRadius: 6, border: "none",
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}>Download .txt Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
