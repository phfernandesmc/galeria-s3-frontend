import { useState, useEffect } from "react";
import { Loader2, Search } from "lucide-react";
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

  return (
    <div>
      {/* Barra de filtros */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Busca por nome */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Ordenação */}
        <div className="flex items-center gap-2">
          <select
            value={ordenarPor}
            onChange={(e) => setOrdenarPor(e.target.value as OrdenarPor)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            aria-label="Ordenar por"
          >
            <option value="data">Data</option>
            <option value="nome">Nome</option>
            <option value="tamanho">Tamanho</option>
          </select>
          <select
            value={ordem}
            onChange={(e) => setOrdem(e.target.value as Ordem)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            aria-label="Direção"
          >
            <option value="desc">Mais recente</option>
            <option value="asc">Mais antigo</option>
          </select>
        </div>
      </div>

      {/* Conteúdo */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : arquivos.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            Nenhum arquivo encontrado para o filtro selecionado
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {arquivos.map((arquivo) => (
            <FileCard
              key={arquivo.id}
              id={arquivo.id}
              nome={arquivo.nome}
              data={arquivo.data}
              tamanho={arquivo.tamanho}
            />
          ))}
        </div>
      )}
    </div>
  );
}
