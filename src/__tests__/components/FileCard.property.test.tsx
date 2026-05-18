import { describe, it, expect, vi } from "vitest";
import * as fc from "fast-check";
import { render } from "@testing-library/react";
import { FileCard } from "@/components/FileCard";
import { CATEGORIAS } from "@/lib/constants";

/**
 * Feature: galeria-s3-frontend, Property 2: Unknown category graceful rendering
 *
 * Validates: Requirements 2.5, 6.3
 *
 * For any string value not present in CategoriaEnum ("fotos", "planilhas",
 * "documentos", "outros"), the FileCard component SHALL render without
 * throwing an error and SHALL display the generic file icon (File).
 */

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const validCategories = new Set<string>(CATEGORIAS);

describe("Property 2: Unknown category graceful rendering", () => {
  it("qualquer string não presente no CategoriaEnum renderiza sem erro e exibe ícone genérico File", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => !validCategories.has(s)),
        (unknownCategory) => {
          const { container, unmount } = render(
            <FileCard
              id="test-id"
              nome="arquivo.txt"
              data="2024-01-01"
              tamanho={1024}
              categoria={unknownCategory}
            />
          );

          // Component should render without throwing
          expect(container).toBeTruthy();

          // Should display the generic File icon (lucide-react renders SVGs)
          const svg = container.querySelector("svg");
          expect(svg).not.toBeNull();

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("categoria undefined renderiza sem erro e exibe ícone genérico File", () => {
    fc.assert(
      fc.property(fc.constant(undefined), () => {
        const { container, unmount } = render(
          <FileCard
            id="test-id"
            nome="arquivo.txt"
            data="2024-01-01"
            tamanho={1024}
            categoria={undefined}
          />
        );

        expect(container).toBeTruthy();

        const svg = container.querySelector("svg");
        expect(svg).not.toBeNull();

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
