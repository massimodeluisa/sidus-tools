export type CodeLang =
  | 'c'
  | 'cpp'
  | 'rust'
  | 'zig'
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'matlab'
  | 'julia'
  | 'fortran'
  | 'latex'

export const CODE_LANGS: { id: CodeLang; label: string }[] = [
  { id: 'c', label: 'C' },
  { id: 'cpp', label: 'C++' },
  { id: 'rust', label: 'Rust' },
  { id: 'zig', label: 'Zig' },
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'matlab', label: 'MATLAB' },
  { id: 'julia', label: 'Julia' },
  { id: 'fortran', label: 'Fortran' },
  { id: 'latex', label: 'LaTeX' },
]

/** External library used by a language snippet (shown under CodeExport). */
export type CodeDep = {
  name: string
  /** Package ecosystem / registry */
  ecosystem: 'npm' | 'pypi' | 'crates' | 'github' | 'other'
  /** Package or repo page */
  url: string
  /** Optional install one-liner */
  install?: string
  note?: string
  /** If set, only show when that language tab is active */
  langs?: CodeLang[]
}

export type FormulaSnippet = {
  formulaId: string
  assumptions: string
  code: Partial<Record<CodeLang, string>>
  /** Libraries the snippet imports: never silent */
  deps?: CodeDep[]
}
