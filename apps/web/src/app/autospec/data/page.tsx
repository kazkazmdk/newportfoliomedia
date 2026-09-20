import { B2BRoute, b2bMetadata } from "@/lib/b2b-page";

export const metadata = b2bMetadata("autospec", "data");

export default function Page() {
  return <B2BRoute site="autospec" surface="data" />;
}
