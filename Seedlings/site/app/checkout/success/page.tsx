import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderSuccess } from "@/components/order-success";

export const metadata: Metadata = { title: "Заказ принят", robots: { index: false } };

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="shell py-16">Загружаем заказ…</div>}>
      <OrderSuccess />
    </Suspense>
  );
}
