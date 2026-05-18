import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

/**
 * Feature: galeria-s3-frontend, Property 1: API Client baseURL resolution
 *
 * Validates: Requirements 1.1, 1.2, 1.4
 *
 * For any string value assigned to VITE_API_URL, if the string is non-empty
 * after trimming, the Axios instance's baseURL SHALL equal the trimmed value.
 * For any string that is undefined, null, empty, or composed entirely of
 * whitespace characters, the baseURL SHALL be an empty string.
 */

/**
 * Extracts the baseURL resolution logic from apiClient.ts as a pure function
 * for property-based testing. This mirrors the exact logic:
 *   const baseURL = rawUrl && rawUrl.trim() ? rawUrl.trim() : "";
 */
function resolveBaseURL(rawUrl: string | undefined | null): string {
  return rawUrl && rawUrl.trim() ? rawUrl.trim() : "";
}

describe("Property 1: API Client baseURL resolution", () => {
  it("strings não-vazias após trim resultam no valor trimado como baseURL", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        (rawUrl) => {
          const result = resolveBaseURL(rawUrl);
          expect(result).toBe(rawUrl.trim());
        }
      ),
      { numRuns: 100 }
    );
  });

  it("undefined resulta em string vazia", () => {
    fc.assert(
      fc.property(fc.constant(undefined), (rawUrl) => {
        const result = resolveBaseURL(rawUrl);
        expect(result).toBe("");
      }),
      { numRuns: 100 }
    );
  });

  it("null resulta em string vazia", () => {
    fc.assert(
      fc.property(fc.constant(null), (rawUrl) => {
        const result = resolveBaseURL(rawUrl);
        expect(result).toBe("");
      }),
      { numRuns: 100 }
    );
  });

  it("strings vazias resultam em string vazia", () => {
    fc.assert(
      fc.property(fc.constant(""), (rawUrl) => {
        const result = resolveBaseURL(rawUrl);
        expect(result).toBe("");
      }),
      { numRuns: 100 }
    );
  });

  it("strings compostas apenas de whitespace resultam em string vazia", () => {
    const whitespaceArb = fc
      .array(fc.constantFrom(" ", "\t", "\n", "\r"), { minLength: 1, maxLength: 20 })
      .map((chars) => chars.join(""));

    fc.assert(
      fc.property(whitespaceArb, (rawUrl) => {
        const result = resolveBaseURL(rawUrl);
        expect(result).toBe("");
      }),
      { numRuns: 100 }
    );
  });

  it("URLs válidas com espaços ao redor resultam no valor trimado", () => {
    const whitespaceArb = fc
      .array(fc.constantFrom(" ", "\t", "\n"), { minLength: 0, maxLength: 5 })
      .map((chars) => chars.join(""));

    fc.assert(
      fc.property(
        fc.tuple(whitespaceArb, fc.webUrl(), whitespaceArb),
        ([prefix, url, suffix]) => {
          const rawUrl = prefix + url + suffix;
          const result = resolveBaseURL(rawUrl);
          expect(result).toBe(rawUrl.trim());
        }
      ),
      { numRuns: 100 }
    );
  });

  it("qualquer valor undefined/null/vazio/whitespace resulta em string vazia (combinado)", () => {
    const whitespaceArb = fc
      .array(fc.constantFrom(" ", "\t", "\n", "\r"), { minLength: 1, maxLength: 10 })
      .map((chars) => chars.join(""));

    const emptyishArb = fc.oneof(
      fc.constant(undefined as string | undefined | null),
      fc.constant(null as string | undefined | null),
      fc.constant("" as string | undefined | null),
      whitespaceArb as fc.Arbitrary<string | undefined | null>
    );

    fc.assert(
      fc.property(emptyishArb, (rawUrl) => {
        const result = resolveBaseURL(rawUrl);
        expect(result).toBe("");
      }),
      { numRuns: 100 }
    );
  });
});
