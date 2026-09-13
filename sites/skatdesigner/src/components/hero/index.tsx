import { ReactComponent as Skat } from 'src/assets/icons/skat.svg'
import { ReactComponent as SkatSeparator } from 'src/assets/icons/separator.svg'

export const Hero = () => {
  return (
    <div className="flex min-h-screen">
      <section className="w-full py-32 md:py-48">
        <div className="container mt-16 flex h-full flex-col items-center justify-center gap-8 px-4 md:px-6">
          <h1 className="px-4 text-center text-7xl">
            You can tell <i className="font-serif">stories</i>
            <br />
            through{' '}
            <a href="" className="text-link" data-text="design">
              <strong>design</strong>
            </a>
            <br />
            with <Skat className="inline" />{' '}
            <a href="" className="text-link" data-text="creative skills">
              <strong>creative skills</strong>
            </a>
            <br />
            <a href="" className="text-link" data-text="ainnovation">
              <i className="font-serif">ai</i>
              <strong>nnovation</strong>
            </a>{' '}
            &{' '}
            <a href="" className="text-link" data-text="[wo]mankind">
              <i className="font-serif">[wo]</i>mankind.
            </a>
          </h1>
          <SkatSeparator className="h-4 w-auto" />
          <span>Skat Designer means scat music for intuition and cat for agility.</span>
        </div>
      </section>
    </div>
  )
}
