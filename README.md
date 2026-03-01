# AI Triage Governance Checklist

**Interactive assessment tool for external auditors evaluating AI-supported clinical triage systems.**

This application wraps the *External Auditor / Joint Commission Surveyor Checklist for AI-Supported Clinical Triage Governance Architecture* (Truong, 2026) in a browser-based interface with per-domain scoring, traffic-light status indicators, and exportable assessment reports.

---

### What This Is

A **generic external auditor instrument** designed for surveyors, compliance teams, and regulatory bodies assessing whether an organization's AI-supported clinical triage system meets baseline governance expectations across ten domains:

1. Governance Structure & Accountability
2. Model Lifecycle & Vendor Management
3. Clinical Workflow Integrity
4. Assumption Lifecycle Management
5. Boundary Deformation & Shadow Governance Detection
6. Cross-Substrate Propagation Controls
7. Escalation Playbooks & Severity Tiers
8. Regulatory Alignment (OCR / ONC / CMS)
9. Documentation & Audit Trail Completeness
10. Final Auditor Determination

Each domain contains observable indicators expressed as yes/no questions. The tool calculates coverage scores and flags gaps—controls answered "No"—as findings in the exported report.

---

### What This Is Not

This checklist is **not** a full implementation of any proprietary governance architecture, detection engine, or operational security stack. It assesses *institutional controls*—whether governance structures exist, whether documentation is maintained, whether escalation pathways are defined—using publicly available criteria from the referenced Zenodo publication.

The scoring thresholds (≥90% Governed / 70–89% Partially Governed / <70% High Risk) are simplified traffic-light indicators for audit reporting purposes. They do not represent or expose any proprietary detection logic, invariant definitions, binding relationships, or operational parameters.

Organizations seeking to *implement* a governance architecture—rather than *assess* one—should engage qualified consultants for design and deployment.

---

### Governance Surfaces

This tool represents the **institutional controls** surface of AI triage governance. It pairs with the [Envelope Demonstrator](https://github.com/naiemzzz/safety-envelope-demo) as a complementary **runtime behavior** surface.

Together, they illustrate AI triage governed at two levels:

- **Runtime governance** — the envelope demonstrator shows how a system enforces behavioral boundaries in real time.
- **Institutional governance** — this checklist shows how an organization establishes, documents, and maintains oversight controls.

---

### Features

- **Three-panel layout** — domain navigation, question interface with Yes/No/N/A selectors and auditor notes, live scoring sidebar
- **Client-side scoring** — `yes_count / (yes_count + no_count)` per domain, NA excluded from denominator, weighted overall average
- **Final Auditor Determination** — governance posture, severity tier, corrective action timelines, and free-text notes (mirroring Section 10 of the published checklist)
- **Exportable report** — structured text file with metadata, per-domain scores, identified gaps with comments, and auditor determination
- **Fully static** — no backend, no data collection, no persistence; all state lives in the browser session

---

### Tech Stack

- React (JSX, single-file component)
- No external dependencies beyond Google Fonts (DM Sans, DM Mono)
- Designed for static hosting (GitHub Pages, Netlify, Vercel, or any CDN)

---

### Running Locally

```bash
# Clone the repository
git clone https://github.com/naiemzzz/triage-governance-checklist.git
cd triage-governance-checklist

# If using Vite (recommended)
npm create vite@latest . -- --template react
# Copy triage-checklist.jsx into src/ as App.jsx
npm install
npm run dev
```

---

### Citation

> Truong, N. (2026). *External Auditor Checklist for AI-Supported Clinical Triage Governance Architecture.* Soft Armor Labs.
> DOI: [10.5281/zenodo.18819348](https://doi.org/10.5281/zenodo.18819348)

If you use or adapt this checklist, please cite the Zenodo publication above.

---

### License

This work is licensed under the [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/) (CC BY 4.0).

You are free to share and adapt this material for any purpose, including commercial, provided you give appropriate credit, provide a link to the license, and indicate if changes were made.

**Source publication license:** The underlying checklist instrument is published under CC BY 4.0 on Zenodo. This interactive implementation inherits the same license.

---

### Author

**Narnaiezzsshaa Truong**
Soft Armor Labs
Zenodo Profile · [LinkedIn](https://linkedin.com/in/narnaiezzsshaa-truong)

---

### Disclaimer

This tool is provided for governance assessment purposes only. It does not constitute legal, regulatory, or clinical advice. Organizations should consult qualified professionals for compliance determinations. The author assumes no liability for decisions made based on assessment results produced by this tool.
