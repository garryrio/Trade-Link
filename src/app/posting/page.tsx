import type { Metadata } from "next";
import { ListingForm } from "@/components/posting/ListingForm";
import { Callout } from "@/components/ui/Callout";
import { PageHeader } from "@/components/ui/SectionHeading";
import { isEphemeralStore } from "@/lib/store";
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
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Di serverless, penyimpanan di memori tidak dibagi antar instance,
              jadi postingan bisa hilang secara acak. Lebih baik pengguna tahu
              sebelum mengisi form panjang daripada kecewa sesudahnya. */}
          {isEphemeralStore() && (
            <Callout tone="warning" title="Postingan di demo ini tidak tersimpan permanen">
              Versi yang Anda buka berjalan di lingkungan serverless tanpa
              database. Postingan yang Anda buat mungkin hilang dalam beberapa
              menit atau tidak muncul sama sekali di daftar marketplace. Silakan
              tetap mencoba formulirnya, tetapi jangan mengandalkannya untuk
              penawaran sungguhan.
            </Callout>
          )}

          <ListingForm initialKind={initialKind} />
        </div>
      </div>
    </>
  );
}
