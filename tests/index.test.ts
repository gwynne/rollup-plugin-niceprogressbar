import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import type rollup from "rollup";
import { ProgressDrawingMode, progressbar } from "../src/index.js";

describe("baseline", () => {
    beforeEach(() => {
        process.stdout.isTTY = true;
        process.stdout.columns = 100;
        process.stdout.rows = 24;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("returns a plugin", () => {
        expect(progressbar({})).toBeDefined();
        expect(progressbar({})).toHaveProperty("buildStart");
    });

    it("returns an empty plugin when it should", () => {
        expect(progressbar({ mode: ProgressDrawingMode.None, logProgress: false })).not.toHaveProperty("buildStart");
    });

    it("outputs things", () => {
        const spy = jest.spyOn(process.stdout, "write");
        const bar = progressbar({ mode: ProgressDrawingMode.NerdFontProgressGlyphs });

        (bar.buildStart as ({ handler: (this: rollup.PluginContext, options: rollup.NormalizedInputOptions) => void | Promise<void>; order?: "pre" | "post" | null; sequential?: boolean; })).handler.call({} as rollup.PluginContext, { input: ["index.ts"] } as rollup.NormalizedInputOptions);
        (bar.closeBundle as ({ handler: (this: rollup.PluginContext, error?: Error) => void | Promise<void>; order?: "pre" | "post" | null; sequential?: boolean; })).handler.call({} as rollup.PluginContext, undefined);

        expect(spy.mock.calls.length).toBe(2);
        expect(spy.mock.calls[0][0]).toBe(`\x1b7\x1b[1;23r\x1b8`);
        expect(spy.mock.calls[1][0]).toBe(`\x1b7\x1b[24;1H\x1b[K\x1B[1;24r\x1B8`);
    });
});
