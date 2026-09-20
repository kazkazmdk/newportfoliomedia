import { B2BRoute, b2bMetadata } from "@/lib/b2b-page";

export const metadata = b2bMetadata("chargematch", "contact-sales");

export default function Page() {
  return <B2BRoute site="chargematch" surface="contact-sales" />;
}
