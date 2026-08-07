export type Resource = {
  name: string
  org: string
  url: string
  description: string
  tags: string[]
}

export const RESOURCES: Resource[] = [
  {
    name: 'Apollo-11 AGC source',
    org: 'NASA / MIT (public domain)',
    url: 'https://github.com/chrislgarry/Apollo-11',
    description: 'Original Comanche055 & Luminary099 guidance computer source listings.',
    tags: ['apollo', 'historic', 'AGC'],
  },
  {
    name: 'Virtual AGC',
    org: 'ibiblio / Ron Burkey',
    url: 'https://www.ibiblio.org/apollo/',
    description: 'AGC emulator, listings, and historical documentation.',
    tags: ['apollo', 'historic'],
  },
  {
    name: 'NASA Open Data',
    org: 'NASA',
    url: 'https://data.nasa.gov/',
    description: 'Catalog of NASA open datasets and APIs.',
    tags: ['data', 'API'],
  },
  {
    name: 'NASA Open APIs',
    org: 'NASA',
    url: 'https://api.nasa.gov/',
    description: 'Official NASA API portal (APOD, NEO, Mars, etc.).',
    tags: ['API'],
  },
  {
    name: 'JPL Horizons',
    org: 'NASA / JPL',
    url: 'https://ssd.jpl.nasa.gov/horizons/',
    description: 'Solar System ephemerides and body data.',
    tags: ['ephemerides'],
  },
  {
    name: 'NASA SPICE / NAIF',
    org: 'NASA / JPL',
    url: 'https://naif.jpl.nasa.gov/naif/',
    description: 'SPICE toolkit and kernels for trajectory geometry.',
    tags: ['SPICE'],
  },
  {
    name: 'CelesTrak',
    org: 'CelesTrak',
    url: 'https://celestrak.org/',
    description: 'TLE sets and satellite catalog utilities.',
    tags: ['TLE', 'catalog'],
  },
  {
    name: 'satellite.js',
    org: 'MIT license',
    url: 'https://github.com/shashwatak/satellite-js',
    description: 'Browser SGP4/SDP4 propagation library.',
    tags: ['SGP4', 'library'],
  },
  {
    name: 'Vallado software',
    org: 'David A. Vallado / CelesTrak',
    url: 'https://celestrak.org/software/vallado-sw.php',
    description: 'Companion code and papers for Fundamentals of Astrodynamics.',
    tags: ['algorithms'],
  },
  {
    name: 'ESA Open Data',
    org: 'ESA',
    url: 'https://www.esa.int/About_Us/Business_with_ESA/Open_Space_Innovation_Platform',
    description: 'ESA open innovation and data initiatives.',
    tags: ['data'],
  },
  {
    name: 'Space-Track',
    org: 'USSF',
    url: 'https://www.space-track.org/',
    description: 'Official orbital object catalog (registration required).',
    tags: ['catalog'],
  },
  {
    name: 'NASA GRC: Beginner’s Guide to Aeronautics',
    org: 'NASA Glenn',
    url: 'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/',
    description: 'Rocket equation, Isp, thrust, and dynamic pressure education pages.',
    tags: ['propulsion', 'aero', 'education'],
  },
  {
    name: 'NASA OCHMO CO₂ brief',
    org: 'NASA OCHMO',
    url: 'https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-004-carbon-dioxide.pdf',
    description: 'Crew metabolic and CO₂ exposure context for ECLSS education.',
    tags: ['ECLSS', 'crew'],
  },
  {
    name: 'NASA-STD-3001 / Human spaceflight standards',
    org: 'NASA',
    url: 'https://www.nasa.gov/ohp/standards/',
    description: 'Human-system standards overview (ppO₂ / atmosphere context).',
    tags: ['ECLSS', 'standards'],
  },
  {
    name: 'AeroVia Aerospace Tools',
    org: 'AeroVia',
    url: 'https://www.aerovia.org/tools',
    description: 'Public catalog of ISA, max-q, launch azimuth, RF link, and SSO-class calculators.',
    tags: ['calculators', 'reference'],
  },
  {
    name: 'BIPM SI Brochure',
    org: 'BIPM',
    url: 'https://www.bipm.org/en/publications/si-brochure',
    description: 'SI base units for unit conversion and reporting.',
    tags: ['SI', 'units'],
  },
  {
    name: 'SIDUS MCP server',
    org: 'sidus.tools',
    url: 'https://sidus.tools/api/mcp',
    description:
      'Public Streamable HTTP MCP endpoint: add the URL to any MCP client (no local install). Optional stdio for offline.',
    tags: ['MCP', 'AI', 'open-source'],
  },
]
