import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "WhisperHunt AI | ทลายกำแพงความเงียบในห้องเรียน",
  description: "ระบบ AI สรุปความเข้าใจนักเรียน จัดกลุ่มปัญหา และช่วยครูจัดการเลคเชอร์ได้แบบ Real-time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${inter.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
