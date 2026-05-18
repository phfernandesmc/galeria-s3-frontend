import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import * as fc from "fast-check";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { Dashboard } from "@/components/Dashboard";
import { formatDate, formatFileSize } from "@/lib/formatters";

/**
 * Feature: galeria-s3-frontend, Property 7: FileCard grid rendering
 *
 * Validates: Requirements 4.4
 *
 * For any non-empty array of Arquivo objects returned by the API, the Dashboard
 * SHALL render exactly one FileCard per item, and each FileCard SHALL display
 * the corresponding file's name, formatted date, and formatted size.
 */

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

/**
 * Arbitrary for generating valid Arquivo objects with unique names.
 * Generates arrays of 1-10 items with distinct file names.
 */
const dateArb = fc
  .tuple(
    fc.integer({ min: 2020, max: 2025 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 })
  )
  .map(([y, m, d]) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);

const arquivoArb = fc.record({
  id: fc.uuid(),
  nome: fc
    .stringMatching(/^[a-zA-Z0-9_-]+\.[a-z]{2,4}$/)
    .filter((s) => s.length >= 3 && s.length <= 40),
  data: dateArb,
  tamanho: fc.integer({ min: 10240, max: 100_000_000 }),
});

const arquivosArrayArb = fc
  .array(arquivoArb, { minLength: 1, maxLength: 10 })
  .filter((arr) => {
    const names = arr.map((a) => a.nome);
    return new Set(names).size === names.length;
  });

describe("Property 7: FileCard grid rendering", () => {
  it("para qualquer array não-vazio de Arquivo, o Dashboard renderiza exatamente um FileCard por item com nome, data formatada e tamanho formatado", async () => {
    await fc.assert(
      fc.asyncProperty(arquivosArrayArb, async (arquivos) => {
        server.use(
          http.get("*/galeria/arquivos/", () => {
            return HttpResponse.json({
              total: arquivos.length,
              arquivos,
            });
          })
        );

        const { unmount } = render(<Dashboard categoriaAtiva={null} />);

        // Wait for the first file name to appear (loading finished)
        await waitFor(() => {
          expect(screen.getByText(arquivos[0].nome)).toBeInTheDocument();
        });

        // Verify each arquivo has its name, formatted date, and formatted size rendered
        for (const arquivo of arquivos) {
          // Check file name is displayed
          expect(screen.getByText(arquivo.nome)).toBeInTheDocument();

          // Check formatted date is displayed
          const expectedDate = formatDate(arquivo.data);
          const dateElements = screen.getAllByText(expectedDate);
          expect(dateElements.length).toBeGreaterThanOrEqual(1);

          // Check formatted size is displayed
          const expectedSize = formatFileSize(arquivo.tamanho);
          const sizeElements = screen.getAllByText(expectedSize);
          expect(sizeElements.length).toBeGreaterThanOrEqual(1);
        }

        // Verify the total count of file names matches the array length
        // Each FileCard renders exactly one file name
        const allFileNames = arquivos.map((a) => a.nome);
        for (const name of allFileNames) {
          const elements = screen.getAllByText(name);
          expect(elements).toHaveLength(1);
        }

        unmount();
        server.resetHandlers();
      }),
      { numRuns: 100 }
    );
  }, 120_000);
});
