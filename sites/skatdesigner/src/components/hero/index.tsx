import { ReactComponent as Skat } from 'src/assets/icons/skat.svg'
import { ReactComponent as SkatSeparator } from 'src/assets/icons/separator.svg'
import { HERO_LINKS } from 'src/lib/site'

export const Hero = () => {
  return (
    <div className="flex min-h-[80vh] md:min-h-screen">
      <section className="w-full py-24 md:py-48">
        <div className="container mt-16 flex h-full flex-col items-center justify-center gap-8 px-4 md:px-6">
          <h1 className="px-4 text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
            You can tell <i className="font-serif">stories</i>
            <br />
            through{' '}
            <a href={HERO_LINKS[0].href} className="text-link" data-text={HERO_LINKS[0].dataText}>
              <strong>design</strong>
            </a>
            <br />
            with <Skat className="inline" />{' '}
            <a href={HERO_LINKS[1].href} className="text-link" data-text={HERO_LINKS[1].dataText}>
              <strong>creative skills</strong>
            </a>
            <br />
            <a href={HERO_LINKS[2].href} className="text-link" data-text={HERO_LINKS[2].dataText}>
              <i className="font-serif">ai</i>
              <strong>nnovation</strong>
            </a>{' '}
            &{' '}
            <a href={HERO_LINKS[3].href} className="text-link" data-text={HERO_LINKS[3].dataText}>
              <i className="font-serif">[wo]</i>mankind.
            </a>
          </h1>
          <SkatSeparator className="h-4 w-auto" />
          <span className="px-4 text-center">Skat Designer means scat music for intuition and cat for agility.</span>
        </div>
      </section>
    </div>
  )
}
