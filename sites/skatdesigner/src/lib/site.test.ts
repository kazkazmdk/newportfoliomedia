import { describe, expect, it } from 'vitest'
import { HERO_LINKS, NAV_LINKS, ROUTES, SITE_DESCRIPTION, SITE_NAME } from './site'

describe('skatdesigner public links', () => {
  it('exposes only real in-page destinations', () => {
    for (const link of [...NAV_LINKS, ...HERO_LINKS]) {
      expect(link.href.startsWith('#/')).toBe(true)
      expect(link.href.length).toBeGreaterThan(2)
    }
  })

  it('keeps homepage and section routes', () => {
    expect(ROUTES).toContain('/')
    expect(ROUTES).toContain('/design')
    expect(ROUTES).toContain('/creative-skills')
    expect(ROUTES).toContain('/ai')
  })

  it('does not publish starter metadata', () => {
    expect(SITE_NAME).toBe('Skat Designer')
    expect(SITE_DESCRIPTION.toLowerCase()).not.toContain('vite react ts tailwind starter')
    expect(SITE_DESCRIPTION.toLowerCase()).not.toContain('pages.dev')
  })
})
