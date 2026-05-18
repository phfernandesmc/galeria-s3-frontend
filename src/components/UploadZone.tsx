import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient";
import {
  CATEGORIAS,
  CATEGORIA_LABELS,
  CATEGORIA_ACCEPT,
  type Categoria,
} from "@/lib/constants";

interface UploadZoneProps {
  readonly onUploadSuccess?: () => void;
}

export function UploadZone({ onUploadSuccess }: UploadZoneProps) {
  const [selectedCategory, setSelectedCategory] = useState<Categoria>("fotos");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleCategoryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newCategory = e.target.value as Categoria;
    setSelectedCategory(newCategory);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("categoria", selectedCategory);

    try {
      const response = await apiClient.post("/galeria/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const nomeOriginal = response.data.nome_original;
      setMessage({
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
          setMessage({
            type: "error",
            text: "Erro de conexão. Verifique sua rede.",
          });
        } else if (error.response.status === 413) {
          setMessage({
            type: "error",
            text: "O arquivo excede o limite de 10 MB",
          });
        } else if (error.response.status === 400) {
          setMessage({
            type: "error",
            text: error.response.data.detail ?? "Erro de validação",
          });
        } else {
          setMessage({
            type: "error",
            text: `Erro ao enviar arquivo (código: ${error.response.status})`,
          });
        }
      } else {
        setMessage({
          type: "error",
          text: "Erro de conexão. Verifique sua rede.",
        });
      }
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="categoria-select" className="text-sm font-medium">
          Categoria
        </label>
        <select
          id="categoria-select"
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {CATEGORIAS.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORIA_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="file-input" className="text-sm font-medium">
          Arquivo
        </label>
        <input
          id="file-input"
          ref={fileInputRef}
          type="file"
          accept={CATEGORIA_ACCEPT[selectedCategory]}
          onChange={handleFileChange}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
        />
      </div>

      <Button type="submit" disabled={!selectedFile || isUploading}>
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

      {message && (
        <p
          className={`text-sm ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
          role="alert"
        >
          {message.text}
        </p>
      )}
    </form>
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
