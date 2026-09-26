import type { Metadata } from "next";
import {
  CalculatorTabs,
  type CalculatorMode,
} from "@/components/calculator/CalculatorTabs";
import { PageHeader } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Kalkulator Ekspor Impor",
  description:
    "Hitung landed cost impor lengkap dengan bea masuk, PPN, dan PPh Pasal 22, atau susun harga jual ekspor FOB, CFR, dan CIF beserta titik impasnya.",
};

export default async function CalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const params = await searchParams;
  const initialMode: CalculatorMode =
    params.mode === "ekspor" ? "ekspor" : "impor";

  return (
    <>
      <PageHeader
        eyebrow="Kalkulator"
        title="Hitung biaya sampai rupiah terakhir"
        description="Kesalahan paling mahal dalam perdagangan lintas negara adalah menyepakati harga sebelum tahu seluruh komponen biayanya. Kalkulator ini memecah setiap pos, termasuk yang biasanya terlupakan."
      />

      <div className="container-page py-10">
        <CalculatorTabs initialMode={initialMode} />
      </div>
    </>
  );
}
