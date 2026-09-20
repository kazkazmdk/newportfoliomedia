import { B2BRoute, b2bMetadata } from "@/lib/b2b-page";

export const metadata = b2bMetadata("wearthere", "business");

export default function Page() {
  return <B2BRoute site="wearthere" surface="business" />;
}
