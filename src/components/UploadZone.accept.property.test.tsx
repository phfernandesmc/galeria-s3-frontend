import { describe, it, expect, vi } from "vitest";
import * as fc from "fast-check";
import { render, screen } from "@testing-library/react";
import { UploadZone } from "./UploadZone";
import { CATEGORIAS, CATEGORIA_ACCEPT, type Categoria } from "@/lib/constants";

/**
 * Feature: galeria-s3-frontend, Property 5: File input accept attribute per category
 *
 * Validates: Requirements 3.9
 *
 * For any CategoriaEnum value selected in the UploadZone, the file input's
 * `accept` attribute SHALL contain exactly the MIME types defined in
 * CATEGORIA_ACCEPT for that category.
 */

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe("Property 5: File input accept attribute per category", () => {
  it("para qualquer categoria selecionada, o atributo accept do file input contém exatamente os MIME types definidos em CATEGORIA_ACCEPT", () => {
    const categoriaArb = fc.constantFrom(...CATEGORIAS);

    fc.assert(
      fc.property(categoriaArb, (categoria: Categoria) => {
        const { unmount } = render(<UploadZone />);

        const select = screen.getByLabelText("Categoria") as HTMLSelectElement;
        const fileInput = screen.getByLabelText("Arquivo") as HTMLInputElement;

        // Simulate selecting the category synchronously via DOM
        // Since React state updates are synchronous in test environment with act(),
        // we use fireEvent for synchronous property testing
        select.value = categoria;
        select.dispatchEvent(new Event("change", { bubbles: true }));

        // Verify the accept attribute matches CATEGORIA_ACCEPT for the selected category
        expect(fileInput.getAttribute("accept")).toBe(CATEGORIA_ACCEPT[categoria]);

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it("a categoria padrão 'fotos' tem o accept correto ao renderizar", () => {
    fc.assert(
      fc.property(fc.constant("fotos" as Categoria), (categoria) => {
        const { unmount } = render(<UploadZone />);

        const fileInput = screen.getByLabelText("Arquivo") as HTMLInputElement;
        expect(fileInput.getAttribute("accept")).toBe(CATEGORIA_ACCEPT[categoria]);

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it("todas as categorias do enum possuem MIME types definidos e o accept reflete exatamente", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: CATEGORIAS.length - 1 }),
        (index) => {
          const categoria = CATEGORIAS[index];
          const { unmount } = render(<UploadZone />);

          const select = screen.getByLabelText("Categoria") as HTMLSelectElement;
          const fileInput = screen.getByLabelText("Arquivo") as HTMLInputElement;

          select.value = categoria;
          select.dispatchEvent(new Event("change", { bubbles: true }));

          const acceptValue = fileInput.getAttribute("accept");

          // Accept must be exactly the value from CATEGORIA_ACCEPT
          expect(acceptValue).toBe(CATEGORIA_ACCEPT[categoria]);

          // Accept must not be empty
          expect(acceptValue).not.toBe("");

          // Accept must contain valid MIME type format (type/subtype separated by commas)
          const mimeTypes = acceptValue!.split(",");
          for (const mime of mimeTypes) {
            expect(mime).toMatch(/^[a-z]+\/[a-z0-9.+-]+$/);
          }

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
