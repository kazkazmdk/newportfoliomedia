import { ReactComponent as SkatLogo } from 'src/assets/icons/logo.svg'
import { ReactComponent as SkatSun } from 'src/assets/icons/meteo.svg'

export function Header() {
  return (
    <div className="fixed left-0 top-0 flex w-full items-center justify-between px-4 py-8 md:px-12">
      <a href="/">
        <SkatLogo className="h-5 w-auto" />
      </a>
      <div className="relative flex items-center gap-8 text-xs md:text-base">
        <a href="">Design</a>
        <a href="">Creative Skills</a>
        <a href="">AInnovation</a>
        <span className="cursor-wait line-through">Store</span>
        <div className="absolute -bottom-8 right-0">
          <SkatSun />
        </div>
      </div>
    </div>
  )
}
