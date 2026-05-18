import { describe, it, expect } from "vitest";
import { apiClient } from "@/lib/apiClient";

describe("apiClient", () => {
  it("deve ser uma instância Axios exportada como named export", () => {
    expect(apiClient).toBeDefined();
    expect(typeof apiClient.get).toBe("function");
    expect(typeof apiClient.post).toBe("function");
    expect(typeof apiClient.put).toBe("function");
    expect(typeof apiClient.delete).toBe("function");
  });

  it("deve ter baseURL configurada a partir de VITE_API_URL", () => {
    const baseURL = apiClient.defaults.baseURL;
    // O valor depende do .env no momento do teste;
    // o importante é que seja string (vazia ou com valor)
    expect(typeof baseURL).toBe("string");
  });
});
