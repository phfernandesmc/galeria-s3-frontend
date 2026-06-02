import { useState, useEffect } from "react";
import { Download, Loader2, Calendar, HardDrive } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient";
import { formatFileSize, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  getCategoriaStyle,
  getCategoriaFromNome,
} from "@/lib/constants";

export interface FileCardProps {
  id: string;
  nome: string;
  data: string | null;
  tamanho: number;
  categoria?: string;
}

const CATEGORIAS_VALIDAS = new Set<string>([
  "fotos",
  "planilhas",
  "documentos",
  "outros",
]);

function truncateName(nome: string): string {
  if (nome.length > 40) {
    return nome.slice(0, 37) + "...";
  }
  return nome;
}

/**
 * Determina a categoria efetiva do arquivo: usa a categoria explícita quando
 * válida, caso contrário deriva da extensão do nome do arquivo.
 */
function resolverCategoria(categoria: string | undefined, nome: string): string {
  if (categoria && CATEGORIAS_VALIDAS.has(categoria)) {
    return categoria;
  }
  return getCategoriaFromNome(nome);
}

export function FileCard({ id, nome, data, tamanho, categoria }: Readonly<FileCardProps>) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (!downloadError) return;
    const timer = setTimeout(() => {
      setDownloadError(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [downloadError]);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      const response = await apiClient.get(`/galeria/arquivos/${id}/download`);
      window.open(response.data.url_download, "_blank");
    } catch {
      setDownloadError("Erro ao obter link de download");
    } finally {
      setIsDownloading(false);
    }
  };

  const categoriaEfetiva = resolverCategoria(categoria, nome);
  const style = getCategoriaStyle(categoriaEfetiva);
  const IconComponent = style.icon;

  return (
    <Card
      className={cn(
        "card-surface flex flex-col justify-between border-l-4 transition-shadow hover:shadow-lg hover:shadow-black/30",
        style.borderColor
      )}
    >
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm",
              style.iconBg
            )}
          >
            <IconComponent className={cn("h-6 w-6", style.iconColor)} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight break-all text-foreground" title={nome}>
              {truncateName(nome)}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                {formatDate(data)}
              </span>
              <span className="flex items-center gap-1">
                <HardDrive className="h-3.5 w-3.5 shrink-0" />
                {formatFileSize(tamanho)}
              </span>
            </div>
          </div>
        </div>

        {downloadError && (
          <p className="text-xs text-destructive">{downloadError}</p>
        )}

        <Button
          variant="default"
          size="sm"
          className="w-full"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isDownloading ? "Baixando..." : "Download"}
        </Button>
      </CardContent>
    </Card>
  );
}
