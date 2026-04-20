'use client'

import { use } from 'react'
import OpportunitySpaceEditor from '@/components/OpportunitySpaceEditor'

type Props = { params: Promise<{ slug: string }> }

export default function EditOpportunitySpacePage({ params }: Props) {
  const { slug } = use(params)
  return <OpportunitySpaceEditor areaSlug="neurotech" areaLabel="Neurotech" slug={slug} />
}
