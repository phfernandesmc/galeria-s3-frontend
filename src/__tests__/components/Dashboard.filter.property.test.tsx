import { render, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { Dashboard } from "@/components/Dashboard";
import { apiClient } from "@/lib/apiClient";
import { CATEGORIAS, type Categoria } from "@/lib/constants";

/**
 * Feature: galeria-s3-frontend, Property 6: Category filter request parameter
 *
 * Validates: Requirements 4.2, 4.3
 *
 * For any CategoriaEnum value selected in the Sidebar, the Dashboard SHALL
 * make a GET request to `/galeria/arquivos/` with query parameter `categoria`
 * equal to that value. When "All" is selected, the request SHALL have no
 * `categoria` parameter.
 */

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe("Property 6: Category filter request parameter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("para qualquer categoria válida, o request GET inclui categoria como query param", async () => {
    const categoriaArb = fc.constantFrom(...CATEGORIAS);

    await fc.assert(
      fc.asyncProperty(categoriaArb, async (categoria: Categoria) => {
        vi.mocked(apiClient.get).mockResolvedValue({
          data: { total: 0, arquivos: [] },
        });

        const { unmount } = render(
          <Dashboard categoriaAtiva={categoria} />
        );

        await waitFor(() => {
          expect(apiClient.get).toHaveBeenCalledWith(
            "/galeria/arquivos/",
            expect.objectContaining({
              params: { categoria },
              signal: expect.any(AbortSignal),
            })
          );
        });

        unmount();
        vi.clearAllMocks();
      }),
      { numRuns: 100 }
    );
  }, 60_000);

  it("quando categoriaAtiva é null (Todos), o request GET não inclui parâmetro categoria", async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        vi.mocked(apiClient.get).mockResolvedValue({
          data: { total: 0, arquivos: [] },
        });

        const { unmount } = render(
          <Dashboard categoriaAtiva={null} />
        );

        await waitFor(() => {
          expect(apiClient.get).toHaveBeenCalledWith(
            "/galeria/arquivos/",
            expect.objectContaining({
              params: {},
              signal: expect.any(AbortSignal),
            })
          );
        });

        unmount();
        vi.clearAllMocks();
      }),
      { numRuns: 100 }
    );
  }, 60_000);
});
