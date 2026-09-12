import type { Metadata } from "next";
import "./globals.css";
import "./id-photo.css";

export const metadata: Metadata = {
  title: "รูปพร้อมใช้ — สร้างรูปข้าราชการและรูปสมัครงาน",
  description: "สร้างรูปข้าราชการ รูปสมัครงาน รูปนักเรียนและนักศึกษาให้สวยสมดุลพร้อมใช้",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">{children}</body>
    </html>
  );
}
