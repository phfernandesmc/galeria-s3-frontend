import { useState, useEffect } from "react";
import { Download, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient";
import { formatFileSize, formatDate } from "@/lib/formatters";
import { getCategoriaIcon } from "@/lib/constants";

export interface FileCardProps {
  id: string;
  nome: string;
  data: string | null;
  tamanho: number;
  categoria?: string;
}

function truncateName(nome: string): string {
  if (nome.length > 40) {
    return nome.slice(0, 37) + "...";
  }
  return nome;
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

  const IconComponent = getCategoriaIcon(categoria ?? "outros");

  return (
    <Card className="flex flex-col justify-between">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <IconComponent className="h-6 w-6 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-tight break-all" title={nome}>
              {truncateName(nome)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDate(data)}</span>
          <span>{formatFileSize(tamanho)}</span>
        </div>

        {downloadError && (
          <p className="text-xs text-destructive">{downloadError}</p>
        )}

        <Button
          variant="outline"
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
