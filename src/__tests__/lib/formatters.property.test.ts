import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { formatFileSize } from "@/lib/formatters";

/**
 * Feature: galeria-s3-frontend, Property 8: File size formatting
 * Validates: Requirements 8.1, 8.3, 8.4
 */
describe("Property 8: File size formatting", () => {
  it("returns '0.00 MB' when bytes equals 0", () => {
    expect(formatFileSize(0)).toBe("0.00 MB");
  });

  it("returns '< 0.01 MB' for any bytes between 1 and 10239 inclusive", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 10239 }), (bytes) => {
        expect(formatFileSize(bytes)).toBe("< 0.01 MB");
      }),
      { numRuns: 100 }
    );
  });

  it("returns (bytes / 1048576).toFixed(2) + ' MB' for any bytes >= 10240", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10240, max: Number.MAX_SAFE_INTEGER }),
        (bytes) => {
          const result = formatFileSize(bytes);
          const expected = (bytes / 1_048_576).toFixed(2) + " MB";
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("always returns a string ending with ' MB' for any non-negative integer", () => {
    fc.assert(
      fc.property(fc.nat(), (bytes) => {
        const result = formatFileSize(bytes);
        expect(result.endsWith(" MB") || result.endsWith(" MB")).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});
