export const FOCUS_AREA_DESCRIPTIONS = {
  'digital-human-rights': 'Open, verifiable, censorship-resistant infrastructure to protect human freedom and agency',
  'economies-governance': 'Programmable infrastructure to coordinate people, organizations, and states more fairly and efficiently',
  'ai-robotics': 'Open compute, data, and coordination infrastructure to ensure human direction over AI',
  neurotech: 'Neural-interface and data infrastructure to expand human cognition',
} as const

export type FocusAreaSlug = keyof typeof FOCUS_AREA_DESCRIPTIONS
