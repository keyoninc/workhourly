import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorkHourly | Modern Multi-tenant Groupware",
  description: "Next-generation groupware for efficient business management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
