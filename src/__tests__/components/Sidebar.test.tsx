import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Sidebar } from "@/components/Sidebar";
import { CATEGORIAS, CATEGORIA_LABELS } from "@/lib/constants";

describe("Sidebar", () => {
  it("renderiza botão 'Todos' e todos os botões de categoria na ordem correta", () => {
    render(<Sidebar categoriaAtiva={null} onCategoriaChange={() => {}} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(CATEGORIAS.length + 1);
    expect(buttons[0]).toHaveTextContent("Todos");
    CATEGORIAS.forEach((cat, index) => {
      expect(buttons[index + 1]).toHaveTextContent(CATEGORIA_LABELS[cat]);
    });
  });

  it("destaca visualmente o botão 'Todos' quando categoriaAtiva é null", () => {
    render(<Sidebar categoriaAtiva={null} onCategoriaChange={() => {}} />);

    const todosButton = screen.getByRole("button", { name: "Todos" });
    // O botão "Todos" ativo usa o degradê multicolor (estilo Instagram)
    expect(todosButton.className).toContain("sidebar-todos-active");
  });

  it("destaca visualmente o botão da categoria ativa com a cor da categoria", () => {
    render(<Sidebar categoriaAtiva="fotos" onCategoriaChange={() => {}} />);

    const fotosButton = screen.getByRole("button", { name: "Fotos" });
    const todosButton = screen.getByRole("button", { name: "Todos" });

    // A categoria ativa é preenchida com sua cor sólida
    expect(fotosButton.className).toContain("bg-blue-500");
    // "Todos" não está ativo, então não recebe o degradê
    expect(todosButton.className).not.toContain("sidebar-todos-active");
  });

  it("chama onCategoriaChange com null ao clicar em 'Todos'", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Sidebar categoriaAtiva="fotos" onCategoriaChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Todos" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("chama onCategoriaChange com a categoria ao clicar em um botão de categoria", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Sidebar categoriaAtiva={null} onCategoriaChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Documentos" }));
    expect(onChange).toHaveBeenCalledWith("documentos");
  });
});
