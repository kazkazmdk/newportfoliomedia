export const PREVIEW_PRODUCTS = ["fixcode", "wearthere", "chargematch", "autospec", "tripcost"] as const;

export type PreviewProduct = (typeof PREVIEW_PRODUCTS)[number];

export function previewProduct(): PreviewProduct | null {
  const raw = (process.env.PENTA_PREVIEW_PRODUCT ?? "").trim().toLowerCase();
  return (PREVIEW_PRODUCTS as readonly string[]).includes(raw) ? (raw as PreviewProduct) : null;
}

export function previewHomePath(product = previewProduct()): `/${PreviewProduct}` | "/" {
  return product ? `/${product}` : "/";
}
