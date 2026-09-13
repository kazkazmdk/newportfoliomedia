import { LanguageSelector } from 'src/components/language-selector'
import { SITE_NAME } from 'src/lib/site'

export function Footer() {
  return (
    <footer className="relative z-10 mt-12 flex w-full items-center justify-between px-4 py-8 md:px-12">
      <p className="text-xs md:text-base">{SITE_NAME}</p>
      <LanguageSelector />
    </footer>
  )
}
