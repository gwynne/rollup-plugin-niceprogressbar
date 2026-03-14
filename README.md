# rollup-plugin-niceprogressbar

[![npm version](https://img.shields.io/npm/v/rollup-plugin-niceprogressbar?logo=npm)](https://npmjs.com/packages/rollup-plugin-niceprogressbar)
[![downloads](https://img.shields.io/npm/dm/rollup-plugin-niceprogressbar?logo=npm)](https://www.npmjs.com/package/rollup-plugin-niceprogressbar)
[![rollup](https://img.shields.io/npm/dependency-version/rollup-plugin-niceprogressbar/peer/rollup?logo=rollup.js&label=rollup)](https://www.npmjs.com/package/rollup)
[![ci](https://img.shields.io/github/actions/workflow/status/gwynne/rollup-plugin-niceprogressbar/test.yml?logo=github)](https://github.com/gwynne/rollup-plugin-niceprogressbar/actions/test.yml)
[![code coverage](https://img.shields.io/codecov/c/github/gwynne/rollup-plugin-niceprogressbar?logo=codecov)](https://codecov.io/gh/gwynne/rollup-plugin-niceprogressbar)
[![license](https://img.shields.io/badge/license-MIT-skyblue?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij48cGF0aCBmaWxsPSJza3libHVlIiBkPSJtNzAuNSwxMS41YzAtMy45LTEyLTMuOS0xMiwwdjEwYy01LjIsMC0yMC4zLDgtMjQuNCw4aC0xOC40Yy03LjEsMC04LjEsMTMuOSwzLjUsMTJsLTE2LjksMzguM2MtMy41LDYuOSwxMi41LDE0LDIyLjksMTQsMTEuOCwwLDI1LjktNy4xLDIyLjktMTRsLTE2LjctMzguM2M1LjYsMCwxOC40LTcuOCwyNy4xLTh2NzYuOGgtMjBjLTMuOSwwLTMuOSwxMiwwLDEyaDUyYzQsMCw0LTEyLDAtMTJoLTIwdi03Ni44YzkuMy0uMSwyMS4yLDgsMjcuNCw4bC0xNi45LDM4LjNjLTIuNyw2LDExLjYsMTQsMjIuOSwxNCwxMS44LDAsMjYuMi02LjUsMjIuOS0xNGwtMTYuOS0zOC4zYzEyLjQsMS4yLDExLjUtMTIsMy41LTEyaC0xOC40YzAsMC0xOS04LTI0LjUtOHptMzIuOSw0NC43LDEwLjQsMjRjLTUuOCwzLjItMTUsMy4yLTIwLjgsMHptLTc3LjcsMCwxMC40LDI0Yy01LjgsMy4yLTE1LDMuMi0yMC44LDAiLz48L3N2Zz4K)](LICENSE)


Displays a progress bar indicating the current progress of the rollup build in progress, or an indeterminate progress bar if the progress isn't currently known.

## Installation

```bash
npm i rollup-plugin-progressbar --save-dev
```

## Usage

```js
import * as rollup from "rollup";
import { progressbar } from "rollup-plugin-progressbar";

export default rollup.defineConfig({
  input: "src/main.js",
  plugins: [
    progressbar(),
  ],
  output: {
    file: "dist/main.js",
    format: "es",
  },
});
```
## Options

### `rootDir`

Type: `string`<br>
Default: `null`

Used to shorten paths when `logProgress` is enabled.

### `mode`

Type: `ProgressDrawingMode.None | .Automatic | .NerdFontProgressGlyphs | .OSC94ProgressBar | .PureUnicode`<br>
Default: `ProgressDrawingMode.Automatic`

Sets the type of progress bar used by the plugin.

- `ProgressDrawingMode.None`: No progress bar is displayed. This is primarily useful if you want the effect of the `logProgress` option without a progress bar.
- `ProgressDrawingMode.Automatic`: Attempt to choose the best mode supported by the terminal connected to stdout. If stdout is not a TTY, chooses `.None`.
- `ProgressDrawingMode.NerdFontProgressGlyphs` Draw a progress bar using the `U+EE00`-`U+EE05` glyphs found in Nerd Fonts and xterm.js.

  For more information, see [ryanoasis/nerd-fonts#1733](https://github.com/ryanoasis/nerd-fonts/pull/1733).
- `ProgressDrawingMode.OSC94ProgressBar`: Ask the terminal to render its own progress bar using the `OSC 9;4` escape sequence originally pioneered by ConEmu.

  See [ConEmu specific OSC](https://conemu.github.io/en/AnsiEscapeCodes.html#ConEmu_specific_OSC) and [iTerm2 Escape Codes](https://iterm2.com/documentation-escape-codes.html#:~:text=Progress%20Bar) for more information.
- `ProgressDrawingMode.PureUnicode`: Draw a progress bar using a background color and the `■ U+25A0 BLACK SQUARE` glyph.

### `logProgress`

Type: `boolean`<br>
Default: `false`

Logs each module loaded during the bundling process as a plugin debug message. These logs will only be visible if Rollup's `logLevel` is set to `debug`.
