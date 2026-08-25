import type { Metadata } from "next";
import { FavoritesView } from "@/components/favorites-view";

export const metadata: Metadata = { title: "Избранное", robots: { index: false } };

export default function FavoritesPage() {
  return <FavoritesView />;
}
