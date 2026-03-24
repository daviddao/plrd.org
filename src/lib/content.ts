import publicationsData from '@/data/generated/publications.json'
import authorsData from '@/data/generated/authors.json'
import talksData from '@/data/generated/talks.json'
import tutorialsData from '@/data/generated/tutorials.json'
import blogData from '@/data/generated/blog.json'
import areasData from '@/data/generated/areas.json'
import sectionsData from '@/data/generated/sections.json'
import depGraphData from '@/data/generated/dependency-graph.json'

export type Publication = {
  slug: string
  title: string
  date: string
  authors: string[]
  venue: string
  doi: string
  publication_types: string[]
  areas: string[]
  abstract: string
  url_pdf: string
  url_source: string
  html: string
}

export type Author = {
  slug: string
  name: string
  role: string
  groups: string[]
  user_groups: string[]
  interests: string[]
  quote: string
  social: { icon?: string; link?: string }[]
  education: { courses?: { course?: string; institution?: string; year?: number }[] } | null
  avatarPath: string | null
  html: string
}

export type Talk = {
  slug: string
  title: string
  date: string
  venue: string
  venue_url: string
  venue_location: string
  authors: string[]
  areas: string[]
  abstract: string
  html: string
}

export type Tutorial = {
  slug: string
  title: string
  date: string
  summary: string
  html: string
}

export type BlogPost = {
  slug: string
  title: string
  date: string
  summary: string
  authors: string[]
  external_url: string
  html: string
}

export type Area = {
  slug: string
  title: string
  date: string
  summary: string
  leads: string[]
  advisors: string[]
  html: string
}

export type Section = {
  title: string
  html: string
}

export type DependencyGraphTooltip = {
  title: string
  body: string
  context: string
}

export type DependencyGraphEntry = {
  config: {
    id: string
    label: string
    sub: string
    color: string
    num: string
    bottlenecks: { id: string; label: string }[]
    gates: { id: string; label: string; quarter: string }[]
    strands: { id: string; label: string; sub: string }[]
    interventions: { id: string; label: string; sub: string; strands: string[] }[]
    feedbackLoops: { id: string; from: string; to: string; label: string }[]
  }
  tooltips: Record<string, DependencyGraphTooltip>
}

export const publications = publicationsData as Publication[]
export const authors = authorsData as Author[]
export const talks = talksData as Talk[]
export const tutorials = tutorialsData as Tutorial[]
export const blogPosts = blogData as BlogPost[]
export const areas = areasData as Area[]
export const sections = sectionsData as Record<string, Section>
export const dependencyGraphs = depGraphData as Record<string, DependencyGraphEntry>
