import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import CartDrawer from "@/components/CartDrawer";
import { ThemeProvider } from "@/components/ThemeProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "K.T AQUARIUM | Luxury Showroom & Aquascaping Experience",
  description: "Transform your spaces with bespoke luxury aquariums, rare exotic fish, professional aquascaping, and premium maintenance services. Enter the world of high-end marine exhibits.",
  keywords: ["aquarium", "luxury aquarium", "bespoke aquascaping", "K.T Aquarium", "exotic fish", "marine reef tank", "premium aquariums"],
  authors: [{ name: "K.T AQUARIUM" }],
  openGraph: {
    title: "K.T AQUARIUM | Luxury Showroom & Aquascaping Experience",
    description: "Transform your spaces with bespoke luxury aquariums, rare exotic fish, professional aquascaping, and premium maintenance services.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${plusJakarta.variable} h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('kt-aquarium-theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const theme = saved || (prefersDark ? 'dark' : 'light');
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(theme);
                document.documentElement.setAttribute('data-theme', theme);
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-text transition-colors duration-300 font-sans antialiased overflow-x-hidden">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                {children}
                <CartDrawer />
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

