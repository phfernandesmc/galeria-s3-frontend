import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { FileCard } from "@/components/FileCard";
import { apiClient } from "@/lib/apiClient";

/**
 * Feature: galeria-s3-frontend, Property 12: Download request URL formation
 *
 * Validates: Requirements 5.2
 *
 * For any file ID string, clicking the download button on a FileCard SHALL
 * make a GET request to `/galeria/arquivos/{id}/download` where `{id}` is
 * the file's ID.
 */

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

vi.stubGlobal("open", vi.fn());

describe("Property 12: Download request URL formation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("para qualquer ID, o request GET é feito para /galeria/arquivos/{id}/download", async () => {
    const idArb = fc.oneof(
      fc.stringMatching(/^[a-zA-Z0-9_-]+$/).filter(
        (s) => s.length > 0 && s.length <= 64
      ),
      fc.uuid()
    );

    await fc.assert(
      fc.asyncProperty(idArb, async (id) => {
        vi.mocked(apiClient.get).mockResolvedValue({
          data: { url_download: "https://example.com/file" },
        });

        const user = userEvent.setup();

        const { unmount } = render(
          <FileCard
            id={id}
            nome="test-file.pdf"
            data="2024-01-01T00:00:00Z"
            tamanho={1024}
            categoria="documentos"
          />
        );

        const btn = screen.getByRole("button", { name: /download/i });
        await user.click(btn);

        await waitFor(() => {
          expect(apiClient.get).toHaveBeenCalledWith(
            `/galeria/arquivos/${id}/download`
          );
        });

        unmount();
        vi.clearAllMocks();
      }),
      { numRuns: 100 }
    );
  }, 60_000);
});
