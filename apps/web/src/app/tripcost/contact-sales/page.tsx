import { B2BRoute, b2bMetadata } from "@/lib/b2b-page";

export const metadata = b2bMetadata("tripcost", "contact-sales");

export default function Page() {
  return <B2BRoute site="tripcost" surface="contact-sales" />;
}
