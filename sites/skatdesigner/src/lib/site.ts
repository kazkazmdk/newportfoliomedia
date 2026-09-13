export const SITE_NAME = 'Skat Designer'

export const SITE_DESCRIPTION =
  'Skat Designer means scat music for intuition and cat for agility. Stories told through design, creative skills, AInnovation and [wo]mankind.'

export const NAV_LINKS = [
  { href: '#/design', label: 'Design' },
  { href: '#/creative-skills', label: 'Creative Skills' },
  { href: '#/ai', label: 'AInnovation' },
] as const

export const HERO_LINKS = [
  { href: '#/design', label: 'design', dataText: 'design', strong: true },
  { href: '#/creative-skills', label: 'creative skills', dataText: 'creative skills', strong: true },
  { href: '#/ai', label: 'ainnovation', dataText: 'ainnovation', italicPrefix: 'ai', strongSuffix: 'nnovation' },
  { href: '#/mankind', label: '[wo]mankind', dataText: '[wo]mankind', italicPrefix: '[wo]', rest: 'mankind.' },
] as const

export const ROUTES = ['/', '/design', '/creative-skills', '/ai', '/mankind'] as const

export const POSITION_SECTIONS = [
  {
    id: 'design',
    title: 'Design',
    body: 'Visual and editorial design as a way to tell stories — not as a catalogue of invented clients.',
  },
  {
    id: 'creative-skills',
    title: 'Creative Skills',
    body: 'Craft and intuition: scat music for improvisation, cat for agility.',
  },
  {
    id: 'ai',
    title: 'AInnovation',
    body: 'Exploring how AI can sit inside a human creative process, without replacing it.',
  },
  {
    id: 'mankind',
    title: '[wo]mankind',
    body: 'Work made for people. The site stays a position statement until real projects are published here.',
  },
] as const
