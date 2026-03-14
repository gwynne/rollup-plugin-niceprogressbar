import { vt } from "./vtcodes.js";

/**
 * Abstract base class defining a progress bar implementation.
 */
export abstract class ProgressBar {
  private readonly listener = this._onResized.bind(this);
  private isActive: boolean;
  protected value: number = 0;
  protected rows: number = process.stdout.rows;
  protected cols: number = process.stdout.columns;

  constructor(protected indeterminate: boolean) {
    this.indeterminate = indeterminate;
    this.isActive = false;
  }

  private _onResized(): void {
    const [oldRows, oldCols] = [this.rows, this.cols];
    [this.rows, this.cols] = [process.stdout.rows, process.stdout.columns];
    this._resized(oldRows, oldCols);
  }

  setup(): void {
    process.stdout.on("resize", this.listener);
    this.isActive = true;
  }

  teardown(): void {
    process.stdout.off("resize", this.listener);
    this.isActive = false;
  }

  setIndeterminate(indeterminate: boolean, percentage?: number): void {
    if (indeterminate && !this.indeterminate) {
      this.indeterminate = true;
      this.value = 0;
      if (this.isActive) { this.redraw(); }
    } else if (!indeterminate && this.indeterminate) {
      this.indeterminate = false;
      this.value = percentage ?? 0;
      if (this.isActive) { this.redraw(); }
    }
  }

  advanceTo(percentage: number): void {
    if (this.indeterminate) { return; }
    this.value = percentage;
    if (this.isActive) { this.redraw(); }
  }

  tick(): void {
    if (!this.indeterminate) { return; }
    this.value += 2;
    if (this.isActive) { this.redraw(); }
  }

  redraw(): void {
    if (!this.isActive) { return; }
    this._redraw();
  }

  protected abstract _resized(prevRows: number, prevCols: number): void;
  protected abstract _redraw(): void;
}

/**
 * An implementation of {@link ProgressDrawingMode.NerdFontProgressGlyphs}
 */
export class NerdFontProgressBar extends ProgressBar {
  readonly NONE_LEFT = "\uee00"; readonly NONE_CELL = "\uee01"; readonly NONE_RGHT = "\uee02";
  readonly FILL_LEFT = "\uee03"; readonly FILL_CELL = "\uee04"; readonly FILL_RGHT = "\uee05";

  setup(): void {
    super.setup();
    process.stdout.write(vt`{{sc}}{{csr 1;${this.rows - 1}}}{{rc}}`);
  }

  teardown(): void {
    super.teardown();
    process.stdout.write(vt`{{sc}}{{cup ${this.rows};1}}{{el}}{{csr 1;${this.rows}}}{{rc}}`);
  }

  protected _resized(prevRows: number, prevCols: number): void {
    if (this.rows !== prevRows) {
      process.stdout.write(vt`{{sc}}{{csr 1;${this.rows - 1}}}{{rc}}{{ed}}`);
    }
    if (this.rows !== prevRows || this.cols !== prevCols) {
      this.redraw();
    }
  }

  protected _redraw(): void {
    const INDETERMINATE_WIDTH = Math.round(this.cols / 75 * 8);

    if (this.indeterminate) {
      const leftEdge = Math.max(0, (this.value % (this.cols + INDETERMINATE_WIDTH)) - (INDETERMINATE_WIDTH - 1));
      const rightEdge = Math.min(this.cols, this.value % (this.cols + INDETERMINATE_WIDTH));
      let cells = this.NONE_CELL.repeat(leftEdge) +
                  this.FILL_CELL.repeat(rightEdge - leftEdge) +
                  this.NONE_CELL.repeat(this.cols - rightEdge);

      cells = (cells[0] === this.NONE_CELL ? this.NONE_LEFT : this.FILL_LEFT) + cells.slice(1, -1) + (cells.slice(-1) === this.NONE_CELL ? this.NONE_RGHT : this.FILL_RGHT);
      process.stdout.write(vt`{{sc}}{{cup ${this.rows};1}}{{sgr 1;35}}${cells}{{sgr 0}}{{rc}}`);
    } else {
      const cells = Math.round(this.cols * Math.max(0, Math.min(1, this.value)));

      process.stdout.write(vt`{{sc}}{{cup ${this.rows};1}}{{sgr 1;35}}`);
      process.stdout.write(cells === 0 ? this.NONE_LEFT : this.FILL_LEFT);
      process.stdout.write(this.FILL_CELL.repeat(Math.max(0, cells - 1 - (cells === this.cols ? 1 : 0))));
      process.stdout.write(this.NONE_CELL.repeat(this.cols - 2 - Math.max(0, cells - 1 - (cells === this.cols ? 1 : 0))));
      process.stdout.write(cells === this.cols ? this.FILL_RGHT : this.NONE_RGHT);
      process.stdout.write(vt`{{sgr 0}}{{rc}}`);
    }
  }
}

/**
 * An implementation of {@link ProgressDrawingMode.OSC94ProgressBar}.
 */
export class OSC94ProgressBar extends ProgressBar {
  setup(): void {
    process.stdout.write(vt`{{pbr ${this.indeterminate ? "ind" : "0"}}}`);
  }

  teardown(): void {
    process.stdout.write(vt`{{pbr clear}}`);
  }

  protected _resized(_prevRows: number, _prevCols: number): void {}

  protected _redraw(): void {
    if (this.indeterminate) { return; }
    process.stdout.write(vt`{{pbr ${Math.round(Math.max(0, Math.min(100, this.value)) * 100)}}}`);
  }
}

/**
 * An implementation of {@link ProgressDrawingMode.PureUnicode}.
 */
export class PureUnicodeProgressBar extends ProgressBar {
  static readonly NONE_CHAR = " ";
  static readonly FILL_CHAR = "\u2bc0"; // U+2BC0 BLACK SQUARE CENTRED

  setup(): void {
    super.setup();
    process.stdout.write(vt`{{cuu1}}{{sc}}{{csr 1;${this.rows - 1}}}{{rc}}`);
  }

  teardown(): void {
    super.teardown();
    process.stdout.write(vt`{{sc}}{{csr 1;${this.rows}}}{{rc}}{{ed}}`);
  }

  protected _resized(prevRows: number, prevCols: number): void {
    if (this.rows !== prevRows) {
      process.stdout.write(vt`{{sc}}{{csr 1;${this.rows - 1}}}{{rc}}{{ed}}`);
    }
    if (this.rows !== prevRows || this.cols !== prevCols) {
      this.redraw();
    }
  }

  protected _redraw(): void {
    process.stdout.write(vt`{{sc}}{{cup ${this.rows};1}}{{sgr 1;34;107}}`);
    if (this.indeterminate) {
      const leftEdge = Math.max(0, (this.value % (this.cols + 8)) - 7), rightEdge = Math.min(this.cols, this.value % (this.cols + 8));

      process.stdout.write(PureUnicodeProgressBar.NONE_CHAR.repeat(Math.max(0, leftEdge - 1)));
      process.stdout.write(PureUnicodeProgressBar.FILL_CHAR.repeat(rightEdge - leftEdge));
      process.stdout.write(PureUnicodeProgressBar.NONE_CHAR.repeat(this.cols - rightEdge));
    } else {
      const cells = Math.round(this.cols * Math.max(0, Math.min(1, this.value)));

      process.stdout.write(PureUnicodeProgressBar.FILL_CHAR.repeat(cells) + PureUnicodeProgressBar.NONE_CHAR.repeat(Math.max(0, this.cols - cells)));
    }
    process.stdout.write(vt`{{sgr 0}}{{rc}}`);
  }
}

/**
 * A progress bar implementation that does nothing.
 */
export class NoopProgressBar extends ProgressBar {
  protected _resized(_prevRows: number, _prevCols: number): void {}
  protected _redraw(): void {}
}

/**
 * Run a timer that periodically calls a progress bar's tick() method.
 */
export class ProgressBarAnimator {
  timer: ReturnType<typeof setInterval> | undefined;

  constructor(readonly progressBar: ProgressBar) {
    this.progressBar = progressBar;
  }

  start(): void {
    if (this.timer === undefined) {
      this.timer = setInterval(this.progressBar.tick.bind(this.progressBar), 25);
    }
  }

  stop(): void {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
