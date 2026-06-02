import { LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CATEGORIAS,
  CATEGORIA_LABELS,
  CATEGORIA_STYLES,
  type Categoria,
} from "@/lib/constants";

interface SidebarProps {
  readonly categoriaAtiva: Categoria | null;
  readonly onCategoriaChange: (cat: Categoria | null) => void;
}

export function Sidebar({ categoriaAtiva, onCategoriaChange }: SidebarProps) {
  const todosAtivo = categoriaAtiva === null;

  return (
    <nav className="flex flex-col gap-1">
      <Button
        variant="ghost"
        className={cn(
          "justify-start gap-3 transition-colors",
          todosAtivo
            ? "sidebar-todos-active border-transparent text-white shadow-md hover:text-white hover:opacity-95"
            : "text-foreground hover:bg-accent"
        )}
        onClick={() => onCategoriaChange(null)}
      >
        <LayoutGrid className="h-4 w-4 shrink-0" />
        Todos
      </Button>
      {CATEGORIAS.map((cat) => {
        const style = CATEGORIA_STYLES[cat];
        const Icon = style.icon;
        const isAtiva = categoriaAtiva === cat;
        return (
          <Button
            key={cat}
            variant="ghost"
            className={cn(
              "justify-start gap-3 transition-colors",
              isAtiva
                ? cn(style.selectedBg, "text-white shadow-md hover:text-white")
                : "text-foreground hover:bg-accent"
            )}
            onClick={() => onCategoriaChange(cat)}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
                isAtiva ? "text-white" : style.iconColorText
              )}
            />
            {CATEGORIA_LABELS[cat]}
          </Button>
        );
      })}
    </nav>
  );
}
