import type { Metadata } from "next";
import { ListingForm } from "@/components/posting/ListingForm";
import { PageHeader } from "@/components/ui/SectionHeading";
import type { ListingKind } from "@/lib/types";

export const metadata: Metadata = {
  title: "Buat Postingan",
  description:
    "Pasang penawaran ekspor sebagai eksportir, atau pasang permintaan pembelian sebagai importir.",
};

export default async function PostingPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const params = await searchParams;
  const initialKind: ListingKind =
    params.kind === "demand" ? "demand" : "supply";

  return (
    <>
      <PageHeader
        eyebrow="Buat Postingan"
        title="Pasang penawaran atau permintaan"
        description="Isi sedetail mungkin. Postingan yang jelas spesifikasinya jauh lebih sering ditanggapi, dan menghemat waktu tanya jawab di kemudian hari."
      />

      <div className="container-page py-10">
        <div className="mx-auto max-w-4xl">
          <ListingForm initialKind={initialKind} />
        </div>
      </div>
    </>
  );
}
