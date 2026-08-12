import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Raahi Radio — The music between places",
  description: "A living bus radio tuned to your route, the hour and the weather.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Raahi Radio — The music between places",
    description: "A living bus radio tuned to your route, the hour and the weather.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Raahi Radio on the road" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Raahi Radio — The music between places",
    description: "A living bus radio tuned to your route, the hour and the weather.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
