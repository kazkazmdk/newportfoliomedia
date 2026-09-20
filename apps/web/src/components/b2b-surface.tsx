import Link from "next/link";
import { SITE_LABEL } from "@penta/monetization";
import { b2bNav, type B2BPage } from "@/lib/b2b-catalog";
import { LeadForm } from "@/components/lead-form";
import { LocalKeyForm } from "@/components/local-key-form";

export function B2BSurface({ page }: { page: B2BPage }) {
  return (
    <main className={`px-b2b is-${page.site} is-${page.surface}`}>
      <p className="px-b2b-kicker">{page.kicker}</p>
      <h1>{page.title}</h1>
      <p className="px-b2b-lede">{page.lede}</p>
      <nav className="px-b2b-nav" aria-label={`${SITE_LABEL[page.site]} operator`}>
        {b2bNav(page.site).map((item) => (
          <Link key={item.href} href={item.href} aria-current={item.href.endsWith(`/${page.surface}`) ? "page" : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>
      {page.sections.map((section) => (
        <section key={section.title} className="px-b2b-section">
          <h2>{section.title}</h2>
          <p>{section.body}</p>
          {section.code ? <pre><code>{section.code}</code></pre> : null}
        </section>
      ))}
      {page.surface === "contact-sales" || page.surface === "business" ? (
        <LeadForm site={page.site} kind={page.surface === "business" ? "sales_inquiry" : "sales_inquiry"} />
      ) : null}
      {page.surface === "developers" || page.surface === "api" ? <LocalKeyForm site={page.site} /> : null}
      {page.surface === "data" ? <LeadForm site={page.site} kind="data_license" /> : null}
      {page.surface === "widgets" ? <LeadForm site={page.site} kind="widget_embed" /> : null}
    </main>
  );
}
