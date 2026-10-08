import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Raphael AI — Free Unlimited AI Image Generator",
  description:
    "Generate stunning AI images completely free with FLUX.1 & SDXL multi-cluster routing. No login, no registration, no subscription, 100% free.",
  keywords: [
    "Raphael AI",
    "Free AI Image Generator",
    "FLUX.1 schnell",
    "Stable Diffusion XL",
    "Cloudflare Workers AI",
    "Hugging Face",
    "Text to Image",
    "No login AI generator",
  ],
  authors: [{ name: "Raphael AI Team" }],
  openGraph: {
    title: "Raphael AI — Free Unlimited AI Image Generator",
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
      <body className="antialiased font-sans bg-[#FAFAF9] text-stone-900 dark:bg-[#191410] dark:text-stone-100">
        {children}
      </body>
    </html>
  );
}
