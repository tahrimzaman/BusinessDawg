export const systemsQuery = `*[_type == "system"] | order(order asc) {
  _id, name, "slug": slug.current, tagline, description,
  deliverables, starterPack, ctaType, gradient
}`;

export const systemBySlugQuery = `*[_type == "system" && slug.current == $slug][0]`;

export const founderVenturesQuery = `*[_type == "founder_venture"] | order(_createdAt asc) {
  _id, name, "slug": slug.current, tagline, ownerRole, timeline, liveUrl,
  businessDescription, outcome
}`;

export const caseStudiesQuery = `*[_type == "case_study"] | order(_createdAt desc) {
  _id, title, "slug": slug.current, client, role, timeline, isConcept,
  problem, outcome
}`;

export const settingsQuery = `*[_type == "settings"][0]`;
