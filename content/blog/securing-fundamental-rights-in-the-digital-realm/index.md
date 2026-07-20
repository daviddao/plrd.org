---
title: "Securing Fundamental Rights in the Digital Realm: The Infrastructure Freedom Now Runs On"
date: 2026-06-30
summary: "The digital foundations our fundamental rights now depend on."
authors:
  - will-scott
cover_image: "/images/blog/securing-fundamental-rights-in-the-digital-realm/hero.png"
---
<figure class="post-figure post-hero"><img src="/images/blog/securing-fundamental-rights-in-the-digital-realm/hero.png" alt="Securing fundamental rights in the digital realm." /></figure>

*Part of a series introducing the focus areas of PL R&D.*

Our information environment is being reshaped in real time by algorithms, networks, protocols, platforms, and adversaries that move faster than the institutions meant to govern them. Digital infrastructure like core internet protocols, already shapes how we speak, gather, and keep our lives private. We now need to ensure we build the infrastructure to protect those freedoms faster, and more wisely, than that same infrastructure can be turned against them.

The types of freedoms we mean are specific: freedom of speech (to seek, receive, and impart information regardless of frontiers); freedom of peaceful assembly and association; the right to privacy; recognition everywhere as a person before the law; and the freedom of thought and self-determination that underwrites them all. Far from new, each was hard-won through long debate.

<figure><img src="/images/blog/securing-fundamental-rights-in-the-digital-realm/web3-summit-2019.png" alt="Juan Benet presenting &lsquo;Some Web3 values&rsquo; at the Web3 Summit, 2019" style="width:100%;height:auto;border-radius:0.5rem" /><figcaption style="color:var(--color-gray-500)">Juan Benet, CEO of Protocol Labs, discussing the importance of embedding fundamental rights into software at the web3 Summit in 2019.</figcaption></figure>

At PL R&D, we know that the infrastructure we build today will determine which of these freedoms can be exercised tomorrow. To preserve and extend them, we continue to invest in research, funding, and product development across four interconnected opportunity spaces. These are the frontiers where a technical breakthrough can become a durable protection for a specific right, rather than one more tool for eroding it.

## The Framework: Four Layers of Sovereign Infrastructure

We organize our work into four layers, each sustaining specific rights:

* **Censorship-Resistant Communication.** Keeping communication and connectivity alive even in low-connectivity, partitioned, or adversarial environments to sustain freedom of expression and of assembly and association.
* **Portable Identity, Credentials & Trust.** Verifiable credentials and portable reputation owned by the individual rather than the platform to sustain recognition as a person before the law, and privacy.
* **Verifiable Public Knowledge & Provenance.** Durable, tamper-evident records and standards for non-intermediated trust to sustain the right to seek and receive accurate information, and to share in collective knowledge.
* **Agency & Governance.** Privacy-preserving systems through which humans (and the AI agents acting for them) can coordinate, transact, and reach consensus to sustain self-determination and freedom of thought.

## Opportunity Space 1: Censorship-Resistant Communication

### What it is

Keeping communication and connectivity alive even in low-connectivity, partitioned, or adversarial environments. The frontier has moved past simple encryption toward metadata-resistance (hiding not just what you say but whom you say it to) and partition-tolerance (staying connected when the network is deliberately fragmented).

### Why it matters

Speech and assembly are the first freedoms to go in any adversarial environment, and both assume you can reach other people, an assumption that residential and cellular networks, controlled by a few incumbents and the states that license them, can revoke at will.

### Progress so far

Nation-state-independent connectivity is appearing, low-earth-orbit satellite networks such as [Starlink](https://www.starlink.com/) decouple a person's ability to get online from the institutions that govern local access. Metadata-resistant tooling such as [Kohaku](https://github.com/ethereum/kohaku) (Ethereum Foundation) is productionizing Private Information Retrieval and mix networks inside a wallet, so that messages, and the patterns of who contacts whom, leak as little as possible. And modular networking stacks such as [libp2p](https://libp2p.io/) let applications find one another and stay connected even when traditional rails fail.

### Inflection point: communication that cannot be switched off.

The step-change comes when nation-state-independent connectivity and metadata-resistant messaging reach consumer scale, so that during a deliberate shutdown a measurable share of a population stays connected and able to organize. Observable, and not yet true: a global connectivity provider offers consumer-scale service without state licensing or identity gating, and a metadata-resistant messenger crosses tens of millions of users under real adversarial conditions. At that point censoring who may speak or gather online becomes impractical rather than merely illegal.

## Opportunity Space 2: Portable Identity, Credentials & Trust

### What it is

Verifiable credentials and portable reputation owned by the individual rather than the platform, for humans and, increasingly, for the agents acting on their behalf, without depending on a centralized government ID or on expert-level key management.

### Why it matters

Identity is how a person is recognized, and today that recognition is mostly rented from platforms and states: lose the account or the document and you lose the standing. Without portability, people are trapped in whatever platform first issued their identity; without privacy, identity becomes a surveillance dossier. This sustains recognition as a person before the law, and privacy.

### Progress so far

Open social protocols such as the [Authenticated Transfer (AT) Protocol](https://atproto.com/) behind [Bluesky](https://bsky.app/) give people a credible exit: identity and data bind to a portable identifier the user controls, so a whole social graph can move between providers without loss. Sybil-resistant systems such as [World](https://world.org/) establish that someone is a unique human without tying that proof to a state document. And zero-knowledge credential systems, spanning age verification, passkeys, and verifiable credentials, let a person prove one specific claim while disclosing as little as possible.

### Inflection point: personhood without the state in the loop.

The step-change comes when a service at real scale, more than 100 million people, verifies unique humans for everyday services without anchoring them to a nation-state identity or KYC. Observable, and not yet true: today's proof-of-personhood systems operate well below that scale and outside mainstream services. When one crosses it, recognition as a person need no longer be rented from a state or a platform, and privacy-preserving personhood becomes safe to build on.

## Opportunity Space 3: Verifiable Public Knowledge & Provenance

### What it is

Durable, tamper-evident records and standards for non-intermediated trust: systems that can prove a knowledge artifact has not been altered, and keep proving it over time.

### Why it matters

The rights to seek, receive, and share information depend on a shared public record people can trust. The ability to prove a piece of information is authentic has always underpinned that record, and as AI-generated content floods the internet that ability gets far more fragile and far more urgent. As global truth gets harder to verify, trust retreats into small private circles, a dark forest in which a common, checkable account of what happened ceases to exist.

### Progress so far

Content addressing, as in [IPFS](https://ipfs.tech/), gives every file a verifiable identifier derived from its contents, so a reader can confirm data is exactly what was published. Provenance frameworks such as [Starling Lab](https://www.starlinglab.org/) establish verifiable chains of custody for journalism and historical records. Large-scale archives such as the [Internet Archive](https://archive.org/) preserve digital history at scale. And formal-verification systems such as [Lean](https://lean-lang.org/), with zero-knowledge proofs of execution, extend provenance from documents to [the computations that produced them](https://blog.atlascomputing.org/p/a-refinement-based-paradigm-for-code).

### Inflection point: provenance becomes the default for truth.

The step-change comes when content authenticity stops being optional. Observable, and not yet true: two consecutive generations of frontier AI models ship attested provenance tooling by default, and at least one major platform or archive adopts content-addressed provenance as the default for its public record. As synthetic content becomes indistinguishable from the real thing, a public record that can prove its own integrity becomes the precondition for accurate information meaning anything at all.

## Opportunity Space 4: Sovereign Infrastructure for AI & Agents

### What it is

The open environment, compute, storage, and identity, that lets AI agents coordinate and transact on our behalf: open enough to be permissionless, accountable enough to keep humans in charge.

### Why it matters

AI is becoming a powerful extension of each of us and of the institutions around us, and the open question is whether that capability stays under individual human control or concentrates in a few hands. An agent that acts on your behalf only extends your agency if you, and not a single platform, govern the compute, storage, and identity it runs on. This is where self-determination and freedom of thought are won or lost.

### Progress so far

Open storage markets such as [Filecoin](https://www.filecoin.io/) run on independent providers rather than one centralized host, so no single party can deny, alter, or lose your data. Fully homomorphic encryption environments such as [Zama](https://www.zama.org/) let computation run directly on encrypted data, so agents can coordinate in public without exposing what they hold. And open compute protocols such as [Gensyn](https://www.gensyn.ai/) and [Prime Intellect](https://www.primeintellect.ai/) train models across independent, globally distributed hardware rather than inside a single lab.

### Inflection point: agents run on open rails.

The step-change comes when serious AI capability no longer requires a single provider's stack. Observable, and not yet true: a frontier-scale model is trained across independent, decentralized hardware rather than one company's cluster, or a meaningful share of agent-to-agent economic activity settles on open, permissionless compute, storage, and identity rather than inside one platform. At that point the rights architecture of the agent economy is set in the open rather than by whoever owns the cluster.

## Building the field

The next few years will decide whether these freedoms are quietly curtailed or deliberately extended. Human freedom can be hollowed out when infrastructure is centralized, surveilled, or switched off, and PL R&D focuses on the root system a free digital society stands on. We do not build every piece; we connect them, and aim our toolkit, field-building communications, convenings, grants, venture support, and policy and standards work, at the blockers specific to this field. (That toolkit is described in the PL R&D Overview.) PL's foundational primitives here, IPFS, libp2p, and content-addressed data, are among the strongest in the portfolio.

## Get involved

If you are working on any of these four layers, we want to hear from you:

* **Founders and researchers** building censorship-resistant communication, portable identity, verifiable provenance, or agent infrastructure: tell us what you are building and where you are stuck.
* **Investors and funders** who want to co-fund this frontier or respond to a specific Request for Startups.
* **Policymakers, journalists, and civil-society groups** who depend on these guarantees in practice: partner with us on real-world deployments and the evidence that comes from them.

The rights we refuse to lose will be defended in the infrastructure, or not at all. Join us.
