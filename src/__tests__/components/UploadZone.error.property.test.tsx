import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";
import { UploadZone } from "@/components/UploadZone";
import { apiClient } from "@/lib/apiClient";

/**
 * Feature: galeria-s3-frontend, Property 4: Upload error message display
 *
 * Validates: Requirements 3.5, 3.6, 3.7
 *
 * For any HTTP error response from the upload endpoint: if status is 400,
 * the displayed error message SHALL contain the `detail` field from the
 * response body; if status is 413, the message SHALL indicate the 10MB limit;
 * for any other error status code, the message SHALL include that status code.
 */

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

const mockedPost = vi.mocked(apiClient.post);

async function renderAndSubmitWithError(errorResponse: {
  status: number;
  data: Record<string, unknown>;
}): Promise<string> {
  mockedPost.mockRejectedValueOnce({
    isAxiosError: true,
    response: errorResponse,
  });

  const user = userEvent.setup();
  const { unmount } = render(<UploadZone />);

  const fileInput = screen.getByLabelText("Arquivo");
  const file = new File(["conteudo"], "test.jpg", { type: "image/jpeg" });
  await user.upload(fileInput, file);
  await user.click(screen.getByRole("button", { name: /enviar/i }));

  const alert = await waitFor(() => screen.getByRole("alert"));
  const text = alert.textContent ?? "";

  unmount();
  return text;
}

describe("Property 4: Upload error message display", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("status 413 exibe mensagem indicando limite de 10 MB", async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(413), async () => {
        const text = await renderAndSubmitWithError({
          status: 413,
          data: {},
        });
        expect(text).toBe("O arquivo excede o limite de 10 MB");
      }),
      { numRuns: 100 }
    );
  }, 30000);

  it("status 400 exibe o campo detail da resposta do backend", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
        async (detail) => {
          const text = await renderAndSubmitWithError({
            status: 400,
            data: { detail },
          });
          expect(text).toContain(detail);
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  it("outros status codes exibem mensagem genérica com o código", async () => {
    const otherStatusArb = fc
      .integer({ min: 401, max: 599 })
      .filter((s) => s !== 413);

    await fc.assert(
      fc.asyncProperty(otherStatusArb, async (status) => {
        const text = await renderAndSubmitWithError({
          status,
          data: {},
        });
        expect(text).toBe(`Erro ao enviar arquivo (código: ${status})`);
      }),
      { numRuns: 100 }
    );
  }, 30000);
});
