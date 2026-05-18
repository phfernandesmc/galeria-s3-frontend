import { Image, FileSpreadsheet, FileText, File } from "lucide-react";

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
  return CATEGORIA_ICONS[categoria] ?? File;
}
