import { POSITION_SECTIONS } from 'src/lib/site'

export function PositionSections() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-16 px-4 pb-24 pt-8 md:px-6">
      {POSITION_SECTIONS.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-28">
          <h2 className="mb-3 text-2xl md:text-3xl">{section.title}</h2>
          <p className="max-w-2xl text-base leading-relaxed md:text-lg">{section.body}</p>
        </section>
      ))}
    </div>
  )
}
