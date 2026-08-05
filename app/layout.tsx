import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "나만 아니면 돼!!! · 랜덤 배정 게임",
  description: "운전자, 차량 좌석, 방 배정을 룰렛으로 정하는 야유회 게임.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
