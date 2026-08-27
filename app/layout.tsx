import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cc-visao-profetica.solysprojetos.chatgpt.site"),
  title: {
    default: "CC Visão Profética",
    template: "%s | CC Visão Profética",
  },
  description:
    "Portal oficial da Comunidade Cristã Visão Profética: cultos, células, cursos, eventos, ministérios e inscrições.",
  openGraph: {
    title: "Comunidade Cristã Visão Profética",
    description:
      "Um lugar para viver a presença de Deus, crescer e descobrir seu propósito.",
    type: "website",
    locale: "pt_BR",
    url: "https://cc-visao-profetica.solysprojetos.chatgpt.site",
    siteName: "CC Visão Profética",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Comunidade Cristã Visão Profética" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Comunidade Cristã Visão Profética",
    description:
      "Um lugar para viver a presença de Deus, crescer e descobrir seu propósito.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/logo-oficial.webp",
    shortcut: "/logo-oficial.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
