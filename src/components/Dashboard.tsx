import { useState, useEffect, type ReactNode } from "react";
import { Loader2, Search, ArrowUpDown, X } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { useDebounce } from "@/lib/useDebounce";
import { FileCard } from "@/components/FileCard";
import type { Categoria } from "@/lib/constants";

interface Arquivo {
  id: string;
  nome: string;
  data: string;
  tamanho: number;
}

type OrdenarPor = "data" | "nome" | "tamanho";
type Ordem = "asc" | "desc";

/**
 * Rótulos de direção contextuais: o significado de asc/desc muda conforme o
 * campo de ordenação, então deixamos isso explícito para o usuário.
 */
const DIRECAO_LABELS: Record<OrdenarPor, { desc: string; asc: string }> = {
  data: { desc: "Mais recente", asc: "Mais antigo" },
  nome: { desc: "Z → A", asc: "A → Z" },
  tamanho: { desc: "Maior primeiro", asc: "Menor primeiro" },
};

const ORDENAR_LABELS: Record<OrdenarPor, string> = {
  data: "Data de envio",
  nome: "Nome",
  tamanho: "Tamanho",
};

interface DashboardProps {
  categoriaAtiva: Categoria | null;
  refreshTrigger?: number;
}

export function Dashboard({ categoriaAtiva, refreshTrigger = 0 }: Readonly<DashboardProps>) {
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [ordenarPor, setOrdenarPor] = useState<OrdenarPor>("data");
  const [ordem, setOrdem] = useState<Ordem>("desc");
  const buscaDebounced = useDebounce(busca, 300);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchArquivos() {
      setIsLoading(true);
      setError(null);

      try {
        const params: Record<string, string> = {};
        if (categoriaAtiva) {
          params.categoria = categoriaAtiva;
        }
        if (buscaDebounced.trim()) {
          params.nome = buscaDebounced.trim();
        }
        params.ordenar_por = ordenarPor;
        params.ordem = ordem;

        const response = await apiClient.get("/galeria/arquivos/", {
          params,
          signal: controller.signal,
        });

        setArquivos(response.data.arquivos);
      } catch {
        if (controller.signal.aborted) return;
        setError("Não foi possível carregar a lista de arquivos");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchArquivos();

    return () => {
      controller.abort();
    };
  }, [categoriaAtiva, refreshTrigger, buscaDebounced, ordenarPor, ordem]);

  let conteudo: ReactNode;
  if (isLoading) {
    conteudo = (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  } else if (error) {
    conteudo = (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  } else if (arquivos.length === 0) {
    conteudo = (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">
          Nenhum arquivo encontrado para o filtro selecionado
        </p>
      </div>
    );
  } else {
    conteudo = (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {arquivos.map((arquivo) => (
          <FileCard
            key={arquivo.id}
            id={arquivo.id}
            nome={arquivo.nome}
            data={arquivo.data}
            tamanho={arquivo.tamanho}
            categoria={categoriaAtiva ?? undefined}
          />
        ))}
      </div>
    );
  }

  let resumoResultados: string;
  if (arquivos.length === 0) {
    resumoResultados = "Nenhum arquivo";
  } else if (arquivos.length === 1) {
    resumoResultados = "1 arquivo";
  } else {
    resumoResultados = `${arquivos.length} arquivos`;
  }

  return (
    <div>
      {/* Barra de filtros */}
      <div className="card-surface mb-4 flex flex-col gap-4 rounded-lg border p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          {/* Busca por nome */}
          <div className="flex flex-col gap-1.5 lg:max-w-sm lg:flex-1">
            <label htmlFor="busca-arquivo" className="text-xs font-medium text-muted-foreground">
              Buscar arquivo
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="busca-arquivo"
                type="text"
                placeholder="Digite o nome do arquivo..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca("")}
                  aria-label="Limpar busca"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Ordenação */}
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <ArrowUpDown className="h-3.5 w-3.5" />
              Ordenar por
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={ordenarPor}
                onChange={(e) => setOrdenarPor(e.target.value as OrdenarPor)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Ordenar por"
              >
                <option value="data">{ORDENAR_LABELS.data}</option>
                <option value="nome">{ORDENAR_LABELS.nome}</option>
                <option value="tamanho">{ORDENAR_LABELS.tamanho}</option>
              </select>
              <select
                value={ordem}
                onChange={(e) => setOrdem(e.target.value as Ordem)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Direção da ordenação"
              >
                <option value="desc">{DIRECAO_LABELS[ordenarPor].desc}</option>
                <option value="asc">{DIRECAO_LABELS[ordenarPor].asc}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resumo dos resultados */}
        {!isLoading && !error && (
          <div className="flex items-center gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
            <span>
              {resumoResultados}
            </span>
            {busca.trim() && (
              <span className="truncate">
                · busca: <span className="text-foreground">{busca.trim()}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      {conteudo}
    </div>
  );
}
