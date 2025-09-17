"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  getDigimons,
  getDigimonDetail,
  getAttributes,
  getLevels,
  Digimon,
  DigimonDetail,
  DigimonAttribute,
  DigimonLevel,
  attributeColors,
  levelColors,
  getMainImage,
  formatAttributeName,
  formatLevelName,
} from "@/utils/digiapi";

export default function DigimonPage() {
  const [digimons, setDigimons] = useState<Digimon[]>([]);
  const [selected, setSelected] = useState<DigimonDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [attribute, setAttribute] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [xAntibody, setXAntibody] = useState<boolean | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [detailsCache, setDetailsCache] = useState<Record<string, DigimonDetail>>({});
  
  // Lista de opciones para filtros
  const [attributes, setAttributes] = useState<DigimonAttribute[]>([]);
  const [levels, setLevels] = useState<DigimonLevel[]>([]);
  
  const limit = 20;

  // Cargar opciones de filtros al inicio
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [attributesData, levelsData] = await Promise.all([
          getAttributes(),
          getLevels(),
        ]);
        
        // Validar que las respuestas tengan la estructura esperada
        if (attributesData && attributesData.content && Array.isArray(attributesData.content)) {
          setAttributes(attributesData.content);
        } else {
          console.warn("Attributes data doesn't have expected structure:", attributesData);
          setAttributes([]);
        }
        
        if (levelsData && levelsData.content && Array.isArray(levelsData.content)) {
          setLevels(levelsData.content);
        } else {
          console.warn("Levels data doesn't have expected structure:", levelsData);
          setLevels([]);
        }
      } catch (error) {
        console.error("Error loading filter options:", error);
        // Establecer arrays vacíos en caso de error
        setAttributes([]);
        setLevels([]);
      }
    };
    loadFilterOptions();
  }, []);

  // Cargar lista de Digimon
  useEffect(() => {
    let ignore = false;
    const fetchList = async () => {
      setLoading(true);
      try {
        const filters = {
          page: page - 1, // La API usa páginas basadas en 0
          pageSize: limit,
          ...(search && { name: search }),
          ...(attribute && { attribute }),
          ...(level && { level }),
          ...(xAntibody !== null && { xAntibody }),
        };
        
        const response = await getDigimons(filters);
        
        if (!ignore) {
          setDigimons(response.content);
          setTotalPages(response.pageable.totalPages);
          setTotalElements(response.pageable.totalElements);
        }
      } catch (e) {
        console.error("Error fetching digimons", e);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    
    fetchList();
    return () => {
      ignore = true;
    };
  }, [page, search, attribute, level, xAntibody]);

  // Prefetch de detalles
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const names = digimons.map((d) => d.name).filter((n) => !detailsCache[n]);
      if (names.length === 0) return;
      
      const CONCURRENCY = 3; // Menos concurrencia para evitar saturar la API
      let index = 0;
      
      const workers = new Array(CONCURRENCY).fill(0).map(async () => {
        while (!cancelled && index < names.length) {
          const name = names[index++];
          try {
            const detail = await getDigimonDetail(name);
            if (!cancelled) {
              setDetailsCache((prev) => (prev[name] ? prev : { ...prev, [name]: detail }));
            }
          } catch {
            // Ignorar errores de prefetch
          }
        }
      });
      
      await Promise.all(workers);
    };
    
    run();
    return () => {
      cancelled = true;
    };
  }, [digimons, detailsCache]);

  const handleClick = async (name: string) => {
    setLoading(true);
    try {
      const detail = await getDigimonDetail(name);
      setSelected(detail);
      setModalOpen(true);
    } catch (e) {
      console.error("Error fetching digimon detail", e);
    } finally {
      setLoading(false);
    }
  };

  const listCard = (d: Digimon) => {
    const cachedDetail = detailsCache[d.name];
    const mainImage = cachedDetail ? getMainImage(cachedDetail) : "/pokeball-bg.svg";
    
    const prefetchDetails = async () => {
      if (!detailsCache[d.name]) {
        try {
          const detail = await getDigimonDetail(d.name);
          setDetailsCache((prev) => ({ ...prev, [d.name]: detail }));
        } catch (e) {
          console.error("prefetch detail error", e);
        }
      }
    };

    return (
      <li
        key={d.id}
        className="flex items-center gap-3 p-3 rounded border border-orange-700/50 bg-neutral-800/80 hover:bg-neutral-700/80 cursor-pointer transition-colors"
        onClick={() => handleClick(d.name)}
        onMouseEnter={prefetchDetails}
      >
        <div className="relative">
          <Image
            src={mainImage}
            alt={d.name}
            width={64}
            height={64}
            className="object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/pokeball-bg.svg";
            }}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-orange-400">#{d.id.toString().padStart(3, "0")}</span>
          <span className="capitalize font-medium text-white">{d.name}</span>
          
          {/* Chips de atributos y niveles si tenemos detalle en caché */}
          {cachedDetail && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {cachedDetail.attributes?.map((attr) => (
                <span
                  key={attr.id}
                  className="px-1.5 py-0.5 rounded text-[10px] capitalize font-bold text-white"
                  style={{ backgroundColor: attributeColors[attr.attribute.toLowerCase()] || "#444" }}
                >
                  {formatAttributeName(attr.attribute)}
                </span>
              ))}
              {cachedDetail.levels?.map((lvl) => (
                <span
                  key={lvl.id}
                  className="px-1.5 py-0.5 rounded text-[10px] capitalize font-bold text-white"
                  style={{ backgroundColor: levelColors[lvl.level.toLowerCase()] || "#666" }}
                >
                  {formatLevelName(lvl.level)}
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
      <h1 className="text-3xl font-bold text-white mb-6">Digimon Database</h1>

      <div className="flex flex-col md:flex-row gap-3 mb-6 items-center flex-wrap">
        <button
          className="px-4 py-2 rounded bg-orange-700 border border-orange-600 text-white hover:bg-orange-600 text-sm"
          onClick={() => {
            setSearch("");
            setAttribute("");
            setLevel("");
            setXAntibody(null);
            setPage(1);
          }}
        >
          Limpiar filtros
        </button>
        
        <input
          type="text"
          placeholder="Buscar Digimon..."
          className="px-4 py-2 rounded bg-neutral-800 border border-orange-700 text-white focus:outline-none focus:ring focus:border-orange-400 w-full md:w-72"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        
        <select
          className="px-4 py-2 rounded bg-neutral-800 border border-orange-700 text-white focus:outline-none focus:ring focus:border-orange-400 w-full md:w-72"
          value={attribute}
          onChange={(e) => {
            setAttribute(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Todos los atributos</option>
          {attributes && Array.isArray(attributes) && attributes.map((attr) => (
            <option key={attr.id} value={attr.attribute}>
              {formatAttributeName(attr.attribute)}
            </option>
          ))}
        </select>
        
        <select
          className="px-4 py-2 rounded bg-neutral-800 border border-orange-700 text-white focus:outline-none focus:ring focus:border-orange-400 w-full md:w-72"
          value={level}
          onChange={(e) => {
            setLevel(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Todos los niveles</option>
          {levels && Array.isArray(levels) && levels.map((lvl) => (
            <option key={lvl.id} value={lvl.level}>
              {formatLevelName(lvl.level)}
            </option>
          ))}
        </select>
        
        <select
          className="px-4 py-2 rounded bg-neutral-800 border border-orange-700 text-white focus:outline-none focus:ring focus:border-orange-400 w-full md:w-72"
          value={xAntibody === null ? "" : xAntibody.toString()}
          onChange={(e) => {
            const value = e.target.value;
            setXAntibody(value === "" ? null : value === "true");
            setPage(1);
          }}
        >
          <option value="">X-Antibody: Todos</option>
          <option value="true">Solo X-Antibody</option>
          <option value="false">Sin X-Antibody</option>
        </select>
      </div>

      {loading && (
        <div className="text-center text-white mb-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <p className="mt-2">Cargando Digimon...</p>
        </div>
      )}

      <div className="mb-4 text-sm text-orange-300">
        Mostrando {digimons.length} de {totalElements} Digimon
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {digimons.map((d) => listCard(d))}
      </ul>

      <div className="flex justify-center gap-4 mt-8">
        <button
          className="px-4 py-2 rounded bg-neutral-800 border border-orange-700 text-white hover:bg-neutral-700 disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
        >
          Anterior
        </button>
        <span className="text-white font-bold flex items-center">
          Página {page} de {totalPages}
        </span>
        <button
          className="px-4 py-2 rounded bg-neutral-800 border border-orange-700 text-white hover:bg-neutral-700 disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages || loading}
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
            className="bg-neutral-900 border border-orange-700 rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
              onClick={() => setModalOpen(false)}
              aria-label="Cerrar"
            >
              &times;
            </button>

            <div className="flex flex-col items-center mb-6">
              <Image
                src={getMainImage(selected)}
                alt={selected.name}
                width={200}
                height={200}
                className="mx-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/pokeball-bg.svg";
                }}
              />
            </div>

            <h2 className="text-3xl capitalize font-bold text-center mb-4 text-white">
              {selected.name}
            </h2>
            
            <div className="text-center mb-4">
              <span className="text-sm text-orange-400">ID: #{selected.id}</span>
              {selected.xAntibody && (
                <span className="ml-4 px-2 py-1 bg-purple-600 text-white text-xs rounded font-bold">
                  X-ANTIBODY
                </span>
              )}
            </div>

            {/* Atributos */}
            {selected.attributes && selected.attributes.length > 0 && (
              <div className="mb-4">
                <h3 className="text-orange-400 text-sm mb-2">Atributos:</h3>
                <div className="flex justify-center gap-2">
                  {selected.attributes.map((attr) => (
                    <span
                      key={attr.id}
                      className="px-3 py-1 rounded text-sm font-bold text-white"
                      style={{ backgroundColor: attributeColors[attr.attribute.toLowerCase()] || "#444" }}
                    >
                      {formatAttributeName(attr.attribute)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Niveles */}
            {selected.levels && selected.levels.length > 0 && (
              <div className="mb-4">
                <h3 className="text-orange-400 text-sm mb-2">Niveles:</h3>
                <div className="flex justify-center gap-2">
                  {selected.levels.map((lvl) => (
                    <span
                      key={lvl.id}
                      className="px-3 py-1 rounded text-sm font-bold text-white"
                      style={{ backgroundColor: levelColors[lvl.level.toLowerCase()] || "#666" }}
                    >
                      {formatLevelName(lvl.level)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tipos */}
            {selected.types && selected.types.length > 0 && (
              <div className="mb-4">
                <h3 className="text-orange-400 text-sm mb-2">Tipos:</h3>
                <div className="flex justify-center gap-2 flex-wrap">
                  {selected.types.map((type) => (
                    <span
                      key={type.id}
                      className="px-3 py-1 rounded bg-gray-700 text-white text-sm"
                    >
                      {type.type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Fields */}
            {selected.fields && selected.fields.length > 0 && (
              <div className="mb-6">
                <h3 className="text-orange-400 text-sm mb-2">Fields:</h3>
                <div className="flex justify-center gap-4 flex-wrap">
                  {selected.fields.map((field) => (
                    <div key={field.id} className="flex flex-col items-center">
                      <Image
                        src={field.image}
                        alt={field.field}
                        width={40}
                        height={40}
                        className="mb-1"
                      />
                      <span className="text-xs text-gray-300 text-center">{field.field}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Descripciones */}
            {selected.descriptions && selected.descriptions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-orange-400 text-sm mb-2">Descripciones:</h3>
                <div className="space-y-3">
                  {selected.descriptions.map((desc, index) => (
                    <div key={index} className="bg-neutral-800/50 p-3 rounded">
                      <div className="text-xs text-orange-300 mb-1">
                        {desc.origin} ({desc.language})
                      </div>
                      <div className="text-sm text-gray-300">{desc.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Habilidades */}
            {selected.skills && selected.skills.length > 0 && (
              <div className="mb-6">
                <h3 className="text-orange-400 text-sm mb-2">Habilidades:</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selected.skills.map((skill) => (
                    <div key={skill.id} className="bg-neutral-800/50 p-2 rounded">
                      <div className="font-bold text-white text-sm">{skill.skill}</div>
                      {skill.translation && (
                        <div className="text-xs text-orange-300">{skill.translation}</div>
                      )}
                      {skill.description && (
                        <div className="text-xs text-gray-400 mt-1">{skill.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evoluciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Evoluciones anteriores */}
              {selected.priorEvolutions && selected.priorEvolutions.length > 0 && (
                <div>
                  <h3 className="text-orange-400 text-sm mb-2">Evoluciona desde:</h3>
                  <div className="space-y-2">
                    {selected.priorEvolutions.map((evo) => (
                      <div key={evo.id} className="flex items-center gap-2 bg-neutral-800/50 p-2 rounded">
                        <Image
                          src={evo.image}
                          alt={evo.digimon}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                        <div>
                          <div className="text-sm text-white">{evo.digimon}</div>
                          {evo.condition && (
                            <div className="text-xs text-gray-400">{evo.condition}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evoluciones siguientes */}
              {selected.nextEvolutions && selected.nextEvolutions.length > 0 && (
                <div>
                  <h3 className="text-orange-400 text-sm mb-2">Evoluciona hacia:</h3>
                  <div className="space-y-2">
                    {selected.nextEvolutions.map((evo) => (
                      <div key={evo.id} className="flex items-center gap-2 bg-neutral-800/50 p-2 rounded">
                        <Image
                          src={evo.image}
                          alt={evo.digimon}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                        <div>
                          <div className="text-sm text-white">{evo.digimon}</div>
                          {evo.condition && (
                            <div className="text-xs text-gray-400">{evo.condition}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selected.releaseDate && (
              <div className="mt-6 text-center text-xs text-gray-400">
                Fecha de lanzamiento: {selected.releaseDate}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}