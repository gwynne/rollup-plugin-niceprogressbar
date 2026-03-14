import fs from "node:fs";
import path from "node:path";

function findIndexOrEnd<T>(arr: T[], predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: unknown): number {
  const i = arr.findIndex(predicate, thisArg);

  return i === -1 ? arr.length : i;
}

function smartDirname(pth: string): string {
  return fs.statSync(pth).isDirectory() ? pth : path.dirname(pth);
}

function commonPrefix(...paths: string[]): string {
  if (paths.length < 2) { return paths[0] ?? ""; }
  const base = smartDirname(path.resolve(paths[0])).split(path.sep);
  for (const origPath of paths) {
    const pth = smartDirname(path.resolve(origPath)).split(path.sep);
    let i = 0;

    while (i < Math.min(base.length, pth.length) && base[i] === pth[i]) { ++i; }
    base.splice(findIndexOrEnd(base, (v, i) => v !== pth[i]));
  }
  return base.length === 0 ? "/" : base.join(path.sep);
}

export function guessRootDir(inputs: string[]): string {
  let commonBase = commonPrefix(...inputs);

  while (commonBase !== "/") {
    if (fs.globSync([`${commonBase}${path.sep}@({package,{t,j}sconfig}.json|rollup.config.{m,c,}{j,t}s)`]).length > 0) { break; }
    commonBase = path.dirname(commonBase);
  }
  return commonBase === "/" ? smartDirname(path.resolve(inputs[0])) : commonBase;
}
