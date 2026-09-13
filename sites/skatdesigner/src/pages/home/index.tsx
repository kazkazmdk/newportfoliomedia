import { useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Hero } from 'src/components/hero'
import { PositionSections } from 'src/components/position-sections'
import { SITE_DESCRIPTION, SITE_NAME } from 'src/lib/site'

export default function Home() {
  const { t } = useTranslation('translation')
  const location = useLocation()

  useEffect(() => {
    const sectionId = location.pathname.replace(/^\//, '')
    const target = document.getElementById(sectionId || 'top')
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.pathname])

  return (
    <main id="top">
      <Helmet>
        <html lang="en" />
        <title>{t('title')}</title>
        <meta name="description" content={SITE_DESCRIPTION} />
        <meta property="og:title" content={SITE_NAME} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={SITE_NAME} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
      </Helmet>
      <Hero />
      <PositionSections />
    </main>
  )
}
