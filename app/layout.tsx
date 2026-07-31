import type { Metadata } from "next";
import "./globals.css";
import RaceOverview from "./RaceOverview";

export const metadata: Metadata = {
  title: "BMW Apex — Autobahn Rush",
  description: "BMW 차량을 선택하고 독일 아우토반을 질주하는 탑다운 아케이드 레이싱 게임.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}<RaceOverview /></body></html>;
}
