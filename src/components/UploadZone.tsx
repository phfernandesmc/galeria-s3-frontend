import { useRef, useState } from "react";
import { Upload, Loader2, FileUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/formatters";
import { Toast, type ToastData } from "@/components/Toast";
import {
  CATEGORIAS,
  CATEGORIA_LABELS,
  CATEGORIA_ACCEPT,
  getCategoriaStyle,
  getCategoriaFromFile,
  type Categoria,
} from "@/lib/constants";

interface UploadZoneProps {
  readonly onUploadSuccess?: () => void;
}

export function UploadZone({ onUploadSuccess }: UploadZoneProps) {
  const [selectedCategory, setSelectedCategory] = useState<Categoria>("fotos");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    // Permite que o usuário sobrescreva manualmente a categoria detectada
    // (ex.: enviar uma planilha como "Outros") sem perder o arquivo já escolhido.
    setSelectedCategory(e.target.value as Categoria);
  }

  function handleFileSelect(file: File | null) {
    setSelectedFile(file);
    if (file) {
      // Detecta a categoria a partir do próprio arquivo (MIME/extensão) para
      // que o ícone exibido e a categoria enviada correspondam ao arquivo,
      // evitando rejeição do backend por categoria incompatível.
      setSelectedCategory(getCategoriaFromFile(file));
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    handleFileSelect(file);
  }

  function clearSelectedFile() {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file) {
      handleFileSelect(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile || isUploading) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("categoria", selectedCategory);

    try {
      const response = await apiClient.post("/galeria/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const nomeOriginal = response.data.nome_original;
      setToast({
        type: "success",
        text: `Arquivo "${nomeOriginal}" enviado com sucesso!`,
      });

      setSelectedFile(null);
      setSelectedCategory("fotos");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onUploadSuccess?.();
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (!error.response) {
          setToast({
            type: "error",
            text: "Erro de conexão. Verifique sua rede.",
          });
        } else if (error.response.status === 413) {
          setToast({
            type: "error",
            text: "O arquivo excede o limite de 10 MB",
          });
        } else if (error.response.status === 400) {
          setToast({
            type: "error",
            text: error.response.data.detail ?? "Erro de validação",
          });
        } else {
          setToast({
            type: "error",
            text: `Erro ao enviar arquivo (código: ${error.response.status})`,
          });
        }
      } else {
        setToast({
          type: "error",
          text: "Erro de conexão. Verifique sua rede.",
        });
      }
    } finally {
      setIsUploading(false);
    }
  }

  const categoriaStyle = getCategoriaStyle(selectedCategory);
  const FileIcon = categoriaStyle.icon;

  return (
    <>
      <form
        onSubmit={handleSubmit}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div
          className={cn(
            "rounded-xl border-2 border-dashed p-4 transition-colors sm:p-6",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-input bg-muted/30"
          )}
        >
          {/* Linha de controles: categoria + enviar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="categoria-select" className="text-sm font-medium">
                Categoria
              </label>
              <select
                id="categoria-select"
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORIA_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" disabled={!selectedFile || isUploading} className="h-10 sm:w-32">
              {isUploading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload />
                  Enviar
                </>
              )}
            </Button>
          </div>

          {/* Área de seleção / drag-and-drop */}
          <div className="mt-3">
            {selectedFile ? (
              <div className="flex items-center gap-3 rounded-lg border border-input bg-background px-3 py-2.5">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    categoriaStyle.iconBg
                  )}
                >
                  <FileIcon className={cn("h-5 w-5", categoriaStyle.iconColor)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" title={selectedFile.name}>
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={clearSelectedFile}
                  aria-label="Remover arquivo selecionado"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label
                htmlFor="file-input"
                className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg py-4 text-center transition-colors hover:bg-muted/50"
              >
                <FileUp className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Arraste um arquivo ou clique para selecionar
                </span>
                <span className="text-xs text-muted-foreground">
                  Categoria: {CATEGORIA_LABELS[selectedCategory]} · até 10 MB
                </span>
              </label>
            )}

            <input
              id="file-input"
              ref={fileInputRef}
              type="file"
              accept={CATEGORIA_ACCEPT[selectedCategory]}
              onChange={handleFileChange}
              className="sr-only"
            />
            <label htmlFor="file-input" className="sr-only">
              Arquivo
            </label>
          </div>
        </div>
      </form>

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </>
  );
}

function isAxiosError(
  error: unknown
): error is { response?: { status: number; data: { detail?: string } } } {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as { isAxiosError: boolean }).isAxiosError === true
  );
}
