import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Biblioteca Digital de Criaturas
        </h1>
        <p className="text-xl text-neutral-300 mb-12">
          Explora el fascinante mundo de Pokémon y Digimon
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pokémon Card */}
          <Link href="/pokemon" className="group">
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-blue-500/20">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Image
                    src="/pokeball-bg.svg"
                    alt="Pokéball"
                    width={120}
                    height={120}
                    className="drop-shadow-2xl group-hover:rotate-12 transition-transform duration-300"
                  />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Pokédex</h2>
              <p className="text-blue-100 mb-6 leading-relaxed">
                Descubre más de 1000 Pokémon con información detallada, 
                estadísticas, movimientos y evoluciones.
              </p>
              <div className="flex justify-center">
                <span className="bg-white/20 text-white px-6 py-3 rounded-full font-semibold group-hover:bg-white/30 transition-colors duration-300">
                  Explorar Pokémon →
                </span>
              </div>
            </div>
          </Link>

          {/* Digimon Card */}
          <Link href="/digimon" className="group">
            <div className="bg-gradient-to-br from-orange-600 to-red-700 rounded-2xl p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-orange-500/20">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-[120px] h-[120px] bg-orange-500/20 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <span className="text-6xl">📱</span>
                  </div>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Digimon Database</h2>
              <p className="text-orange-100 mb-6 leading-relaxed">
                Explora el mundo digital con información completa sobre 
                Digimon, sus digievoluciones y habilidades especiales.
              </p>
              <div className="flex justify-center">
                <span className="bg-white/20 text-white px-6 py-3 rounded-full font-semibold group-hover:bg-white/30 transition-colors duration-300">
                  Explorar Digimon →
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <p className="text-neutral-400 text-sm">
            Construido con Next.js y TypeScript • Datos de PokeAPI
          </p>
        </div>
      </div>
    </main>
  );
}
