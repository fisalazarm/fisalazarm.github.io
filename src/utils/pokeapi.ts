export type Pokemon = {
  name: string;
  url: string;
};

export type Evolution = {
  name: string;
  name_es?: string;
  min_level?: number | null;
  trigger?: string | null;
  item?: string | null;
};

export type PokemonDetail = {
  id: number;
  name: string;
  name_es?: string;
  sprites: {
    front_default: string;
    front_shiny?: string;
    front_female?: string;
    front_shiny_female?: string;
  };
  height: number;
  weight: number;
  types: { type: { name: string; name_es?: string } }[];
  stats: { name: string; base_stat: number }[];
  moves: { name: string; method: string; level: number; version_group: string }[];
  encounters?: { version: string; location_area: string }[];
  abilities: { name: string; name_es?: string; is_hidden: boolean }[];
  description_es?: string;
  evolution_chain?: Evolution[];
  cry_url?: string;
};

export async function getPokemons(limit = 20): Promise<Pokemon[]> {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
  const data = (await res.json()) as unknown as { results: Pokemon[] };
  return data.results;
}


export async function getPokemonDetail(name: string): Promise<PokemonDetail> {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
  const data = (await res.json()) as unknown as {
    id: number;
    name: string;
    species: { url: string };
    height: number;
    weight: number;
    types: { type: { name: string; url: string } }[];
    stats: { base_stat: number; stat: { name: string } }[];
    moves: {
      move: { name: string };
      version_group_details: {
        move_learn_method: { name: string };
        level_learned_at: number;
        version_group: { name: string };
      }[];
    }[];
    location_area_encounters: string;
    abilities?: { ability: { name: string; url: string }; is_hidden: boolean }[];
    cries?: { latest?: string };
    sprites: {
      front_default: string;
      front_shiny?: string;
      front_female?: string;
      front_shiny_female?: string;
    };
  };
  // Obtener nombre y descripción en español
  const speciesRes = await fetch(data.species.url);
  const speciesData = (await speciesRes.json()) as unknown as {
    names: { language: { name: string }; name: string }[];
    flavor_text_entries: { language: { name: string }; flavor_text: string }[];
    evolution_chain?: { url: string } | null;
  };
  const nameES = speciesData.names.find((n) => n.language.name === "es");
  const flavorES = speciesData.flavor_text_entries.find((f) => f.language.name === "es");
  // Obtener nombres de tipos en español
  const typesWithES = await Promise.all(
    data.types.map(async (t: { type: { name: string; url: string } }) => {
      const typeRes = await fetch(t.type.url);
      const typeData = (await typeRes.json()) as unknown as {
        names: { language: { name: string }; name: string }[];
      };
      const typeNameES = typeData.names.find((n) => n.language.name === "es");
      return {
        ...t,
        type: {
          ...t.type,
          name_es: typeNameES ? typeNameES.name : t.type.name,
        },
      };
    })
  );

  // Obtener línea evolutiva
  const evolution_chain: Evolution[] = [];
  if (speciesData.evolution_chain && speciesData.evolution_chain.url) {
    const evoRes = await fetch(speciesData.evolution_chain.url);
    const evoData = (await evoRes.json()) as unknown as { chain: EvolutionChain };
    // Recorrer la cadena evolutiva
    type EvolutionChain = {
      species: { name: string };
      evolves_to: EvolutionChain[];
      evolution_details: {
        trigger: { name: string };
        min_level?: number;
        item?: { name: string };
      }[];
    };

    async function extractEvos(chain: EvolutionChain, arr: Evolution[] = []): Promise<Evolution[]> {
      if (chain.evolves_to && chain.evolves_to.length > 0) {
        for (const evoStep of chain.evolves_to) {
          const details: {
            trigger?: { name: string };
            min_level?: number;
            item?: { name: string };
          } = evoStep.evolution_details[0] || {};
          // Traducir trigger
          let trigger = details.trigger ? details.trigger.name : null;
          if (trigger === "level-up") trigger = "Subir de nivel";
          // Traducir objeto
          let item = null;
          if (details.item && details.item.name) {
            const itemRes = await fetch(`https://pokeapi.co/api/v2/item/${details.item.name}`);
            const itemData = (await itemRes.json()) as unknown as {
              names: { language: { name: string }; name: string }[];
            };
            const itemNameES = itemData.names.find((n) => n.language.name === "es");
            item = itemNameES ? itemNameES.name : details.item.name;
          }
          arr.push({
            name: evoStep.species.name,
            min_level: details.min_level ?? null,
            trigger,
            item,
          });
          await extractEvos(evoStep, arr);
        }
      }
      return arr;
    }
    // Agregar la base
    evolution_chain.push({ name: evoData.chain.species.name });
    await extractEvos(evoData.chain, evolution_chain);
    // Obtener nombres en español para la línea evolutiva
    for (const evo of evolution_chain) {
      const evoSpeciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${evo.name}`);
      const evoSpeciesData = (await evoSpeciesRes.json()) as unknown as {
        names: { language: { name: string }; name: string }[];
      };
      const evoNameES = evoSpeciesData.names.find((n) => n.language.name === "es");
      evo.name_es = evoNameES ? evoNameES.name : evo.name;
    }
  }

  // Obtener url del grito (cry)
  const cry_url = data.cries && data.cries.latest ? data.cries.latest : undefined;

  // Stats
  const stats = (data.stats || []).map((s) => ({ name: s.stat.name, base_stat: s.base_stat }));

  // Moves (aplanado con método, nivel y versión)
  const moves = (data.moves || []).flatMap((m) =>
    m.version_group_details.map((d) => ({
      name: m.move.name,
      method: d.move_learn_method.name,
      level: d.level_learned_at,
      version_group: d.version_group.name,
    }))
  );

  // Encuentros por versión de juego (puede no existir para todos)
  let encounters: { version: string; location_area: string }[] | undefined;
  try {
    if (data.location_area_encounters) {
      const encRes = await fetch(data.location_area_encounters);
      const encData = (await encRes.json()) as unknown as Array<{
        location_area: { name: string };
        version_details: { version: { name: string } }[];
      }>;
      const acc: { version: string; location_area: string }[] = [];
      for (const row of encData) {
        for (const v of row.version_details) {
          acc.push({ version: v.version.name, location_area: row.location_area.name });
        }
      }
      // Reducir duplicados simples
      const uniq = new Map<string, { version: string; location_area: string }>();
      for (const e of acc) uniq.set(`${e.version}:${e.location_area}`, e);
      encounters = Array.from(uniq.values()).slice(0, 30);
    }
  } catch {
    encounters = undefined;
  }

  // Habilidades con nombre en español
  let abilities: { name: string; name_es?: string; is_hidden: boolean }[] = [];
  try {
    const abList = data.abilities;
    if (abList && abList.length) {
      abilities = await Promise.all(
        abList.map(async (ab) => {
          try {
            const aRes = await fetch(ab.ability.url);
            const aData = (await aRes.json()) as { names: { language: { name: string }; name: string }[] };
            const aNameES = aData.names.find((n) => n.language.name === "es");
            return { name: ab.ability.name, name_es: aNameES?.name, is_hidden: ab.is_hidden };
          } catch {
            return { name: ab.ability.name, is_hidden: ab.is_hidden };
          }
        })
      );
    }
  } catch {
    abilities = [];
  }

  return {
    ...data,
    types: typesWithES,
    stats,
    moves,
    encounters,
    abilities,
    name_es: nameES ? nameES.name : data.name,
    description_es: flavorES ? flavorES.flavor_text.replace(/\f|\n|\r/g, " ") : undefined,
    evolution_chain,
    cry_url,
    sprites: {
      front_default: data.sprites.front_default,
      front_shiny: data.sprites.front_shiny,
      front_female: data.sprites.front_female,
      front_shiny_female: data.sprites.front_shiny_female,
    },
  };
}
