import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pokédex | Biblioteca Digital de Criaturas",
  description: "Descubre más de 1000 Pokémon con información detallada, estadísticas, movimientos y evoluciones.",
};

export default function PokemonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <nav className="bg-neutral-900/95 backdrop-blur border-b border-neutral-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="text-white font-bold text-xl hover:text-yellow-400 transition-colors"
            >
              ← Inicio
            </Link>
            <h1 className="text-white font-bold text-lg">Pokédex</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </nav>
      <div className="bg-neutral-900 min-h-screen">
        {children}
      </div>
    </>
  );
}