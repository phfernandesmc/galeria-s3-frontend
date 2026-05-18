import { Button } from "@/components/ui/button";
import { CATEGORIAS, CATEGORIA_LABELS, type Categoria } from "@/lib/constants";

interface SidebarProps {
  readonly categoriaAtiva: Categoria | null;
  readonly onCategoriaChange: (cat: Categoria | null) => void;
}

export function Sidebar({ categoriaAtiva, onCategoriaChange }: SidebarProps) {
  return (
    <nav className="flex flex-col gap-1">
      <Button
        variant={categoriaAtiva === null ? "default" : "ghost"}
        className="justify-start"
        onClick={() => onCategoriaChange(null)}
      >
        Todos
      </Button>
      {CATEGORIAS.map((cat) => (
        <Button
          key={cat}
          variant={categoriaAtiva === cat ? "default" : "ghost"}
          className="justify-start"
          onClick={() => onCategoriaChange(cat)}
        >
          {CATEGORIA_LABELS[cat]}
        </Button>
      ))}
    </nav>
  );
}
