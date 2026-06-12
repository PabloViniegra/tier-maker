import type { LegalSection } from '@/lib/legal/content'

type LegalSectionsProps = {
  sections: LegalSection[]
}

export function LegalSections({ sections }: LegalSectionsProps) {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
      {sections.map((section) => (
        <section key={section.title}>
          <h3 className="mb-1 font-heading text-sm font-semibold text-foreground">
            {section.title}
          </h3>
          <p>{section.content}</p>
        </section>
      ))}
    </div>
  )
}
