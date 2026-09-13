import { ReactComponent as SkatLogo } from 'src/assets/icons/logo.svg'
import { ReactComponent as SkatSun } from 'src/assets/icons/meteo.svg'
import { NAV_LINKS } from 'src/lib/site'

export function Header() {
  return (
    <header className="fixed left-0 top-0 z-20 flex w-full items-center justify-between px-4 py-6 md:px-12 md:py-8">
      <a href="#/" aria-label="Skat Designer home">
        <SkatLogo className="h-5 w-auto" />
      </a>
      <nav className="relative flex max-w-[70%] flex-wrap items-center justify-end gap-x-4 gap-y-2 text-xs md:gap-8 md:text-base">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
        <span className="cursor-wait line-through">Store</span>
        <div className="absolute -bottom-8 right-0 hidden sm:block">
          <SkatSun />
        </div>
      </nav>
    </header>
  )
}
