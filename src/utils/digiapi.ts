// Tipos TypeScript para la Digi-API
export interface Digimon {
  id: number;
  name: string;
  href: string;
}

export interface DigimonDetail {
  id: number;
  name: string;
  xAntibody: boolean;
  images: DigimonImage[];
  levels: DigimonLevel[];
  types: DigimonType[];
  attributes: DigimonAttribute[];
  fields: DigimonField[];
  releaseDate: string;
  descriptions: DigimonDescription[];
  skills: DigimonSkill[];
  priorEvolutions: DigimonEvolution[];
  nextEvolutions: DigimonEvolution[];
}

export interface DigimonImage {
  href: string;
  transparent: boolean;
}

export interface DigimonLevel {
  id: number;
  level: string;
}

export interface DigimonType {
  id: number;
  type: string;
}

export interface DigimonAttribute {
  id: number;
  attribute: string;
}

export interface DigimonField {
  id: number;
  field: string;
  image: string;
}

export interface DigimonDescription {
  origin: string;
  language: string;
  description: string;
}

export interface DigimonSkill {
  id: number;
  skill: string;
  translation: string;
  description: string;
}

export interface DigimonEvolution {
  id: number;
  digimon: string;
  condition: string;
  image: string;
  url: string;
}

export interface DigimonListResponse {
  content: Digimon[];
  pageable: {
    currentPage: number;
    elementsOnPage: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface DigimonFilters {
  name?: string;
  exact?: boolean;
  attribute?: string;
  xAntibody?: boolean;
  level?: string;
  page?: number;
  pageSize?: number;
}

const BASE_URL = "https://digi-api.com/api/v1";

// Función para obtener lista de Digimon con filtros
export async function getDigimons(filters: DigimonFilters = {}): Promise<DigimonListResponse> {
  const params = new URLSearchParams();
  
  if (filters.name) params.append("name", filters.name);
  if (filters.exact !== undefined) params.append("exact", filters.exact.toString());
  if (filters.attribute) params.append("attribute", filters.attribute);
  if (filters.xAntibody !== undefined) params.append("xAntibody", filters.xAntibody.toString());
  if (filters.level) params.append("level", filters.level);
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.pageSize) params.append("pageSize", filters.pageSize.toString());

  const url = `${BASE_URL}/digimon${params.toString() ? `?${params.toString()}` : ""}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching Digimon list:", error);
    throw error;
  }
}

// Función para obtener detalles de un Digimon específico
export async function getDigimonDetail(identifier: string | number): Promise<DigimonDetail> {
  const url = `${BASE_URL}/digimon/${identifier}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching Digimon detail for ${identifier}:`, error);
    throw error;
  }
}

// Función para obtener lista de atributos
export async function getAttributes(): Promise<{ content: DigimonAttribute[] }> {
  const url = `${BASE_URL}/attribute`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // La API podría devolver la data directamente o en un wrapper
    if (Array.isArray(data)) {
      return { content: data };
    }
    return data;
  } catch (error) {
    console.error("Error fetching attributes:", error);
    // Devolver estructura por defecto con atributos conocidos
    return {
      content: [
        { id: 1, attribute: "Vaccine" },
        { id: 2, attribute: "Virus" },
        { id: 3, attribute: "Data" },
        { id: 4, attribute: "Free" },
        { id: 5, attribute: "Variable" },
      ]
    };
  }
}

// Función para obtener lista de niveles
export async function getLevels(): Promise<{ content: DigimonLevel[] }> {
  const url = `${BASE_URL}/level`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // La API podría devolver la data directamente o en un wrapper
    if (Array.isArray(data)) {
      return { content: data };
    }
    return data;
  } catch (error) {
    console.error("Error fetching levels:", error);
    // Devolver estructura por defecto con niveles conocidos
    return {
      content: [
        { id: 1, level: "Baby" },
        { id: 2, level: "In-Training" },
        { id: 3, level: "Rookie" },
        { id: 4, level: "Champion" },
        { id: 5, level: "Ultimate" },
        { id: 6, level: "Mega" },
        { id: 7, level: "Super Ultimate" },
        { id: 8, level: "Armor" },
        { id: 9, level: "Hybrid" },
      ]
    };
  }
}

// Función para obtener lista de tipos
export async function getTypes(): Promise<{ content: DigimonType[] }> {
  const url = `${BASE_URL}/type`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching types:", error);
    throw error;
  }
}

// Función para obtener lista de fields
export async function getFields(): Promise<{ content: DigimonField[] }> {
  const url = `${BASE_URL}/field`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching fields:", error);
    throw error;
  }
}

// Colores para los diferentes atributos de Digimon
export const attributeColors: Record<string, string> = {
  vaccine: "#4ade80", // Verde
  virus: "#ef4444", // Rojo
  data: "#3b82f6", // Azul
  free: "#f59e0b", // Amarillo
  variable: "#8b5cf6", // Púrpura
  unknown: "#6b7280", // Gris
};

// Colores para los niveles de Digimon
export const levelColors: Record<string, string> = {
  baby: "#fbbf24", // Amarillo bebé
  "in-training": "#fb923c", // Naranja claro
  rookie: "#22c55e", // Verde
  champion: "#3b82f6", // Azul
  ultimate: "#8b5cf6", // Púrpura
  mega: "#ef4444", // Rojo
  "super ultimate": "#dc2626", // Rojo oscuro
  armor: "#f59e0b", // Dorado
  hybrid: "#ec4899", // Rosa
};

// Función helper para obtener imagen principal de un Digimon
export function getMainImage(digimon: DigimonDetail): string {
  if (digimon.images && digimon.images.length > 0) {
    // Preferir imágenes transparentes si están disponibles
    const transparentImage = digimon.images.find(img => img.transparent);
    return transparentImage ? transparentImage.href : digimon.images[0].href;
  }
  return "/pokeball-bg.svg"; // Fallback image
}

// Función helper para formatear nombres de atributos
export function formatAttributeName(attribute: string): string {
  return attribute.charAt(0).toUpperCase() + attribute.slice(1).toLowerCase();
}

// Función helper para formatear nombres de niveles
export function formatLevelName(level: string): string {
  return level.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}