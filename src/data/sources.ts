export type SourceRef = {
  id: string
  name: string
  org: string
  url: string
  note: string
  license?: string
}

/**
 * Multi-source bibliography for tools. Prefer ≥2 independent references per formula tool.
 */
export const SOURCES: Record<string, SourceRef> = {
  'apollo-11': {
    id: 'apollo-11',
    name: 'Apollo-11 AGC source',
    org: 'NASA / MIT (public domain listings)',
    url: 'https://github.com/chrislgarry/Apollo-11',
    note: 'Comanche055 & Luminary099 guidance computer source. Algorithms reimplemented from published equations, not copied as binary/listing dumps.',
    license: 'Public domain (AGC listings)',
  },
  'virtual-agc': {
    id: 'virtual-agc',
    name: 'Virtual AGC',
    org: 'ibiblio / Ron Burkey',
    url: 'https://www.ibiblio.org/apollo/',
    note: 'AGC emulator, scanned listings, and historical documentation.',
    license: 'Mixed; documentation freely available',
  },
  vallado: {
    id: 'vallado',
    name: 'Fundamentals of Astrodynamics and Applications',
    org: 'David A. Vallado',
    url: 'https://celestrak.org/software/vallado-sw.php',
    note: 'Standard reference for two-body, Lambert, maneuvers, and J2. Equations implemented independently in SIDUS.',
    license: 'Book + companion software (see author terms)',
  },
  curtis: {
    id: 'curtis',
    name: 'Orbital Mechanics for Engineering Students',
    org: 'Howard D. Curtis',
    url: 'https://www.elsevier.com/books/orbital-mechanics-for-engineering-students/curtis/978-0-08-097747-8',
    note: 'Textbook derivations for Hohmann, vis-viva, rocket equation, elements.',
  },
  'satellite-js': {
    id: 'satellite-js',
    name: 'satellite.js',
    org: 'MIT License',
    url: 'https://github.com/shashwatak/satellite-js',
    note: 'Browser SGP4/SDP4 propagation library used by SIDUS satellite tools.',
    license: 'MIT',
  },
  celestrak: {
    id: 'celestrak',
    name: 'CelesTrak',
    org: 'CelesTrak',
    url: 'https://celestrak.org/',
    note: 'TLE sets, NORAD element documentation, and Vallado software companion hosting.',
  },
  'jpl-horizons': {
    id: 'jpl-horizons',
    name: 'JPL Horizons',
    org: 'NASA / JPL',
    url: 'https://ssd.jpl.nasa.gov/horizons/',
    note: 'Solar System ephemerides and body constants.',
  },
  'nasa-grc': {
    id: 'nasa-grc',
    name: 'NASA Glenn Research Center: Beginner’s Guide to Aeronautics',
    org: 'NASA GRC',
    url: 'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/',
    note: 'Ideal rocket equation, specific impulse, thrust equation, dynamic pressure education pages.',
  },
  aerovia: {
    id: 'aerovia',
    name: 'AeroVia Aerospace Tools',
    org: 'AeroVia (public calculators)',
    url: 'https://www.aerovia.org/tools',
    note: 'Public catalog of ISA, dynamic pressure, launch azimuth, RF link, SSO-class tools (domain demand reference).',
  },
  'itu-fspl': {
    id: 'itu-fspl',
    name: 'Free-space path loss (Friis / ITU-style FSPL)',
    org: 'ITU / standard radio engineering',
    url: 'https://en.wikipedia.org/wiki/Free-space_path_loss',
    note: 'L_fs = 20 log10(d_km) + 20 log10(f_MHz) + 32.44 dB form used in educational link budgets.',
  },
  'nasa-ochmo': {
    id: 'nasa-ochmo',
    name: 'NASA OCHMO CO₂ / metabolic technical briefs',
    org: 'NASA OCHMO',
    url: 'https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-004-carbon-dioxide.pdf',
    note: 'Crew metabolic loads and CO₂ exposure context for ECLSS educational models.',
  },
  'nasa-std-3001': {
    id: 'nasa-std-3001',
    name: 'NASA-STD-3001 (Human Spaceflight standards overview)',
    org: 'NASA',
    url: 'https://www.nasa.gov/ohp/standards/',
    note: 'Human-system standards context (ppO₂ / atmosphere). SIDUS flags are educational. They are not flight-rule substitutes.',
  },
  'nasa-cara': {
    id: 'nasa-cara',
    name: 'NASA Conjunction Assessment Risk Analysis (CARA)',
    org: 'NASA',
    url: 'https://www.nasa.gov/cara/step-2-close-approach-risk-assessment/',
    note: 'Public conjunction Pc practice. SIDUS implements an educational 2-D Chan/Alfriend-class formula, not an operational CARA product.',
  },
  iau: {
    id: 'iau',
    name: 'IAU / planetary constants practice',
    org: 'IAU',
    url: 'https://www.iau.org/',
    note: 'Astronomical constant conventions used alongside JPL body data.',
  },
  bipm: {
    id: 'bipm',
    name: 'SI Brochure (BIPM)',
    org: 'BIPM',
    url: 'https://www.bipm.org/en/publications/si-brochure',
    note: 'SI base units for converter categories.',
  },
  sidus: {
    id: 'sidus',
    name: 'SIDUS pure-SI implementation',
    org: 'sidus.tools',
    url: 'https://github.com/massimodeluisa/sidus-tools',
    note: 'Local pure-function implementations in src/lib/physics (educational, independent reimplementation).',
    license: 'MIT',
  },
  sutton: {
    id: 'sutton',
    name: 'Rocket Propulsion Elements',
    org: 'Sutton & Biblarz',
    url: 'https://www.wiley.com/en-us/Rocket+Propulsion+Elements-p-9781118753651',
    note: 'Standard propulsion text for rocket equation, Isp, and staged vehicles.',
  },
  isa: {
    id: 'isa',
    name: 'International Standard Atmosphere (ISO 2533 / ICAO)',
    org: 'ISO / ICAO',
    url: 'https://www.iso.org/standard/7472.html',
    note: 'ISA troposphere model used for educational density, temperature, and speed of sound.',
  },
  wiesel: {
    id: 'wiesel',
    name: 'Spaceflight Dynamics',
    org: 'William E. Wiesel',
    url: 'https://www.apogeebooks.com/Books/Spaceflight_Dynamics.html',
    note: 'Relative motion, rendezvous, and phasing context complementary to Vallado/Curtis.',
  },
  wertz: {
    id: 'wertz',
    name: 'Space Mission Engineering: The New SMAD',
    org: 'Wertz, Everett, Puschell (eds.)',
    url: 'https://www.microcosmpress.com/smad/',
    note: 'Mission engineering handbook: RF links, constellations, and ops framing.',
  },
  'space-track': {
    id: 'space-track',
    name: 'Space-Track / USSF catalog practice',
    org: '18th SDS / Space-Track.org',
    url: 'https://www.space-track.org/',
    note: 'Operational TLE distribution context (account required for live data). SIDUS uses public educational TLE samples only.',
  },
  'iss-eclss': {
    id: 'iss-eclss',
    name: 'ISS ECLSS overview literature',
    org: 'NASA ISS program (public summaries)',
    url: 'https://www.nasa.gov/international-space-station/',
    note: 'Public ISS life-support system context for educational O₂/CO₂/thermal models: not a flight-rule substitute.',
  },
}

export function resolveSources(ids?: string[]): SourceRef[] {
  if (!ids?.length) return []
  return ids.map((id) => SOURCES[id]).filter(Boolean)
}
