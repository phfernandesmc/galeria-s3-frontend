import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { Dashboard } from "./Dashboard";

const mockArquivos = [
  { id: "1", nome: "foto1.jpg", data: "2024-01-15", tamanho: 1048576 },
  { id: "2", nome: "planilha.xlsx", data: "2024-02-20", tamanho: 2097152 },
  { id: "3", nome: "documento.pdf", data: "2024-03-10", tamanho: 524288 },
];

const server = setupServer(
  http.get("*/galeria/arquivos/", ({ request }) => {
    const url = new URL(request.url);
    const categoria = url.searchParams.get("categoria");

    if (categoria) {
      return HttpResponse.json({
        total: 1,
        arquivos: [mockArquivos[0]],
      });
    }

    return HttpResponse.json({
      total: mockArquivos.length,
      arquivos: mockArquivos,
    });
  })
);

beforeEach(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  server.close();
});

describe("Dashboard", () => {
  it("exibe loading indicator ao montar", () => {
    render(<Dashboard categoriaAtiva={null} />);
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("busca arquivos e renderiza FileCards após carregamento", async () => {
    render(<Dashboard categoriaAtiva={null} />);

    await waitFor(() => {
      expect(screen.getByText("foto1.jpg")).toBeInTheDocument();
    });

    expect(screen.getByText("planilha.xlsx")).toBeInTheDocument();
    expect(screen.getByText("documento.pdf")).toBeInTheDocument();
  });

  it("exibe mensagem de erro quando requisição falha", async () => {
    server.use(
      http.get("*/galeria/arquivos/", () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    render(<Dashboard categoriaAtiva={null} />);

    await waitFor(() => {
      expect(
        screen.getByText("Não foi possível carregar a lista de arquivos")
      ).toBeInTheDocument();
    });
  });

  it("exibe empty state quando lista vazia", async () => {
    server.use(
      http.get("*/galeria/arquivos/", () => {
        return HttpResponse.json({ total: 0, arquivos: [] });
      })
    );

    render(<Dashboard categoriaAtiva={null} />);

    await waitFor(() => {
      expect(
        screen.getByText("Nenhum arquivo encontrado para o filtro selecionado")
      ).toBeInTheDocument();
    });
  });

  it("busca com parâmetro categoria quando categoriaAtiva muda", async () => {
    let capturedUrl = "";
    server.use(
      http.get("*/galeria/arquivos/", ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ total: 1, arquivos: [mockArquivos[0]] });
      })
    );

    render(<Dashboard categoriaAtiva="fotos" />);

    await waitFor(() => {
      expect(capturedUrl).toContain("categoria=fotos");
    });
  });

  it("busca sem parâmetro categoria quando categoriaAtiva é null", async () => {
    let capturedUrl = "";
    server.use(
      http.get("*/galeria/arquivos/", ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({
          total: mockArquivos.length,
          arquivos: mockArquivos,
        });
      })
    );

    render(<Dashboard categoriaAtiva={null} />);

    await waitFor(() => {
      expect(capturedUrl).not.toContain("categoria");
    });
  });

  it("refaz busca quando refreshTrigger é incrementado", async () => {
    let fetchCount = 0;
    server.use(
      http.get("*/galeria/arquivos/", () => {
        fetchCount++;
        return HttpResponse.json({
          total: mockArquivos.length,
          arquivos: mockArquivos,
        });
      })
    );

    const { rerender } = render(
      <Dashboard categoriaAtiva={null} refreshTrigger={0} />
    );

    await waitFor(() => {
      expect(fetchCount).toBe(1);
    });

    rerender(<Dashboard categoriaAtiva={null} refreshTrigger={1} />);

    await waitFor(() => {
      expect(fetchCount).toBe(2);
    });
  });

  it("renderiza grid responsivo com classes corretas", async () => {
    render(<Dashboard categoriaAtiva={null} />);

    await waitFor(() => {
      expect(screen.getByText("foto1.jpg")).toBeInTheDocument();
    });

    const grid = screen.getByText("foto1.jpg").closest(".grid");
    expect(grid).toHaveClass("grid-cols-1");
    expect(grid).toHaveClass("sm:grid-cols-2");
    expect(grid).toHaveClass("lg:grid-cols-3");
  });
});
