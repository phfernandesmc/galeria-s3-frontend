import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { UploadZone } from "@/components/UploadZone";
import { CATEGORIAS, CATEGORIA_LABELS, CATEGORIA_ACCEPT } from "@/lib/constants";
import { apiClient } from "@/lib/apiClient";

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

const mockedPost = vi.mocked(apiClient.post);

describe("UploadZone", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza file input e select de categoria", () => {
    render(<UploadZone />);

    expect(screen.getByLabelText("Arquivo")).toBeInTheDocument();
    expect(screen.getByLabelText("Categoria")).toBeInTheDocument();
  });

  it("renderiza select com todas as categorias na ordem definida", () => {
    render(<UploadZone />);

    const select = screen.getByLabelText("Categoria") as HTMLSelectElement;
    const options = select.querySelectorAll("option");

    expect(options).toHaveLength(CATEGORIAS.length);
    CATEGORIAS.forEach((cat, index) => {
      expect(options[index]).toHaveValue(cat);
      expect(options[index]).toHaveTextContent(CATEGORIA_LABELS[cat]);
    });
  });

  it("seleciona 'fotos' como categoria padrão", () => {
    render(<UploadZone />);

    const select = screen.getByLabelText("Categoria") as HTMLSelectElement;
    expect(select.value).toBe("fotos");
  });

  it("atualiza accept do file input ao mudar categoria", async () => {
    const user = userEvent.setup();
    render(<UploadZone />);

    const fileInput = screen.getByLabelText("Arquivo") as HTMLInputElement;
    expect(fileInput.accept).toBe(CATEGORIA_ACCEPT["fotos"]);

    const select = screen.getByLabelText("Categoria");
    await user.selectOptions(select, "documentos");

    expect(fileInput.accept).toBe(CATEGORIA_ACCEPT["documentos"]);
  });

  it("desabilita botão de envio quando nenhum arquivo está selecionado", () => {
    render(<UploadZone />);

    const button = screen.getByRole("button", { name: /enviar/i });
    expect(button).toBeDisabled();
  });

  it("habilita botão de envio quando arquivo está selecionado", async () => {
    const user = userEvent.setup();
    render(<UploadZone />);

    const fileInput = screen.getByLabelText("Arquivo");
    const file = new File(["conteudo"], "foto.jpg", { type: "image/jpeg" });
    await user.upload(fileInput, file);

    const button = screen.getByRole("button", { name: /enviar/i });
    expect(button).toBeEnabled();
  });

  it("exibe estado de loading durante upload", async () => {
    const user = userEvent.setup();
    mockedPost.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { nome_original: "foto.jpg" } }), 100))
    );

    render(<UploadZone />);

    const fileInput = screen.getByLabelText("Arquivo");
    const file = new File(["conteudo"], "foto.jpg", { type: "image/jpeg" });
    await user.upload(fileInput, file);

    const button = screen.getByRole("button", { name: /enviar/i });
    await user.click(button);

    expect(screen.getByRole("button", { name: /enviando/i })).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /enviar/i })).toBeInTheDocument();
    });
  });

  it("exibe mensagem de sucesso com nome do arquivo após upload", async () => {
    const user = userEvent.setup();
    mockedPost.mockResolvedValue({ data: { nome_original: "foto.jpg" } });

    render(<UploadZone />);

    const fileInput = screen.getByLabelText("Arquivo");
    const file = new File(["conteudo"], "foto.jpg", { type: "image/jpeg" });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        'Arquivo "foto.jpg" enviado com sucesso!'
      );
    });
  });

  it("reseta file input e categoria para 'fotos' após sucesso", async () => {
    const user = userEvent.setup();
    mockedPost.mockResolvedValue({ data: { nome_original: "doc.pdf" } });

    render(<UploadZone />);

    const select = screen.getByLabelText("Categoria") as HTMLSelectElement;
    await user.selectOptions(select, "documentos");

    const fileInput = screen.getByLabelText("Arquivo") as HTMLInputElement;
    const file = new File(["conteudo"], "doc.pdf", { type: "application/pdf" });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      expect(select.value).toBe("fotos");
      expect(fileInput.value).toBe("");
    });
  });

  it("chama onUploadSuccess após upload bem-sucedido", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    mockedPost.mockResolvedValue({ data: { nome_original: "foto.jpg" } });

    render(<UploadZone onUploadSuccess={onSuccess} />);

    const fileInput = screen.getByLabelText("Arquivo");
    const file = new File(["conteudo"], "foto.jpg", { type: "image/jpeg" });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("exibe mensagem de erro 413 (limite de tamanho)", async () => {
    const user = userEvent.setup();
    mockedPost.mockRejectedValue({
      isAxiosError: true,
      response: { status: 413, data: {} },
    });

    render(<UploadZone />);

    const fileInput = screen.getByLabelText("Arquivo");
    const file = new File(["x"], "grande.jpg", { type: "image/jpeg" });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "O arquivo excede o limite de 10 MB"
      );
    });
  });

  it("exibe detail do backend em erro 400", async () => {
    const user = userEvent.setup();
    mockedPost.mockRejectedValue({
      isAxiosError: true,
      response: { status: 400, data: { detail: "Tipo de arquivo não permitido para esta categoria" } },
    });

    render(<UploadZone />);

    const fileInput = screen.getByLabelText("Arquivo");
    const file = new File(["x"], "foto.jpg", { type: "image/jpeg" });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Tipo de arquivo não permitido para esta categoria"
      );
    });
  });

  it("exibe mensagem genérica com status para outros erros HTTP", async () => {
    const user = userEvent.setup();
    mockedPost.mockRejectedValue({
      isAxiosError: true,
      response: { status: 500, data: {} },
    });

    render(<UploadZone />);

    const fileInput = screen.getByLabelText("Arquivo");
    const file = new File(["x"], "foto.jpg", { type: "image/jpeg" });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Erro ao enviar arquivo (código: 500)"
      );
    });
  });

  it("exibe mensagem de erro de conexão quando não há resposta", async () => {
    const user = userEvent.setup();
    mockedPost.mockRejectedValue({
      isAxiosError: true,
      response: undefined,
    });

    render(<UploadZone />);

    const fileInput = screen.getByLabelText("Arquivo");
    const file = new File(["x"], "foto.jpg", { type: "image/jpeg" });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Erro de conexão. Verifique sua rede."
      );
    });
  });

  it("envia POST com multipart/form-data contendo file e categoria", async () => {
    const user = userEvent.setup();
    mockedPost.mockResolvedValue({ data: { nome_original: "foto.jpg" } });

    render(<UploadZone />);

    const select = screen.getByLabelText("Categoria");
    await user.selectOptions(select, "planilhas");

    const fileInput = screen.getByLabelText("Arquivo");
    const file = new File(["dados"], "planilha.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole("button", { name: /enviar/i }));

    await waitFor(() => {
      expect(mockedPost).toHaveBeenCalledWith(
        "/galeria/upload/",
        expect.any(FormData),
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const formData = mockedPost.mock.calls[0][1] as FormData;
      expect(formData.get("categoria")).toBe("planilhas");
      expect(formData.get("file")).toBeInstanceOf(File);
      expect((formData.get("file") as File).name).toBe("planilha.xlsx");
    });
  });
});
