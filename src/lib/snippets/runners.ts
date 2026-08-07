import type { CodeLang } from './types'
import { stripTsTypes } from './liveValues'

export type OnlineRunner = {
  id: string
  label: string
  langs: CodeLang[]
  /**
   * Sync hash URL (fallback). Prefer `createRunnerUrl` (Godbolt shortener).
   */
  buildUrl: (code: string, lang: CodeLang) => string | null
  note?: string
}

/** Clamp only for long sync hash fallbacks. */
function clampCode(code: string, max = 6000): string {
  if (code.length <= max) return code
  return `${code.slice(0, max)}\n/* …truncated for URL length… */\n`
}

type GodboltTarget = {
  /** Compiler Explorer language id */
  language: string
  compiler: string
  options?: string
  /** Transform source before send (e.g. strip TS types → run as JS). */
  transform?: (code: string) => string
}

/**
 * Compiler Explorer targets used by CodeExport Run + godbolt-matrix CI.
 * One runner everywhere: godbolt.org (TS stripped → V8). MATLAB / LaTeX unsupported.
 * Keep compiler ids in sync with https://godbolt.org/api/compilers/<lang>
 */
export const GODBOLT_TARGETS: Partial<Record<CodeLang, GodboltTarget>> = {
  c: { language: 'c', compiler: 'cg142', options: '-lm' },
  cpp: { language: 'c++', compiler: 'g142', options: '-lm' },
  python: { language: 'python', compiler: 'python313' },
  javascript: { language: 'javascript', compiler: 'v8113' },
  // CE TypeScript Native has no console; strip types and run on V8 like JS
  typescript: {
    language: 'javascript',
    compiler: 'v8113',
    transform: stripTsTypes,
  },
  rust: { language: 'rust', compiler: 'r1890' },
  // 0.15+ broke std.io.getStdOut; 0.14.1 still matches our educational print helper
  zig: { language: 'zig', compiler: 'z0141' },
  fortran: { language: 'fortran', compiler: 'gfortran142' },
  julia: { language: 'julia', compiler: 'julia_1_11_2' },
}

export type { GodboltTarget }

/** Resolve CE language + compiler + transformed source for a SIDUS lang. */
export function prepareGodboltSource(
  lang: CodeLang,
  code: string,
): { language: string; compiler: string; options: string; source: string } | null {
  const t = GODBOLT_TARGETS[lang]
  if (!t) return null
  return {
    language: t.language,
    compiler: t.compiler,
    options: t.options ?? '',
    source: (t.transform ?? ((c) => c))(code),
  }
}

function encodeGodboltSource(code: string): string {
  return encodeURIComponent(code).replace(/'/g, '%27')
}

/** Sync client-state hash (fallback when shortener fetch fails). */
export function godboltHashUrl(lang: CodeLang, code: string): string | null {
  const prep = prepareGodboltSource(lang, code)
  if (!prep) return null
  const source = clampCode(prep.source, 4500)
  const src = encodeGodboltSource(source)
  const langEnc = encodeURIComponent(prep.language)
  const opts = encodeURIComponent(prep.options)
  const label = encodeURIComponent(`${prep.language} source #1`)
  return (
    `https://godbolt.org/#g:!((g:!((g:!((h:codeEditor,i:(filename:'1',fontScale:14,fontUsePx:'0',j:1,lang:${langEnc},` +
    `selection:(endColumn:1,endLineNumber:1,positionColumn:1,positionLineNumber:1,selectionStartColumn:1,selectionStartLineNumber:1,startColumn:1,startLineNumber:1),` +
    `source:'${src}'),l:'5',n:'0',o:'${label}',t:'0')),k:50,l:'4',n:'0',o:'',s:0,t:'0'),` +
    `(g:!((h:compiler,i:(compiler:${prep.compiler},filters:(b:'0',binary:'1',binaryObject:'1',commentOnly:'0',debugInfo:'1',demangle:'0',directives:'0',execute:'1',intel:'0',libraryCode:'0',trim:'1'),` +
    `flagsViewOpen:'1',fontScale:14,fontUsePx:'0',j:1,lang:${langEnc},libs:!(),options:'${opts}',overrides:!(),` +
    `selection:(endColumn:1,endLineNumber:1,positionColumn:1,positionLineNumber:1,selectionStartColumn:1,selectionStartLineNumber:1,startColumn:1,startLineNumber:1),source:1),` +
    `l:'5',n:'0',o:'Compiler%20Explorer',t:'0')),header:(),k:50,l:'4',n:'0',o:'',s:0,t:'0')),l:'2',n:'0',o:'',t:'0')),version:4`
  )
}

/**
 * POST to Godbolt shortener (CORS *). Returns short https://godbolt.org/z/... URL
 * with source + executor prefilled. Falls back to hash URL on network error.
 */
export async function createGodboltUrl(
  lang: CodeLang,
  code: string,
): Promise<string | null> {
  const prep = prepareGodboltSource(lang, code)
  if (!prep) return null
  const { language, compiler, options, source } = prep

  const payload = {
    sessions: [
      {
        id: 1,
        language,
        source,
        compilers: [] as unknown[],
        executors: [
          {
            compiler: {
              id: compiler,
              libs: [] as unknown[],
              options,
            },
          },
        ],
      },
    ],
  }

  try {
    const res = await fetch('https://godbolt.org/api/shortener', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const data = (await res.json()) as { url?: string }
      if (data.url) return data.url
    }
  } catch {
    /* fall through to hash */
  }
  return godboltHashUrl(lang, code)
}

/** All online runners are Compiler Explorer. */
export const ONLINE_RUNNERS: OnlineRunner[] = (
  [
    ['c', 'C'],
    ['cpp', 'C++'],
    ['python', 'Python'],
    ['javascript', 'JavaScript'],
    ['typescript', 'TypeScript'],
    ['rust', 'Rust'],
    ['zig', 'Zig'],
    ['fortran', 'Fortran'],
    ['julia', 'Julia'],
  ] as const
).map(([id, label]) => ({
  id: `godbolt-${id}`,
  label: `Compiler Explorer (${label})`,
  langs: [id],
  note:
    id === 'typescript'
      ? 'godbolt.org: types stripped, V8 execute'
      : 'godbolt.org: execute enabled',
  buildUrl: (code) => godboltHashUrl(id, code),
}))

export function runnersForLang(lang: CodeLang): OnlineRunner[] {
  return ONLINE_RUNNERS.filter((r) => r.langs.includes(lang))
}

export function primaryRunnerUrl(lang: CodeLang, code: string): string | null {
  if (!supportsOnlineRun(lang)) return null
  return godboltHashUrl(lang, code)
}

/** Always opens Godbolt (short link preferred). */
export async function createRunnerUrl(
  lang: CodeLang,
  code: string,
): Promise<string | null> {
  if (!supportsOnlineRun(lang)) return null
  return createGodboltUrl(lang, code)
}

export function supportsOnlineRun(lang: CodeLang): boolean {
  return Boolean(GODBOLT_TARGETS[lang])
}

/**
 * Languages with no Compiler Explorer backend for runnable snippets.
 * (MATLAB / LaTeX: no CE execute path.)
 */
export const UNSUPPORTED_ONLINE_RUN_LANGS: CodeLang[] = ['matlab', 'latex']
