"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  getPokemons,
  getPokemonDetail,
  Pokemon,
  PokemonDetail,
} from "@/utils/pokeapi";
import { generations } from "@/utils/generations";

// Colores oficiales de los tipos de Pokémon
const typeColors: Record<string, string> = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

// Etiquetas en español para los tipos
const typeLabelsES: Record<string, string> = {
  normal: "Normal",
  fire: "Fuego",
  water: "Agua",
  electric: "Eléctrico",
  grass: "Planta",
  ice: "Hielo",
  fighting: "Lucha",
  poison: "Veneno",
  ground: "Tierra",
  flying: "Volador",
  psychic: "Psíquico",
  bug: "Bicho",
  rock: "Roca",
  ghost: "Fantasma",
  dragon: "Dragón",
  dark: "Siniestro",
  steel: "Acero",
  fairy: "Hada",
};

export default function HomePage() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [selected, setSelected] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showShiny, setShowShiny] = useState(false);
  const [showFemale, setShowFemale] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [generation, setGeneration] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [typeSet, setTypeSet] = useState<Set<string> | null>(null);
  const [typeFilter2, setTypeFilter2] = useState<string>("");
  const [typeSet2, setTypeSet2] = useState<Set<string> | null>(null);
  const [sort, setSort] = useState<"id-asc" | "id-desc" | "name-asc" | "name-desc">("id-asc");
  const [listShiny, setListShiny] = useState(false);
  const [detailsCache, setDetailsCache] = useState<Record<string, PokemonDetail>>({});
  const [animFallback, setAnimFallback] = useState<Record<string, boolean>>({});

  const limit = 20;

  useEffect(() => {
    let ignore = false;
    const fetchList = async () => {
  const total = search.length > 0 || generation || typeFilter || typeFilter2 ? 1010 : limit * page;
      try {
        const list = await getPokemons(total);
        if (!ignore) setPokemons(list);
      } catch (e) {
        console.error("Error fetching pokemons", e);
      }
    };
    fetchList();
    return () => {
      ignore = true;
    };
  }, [page, search, generation, typeFilter, typeFilter2]);

  // Cargar lista de pokémon por tipo cuando se selecciona uno
  useEffect(() => {
    let ignore = false;
    const run = async () => {
      if (!typeFilter) {
        setTypeSet(null);
        return;
      }
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${typeFilter}`);
        const data = (await res.json()) as unknown as {
          pokemon: { pokemon: { name: string } }[];
        };
        const names = new Set<string>(data.pokemon.map((x) => x.pokemon.name));
        if (!ignore) setTypeSet(names);
      } catch (e) {
        console.error("Error fetching type members", e);
      }
    };
    run();
    return () => {
      ignore = true;
    };
  }, [typeFilter]);

  // Cargar lista de pokémon por segundo tipo
  useEffect(() => {
    let ignore = false;
    const run = async () => {
      if (!typeFilter2) {
        setTypeSet2(null);
        return;
      }
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${typeFilter2}`);
        const data = (await res.json()) as unknown as {
          pokemon: { pokemon: { name: string } }[];
        };
        const names = new Set<string>(data.pokemon.map((x) => x.pokemon.name));
        if (!ignore) setTypeSet2(names);
      } catch (e) {
        console.error("Error fetching type members 2", e);
      }
    };
    run();
    return () => {
      ignore = true;
    };
  }, [typeFilter2]);

  const getPokeIndex = (pokemon: Pokemon) => {
    const match = pokemon.url.match(/\/pokemon\/(\d+)\/?$/);
    return match ? parseInt(match[1], 10) : 1;
  };

  const filteredPokemons = useMemo(() => {
    let list = pokemons;
    if (generation) {
      const gen = generations.find((g) => g.id === generation);
      if (gen) {
        list = list.filter((p) => {
          const idx = getPokeIndex(p);
          return idx >= gen.range[0] && idx <= gen.range[1];
        });
      }
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(s));
    }
    if (typeSet) list = list.filter((p) => typeSet.has(p.name));
    if (typeSet2) list = list.filter((p) => typeSet2.has(p.name));
    // Orden
    const byId = (a: Pokemon, b: Pokemon) => getPokeIndex(a) - getPokeIndex(b);
    const byName = (a: Pokemon, b: Pokemon) => a.name.localeCompare(b.name);
    if (sort === "id-asc") list = [...list].sort(byId);
    if (sort === "id-desc") list = [...list].sort((a, b) => byId(b, a));
    if (sort === "name-asc") list = [...list].sort(byName);
    if (sort === "name-desc") list = [...list].sort((a, b) => byName(b, a));
    return list;
  }, [pokemons, generation, search, typeSet, typeSet2, sort]);

  const paginatedPokemons = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredPokemons.slice(start, start + limit);
  }, [filteredPokemons, page]);

  // Prefetch de detalles por página (limitado en concurrencia)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      // Prefetch solo de un bloque razonable para no saturar la API
      const windowed = paginatedPokemons.slice(0, limit);
      const names = windowed.map((p) => p.name).filter((n) => !detailsCache[n]);
      if (names.length === 0) return;
      const CONCURRENCY = 4;
      let index = 0;
      const workers = new Array(CONCURRENCY).fill(0).map(async () => {
        while (!cancelled && index < names.length) {
          const name = names[index++];
          try {
            const d = await getPokemonDetail(name);
            if (!cancelled) {
              setDetailsCache((prev) => (prev[name] ? prev : { ...prev, [name]: d }));
            }
          } catch {
            // ignorar errores de prefetch
          }
        }
      });
      await Promise.all(workers);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [paginatedPokemons, limit, detailsCache]);

  const handleClick = async (name: string) => {
    setLoading(true);
    try {
      const detail = await getPokemonDetail(name);
      setSelected(detail);
      setModalOpen(true);
    } catch (e) {
      console.error("Error fetching pokemon detail", e);
    } finally {
      setLoading(false);
    }
  };

  const listCard = (p: Pokemon) => {
    const idx = getPokeIndex(p);
    const animatedBase = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated";
    const staticBase = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
    const animatedUrl = `${animatedBase}/${listShiny ? "shiny/" : ""}${idx}.gif`;
    const staticUrl = `${staticBase}/${listShiny ? "shiny/" : ""}${idx}.png`;
    const sprite = animFallback[p.name] ? staticUrl : animatedUrl;
    const prefetchDetails = async () => {
      if (!detailsCache[p.name]) {
        try {
          const d = await getPokemonDetail(p.name);
          setDetailsCache((prev) => ({ ...prev, [p.name]: d }));
        } catch (e) {
          console.error("prefetch detail error", e);
        }
      }
    };
    return (
      <li
        key={p.name}
        className="flex items-center gap-3 p-3 rounded border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 cursor-pointer"
        onClick={() => handleClick(p.name)}
        onMouseEnter={prefetchDetails}
      >
        <div className="relative">
          <Image
            src={sprite}
            alt={p.name}
            width={64}
            height={64}
            onError={() => {
              if (!animFallback[p.name]) {
                setAnimFallback((prev) => ({ ...prev, [p.name]: true }));
              }
            }}
          />
          {/* Nota: en lista no forzamos hembra; se muestra animado y si falla, estático */}
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-neutral-400">#{idx.toString().padStart(3, "0")}</span>
          <span className="capitalize font-medium text-white">{detailsCache[p.name]?.name_es || p.name}</span>
          {/* Chips de tipos si tenemos detalle en caché */}
          {detailsCache[p.name]?.types && (
            <div className="flex gap-1 mt-1">
              {detailsCache[p.name].types.map((t) => (
                <span
                  key={t.type.name}
                  className="px-1.5 py-0.5 rounded text-[10px] capitalize font-bold text-white"
                  style={{ backgroundColor: typeColors[t.type.name] || "#444" }}
                >
                  {t.type.name_es || t.type.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </li>
    );
  };

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Pokédex</h1>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar Pokémon..."
          className="px-4 py-2 rounded bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:ring focus:border-yellow-400 w-full md:w-72"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="px-4 py-2 rounded bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:ring focus:border-yellow-400 w-full md:w-72"
          value={generation ?? ""}
          onChange={(e) => {
            const val = e.target.value ? parseInt(e.target.value, 10) : null;
            setGeneration(val);
            setPage(1);
          }}
        >
          <option value="">Todas las generaciones</option>
          {generations.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <select
          className="px-4 py-2 rounded bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:ring focus:border-yellow-400 w-full md:w-72"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Todos los tipos</option>
          {Object.keys(typeColors).map((t) => (
            <option key={t} value={t}>
              {typeLabelsES[t] ?? t}
            </option>
          ))}
        </select>
        <select
          className="px-4 py-2 rounded bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:ring focus:border-yellow-400 w-full md:w-72"
          value={typeFilter2}
          onChange={(e) => {
            setTypeFilter2(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tipo secundario (opcional)</option>
          {Object.keys(typeColors).map((t) => (
            <option key={t} value={t}>
              {typeLabelsES[t] ?? t}
            </option>
          ))}
        </select>
        {/* Orden */}
        <select
          className="px-4 py-2 rounded bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:ring focus:border-yellow-400 w-full md:w-72"
          value={sort}
          onChange={(e) => {
            const v = e.target.value as "id-asc" | "id-desc" | "name-asc" | "name-desc";
            setSort(v);
          }}
        >
          <option value="id-asc">Ordenar: ID ascendente</option>
          <option value="id-desc">Ordenar: ID descendente</option>
          <option value="name-asc">Ordenar: Nombre A–Z</option>
          <option value="name-desc">Ordenar: Nombre Z–A</option>
        </select>

        {/* Toggles lista */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-white text-sm">
            <input type="checkbox" checked={listShiny} onChange={(e) => setListShiny(e.target.checked)} />
            Shiny
          </label>
          {/* Siempre animado: se eliminó el toggle. Hembra se controla en el modal. */}
        </div>
      </div>

      <ul className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {paginatedPokemons.map((p) => listCard(p))}
      </ul>

      <div className="flex justify-center gap-4 mt-8">
        <button
          className="px-4 py-2 rounded bg-neutral-800 border border-neutral-700 text-white hover:bg-neutral-700 disabled:opacity-50"
          onClick={() => setPage((p) => (p > 1 ? p - 1 : 1))}
          disabled={page === 1}
        >
          Anterior
        </button>
        <span className="text-white font-bold">Página {page}</span>
        <button
          className="px-4 py-2 rounded bg-neutral-800 border border-neutral-700 text-white hover:bg-neutral-700"
          onClick={() => setPage((p) => p < Math.ceil(filteredPokemons.length / limit) ? p + 1 : p)}
          disabled={page >= Math.ceil(filteredPokemons.length / limit)}
        >
          Siguiente
        </button>
      </div>

      {modalOpen && selected && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
          onClick={() => setModalOpen(false)}
        >
    <div
      className="bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto relative"
      onClick={(e) => e.stopPropagation()}
    >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => setModalOpen(false)}
              aria-label="Cerrar"
            >
              &times;
            </button>

            <div className="flex flex-col items-center mb-4">
              {(() => {
                const femaleAvailable = showShiny
                  ? Boolean(selected.sprites.front_shiny_female)
                  : Boolean(selected.sprites.front_female);
                const imgSrc = showFemale
                  ? showShiny && selected.sprites.front_shiny_female
                    ? selected.sprites.front_shiny_female
                    : selected.sprites.front_female || selected.sprites.front_default
                  : showShiny && selected.sprites.front_shiny
                  ? selected.sprites.front_shiny
                  : selected.sprites.front_default;
                return (
                  <div className="relative">
                    <Image
                      src={imgSrc}
                      alt={
                        selected.name + (showShiny ? " shiny" : "") + (showFemale ? " female" : " male")
                      }
                      width={200}
                      height={200}
                      className="mx-auto cursor-pointer"
                      onClick={() => setShowShiny((v) => !v)}
                      title={showShiny ? "Haz click para ver el normal" : "Haz click para ver el shiny"}
                      priority
                    />
                    {showFemale && !femaleAvailable && (
                      <span className="absolute -top-2 -right-2 text-[10px] px-2 py-0.5 rounded bg-pink-700 text-white shadow" title="Sin sprite femenino, mostrando macho">
                        Fallback
                      </span>
                    )}
                  </div>
                );
              })()}
              <div className="flex gap-2 mt-2">
                <button
                  className={`px-2 py-1 rounded text-xs font-bold border ${!showFemale ? "bg-blue-700 text-white" : "bg-neutral-800 text-blue-300"}`}
                  onClick={() => setShowFemale(false)}
                  disabled={!selected.sprites.front_default}
                >
                  Macho
                </button>
                {(selected.sprites.front_female || selected.sprites.front_shiny_female) && (
                  <button
                    className={`px-2 py-1 rounded text-xs font-bold border ${showFemale ? "bg-pink-700 text-white" : "bg-neutral-800 text-pink-300"}`}
                    onClick={() => setShowFemale(true)}
                  >
                    Hembra
                  </button>
                )}
                <button
                  className="px-2 py-1 rounded text-xs font-bold border border-yellow-500 bg-yellow-700 text-white"
                  onClick={() => setShowShiny((v) => !v)}
                >
                  {showShiny ? "Normal" : "Shiny"}
                </button>
              </div>
            </div>

            <h2 className="text-2xl capitalize font-bold text-center mb-2">
              {selected.name_es || selected.name}
            </h2>
            <div className="text-center mb-2">
              <span className="text-sm text-gray-400">ID: {selected.id}</span>
            </div>

            {selected.evolution_chain && selected.evolution_chain.length > 0 && (
              <div className="mb-6">
                <div className="text-xs text-gray-400 mb-2">Línea evolutiva:</div>
                <div className="flex flex-wrap items-center gap-3 justify-center">
                  {selected.evolution_chain.map((evo, i) => {
                    return (
                      <div key={evo.name} className="flex items-center gap-2">
                        <button
                          className="flex flex-col items-center"
                          onClick={async () => {
                            setLoading(true);
                            try {
                              const d = await getPokemonDetail(evo.name);
                              setSelected(d);
                            } finally {
                              setLoading(false);
                            }
                          }}
                          onMouseEnter={async () => {
                            if (!detailsCache[evo.name]) {
                              try {
                                const d = await getPokemonDetail(evo.name);
                                setDetailsCache((prev) => ({ ...prev, [evo.name]: d }));
                              } catch {}
                            }
                          }}
                        >
                          <Image
                            src={
                              detailsCache[evo.name]?.sprites.front_default || "/pokeball-bg.svg"
                            }
                            alt={evo.name}
                            width={56}
                            height={56}
                          />
                          <span className="text-xs text-center text-white capitalize">{evo.name_es || evo.name}</span>
                        </button>
                        {i < selected.evolution_chain!.length - 1 && (
                          <span className="text-gray-500">→</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selected.cry_url && (
              <div className="flex justify-center mb-4">
                <button
                  className="px-3 py-1 rounded bg-yellow-600 text-white font-bold hover:bg-yellow-500"
                  onClick={() => {
                    const audio = new Audio(selected.cry_url!);
                    audio.play();
                  }}
                >
                  Reproducir grito
                </button>
              </div>
            )}

            <div className="flex justify-center gap-2 mb-2">
              {selected.types.map((t) => (
                <span
                  key={t.type.name}
                  className="px-2 py-1 rounded text-xs capitalize font-bold text-white shadow"
                  style={{ backgroundColor: typeColors[t.type.name] || "#444" }}
                >
                  {t.type.name_es || t.type.name}
                </span>
              ))}
            </div>

            {selected.description_es && (
              <div className="text-center text-sm text-gray-300 mb-2 whitespace-pre-line">
                {selected.description_es}
              </div>
            )}

            <div className="text-center text-sm text-gray-400">
              <div>Altura: {selected.height / 10} m</div>
              <div>Peso: {selected.weight / 10} kg</div>
            </div>

            {/* Stats */}
            {selected.stats && selected.stats.length > 0 && (
              <div className="mt-4">
                <div className="text-xs text-gray-400 mb-2">Estadísticas base</div>
                <div className="space-y-2">
                  {selected.stats.map((s) => {
                    const statES: Record<string, string> = {
                      hp: "PS",
                      attack: "Ataque",
                      defense: "Defensa",
                      "special-attack": "At. Esp.",
                      "special-defense": "Def. Esp.",
                      speed: "Velocidad",
                    };
                    const pct = Math.min(100, Math.round((s.base_stat / 255) * 100));
                    const color = pct > 70 ? "#22c55e" : pct > 40 ? "#f59e0b" : "#ef4444";
                    return (
                      <div key={s.name} className="flex items-center gap-2">
                        <div className="w-28 text-xs capitalize text-gray-300">{statES[s.name] ?? s.name}</div>
                        <div className="flex-1 h-3 rounded bg-neutral-800 overflow-hidden">
                          <div className="h-3" style={{ width: `${pct}%`, backgroundColor: color }} />
                        </div>
                        <div className="w-12 text-right text-xs text-gray-400">{s.base_stat}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Movimientos */}
            {selected.moves && selected.moves.length > 0 && (
              <div className="mt-6">
                <div className="text-xs text-gray-400 mb-2">Movimientos</div>
                <MovesList moves={selected.moves} />
              </div>
            )}

            {/* Encuentros */}
            {selected.encounters && selected.encounters.length > 0 && (
              <div className="mt-6">
                <div className="text-xs text-gray-400 mb-2">Encuentros por versión</div>
                <div className="max-h-40 overflow-auto border border-neutral-800 rounded p-2 text-xs text-gray-300">
                  {selected.encounters.map((e, i) => (
                    <div key={`${e.version}-${e.location_area}-${i}`} className="flex justify-between">
                      <span className="capitalize">{e.version.replace(/-/g, " ")}</span>
                      <span className="capitalize text-gray-400">{e.location_area.replace(/-/g, " ")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Habilidades */}
            {selected.abilities && selected.abilities.length > 0 && (
              <div className="mt-6">
                <div className="text-xs text-gray-400 mb-2">Habilidades</div>
                <div className="flex flex-wrap gap-2">
                  {selected.abilities.map((ab) => (
                    <span
                      key={ab.name}
                      className={`px-2 py-1 rounded text-xs capitalize font-bold text-white ${ab.is_hidden ? "bg-purple-700" : "bg-neutral-700"}`}
                      title={ab.is_hidden ? "Habilidad oculta" : "Habilidad"}
                    >
                      {ab.name_es ?? ab.name}
                      {ab.is_hidden && <span className="ml-1 text-[10px] opacity-80">(oculta)</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-neutral-900 text-white rounded p-4 shadow">Cargando...</div>
        </div>
      )}
    </main>
  );
}

// Sub-componente: lista de movimientos con filtros por método y versión
function MovesList({ moves }: { moves: PokemonDetail["moves"] }) {
  const [method, setMethod] = useState<string>("");
  const [versionGroup, setVersionGroup] = useState<string>("");

  const methods = useMemo(() => Array.from(new Set(moves.map((m) => m.method))).sort(), [moves]);
  const versions = useMemo(
    () => Array.from(new Set(moves.map((m) => m.version_group))).sort(),
    [moves]
  );

  const filtered = useMemo(() => {
    return moves.filter((m) => (method ? m.method === method : true) && (versionGroup ? m.version_group === versionGroup : true));
  }, [moves, method, versionGroup]);

  const methodLabelES = (m: string) => {
    if (m === "level-up") return "Subiendo de nivel";
    if (m === "machine") return "MT/MO";
    if (m === "tutor") return "Tutor";
    if (m === "egg") return "Huevo";
    return m;
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-2 mb-2">
        <select
          className="px-3 py-1 rounded bg-neutral-800 border border-neutral-700 text-white text-sm"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="">Todos los métodos</option>
          {methods.map((m) => (
            <option key={m} value={m}>
              {methodLabelES(m)}
            </option>
          ))}
        </select>
        <select
          className="px-3 py-1 rounded bg-neutral-800 border border-neutral-700 text-white text-sm"
          value={versionGroup}
          onChange={(e) => setVersionGroup(e.target.value)}
        >
          <option value="">Todas las versiones</option>
          {versions.map((v) => (
            <option key={v} value={v} className="capitalize">
              {v}
            </option>
          ))}
        </select>
      </div>

      <div className="max-h-56 overflow-auto border border-neutral-800 rounded">
        <table className="w-full text-xs text-gray-300">
          <thead className="sticky top-0 bg-neutral-900">
            <tr>
              <th className="text-left p-2">Movimiento</th>
              <th className="text-left p-2">Método</th>
              <th className="text-right p-2">Nivel</th>
              <th className="text-left p-2">Versión</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr key={`${m.name}-${m.method}-${m.version_group}-${i}`} className="odd:bg-neutral-900">
                <td className="capitalize p-2">{m.name}</td>
                <td className="p-2">{methodLabelES(m.method)}</td>
                <td className="text-right p-2">{m.level || "-"}</td>
                <td className="capitalize p-2">{m.version_group}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
