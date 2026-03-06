import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LEGAL-OS — 한국 거주 외국인 행정 자동화",
  description: "비자 유지, 임금 보호, 주거 안전을 월 4,900원으로 자동화합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body style={{
        fontFamily: `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif`,
        backgroundColor: "#F5F5F7",
        margin: 0, padding: 0,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}>
        {children}
      </body>
    </html>
  );
}