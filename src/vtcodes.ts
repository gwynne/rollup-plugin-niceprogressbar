type Replacement = string | ((substring: string, ...args: unknown[]) => string);

function replaceAllMany(str: string, patterns: ([string | RegExp, Replacement])[]): string {
  return patterns.reduce((output, [pattern, replacement]) => output.replaceAll(pattern, replacement as Parameters<typeof String.prototype["replaceAll"]>[1]), str);
}

export function vt(strs: TemplateStringsArray, ...args: unknown[]): string {
  return replaceAllMany(JSON.parse(`"${String.raw(strs, ...args)}"`) as string, [
    [/(?<!\\)(?:\\\\)*\{\{csi (.+?)\}\}/ig,           "\x1b[$1"],
    [/(?<!\\)(?:\\\\)*\{\{osc (.+?)\}\}/ig,           "\x1b]$1"],
    [/(?<!\\)(?:\\\\)*\{\{esc (.+?)\}\}/ig,           "\x1b$1"],
    [/(?<!\\)(?:\\\\)*\{\{cuu1\}\}/ig,                "\x1b[A"],
    [/(?<!\\)(?:\\\\)*\{\{ed\}\}/ig,                  "\x1b[J"],
    [/(?<!\\)(?:\\\\)*\{\{clear\}\}/ig,               "\x1b[2J"],
    [/(?<!\\)(?:\\\\)*\{\{el\}\}/ig,                  "\x1b[K"],
    [/(?<!\\)(?:\\\\)*\{\{sc\}\}/ig,                  "\u{1b}7"],
    [/(?<!\\)(?:\\\\)*\{\{rc\}\}/ig,                  "\u{1b}8"],
    [/(?<!\\)(?:\\\\)*\{\{csr (\d+);(\d+)\}\}/ig,     "\x1b[$1;$2r"],
    [/(?<!\\)(?:\\\\)*\{\{cup (\d+);(\d+)\}\}/ig,     "\x1b[$1;$2H"],
    [/(?<!\\)(?:\\\\)*\{\{sgr ((\d+[:;])*\d+)\}\}/ig, "\x1b[$1m"],
    [/(?<!\\)(?:\\\\)*\{\{pbr clear\}\}/ig,           "\x1b]9;4;0\x1b\\"],
    [/(?<!\\)(?:\\\\)*\{\{pbr (\d+)\}\}/ig,           "\x1b]9;4;1;$1\x1b\\"],
    [/(?<!\\)(?:\\\\)*\{\{pbr err (\d+)\}\}/ig,       "\x1b]9;4;2;$1\x1b\\"],
    [/(?<!\\)(?:\\\\)*\{\{pbr warn (\d+)\}\}/ig,      "\x1b]9;4;4;$1\x1b\\"],
    [/(?<!\\)(?:\\\\)*\{\{pbr ind\}\}/ig,             "\x1b]9;4;3\x1b\\"],
  ]);
}
