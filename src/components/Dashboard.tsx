import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { FileCard } from "@/components/FileCard";
import type { Categoria } from "@/lib/constants";

interface Arquivo {
  id: string;
  nome: string;
  data: string;
  tamanho: number;
}

interface DashboardProps {
  categoriaAtiva: Categoria | null;
  refreshTrigger?: number;
}

export function Dashboard({ categoriaAtiva, refreshTrigger = 0 }: Readonly<DashboardProps>) {
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [categoriaAtiva, refreshTrigger]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (arquivos.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">
          Nenhum arquivo encontrado para o filtro selecionado
        </p>
      </div>
    );
  }

  return (
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
  );
}
