export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0.00 MB";
  if (bytes > 0 && bytes < 10240) return "< 0.01 MB";
  const mb = bytes / 1_048_576;
  return `${mb.toFixed(2)} MB`;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
