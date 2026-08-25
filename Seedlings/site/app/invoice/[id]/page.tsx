import type { Metadata } from "next";
import { InvoiceView } from "@/components/invoice-view";

export const metadata: Metadata = { title: "Накладная", robots: { index: false } };

export default async function InvoicePage(props: PageProps<"/invoice/[id]">) {
  const { id } = await props.params;
  return <InvoiceView id={decodeURIComponent(id)} />;
}
