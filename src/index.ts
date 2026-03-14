import path from "node:path";
import process from "node:process";
import type { Plugin } from "rollup";
import { guessRootDir } from "./fsutils.js";
import { NerdFontProgressBar, NoopProgressBar, OSC94ProgressBar, type ProgressBar, ProgressBarAnimator, PureUnicodeProgressBar } from "./progressbars.js";
import { ProgressDrawingMode, type ProgressOptions } from "./types.js";

function autodetectDrawingMode(): ProgressDrawingMode {
  if (process.env.TERM_PROGRAM === "vscode" || process.env.KITTY_PID !== undefined) {
    return ProgressDrawingMode.NerdFontProgressGlyphs;
  } else if ((process.env.TERM_FEATURES || "").split(/(?=[A-Z])/).includes("P") || process.env.TERM_PROGRAM === "ghostty") {
    return ProgressDrawingMode.OSC94ProgressBar;
  } else {
    return ProgressDrawingMode.PureUnicode;
  }
}

function makeProgressBar(type: ProgressDrawingMode, indeterminate: boolean): ProgressBar {
  switch (type) {
    case ProgressDrawingMode.None:                   return new NoopProgressBar(indeterminate);
    case ProgressDrawingMode.Automatic:              return makeProgressBar(autodetectDrawingMode(), indeterminate);
    case ProgressDrawingMode.NerdFontProgressGlyphs: return new NerdFontProgressBar(indeterminate);
    case ProgressDrawingMode.OSC94ProgressBar:       return new OSC94ProgressBar(indeterminate);
    case ProgressDrawingMode.PureUnicode:            return new PureUnicodeProgressBar(indeterminate);
  }
}

function progressbar(incomingOptions: ProgressOptions): Plugin {
  const options: ProgressOptions = Object.assign({}, { mode: ProgressDrawingMode.Automatic, logProgress: false }, incomingOptions);

  if ((!process.stdout.isTTY || options.mode === ProgressDrawingMode.None) && !options.logProgress) {
    // If we're not going to be doing anything, don't bother hooking anything.
    return { name: "progress" };
  }

  let total = 0, loaded = 0, parsed = 0;
  let guessedRoot: string;
  const progressBar = makeProgressBar(options.mode ?? ProgressDrawingMode.Automatic, total === 0);
  const animator = new ProgressBarAnimator(progressBar);

  return {
    name: "progress",

    buildStart: {
      order: "pre",
      sequential: true,
      handler(buildOptions) {
        guessedRoot = path.resolve(options.rootDir ?? guessRootDir(Object.values(buildOptions.input)));
        progressBar.setIndeterminate(total === 0);
        progressBar.setup();
        if (total === 0) { animator.start(); }
        loaded = 0;
        parsed = 0;
      },
    },

    load() {
      loaded++;
      if (total > 0) {
        progressBar.advanceTo((loaded + parsed) / total);
      }
    },

    moduleParsed(info) {
      parsed++;
      if (info.id.startsWith("\0")) { return; }
      if (options.logProgress) {
        const file = path.relative(guessedRoot, info.id);
        this.debug({ pluginCode: "PROGRESS", message: file.replace(/^node_modules\//, "pkg:") });
      }
      if (total > 0) {
        progressBar.advanceTo((loaded + parsed) / total);
      }
    },

    closeBundle: {
      order: "post",
      handler() {
        animator.stop();
        progressBar.teardown();
        total = loaded + parsed;
      },
    },

    closeWatcher() {
      animator.stop();
      progressBar.teardown();
    },
  };
}

export { ProgressDrawingMode, type ProgressOptions } from "./types.js";
export { progressbar as default, progressbar };
