import { describe, it, expect } from "vitest";
import {
  CATEGORIAS,
  CATEGORIA_LABELS,
  CATEGORIA_ACCEPT,
  CATEGORIA_ICONS,
  getCategoriaIcon,
} from "./constants";
import { Image, FileSpreadsheet, FileText, File } from "lucide-react";

describe("constants", () => {
  it("CATEGORIAS contém exatamente 4 valores na ordem correta", () => {
    expect(CATEGORIAS).toEqual(["fotos", "planilhas", "documentos", "outros"]);
    expect(CATEGORIAS).toHaveLength(4);
  });

  it("CATEGORIA_LABELS mapeia cada categoria para label de exibição", () => {
    expect(CATEGORIA_LABELS.fotos).toBe("Fotos");
    expect(CATEGORIA_LABELS.planilhas).toBe("Planilhas");
    expect(CATEGORIA_LABELS.documentos).toBe("Documentos");
    expect(CATEGORIA_LABELS.outros).toBe("Outros");
  });

  it("CATEGORIA_ACCEPT define MIME types para cada categoria", () => {
    expect(CATEGORIA_ACCEPT.fotos).toContain("image/jpeg");
    expect(CATEGORIA_ACCEPT.fotos).toContain("image/png");
    expect(CATEGORIA_ACCEPT.planilhas).toContain("application/vnd.ms-excel");
    expect(CATEGORIA_ACCEPT.planilhas).toContain("text/csv");
    expect(CATEGORIA_ACCEPT.documentos).toContain("application/pdf");
    expect(CATEGORIA_ACCEPT.documentos).toContain("text/plain");
    expect(CATEGORIA_ACCEPT.outros).toContain("image/jpeg");
    expect(CATEGORIA_ACCEPT.outros).toContain("application/pdf");
    expect(CATEGORIA_ACCEPT.outros).toContain("text/csv");
  });

  it("CATEGORIA_ICONS mapeia categorias para componentes Lucide React", () => {
    expect(CATEGORIA_ICONS.fotos).toBe(Image);
    expect(CATEGORIA_ICONS.planilhas).toBe(FileSpreadsheet);
    expect(CATEGORIA_ICONS.documentos).toBe(FileText);
    expect(CATEGORIA_ICONS.outros).toBe(File);
  });

  it("getCategoriaIcon retorna ícone correto para categorias conhecidas", () => {
    expect(getCategoriaIcon("fotos")).toBe(Image);
    expect(getCategoriaIcon("planilhas")).toBe(FileSpreadsheet);
    expect(getCategoriaIcon("documentos")).toBe(FileText);
    expect(getCategoriaIcon("outros")).toBe(File);
  });

  it("getCategoriaIcon retorna File como fallback para categorias desconhecidas", () => {
    expect(getCategoriaIcon("inexistente")).toBe(File);
    expect(getCategoriaIcon("")).toBe(File);
    expect(getCategoriaIcon("FOTOS")).toBe(File);
  });
});
