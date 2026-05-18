import { describe, it, expect } from "vitest";
import { formatFileSize, formatDate } from "./formatters";

describe("formatFileSize", () => {
  it("retorna '0.00 MB' para 0 bytes", () => {
    expect(formatFileSize(0)).toBe("0.00 MB");
  });

  it("retorna '< 0.01 MB' para valores entre 1 e 10239", () => {
    expect(formatFileSize(1)).toBe("< 0.01 MB");
    expect(formatFileSize(5000)).toBe("< 0.01 MB");
    expect(formatFileSize(10239)).toBe("< 0.01 MB");
  });

  it("retorna valor formatado em MB para 10240 bytes", () => {
    expect(formatFileSize(10240)).toBe("0.01 MB");
  });

  it("retorna valor formatado em MB para 1 MB exato", () => {
    expect(formatFileSize(1_048_576)).toBe("1.00 MB");
  });

  it("retorna valor formatado em MB para 10 MB", () => {
    expect(formatFileSize(10_485_760)).toBe("10.00 MB");
  });

  it("arredonda corretamente para 2 casas decimais", () => {
    // 1.5 MB = 1_572_864 bytes
    expect(formatFileSize(1_572_864)).toBe("1.50 MB");
  });
});

describe("formatDate", () => {
  it("retorna '-' para null", () => {
    expect(formatDate(null)).toBe("-");
  });

  it("retorna '-' para undefined", () => {
    expect(formatDate(undefined)).toBe("-");
  });

  it("retorna '-' para string vazia", () => {
    expect(formatDate("")).toBe("-");
  });

  it("formata data ISO em dd/mm/yyyy no locale pt-BR", () => {
    expect(formatDate("2024-12-25T12:00:00Z")).toBe("25/12/2024");
  });

  it("formata data com horário corretamente", () => {
    expect(formatDate("2024-01-15T14:30:00Z")).toBe("15/01/2024");
  });
});
