import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Brain, Home, PenTool, Network, Settings, Github } from "lucide-react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SageMap - Map Your Evolving Beliefs",
  description: "Discover, map, and evolve your belief system over time with AI-powered introspection",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-3JVFXBEWYM"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3JVFXBEWYM');
          `
        }}></script>
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">SageMap</span>
              </Link>

              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
                <Link href="/journal" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <PenTool className="w-4 h-4" />
                  <span>Journal</span>
                </Link>
                <Link href="/graph" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <Network className="w-4 h-4" />
                  <span>Graph</span>
                </Link>
                <Link href="/settings" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <a 
                  href="https://github.com/Siddhant-K-code/SageMap" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-black text-white hover:bg-gray-800 px-3 py-2 rounded-md transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
