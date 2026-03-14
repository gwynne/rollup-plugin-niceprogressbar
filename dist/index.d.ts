import { Plugin } from 'rollup';

declare enum ProgressDrawingMode {
    /**
     * Do not report progress at all.
     */
    None = 0,
    /**
     * Automatically determine the best kind of progress reporting based on the current environment.
     *
     * The detection semantics are as follows:
     *
     * 1. If TERM_PROGRAM=ghostty or TERM_PROGRAM=iTerm2.app, the OSC 9;4 progress bar codes are assumed to be available.
     * 2 . If TERM_PROGRAM=vscode or KITTY_PID is set, the Nerd Fonts progress glyphs are assumed to be available.
     * 3. If stdout is a TTY, the pure-Unicode progress bar is used.
     * 4. Otherwise, no progress bar is displayed.
     *
     * Note: Ghostty also supports the Nerd Fonts glyphs, but OSC 9;4 reporting is assumed to be preferred.
     */
    Automatic = 1,
    /**
     * Render a progress bar using the `U+EE00`-`U+EE05` glyphs found in Nerd Fonts and xterm.js.
     *
     * The following glyphs from the Unicode Private Use Area block are used:
     *
     * - ` U+EE00 PROGRESS BAR EMPTY START`
     * - ` U+EE01 PROGRESS BAR EMPTY MIDDLE`
     * - ` U+EE02 PROGRESS BAR EMPTY END`
     * - ` U+EE03 PROGRESS BAR FILLED START`
     * - ` U+EE04 PROGRESS BAR FILLED MIDDLE`
     * - ` U+EE05 PROGRESS BAR FILLED END`
     *
     * See [xterm.js/addons/addon-webgl/src/customGlyphs/CustomGlyphDefinitions.ts](https://github.com/xtermjs/xterm.js/blob/master/addons/addon-webgl/src/customGlyphs/CustomGlyphDefinitions.ts#L361-L367) \
     * See [ryanoasis/nerd-fonts#1733](https://github.com/ryanoasis/nerd-fonts/pull/1733)
     */
    NerdFontProgressGlyphs = 2,
    /**
     * Signal the terminal emulator to display a progress bar using ConEmu's OSC 9;4 progress reporting protocol.
     *
     * See [ConEmu specific OSC](https://conemu.github.io/en/AnsiEscapeCodes.html#ConEmu_specific_OSC).\
     * See [iTerm2 Escape Codes](https://iterm2.com/documentation-escape-codes.html#:~:text=Progress%20Bar).
     */
    OSC94ProgressBar = 3,
    /**
     * Render a progress bar using a background color fill and `■ U+25A0 BLACK SQUARE`.
     *
     * This should be compatible with just about anything, but won't look as good.
     */
    PureUnicode = 4
}
interface ProgressOptions {
    /**
     * Explicitly specify the root directory to which all resolved paths should be considered relative.
     *
     * This mainly affects logging output; it's used to avoid outputting absolute paths.
     */
    rootDir?: string;
    /**
     * The rendering mode for progress reporting. See {@link ProgressDrawingMode}.
     *
     * Defaults to {@link ProgressDrawingMode.Automatic}.
     */
    mode?: ProgressDrawingMode;
    /**
     * If `true`, each loaded module is logged at the plugin debug log level.
     *
     * Defaults to `false`.
     */
    logProgress?: boolean;
}

declare function progressbar(incomingOptions: ProgressOptions): Plugin;

export { ProgressDrawingMode, progressbar as default, progressbar };
export type { ProgressOptions };
