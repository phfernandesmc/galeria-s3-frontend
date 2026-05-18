import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { UploadZone } from "@/components/UploadZone";
import type { Categoria } from "@/lib/constants";

function App() {
  const [categoriaAtiva, setCategoriaAtiva] = useState<Categoria | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleUploadSuccess() {
    setRefreshTrigger((prev) => prev + 1);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b bg-white px-4 py-3 shadow-sm md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <h1 className="text-lg font-bold">Galeria S3</h1>
      </header>

      <div className="flex">
        {/* Sidebar - colapsável em mobile */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-20 w-64 transform border-r bg-white p-4 pt-16 transition-transform duration-200 ease-in-out
            md:static md:z-auto md:translate-x-0 md:pt-4
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <h1 className="mb-6 hidden text-xl font-bold md:block">Galeria S3</h1>
          <Sidebar
            categoriaAtiva={categoriaAtiva}
            onCategoriaChange={(cat) => {
              setCategoriaAtiva(cat);
              setSidebarOpen(false);
            }}
          />
        </aside>

        {/* Overlay para mobile quando sidebar está aberta */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-10 bg-black/30 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Conteúdo principal */}
        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
              Upload de Arquivo
            </h2>
            <UploadZone onUploadSuccess={handleUploadSuccess} />
          </div>

          <Dashboard
            categoriaAtiva={categoriaAtiva}
            refreshTrigger={refreshTrigger}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
