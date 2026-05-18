import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FileCard } from "@/components/FileCard";
import { apiClient } from "@/lib/apiClient";

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const mockWindowOpen = vi.fn();
Object.defineProperty(window, "open", {
  value: mockWindowOpen,
  writable: true,
});

describe("FileCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultProps = {
    id: "abc-123",
    nome: "documento.pdf",
    data: "2024-12-25T12:00:00Z",
    tamanho: 1_048_576,
    categoria: "documentos",
  };

  it("renderiza nome, data formatada e tamanho formatado", () => {
    render(<FileCard {...defaultProps} />);

    expect(screen.getByText("documento.pdf")).toBeInTheDocument();
    expect(screen.getByText("25/12/2024")).toBeInTheDocument();
    expect(screen.getByText("1.00 MB")).toBeInTheDocument();
  });

  it("trunca nome com mais de 40 caracteres", () => {
    const longName = "a".repeat(41);
    render(<FileCard {...defaultProps} nome={longName} />);

    expect(screen.getByText("a".repeat(37) + "...")).toBeInTheDocument();
  });

  it("não trunca nome com 40 caracteres ou menos", () => {
    const exactName = "b".repeat(40);
    render(<FileCard {...defaultProps} nome={exactName} />);

    expect(screen.getByText(exactName)).toBeInTheDocument();
  });

  it("exibe '-' quando data é null", () => {
    render(<FileCard {...defaultProps} data={null} />);

    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("exibe botão de download", () => {
    render(<FileCard {...defaultProps} />);

    expect(screen.getByRole("button", { name: /download/i })).toBeInTheDocument();
  });

  it("faz download com sucesso: GET + window.open", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    const mockUrl = "https://s3.amazonaws.com/bucket/file.pdf?signed=abc";
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { url_download: mockUrl },
    });

    render(<FileCard {...defaultProps} />);
    const btn = screen.getByRole("button", { name: /download/i });
    await user.click(btn);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith("/galeria/arquivos/abc-123/download");
    });
    await waitFor(() => {
      expect(mockWindowOpen).toHaveBeenCalledWith(mockUrl, "_blank");
    });
  });

  it("exibe estado de loading durante download", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(apiClient.get).mockReturnValueOnce(promise as any);

    render(<FileCard {...defaultProps} />);
    const btn = screen.getByRole("button", { name: /download/i });
    await user.click(btn);

    expect(screen.getByRole("button", { name: /baixando/i })).toBeDisabled();

    resolvePromise!({ data: { url_download: "https://example.com" } });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /download/i })).toBeEnabled();
    });
  });

  it("exibe erro temporário de 5 segundos quando download falha", async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error("Network error"));

    render(<FileCard {...defaultProps} />);
    const btn = screen.getByRole("button", { name: /download/i });
    await user.click(btn);

    await waitFor(() => {
      expect(screen.getByText("Erro ao obter link de download")).toBeInTheDocument();
    });

    // Botão volta ao estado normal após o erro
    expect(screen.getByRole("button", { name: /download/i })).toBeEnabled();
  });

  it("renderiza sem erro com categoria desconhecida", () => {
    render(<FileCard {...defaultProps} categoria="inexistente" />);

    expect(screen.getByText("documento.pdf")).toBeInTheDocument();
  });

  it("renderiza sem erro quando categoria é undefined", () => {
    render(<FileCard {...defaultProps} categoria={undefined} />);

    expect(screen.getByText("documento.pdf")).toBeInTheDocument();
  });
});
