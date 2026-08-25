import type { Metadata } from "next";
import { Suspense } from "react";
import { CompareTable } from "@/components/compare-table";

export const metadata: Metadata = { title: "Сравнение сортов", robots: { index: false } };

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="shell py-16">Загружаем сравнение…</div>}>
      <CompareTable />
    </Suspense>
  );
}
