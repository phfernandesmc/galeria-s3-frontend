import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { formatDate } from "@/lib/formatters";

/**
 * Feature: galeria-s3-frontend, Property 9: Date formatting in pt-BR locale
 *
 * *For any* valid ISO 8601 date string, formatDate SHALL return a string matching
 * the pattern dd/mm/yyyy representing the correct day, month, and year.
 * *For any* null or undefined input, it SHALL return "-".
 *
 * **Validates: Requirements 8.2, 8.5**
 */
describe("Property 9: Date formatting in pt-BR locale", () => {
  it("para qualquer data válida, retorna string no padrão dd/mm/yyyy", () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date("1900-01-01T00:00:00Z"), max: new Date("2100-12-31T23:59:59Z") }).filter((d) => !isNaN(d.getTime())),
        (date) => {
          const isoString = date.toISOString();
          const result = formatDate(isoString);

          // Deve corresponder ao padrão dd/mm/yyyy
          const ddmmyyyyPattern = /^\d{2}\/\d{2}\/\d{4}$/;
          expect(result).toMatch(ddmmyyyyPattern);

          // Verificar que os valores correspondem à data original
          const [dd, mm, yyyy] = result.split("/");
          const expectedDate = new Date(isoString);
          expect(Number(dd)).toBe(expectedDate.getDate());
          expect(Number(mm)).toBe(expectedDate.getMonth() + 1);
          expect(Number(yyyy)).toBe(expectedDate.getFullYear());
        }
      ),
      { numRuns: 100 }
    );
  });

  it("para null, retorna '-'", () => {
    fc.assert(
      fc.property(fc.constant(null), (value) => {
        expect(formatDate(value)).toBe("-");
      }),
      { numRuns: 100 }
    );
  });

  it("para undefined, retorna '-'", () => {
    fc.assert(
      fc.property(fc.constant(undefined), (value) => {
        expect(formatDate(value)).toBe("-");
      }),
      { numRuns: 100 }
    );
  });
});
