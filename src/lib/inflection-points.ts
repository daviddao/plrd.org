// Cross-focus-area inflection points and how we measure them.
//
// Each focus area names a small set of inflection points: specific, observable,
// falsifiable shifts we believe would be catalytic and that have NOT yet happened
// as of 2026. They are hypotheses, not descriptions of the present. We judge our
// work against three questions, mapped to the fields on every point:
//
//   Q1 (cascade)      Did it matter?              The second-order effects it should unlock.
//   Q2 (signal)       Did it happen?              A pre-registered threshold — yes/no + date.
//   Q3 (contribution) Did our work make it happen? PL's inputs -> activities -> outputs on the
//                                                  critical path (the planned-work side of the
//                                                  logic model), traced honestly.
//
// IMPORTANT — these are distinct jobs and are NOT collapsed into one score. A point
// can be reached (Q2) and matter (Q1) with low PL contribution (Q3); that is still a
// win for the field. So we track field progress (Q1 & Q2) on one axis and PL's
// contribution (Q3) on a separate, independent axis.
//
// Source: "Inflection points across PL R&D, and how we will measure them."

export type InflectionStatus = 'watching' | 'early-signal' | 'tripped'

/** PL's pre-registered role(s) on the critical path — claims to be evidenced, not a credit score. */
export type PLRole = 'infrastructure' | 'legibility' | 'connection' | 'capital' | 'translation' | 'permission'

/** Canonical display order for role pills, so cards read consistently. */
export const PL_ROLE_ORDER: PLRole[] = ['infrastructure', 'legibility', 'connection', 'capital', 'translation', 'permission']

// Two-axis color system used across the impact dashboard:
//   FIELD = the change in the world (outcomes + impact) — moves with or without us (purple)
//   HAND  = our planned work / the PL toolkit — the only axis we control (PL blue)
export const FIELD_COLOR = '#7c5cf5'
export const HAND_COLOR = '#1982F4'
/** Live-signal accent — the pulsing dot on points with live outputs (green). */
export const LIVE_COLOR = '#22c55e'

/**
 * Q3 contribution, structured along the planned-work side of the logic model.
 * Inputs (resources committed) -> Activities (what we do) -> Outputs (what gets produced).
 * The outcomes and impact these aim at are tracked on the field axis (Q2, Q1).
 */
export type Contribution = {
  inputs: string
  activities: string
  outputs: string
}

/** A pointer to live activity that is contribution evidence (Q3) — NOT a Q2 threshold reading. */
export type LiveEvidence = {
  label: string
  href: string
  note: string
}

export type InflectionPoint = {
  /** Focus-area slug, matches /areas/<slug>. */
  area: FocusAreaKey
  /** The opportunity space this bet lives in. */
  opportunitySpace: string
  /** The inflection point, stated as a hypothesis. */
  title: string
  /** Q2 — observable threshold that says it happened (not yet true). */
  signal: string
  /** Q1 — why it matters / the cascade to watch. */
  cascade: string
  /** Q3 — PL contribution to trace, as inputs -> activities -> outputs. */
  contribution: Contribution
  /** Q3, summarized as the PL role(s) on the critical path — the instruments we bring. */
  roles: PLRole[]
  /** Field-progress lifecycle state. All start 'watching' — none reached as of 2026. */
  status: InflectionStatus
  /** Optional live activity from PL-backed teams — strictly Q3 evidence, never Q2 progress. */
  liveEvidence?: LiveEvidence
}

export type FocusAreaKey =
  | 'digital-human-rights'
  | 'economies-governance'
  | 'ai-robotics'
  | 'neurotech'

export type FocusAreaMeta = {
  key: FocusAreaKey
  label: string
  /** Short legacy code used in the strategy docs. */
  code: string
  href: string
  /** Accent color (hex from the theme) for badges and the field-progress meter. */
  accent: string
}

export const FOCUS_AREAS: FocusAreaMeta[] = [
  { key: 'digital-human-rights', label: 'Digital Human Rights', code: 'FA1', href: '/areas/digital-human-rights/', accent: '#1982F4' },
  { key: 'economies-governance', label: 'Economies & Governance', code: 'FA2', href: '/areas/economies-governance/', accent: '#12bfdf' },
  { key: 'ai-robotics', label: 'AI & Robotics', code: 'FA3', href: '/areas/ai-robotics/', accent: '#3966FE' },
  { key: 'neurotech', label: 'Neurotech', code: 'FA4', href: '/areas/neurotech/', accent: '#E51A66' },
]

// The logic-model chain: planned work (inputs/activities/outputs) → intended
// results (outcomes/impact). Shared by the Measuring-impact section, the three-
// questions explainer, and the per-point detail modal so the vocabulary lives
// in one place.
export const LOGIC_MODEL = [
  { key: 'inputs', label: 'Inputs', body: 'Funding, teams, convenings, standards we commit.' },
  { key: 'activities', label: 'Activities', body: 'Seeding teams, building primitives, setting standards.' },
  { key: 'outputs', label: 'Outputs', body: 'Teams funded, deployments, papers, ventures.' },
  { key: 'outcomes', label: 'Outcomes', body: 'Adoption, capital inflows, new entrants.' },
  { key: 'impact', label: 'Impact', body: 'The lasting shift: an inflection point that holds.' },
] as const
export type LogicStageKey = (typeof LOGIC_MODEL)[number]['key']

// ── Field-progress lifecycle (Q1 & Q2). Deliberately separate from PL contribution. ──
export const FIELD_STAGES = ['Defined', 'Emerging', 'Reached', 'Scaling'] as const
export type FieldStage = (typeof FIELD_STAGES)[number]

/** How far along the field axis a point sits, given its status. */
export function stageIndexForStatus(status: InflectionStatus): number {
  switch (status) {
    case 'watching':
      return 0 // threshold defined, waiting at it
    case 'early-signal':
      return 1
    case 'tripped':
      return 2
  }
}

export const STATUS_META: Record<InflectionStatus, { label: string; description: string; color: string }> = {
  watching: {
    label: 'Defined',
    description: 'The threshold is defined and pre-registered. No movement toward it yet.',
    color: '#6b6d79',
  },
  'early-signal': {
    label: 'Emerging',
    description: 'Leading indicators are moving toward the threshold.',
    color: '#1982F4',
  },
  tripped: {
    label: 'Reached',
    description: 'The defined threshold has been crossed.',
    color: '#12bfdf',
  },
}

export const ROLE_META: Record<PLRole, { label: string; description: string }> = {
  infrastructure: {
    label: 'Infrastructure',
    description: 'The open, neutral rail this runs on did not exist. PL builds and maintains it (libp2p / IPFS / Filecoin lineage).',
  },
  legibility: {
    label: 'Legibility',
    description: 'The field lacked a shared map. PL adds roadmaps, taxonomies, benchmarks, and written artifacts.',
  },
  connection: {
    label: 'Connection',
    description: 'Too few connections blocked progress. PL convenes the people who need to collide: dinners, retreats, residencies, hackathons.',
  },
  capital: {
    label: 'Capital',
    description: 'Pre-commercial work needed patient funding. PL runs grants and prizes and helps peer funders deploy theirs.',
  },
  translation: {
    label: 'Translation',
    description: 'The work was ready to leave the lab. PL helps convert it into ventures, pilots, and deployments.',
  },
  permission: {
    label: 'Permission',
    description: 'The rules did not yet recognize the technology. PL engages standards, policy, and regulatory pathways.',
  },
}

export const INFLECTION_POINTS: InflectionPoint[] = [
  // ── FA1 · Digital Human Rights ───────────────────────────────────────────
  {
    area: 'digital-human-rights',
    opportunitySpace: 'Censorship-Resistant Communication',
    title: 'Communication that cannot be switched off',
    signal:
      'A consumer-scale connectivity provider operates without state licensing or identity gating, and a metadata-resistant messenger crosses tens of millions of users; a population stays connected through a deliberate shutdown.',
    cascade:
      'Censoring speech and assembly becomes impractical, not just illegal; organizing survives adversarial conditions.',
    contribution: {
      inputs: 'The libp2p / IPFS open-source networking stack; funding for resilient-comms and private-messaging teams.',
      activities: 'Maintaining the substrate, funding teams, and contributing to interoperability standards.',
      outputs: 'libp2p / IPFS deployments and the funded comms and messaging teams building on them.',
    },
    roles: ['infrastructure', 'capital'],
    status: 'watching',
  },
  {
    area: 'digital-human-rights',
    opportunitySpace: 'Portable Identity, Credentials & Trust',
    title: 'Personhood without the state in the loop',
    signal:
      'A service at >100M people verifies unique humans for everyday use without a nation-state ID or KYC.',
    cascade:
      'Recognition stops being rented from platforms and states; privacy-preserving personhood becomes safe to build on.',
    contribution: {
      inputs: 'Convening capacity across identity protocols; seed funding for portable-credential initiatives.',
      activities: 'Convening identity-protocol teams and seeding / funding portable-credential work.',
      outputs: 'The identity and credential initiatives PL has seeded or funded.',
    },
    roles: ['connection', 'capital'],
    status: 'watching',
  },
  {
    area: 'digital-human-rights',
    opportunitySpace: 'Verifiable Public Knowledge & Provenance',
    title: 'Provenance becomes the default for truth',
    signal:
      'Two consecutive frontier-model generations ship attested provenance by default, and a major platform or archive adopts content-addressed provenance as default.',
    cascade:
      'A public record that can prove its own integrity becomes the precondition for trustworthy information in the AI era.',
    contribution: {
      inputs: 'Content addressing (IPFS) as the provenance substrate; funding for provenance and verifiable-compute teams.',
      activities: 'Providing the content-addressing substrate and backing provenance / verifiable-compute teams.',
      outputs: 'Content-addressed provenance tooling and the PL-backed teams building it.',
    },
    roles: ['infrastructure', 'capital'],
    status: 'watching',
  },
  {
    area: 'digital-human-rights',
    opportunitySpace: 'Sovereign Infrastructure for AI & Agents',
    title: 'Agents run on open rails',
    signal:
      'A frontier-scale model is trained across independent decentralized hardware, or a meaningful share of agent-to-agent economic activity settles on open permissionless compute / storage / identity.',
    cascade:
      'The rights architecture of the agent economy is set in the open rather than by whoever owns the cluster.',
    contribution: {
      inputs: 'The Filecoin / open-compute portfolio; PL capital and coordination across storage, compute, and identity.',
      activities: 'Building open compute and storage rails and bridging them with identity for agents.',
      outputs: 'Filecoin and the open-compute portfolio; integrations across storage, compute, and identity.',
    },
    roles: ['infrastructure', 'connection', 'capital'],
    status: 'watching',
  },

  // ── FA2 · Economies & Governance ─────────────────────────────────────────
  {
    area: 'economies-governance',
    opportunitySpace: 'Sovereign Digital Public Infrastructure',
    title: 'Programmable government in production',
    signal:
      'At least one sovereign moves >$1B/yr of real public funds through programmable, real-time-auditable rails; 3+ jurisdictions use selective-disclosure credentials for a high-stakes function (election, passport, census).',
    cascade:
      'Digital government crosses from digitization to transformation; a reference deployment others can copy.',
    contribution: {
      inputs: 'Standards and procurement playbooks; convening capacity with sovereigns and builders; funding for DPI primitives.',
      activities: 'Writing standards and playbooks, convening sovereigns with builders, and funding DPI primitives.',
      outputs: 'Published playbooks, convened sovereign–builder cohorts, and funded DPI primitives.',
    },
    roles: ['connection', 'capital', 'permission'],
    status: 'watching',
  },
  {
    area: 'economies-governance',
    opportunitySpace: 'Computational Coordination & Governance',
    title: 'A binding decision at scale',
    signal:
      'A city or government makes a consequential, binding decision through a computational mechanism with tens of thousands participating, beating the legacy process on cost, turnout, or trust.',
    cascade:
      'Deliberation tools move from advisory to part of real decision-making infrastructure.',
    contribution: {
      inputs: 'Support for computational-deliberation mechanisms (e.g. Simocracy, broad-listening tools); convening capacity.',
      activities: 'Supporting mechanism teams and convening government teams with tool teams.',
      outputs: 'Simocracy and broad-listening tools, and the government–tool convenings around them.',
    },
    roles: ['connection', 'capital'],
    status: 'watching',
    liveEvidence: {
      label: 'Simocracy governance simulation — live participation',
      href: '/areas/economies-governance/impact/live-dashboard/',
      note: 'Live activity from a PL-supported mechanism. This is contribution evidence (Q3) from a simulation — not the binding-decision-in-government threshold (Q2).',
    },
  },
  {
    area: 'economies-governance',
    opportunitySpace: 'Programmable Capital Allocation',
    title: 'Public goods become a financeable category',
    signal:
      '>$1B/yr flows through programmable allocation, a mainstream allocator (DFI, pension, sovereign fund) treats it as infrastructure, and a material real-world outcome is documented.',
    cascade:
      'Funding public goods becomes a durable capital market rather than a niche.',
    contribution: {
      inputs: 'Hypercerts (PL origin) and the Gitcoin / Funding-the-Commons lineage; PL evidence and standards work.',
      activities: 'Originating allocation mechanisms, building evidence and standards, and converting work into ventures.',
      outputs: 'Hypercerts, Funding the Commons, and the ventures spun out of this lineage.',
    },
    roles: ['infrastructure', 'capital', 'translation'],
    status: 'watching',
  },
  {
    area: 'economies-governance',
    opportunitySpace: 'Verifiable Real-World Infrastructure & Systems',
    title: 'Capital that pays on verified outcomes',
    signal:
      'A $1B+ climate or public-goods fund disburses against independently verified real-world outcomes, faster and cheaper than a legacy audit.',
    cascade:
      'Verification becomes the rail capital runs on; the loop back to better decisions closes.',
    contribution: {
      inputs: 'Funding for MRV / outcome-verification teams (e.g. GainForest, Glow); benchmark and standards convening.',
      activities: 'Backing MRV teams and convening benchmark and standards work for outcome verification.',
      outputs: 'GainForest, Glow, and the verification benchmarks and standards they inform.',
    },
    roles: ['legibility', 'connection', 'capital'],
    status: 'watching',
    liveEvidence: {
      label: 'GainForest & Glow — live verification activity',
      href: '/areas/economies-governance/impact/live-dashboard/',
      note: 'Live output from PL-backed MRV teams on this critical path. Contribution evidence (Q3) — not the $1B-disbursed-against-verified-outcomes threshold (Q2).',
    },
  },

  // ── FA4 · Neurotech ──────────────────────────────────────────────────────
  {
    area: 'neurotech',
    opportunitySpace: 'Neural Augmentation (BCI)',
    title: 'The BCI app store',
    signal:
      'A regulator clears a standardized software / API layer for a commercial BCI (with medical guardrails), and the first third-party app launches and is adopted.',
    cascade:
      'BCI value compounds after surgery; a developer ecosystem forms; demand shifts toward elective use.',
    contribution: {
      inputs: 'PL Neuro standards work for a BCI component ecosystem; convening capacity across regulators, device makers, and developers.',
      activities: 'Defining the BCI component-ecosystem standard and convening regulators, makers, and developers.',
      outputs: 'A draft BCI component / API standard and the regulator–maker–developer convenings around it.',
    },
    roles: ['connection', 'permission'],
    status: 'watching',
  },
  {
    area: 'neurotech',
    opportunitySpace: 'Biologically Inspired Intelligence (NeuroAI)',
    title: 'Neural distillation',
    signal:
      'A major lab matches frontier reasoning by training on human neural data at a fraction of the parameters / energy, or venture funding surges into consumer EEG to harvest cognitive data for AI.',
    cascade:
      'High-fidelity neural data becomes as valuable to AI as text; comp-neuro talent flow reverses.',
    contribution: {
      inputs: 'The PL Neuro talent network bridging AI labs and comp neuro; investment in neural-data infrastructure and norms.',
      activities: 'Bridging AI-lab and comp-neuro talent and building neural-data infrastructure and norms.',
      outputs: 'The PL Neuro talent network and the neural-data infrastructure and norms it seeds.',
    },
    roles: ['infrastructure', 'connection', 'capital'],
    status: 'watching',
  },
  {
    area: 'neurotech',
    opportunitySpace: 'Biologically Inspired Intelligence (NeuroAI)',
    title: 'The neuromorphic energy pivot',
    signal:
      'A brain-inspired model matches state-of-the-art performance at 3+ orders of magnitude better energy efficiency, and frontier labs begin acquiring neuromorphic startups.',
    cascade:
      'Neurally derived design becomes foundational to commercial AI; AI is tethered to neuroscience.',
    contribution: {
      inputs: 'Funding for NeuroAI / neuromorphic research and demos; benchmark design defining the efficiency target.',
      activities: 'Funding neuromorphic research and demos and defining the efficiency benchmark.',
      outputs: 'PL-funded NeuroAI demos and the energy-efficiency benchmarks that frame the target.',
    },
    roles: ['legibility', 'capital'],
    status: 'watching',
  },
  {
    area: 'neurotech',
    opportunitySpace: 'Whole Organism Emulation (WBE)',
    title: 'Memory retrieval in simulation',
    signal:
      'A reconstructed mouse connectome simulated in silico reproduces a specific behavior the biological mouse learned before its connectome was harvested.',
    cascade:
      'WBE turns from speculation into a benchmarked engineering discipline; serious policy engagement begins.',
    contribution: {
      inputs: 'PL Neuro benchmark definition; connectomics workshops and throughput targets; engineering capacity for a demo.',
      activities: 'Defining the WBE benchmark, running connectomics workshops, and engineering a reference demo.',
      outputs: 'The WBE benchmark, connectomics throughput targets, and a PL-engineered demo.',
    },
    roles: ['legibility', 'connection'],
    status: 'watching',
  },
]

export function pointsForArea(area: FocusAreaKey | 'all'): InflectionPoint[] {
  if (area === 'all') return INFLECTION_POINTS
  return INFLECTION_POINTS.filter((p) => p.area === area)
}
