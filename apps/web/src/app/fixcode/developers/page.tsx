import { B2BRoute, b2bMetadata } from "@/lib/b2b-page";

export const metadata = b2bMetadata("fixcode", "developers");

export default function Page() {
  return <B2BRoute site="fixcode" surface="developers" />;
}
