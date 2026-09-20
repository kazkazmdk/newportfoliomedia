import Link from "next/link";
import { SITE_LABEL } from "@penta/monetization";
import { b2bNav, type B2BPage } from "@/lib/b2b-catalog";
import { playgroundCurl, productOperatorStory, productStory } from "@/lib/b2b-product";
import { LeadForm } from "@/components/lead-form";

export function B2BSurface({ page }: { page: B2BPage }) {
  const story = productStory(page.site);
  const curl = playgroundCurl(page.site, page.surface);
  return (
    <main className={`px-b2b is-${page.site} is-${page.surface}`}>
      {page.site === "fixcode" ? <p className="px-b2b-kicker">Service tree · {page.kicker}</p> : null}
      {page.site === "autospec" ? <p className="px-b2b-kicker">Identity plate · {page.kicker}</p> : null}
      {page.site === "chargematch" ? <p className="px-b2b-kicker">Power bench · {page.kicker}</p> : null}
      {page.site === "tripcost" ? <p className="px-b2b-kicker">Corridor desk · {page.kicker}</p> : null}
      {page.site === "wearthere" ? <p className="px-b2b-kicker">Masthead · {page.kicker}</p> : null}
      <h1>{page.title}</h1>
      <p className="px-b2b-lede">{story.hero} {page.lede}</p>
      <p>{story.proof}</p>
      <nav className="px-b2b-nav" aria-label={`${SITE_LABEL[page.site]} operator`}>
        {b2bNav(page.site).map((item) => (
          <Link key={item.href} href={item.href} aria-current={item.href.endsWith(`/${page.surface}`) ? "page" : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>
      {page.surface === "business" || page.surface === "developers" ? (
        <section className="px-b2b-section">
          <h2>{productOperatorStory(page.site).title}</h2>
          <p>{productOperatorStory(page.site).body}</p>
        </section>
      ) : null}
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
      {page.surface === "developers" || page.surface === "api" || page.surface === "docs" ? (
        <section className="px-b2b-section">
          <h2>Real contract samples</h2>
          <p>Request</p>
          <pre><code>{JSON.stringify(story.sample, null, 2)}</code></pre>
          <p>Unknown entity</p>
          <pre><code>{JSON.stringify(story.error, null, 2)}</code></pre>
          {curl ? <pre><code>{curl}</code></pre> : null}
          <p><Link href="/platform/keys">Issue a local key from the dashboard</Link> — not from this public page.</p>
        </section>
      ) : null}
      {page.surface === "data" ? <LeadForm site={page.site} kind="data_license" /> : null}
      {page.surface === "widgets" ? <LeadForm site={page.site} kind="widget_embed" /> : null}
    </main>
  );
}
