import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProjectPilot",
  description: "Un espace clair pour organiser vos projets et faire avancer vos idées.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ fontFamily: `var(--font-manrope)` }}>
        {children}
      </body>
    </html>
  );
}
