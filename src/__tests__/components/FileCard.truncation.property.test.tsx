import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import * as fc from "fast-check";
import { FileCard } from "@/components/FileCard";

/**
 * Feature: galeria-s3-frontend, Property 10: File name truncation
 * Validates: Requirements 5.1
 *
 * For any file name string, if its length exceeds 40 characters,
 * the FileCard SHALL display only the first 37 characters followed by "...".
 * If the length is 40 or fewer characters, the full name SHALL be displayed.
 */

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const baseProps = {
  id: "test-id",
  data: "2024-01-01T00:00:00Z",
  tamanho: 1024,
  categoria: "documentos",
};

// Generator for printable file name strings (alphanumeric + common file name chars)
const fileNameChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-.()[]".split("");
const fileNameArb = (minLength: number, maxLength: number) =>
  fc.string({ minLength, maxLength, unit: fc.constantFrom(...fileNameChars) });

describe("Property 10: File name truncation", () => {
  it("displays first 37 chars + '...' for any name longer than 40 characters", () => {
    fc.assert(
      fc.property(fileNameArb(41, 200), (nome) => {
        const { container, unmount } = render(<FileCard {...baseProps} nome={nome} />);
        const nameEl = container.querySelector("p[title]");
        expect(nameEl).not.toBeNull();
        const expected = nome.slice(0, 37) + "...";
        expect(nameEl!.textContent).toBe(expected);
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it("displays the full name for any name with 40 or fewer characters", () => {
    fc.assert(
      fc.property(fileNameArb(1, 40), (nome) => {
        const { container, unmount } = render(<FileCard {...baseProps} nome={nome} />);
        const nameEl = container.querySelector("p[title]");
        expect(nameEl).not.toBeNull();
        expect(nameEl!.textContent).toBe(nome);
        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it("truncated name always has exactly 40 characters (37 + '...')", () => {
    fc.assert(
      fc.property(fileNameArb(41, 300), (nome) => {
        const { container, unmount } = render(<FileCard {...baseProps} nome={nome} />);
        const nameEl = container.querySelector("p[title]");
        expect(nameEl).not.toBeNull();
        const displayed = nameEl!.textContent!;
        expect(displayed.length).toBe(40);
        expect(displayed.endsWith("...")).toBe(true);
        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
