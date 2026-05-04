'use client'

import Breadcrumb from '@/components/Breadcrumb'
import {
  useRequireAdmin,
  usePageEdit,
  EditableField,
  EditBar,
  EditBarSpacer,
} from '@/components/InlineEdit'

type SubareaIconType =
  | 'dpi'
  | 'desci'
  | 'depin'
  | 'pgf'
  | 'defi'
  | 'degov'
  | 'network-states'
  | 'nations'
  | 'refi'

const SUBAREAS: { icon: SubareaIconType; title: string; tagline: string; description: string }[] = [
  {
    icon: 'dpi',
    title: '(Sovereign) DPI',
    tagline: 'Digital Public Infrastructure',
    description:
      'Nation-states run open, verifiable, privacy-preserving rails (identity, payments, registries, RWA, data + compute corridors).',
  },
  {
    icon: 'desci',
    title: 'DeSci',
    tagline: 'Decentralized Science',
    description:
      'Shifting from experiments to a full scientific stack (open data, reproducible research, verifiable pipelines, new funding instruments).',
  },
  {
    icon: 'depin',
    title: 'DePIN',
    tagline: 'Decentralized Physical Infrastructure Networks',
    description:
      'DePIN becomes a mainstream infra category (sovereign compute, energy, sensing, mapping, telecom, and resilience networks).',
  },
  {
    icon: 'pgf',
    title: 'Public Goods Funding',
    tagline: 'Sustainable Public Goods Markets',
    description:
      'PGF evolves into public markets for public goods (sustainable co-funding, repeatable granting, clear measurement, institutional legitimacy).',
  },
  {
    icon: 'defi',
    title: 'DeFi',
    tagline: 'Decentralized Finance',
    description:
      'DeFi achieves global democratized access to payments and savings in valuable asset categories (major currencies, stocks, bonds).',
  },
  {
    icon: 'degov',
    title: 'DeGov',
    tagline: 'Decentralized Governance',
    description:
      'Technology enables resilience towards misinformation and lifts the governance abilities of states and institutions.',
  },
  {
    icon: 'network-states',
    title: 'Network States',
    tagline: 'Digital-First Societies',
    description:
      'Network states develop permanent hubs and provide radical new ideas of how society can flourish.',
  },
  {
    icon: 'nations',
    title: 'Improving Nations',
    tagline: 'Computing-Enabled National Development',
    description:
      'Computing leapfrogs national economies and creates wealth and security for developing nations.',
  },
  {
    icon: 'refi',
    title: 'Climate / ReFi',
    tagline: 'Regenerative Finance',
    description:
      'New mechanisms enable sustainable climate finance. DePIN and MRV technology tackle the climate and biodiversity crisis.',
  },
]

export default function SubareasEditPage() {
  const { ready } = useRequireAdmin()
  const { get, set, isDirty, isLoading, isSaving, saveStatus, save, discard } =
    usePageEdit('area-eg-subareas')

  if (!ready || isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 pt-32 text-center text-gray-400">
        Loading…
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-16">
      <Breadcrumb
        items={[
          { label: 'Focus Areas', href: '/areas/' },
          { label: 'Economies & Governance', href: '/areas/economies-governance/' },
          { label: 'Subareas', href: '/areas/economies-governance/subareas/' },
          { label: 'Edit' },
        ]}
      />

      {/* Hero */}
      <div className="pt-8 pb-12 mb-12 border-b border-gray-100">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Page header</p>
        <EditableField
          value={get('hero', 'title')}
          onChange={(v) => set('hero', 'title', v)}
          placeholder="Subareas"
          className="text-2xl lg:text-[36px] font-semibold mb-3 leading-tight"
        />
        <EditableField
          value={get('hero', 'subtitle')}
          onChange={(v) => set('hero', 'subtitle', v)}
          multiline
          placeholder="Nine interconnected subfields, each representing a critical domain for economies and governance."
          className="text-lg text-gray-600 leading-relaxed max-w-2xl"
        />
      </div>

      {/* Subareas list */}
      <h2 className="text-sm text-gray-500 uppercase tracking-wide mb-6">Subareas</h2>
      <p className="text-sm text-gray-400 mb-8 max-w-2xl">
        Edit the title, tagline, and description for each subarea. Leave a field
        blank to fall back to the default copy.
      </p>

      <div className="space-y-10">
        {SUBAREAS.map((sub) => (
          <div key={sub.icon} className="border-l-2 border-gray-100 pl-5">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-mono">
              {sub.icon}
            </p>
            <EditableField
              value={get(sub.icon, 'title')}
              onChange={(v) => set(sub.icon, 'title', v)}
              placeholder={sub.title}
              className="text-base font-medium text-black mb-1"
            />
            <EditableField
              value={get(sub.icon, 'subtitle')}
              onChange={(v) => set(sub.icon, 'subtitle', v)}
              placeholder={sub.tagline}
              className="text-sm text-gray-400 mb-2"
            />
            <EditableField
              value={get(sub.icon, 'body')}
              onChange={(v) => set(sub.icon, 'body', v)}
              multiline
              placeholder={sub.description}
              className="text-sm text-gray-500 leading-relaxed"
            />
          </div>
        ))}
      </div>

      <EditBarSpacer />
      <EditBar
        isDirty={isDirty}
        isSaving={isSaving}
        saveStatus={saveStatus}
        onSave={save}
        onDiscard={discard}
      />
    </div>
  )
}
