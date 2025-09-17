import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Digimon Database | Biblioteca Digital de Criaturas",
  description: "Explora el mundo digital con información completa sobre Digimon, sus digievoluciones y habilidades especiales.",
};

export default function DigimonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <nav className="bg-gradient-to-r from-orange-900/95 to-red-900/95 backdrop-blur border-b border-orange-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="text-white font-bold text-xl hover:text-orange-300 transition-colors"
            >
              ← Inicio
            </Link>
            <h1 className="text-white font-bold text-lg">Digimon Database</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </nav>
      <div className="bg-gradient-to-br from-neutral-900 via-orange-950 to-red-950 min-h-screen">
        {children}
      </div>
    </>
  );
}