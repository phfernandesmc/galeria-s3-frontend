import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileCard } from "@/components/FileCard";
import { apiClient } from "@/lib/apiClient";

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

/**
 * Feature: galeria-s3-frontend, Property 11: Download URL opens in new tab
 * Validates: Requirements 5.4
 */
describe("Property 11: Download URL opens in new tab", () => {
  let mockOpen: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOpen = vi.fn();
    vi.stubGlobal("open", mockOpen);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("for any valid URL returned in url_download, window.open is called with that exact URL and '_blank'", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.webUrl(),
        async (generatedUrl) => {
          mockOpen.mockClear();
          vi.mocked(apiClient.get).mockResolvedValue({
            data: { url_download: generatedUrl },
          });

          const { unmount } = render(
            <FileCard
              id="test-id"
              nome="arquivo.pdf"
              data="2024-01-01"
              tamanho={1024}
              categoria="documentos"
            />
          );

          const downloadButton = screen.getByRole("button", { name: /download/i });
          await userEvent.click(downloadButton);

          await waitFor(() => {
            expect(mockOpen).toHaveBeenCalledTimes(1);
          });

          expect(mockOpen).toHaveBeenCalledWith(generatedUrl, "_blank");

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);
});
