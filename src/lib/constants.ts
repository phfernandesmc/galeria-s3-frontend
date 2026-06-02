import {
  Image,
  FileSpreadsheet,
  FileText,
  File,
  type LucideIcon,
} from "lucide-react";

export const CATEGORIAS = ["fotos", "planilhas", "documentos", "outros"] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export const CATEGORIA_LABELS: Record<Categoria, string> = {
  fotos: "Fotos",
  planilhas: "Planilhas",
  documentos: "Documentos",
  outros: "Outros",
};

export const CATEGORIA_ACCEPT: Record<Categoria, string> = {
  fotos: "image/jpeg,image/png,image/gif,image/webp,image/svg+xml",
  planilhas:
    "application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv",
  documentos:
    "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain",
  outros:
    "image/jpeg,image/png,image/gif,image/webp,image/svg+xml,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain",
};

export const CATEGORIA_ICONS: Record<string, React.ComponentType<any>> = {
  fotos: Image,
  planilhas: FileSpreadsheet,
  documentos: FileText,
  outros: File,
};

export function getCategoriaIcon(categoria: string): React.ComponentType<any> {
  if (Object.prototype.hasOwnProperty.call(CATEGORIA_ICONS, categoria)) {
    return CATEGORIA_ICONS[categoria];
  }
  return File;
}

/**
 * Estilo visual (ícone + cores) associado a cada categoria.
 *
 * `iconColor` é a cor do glifo, `iconBg` é o fundo do badge arredondado que
 * envolve o ícone. As classes usam tons sólidos do Tailwind para garantir
 * identificação rápida do tipo de arquivo, independente do tema.
 */
export interface CategoriaStyle {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly iconColor: string;
  readonly iconBg: string;
  /** Cor do glifo quando exibido sobre fundo claro (ex.: sidebar). */
  readonly iconColorText: string;
  /** Cor da borda esquerda de destaque no card (top/accent). */
  readonly borderColor: string;
  /** Fundo do item selecionado na sidebar (cor sólida da categoria). */
  readonly selectedBg: string;
  /** Classe do gradiente de fundo da aplicação para esta categoria. */
  readonly bgClass: string;
}

export const CATEGORIA_STYLES: Record<Categoria, CategoriaStyle> = {
  fotos: {
    icon: Image,
    label: "Fotos",
    iconColor: "text-white",
    iconBg: "bg-blue-500",
    iconColorText: "text-blue-400",
    borderColor: "border-l-blue-500",
    selectedBg: "bg-blue-500 hover:bg-blue-500",
    bgClass: "app-bg-fotos",
  },
  planilhas: {
    icon: FileSpreadsheet,
    label: "Planilhas",
    iconColor: "text-white",
    iconBg: "bg-green-500",
    iconColorText: "text-green-400",
    borderColor: "border-l-green-500",
    selectedBg: "bg-green-500 hover:bg-green-500",
    bgClass: "app-bg-planilhas",
  },
  documentos: {
    icon: FileText,
    label: "Documentos",
    iconColor: "text-white",
    iconBg: "bg-orange-500",
    iconColorText: "text-orange-400",
    borderColor: "border-l-orange-500",
    selectedBg: "bg-orange-500 hover:bg-orange-500",
    bgClass: "app-bg-documentos",
  },
  outros: {
    icon: File,
    label: "Outros",
    iconColor: "text-white",
    iconBg: "bg-slate-500",
    iconColorText: "text-slate-300",
    borderColor: "border-l-slate-500",
    selectedBg: "bg-slate-500 hover:bg-slate-500",
    bgClass: "app-bg-outros",
  },
};

const FALLBACK_STYLE: CategoriaStyle = CATEGORIA_STYLES.outros;

function isCategoria(value: string): value is Categoria {
  return Object.prototype.hasOwnProperty.call(CATEGORIA_STYLES, value);
}

/**
 * Mapeia extensões de arquivo conhecidas para uma categoria, permitindo
 * derivar o ícone/cor corretos mesmo quando a API não informa a categoria.
 */
const EXTENSION_TO_CATEGORIA: Record<string, Categoria> = {
  jpg: "fotos",
  jpeg: "fotos",
  png: "fotos",
  gif: "fotos",
  webp: "fotos",
  svg: "fotos",
  xls: "planilhas",
  xlsx: "planilhas",
  csv: "planilhas",
  pdf: "documentos",
  doc: "documentos",
  docx: "documentos",
  txt: "documentos",
};

/**
 * Extrai a categoria a partir da extensão do nome do arquivo.
 * Retorna "outros" quando a extensão é desconhecida ou ausente.
 */
export function getCategoriaFromNome(nome: string): Categoria {
  const dotIndex = nome.lastIndexOf(".");
  if (dotIndex === -1 || dotIndex === nome.length - 1) {
    return "outros";
  }
  const ext = nome.slice(dotIndex + 1).toLowerCase();
  return EXTENSION_TO_CATEGORIA[ext] ?? "outros";
}

/**
 * Mapeia um MIME type para a categoria específica (fotos/planilhas/documentos)
 * que o aceita, conforme CATEGORIA_ACCEPT. Retorna null se nenhuma categoria
 * específica corresponder (ex.: MIME vazio, genérico ou desconhecido).
 *
 * "outros" é deliberadamente ignorado aqui, pois aceita a união de todos os
 * tipos — queremos sempre a categoria mais específica possível.
 */
function getCategoriaFromMime(mime: string): Categoria | null {
  const especificas: Categoria[] = ["fotos", "planilhas", "documentos"];
  for (const cat of especificas) {
    if (CATEGORIA_ACCEPT[cat].split(",").includes(mime)) {
      return cat;
    }
  }
  return null;
}

/**
 * Detecta a categoria de um arquivo. Prioriza o MIME type (o mesmo critério
 * que o backend usa para validar) e, como fallback, usa a extensão do nome.
 * Garante que o ícone exibido e a categoria enviada correspondam ao arquivo.
 */
export function getCategoriaFromFile(file: File): Categoria {
  const mime = file.type?.trim().toLowerCase();
  if (mime) {
    const fromMime = getCategoriaFromMime(mime);
    if (fromMime) return fromMime;
  }
  return getCategoriaFromNome(file.name);
}

/**
 * Resolve o estilo visual de uma categoria. Aceita tanto uma categoria
 * explícita quanto qualquer string, com fallback seguro para "outros".
 */
export function getCategoriaStyle(categoria: string | undefined): CategoriaStyle {
  if (categoria && isCategoria(categoria)) {
    return CATEGORIA_STYLES[categoria];
  }
  return FALLBACK_STYLE;
}
