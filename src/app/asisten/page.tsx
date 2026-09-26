import type { Metadata } from "next";
import { ChatPanel } from "@/components/assistant/ChatPanel";
import { PageHeader } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Asisten AI",
  description:
    "Tanya apa saja soal ekspor impor: kode HS, Incoterms, dokumen wajib, cara menghitung bea masuk, dan strategi mencari pembeli.",
};

export default async function AssistantPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;

  // Pertanyaan bisa diisi dari halaman lain, mis. dari detail postingan.
  const initialQuestion =
    typeof params.q === "string" ? params.q.slice(0, 4000) : undefined;

  return (
    <>
      <PageHeader
        eyebrow="Asisten AI"
        title="Tanya soal ekspor impor"
        description="Asisten ini sudah dibekali konteks perdagangan Indonesia: struktur pungutan impor, alur dokumen, Incoterms, dan lembaga mana yang harus dituju untuk apa. Ia juga sengaja tidak menyebut angka tarif sebagai kepastian, karena tarif berubah dan berbeda per kode HS."
      />

      <div className="container-page py-10">
        <ChatPanel initialQuestion={initialQuestion} />
      </div>
    </>
  );
}
