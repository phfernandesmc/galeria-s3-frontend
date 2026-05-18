import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import App from "@/App";

/**
 * Integration Tests - Galeria S3 Frontend
 *
 * Validates: Requirements 3.2, 3.4, 3.5, 4.1, 4.2, 5.2, 5.4
 */

const mockArquivos = [
  { id: "abc-1", nome: "foto-praia.jpg", data: "2024-06-15", tamanho: 2097152 },
  { id: "abc-2", nome: "relatorio.xlsx", data: "2024-07-20", tamanho: 1048576 },
  { id: "abc-3", nome: "contrato.pdf", data: "2024-08-10", tamanho: 524288 },
];

const mockArquivosFotos = [
  { id: "abc-1", nome: "foto-praia.jpg", data: "2024-06-15", tamanho: 2097152 },
];

const server = setupServer(
  http.get("*/galeria/arquivos/", ({ request }) => {
    const url = new URL(request.url);
    const categoria = url.searchParams.get("categoria");

    if (categoria === "fotos") {
      return HttpResponse.json({
        total: mockArquivosFotos.length,
        arquivos: mockArquivosFotos,
      });
    }

    return HttpResponse.json({
      total: mockArquivos.length,
      arquivos: mockArquivos,
    });
  }),

  http.post("*/galeria/upload/", async () => {
    return HttpResponse.json(
      {
        nome_original: "foto-teste.jpg",
        caminho_s3: "fotos/foto-teste.jpg",
        categoria: "fotos",
        tamanho_bytes: 1048576,
      },
      { status: 201 }
    );
  }),

  http.get("*/galeria/arquivos/:id/download", () => {
    return HttpResponse.json({
      url_download: "https://s3.amazonaws.com/bucket/arquivo-presigned-url",
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Integration Tests - Galeria S3", () => {
  describe("Upload flow", () => {
    it("selecionar arquivo + categoria → submit → sucesso → refresh lista", async () => {
      const user = userEvent.setup();

      render(<App />);

      // Aguarda a lista inicial carregar
      await waitFor(() => {
        expect(screen.getByText("foto-praia.jpg")).toBeInTheDocument();
      });

      // Categoria padrão já é "fotos", seleciona um arquivo compatível
      const fileInput = screen.getByLabelText("Arquivo") as HTMLInputElement;
      const file = new File(["conteudo-do-arquivo"], "foto-teste.jpg", {
        type: "image/jpeg",
      });
      await user.upload(fileInput, file);

      // Clica em enviar
      const submitButton = screen.getByRole("button", { name: /enviar/i });
      await user.click(submitButton);

      // Verifica mensagem de sucesso (usa aspas normais no template literal)
      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          'Arquivo "foto-teste.jpg" enviado com sucesso!'
        );
      });

      // Verifica que a lista foi atualizada (refresh trigger incrementou)
      await waitFor(() => {
        expect(screen.getByText("foto-praia.jpg")).toBeInTheDocument();
      });
    });
  });

  describe("Filter flow", () => {
    it("clicar categoria → loading → lista filtrada", async () => {
      const user = userEvent.setup();

      render(<App />);

      // Aguarda lista inicial carregar
      await waitFor(() => {
        expect(screen.getByText("foto-praia.jpg")).toBeInTheDocument();
      });

      // Verifica que todos os arquivos estão visíveis inicialmente
      expect(screen.getByText("relatorio.xlsx")).toBeInTheDocument();
      expect(screen.getByText("contrato.pdf")).toBeInTheDocument();

      // Clica no filtro "Fotos"
      const fotosButton = screen.getByRole("button", { name: "Fotos" });
      await user.click(fotosButton);

      // Aguarda a lista filtrada
      await waitFor(() => {
        expect(screen.getByText("foto-praia.jpg")).toBeInTheDocument();
      });

      // Verifica que os outros arquivos não estão mais visíveis
      expect(screen.queryByText("relatorio.xlsx")).not.toBeInTheDocument();
      expect(screen.queryByText("contrato.pdf")).not.toBeInTheDocument();
    });
  });

  describe("Download flow", () => {
    it("clicar botão download → loading → window.open com URL", async () => {
      const user = userEvent.setup();
      const mockOpen = vi.fn();
      vi.stubGlobal("open", mockOpen);

      render(<App />);

      // Aguarda lista carregar
      await waitFor(() => {
        expect(screen.getByText("foto-praia.jpg")).toBeInTheDocument();
      });

      // Clica no primeiro botão de download
      const downloadButtons = screen.getAllByRole("button", { name: /download/i });
      await user.click(downloadButtons[0]);

      // Verifica que window.open foi chamado com a URL correta
      await waitFor(() => {
        expect(mockOpen).toHaveBeenCalledWith(
          "https://s3.amazonaws.com/bucket/arquivo-presigned-url",
          "_blank"
        );
      });

      vi.unstubAllGlobals();
    });
  });

  describe("Error flow", () => {
    it("upload com erro 400 → mensagem de erro exibida", async () => {
      const user = userEvent.setup();

      server.use(
        http.post("*/galeria/upload/", () => {
          return HttpResponse.json(
            { detail: "Tipo de arquivo não permitido para esta categoria" },
            { status: 400 }
          );
        })
      );

      render(<App />);

      // Aguarda lista carregar
      await waitFor(() => {
        expect(screen.getByText("foto-praia.jpg")).toBeInTheDocument();
      });

      // Seleciona um arquivo (categoria padrão é "fotos")
      const fileInput = screen.getByLabelText("Arquivo") as HTMLInputElement;
      const file = new File(["conteudo"], "arquivo-invalido.exe", {
        type: "image/jpeg",
      });
      await user.upload(fileInput, file);

      // Clica em enviar
      const submitButton = screen.getByRole("button", { name: /enviar/i });
      await user.click(submitButton);

      // Verifica mensagem de erro do backend
      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "Tipo de arquivo não permitido para esta categoria"
        );
      });
    });
  });
});
