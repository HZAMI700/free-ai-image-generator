import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prism AI — Free AI Image Generator SaaS",
  description:
    "Generate stunning AI images completely free. No login, no registration, no subscription. High quality multi-cluster AI image generation.",
  keywords: [
    "AI Image Generator",
    "Free AI Image",
    "No login AI",
    "Stable Diffusion",
    "Flux Schnell",
    "Free SaaS",
  ],
  authors: [{ name: "Prism AI Studio" }],
  openGraph: {
    title: "Prism AI — Free AI Image Generator",
    description: "Generate stunning AI images for free. No account required.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
