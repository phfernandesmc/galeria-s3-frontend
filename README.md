# galeria-s3-frontend
🎨 Interface modular e responsiva em React (Vite) para gerenciamento de arquivos por categorias, conectada a uma API de armazenamento em nuvem (AWS S3).

# 🎨 Cloud File Gallery - Frontend

Este é o cliente web da Galeria de Arquivos em Nuvem. Uma interface limpa, intuitiva e modular focada na experiência do usuário para upload de mídias e visualização de documentos organizados por categorias.

## 🚀 Tecnologias Utilizadas
*   **React (Vite):** Estrutura rápida e moderna para SPA (Single Page Application).
*   **Tailwind CSS:** Estilização utilitária para um layout responsivo.
*   **Axios:** Cliente HTTP para consumo da API Backend.

## 💡 Funcionalidades Implementadas
*   **Upload por Categoria:** Formulário dinâmico onde o usuário escolhe a classificação do arquivo (Fotos, Documentos, Outros).
*   **Navegação Modular:** Filtros rápidos na tela para alternar entre as categorias e renderizar apenas os arquivos desejados.
*   **Visualização Segura:** Consome as URLs pré-assinadas temporárias geradas pelo backend para exibir imagens ou disponibilizar o download de documentos com total privacidade.

## 🛠️ Como Executar o Projeto

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/seu-usuario/galeria-s3-frontend.git](https://github.com/seu-usuario/galeria-s3-frontend.git)
   cd galeria-s3-frontend

2. **Instale as dependências:**
   ```bash
   npm install

3. **Configure a URL da API:**
   Certifique-se de que o backend está rodando no endereço configurado nas requisições do Axios (padrão: `http://127.0.0.1:8000`).

4. **Inicie o projeto em ambiente de desenvolvimento:**
   ```bash
   npm run dev

Abra o endereço indicado no terminal (geralmente http://localhost:5173) no seu navegador.
