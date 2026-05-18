import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";
import { UploadZone } from "./UploadZone";
import { apiClient } from "@/lib/apiClient";
import { CATEGORIAS, type Categoria } from "@/lib/constants";

/**
 * Feature: galeria-s3-frontend, Property 3: Upload request formation
 *
 * Validates: Requirements 3.2
 *
 * For any valid file (non-empty) and any CategoriaEnum value, submitting the
 * UploadZone SHALL produce a POST request to `/galeria/upload/` with
 * `multipart/form-data` containing the file in the `file` field and the
 * category string in the `categoria` field.
 */

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

const mockedPost = vi.mocked(apiClient.post);

describe("Property 3: Upload request formation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("para qualquer arquivo válido e qualquer categoria, o submit produz um POST para /galeria/upload/ com multipart/form-data contendo file e categoria", async () => {
    const fileNameArb = fc
      .tuple(
        fc.stringMatching(/^[a-zA-Z0-9]{1,20}$/),
        fc.constantFrom("jpg", "png", "pdf", "csv", "txt", "doc", "xlsx")
      )
      .map(([name, ext]) => `${name}.${ext}`);

    const categoriaArb = fc.constantFrom(...CATEGORIAS);

    await fc.assert(
      fc.asyncProperty(fileNameArb, categoriaArb, async (fileName, categoria) => {
        cleanup();
        mockedPost.mockReset();
        mockedPost.mockResolvedValueOnce({
          data: { nome_original: fileName, caminho_s3: "s3://bucket/file", categoria, tamanho_bytes: 100 },
        });

        const { unmount } = render(<UploadZone />);

        // Select the category using fireEvent for synchronous property testing
        const select = screen.getByLabelText("Categoria") as HTMLSelectElement;
        fireEvent.change(select, { target: { value: categoria } });

        // Upload a file using fireEvent to bypass accept attribute filtering
        const fileInput = screen.getByLabelText("Arquivo") as HTMLInputElement;
        const file = new File(["conteudo-teste"], fileName, { type: "application/octet-stream" });
        Object.defineProperty(fileInput, "files", { value: [file], configurable: true });
        fireEvent.change(fileInput);

        // Click submit
        const submitButton = screen.getByRole("button", { name: /enviar/i });
        fireEvent.click(submitButton);

        // Wait for the post to be called
        await waitFor(() => {
          expect(mockedPost).toHaveBeenCalled();
        });

        // Verify: apiClient.post was called with `/galeria/upload/`
        const [url, formData, config] = mockedPost.mock.calls[0];
        expect(url).toBe("/galeria/upload/");

        // Verify: FormData contains the file in the `file` field
        expect(formData).toBeInstanceOf(FormData);
        const sentFile = (formData as FormData).get("file") as File;
        expect(sentFile).toBeInstanceOf(File);
        expect(sentFile.name).toBe(fileName);

        // Verify: FormData contains the category in the `categoria` field
        const sentCategoria = (formData as FormData).get("categoria");
        expect(sentCategoria).toBe(categoria);

        // Verify: Content-Type header is multipart/form-data
        expect(config).toBeDefined();
        expect((config as Record<string, unknown>).headers).toBeDefined();
        expect(
          ((config as Record<string, unknown>).headers as Record<string, string>)["Content-Type"]
        ).toBe("multipart/form-data");

        unmount();
      }),
      { numRuns: 100 }
    );
  }, 60000);
});
