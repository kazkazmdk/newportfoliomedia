import Link from "next/link";
import { DESTINATIONS } from "@penta/wearthere";

export function WearthereFooter() {
  const list = [...DESTINATIONS].sort((a, b) => a.city.localeCompare(b.city));
  return (
    <footer className="wt-footer">
      <div>
        <p className="text-xs uppercase tracking-[0.22em]">Editorial index</p>
        <p className="wt-serif mt-4 text-4xl leading-none">Wear<br />There</p>
      </div>
      <div className="wt-dest-list">
        {list.map((d) => (
          <Link key={d.id} href={`/wearthere/${d.slug}`}>
            {d.city}
          </Link>
        ))}
      </div>
    </footer>
  );
}
