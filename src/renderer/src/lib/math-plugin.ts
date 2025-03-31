import {
  ViewPlugin,
  EditorView,
  Decoration,
  DecorationSet,
  WidgetType,
  ViewUpdate
} from '@codemirror/view'
import { syntaxTree } from '@codemirror/language'
import { Range } from '@codemirror/state'
import katex from 'katex'

class MathWidget extends WidgetType {
  constructor(
    private readonly formula: string,
    private readonly isInline: boolean
  ) {
    super()
  }

  eq(other: MathWidget): boolean {
    return this.formula === other.formula && this.isInline === other.isInline
  }

  toDOM(): HTMLElement {
    const container = document.createElement('span')
    container.className = 'math-formula'
    if (this.isInline) {
      container.classList.add('math-inline')
    } else {
      container.classList.add('math-block')
    }

    try {
      katex.render(this.formula, container, {
        displayMode: !this.isInline,
        throwOnError: false,
        output: 'html',
        trust: false
      })
    } catch {
      container.textContent = this.isInline ? `$${this.formula}$` : `$$${this.formula}$$`
      container.classList.add('math-error')
    }

    // Add tooltip with original Markdown
    const originalFormula = this.isInline ? `$${this.formula}$` : `$$${this.formula}$$`
    container.setAttribute('title', originalFormula)

    return container
  }

  ignoreEvent(): boolean {
    return false
  }
}

function findMathFormulas(
  view: EditorView
): { from: number; to: number; formula: string; isInline: boolean }[] {
  const content = view.state.doc.toString()

  // Find all matches first, then sort by position
  const matches: { from: number; to: number; formula: string; isInline: boolean }[] = []

  // Inline math: $formula$
  const inlineRegex = /\$((?!\s)(?:[^$\\]|\\[\s\S])+?(?!\s))\$/g
  let inlineMatch

  while ((inlineMatch = inlineRegex.exec(content))) {
    const from = inlineMatch.index
    const to = from + inlineMatch[0].length
    matches.push({
      from,
      to,
      formula: inlineMatch[1],
      isInline: true
    })
  }

  // Block math: $$formula$$
  const blockRegex = /\$\$((?:[^$\\]|\\[\s\S])+?)\$\$/g
  let blockMatch

  while ((blockMatch = blockRegex.exec(content))) {
    const from = blockMatch.index
    const to = from + blockMatch[0].length
    matches.push({
      from,
      to,
      formula: blockMatch[1],
      isInline: false
    })
  }

  // Sort matches by 'from' position
  return matches.sort((a, b) => a.from - b.from)
}

function mathPlugin(view: EditorView): DecorationSet {
  const widgets: Range<Decoration>[] = []
  const cursor = view.state.selection.main.head

  for (const { from, to, formula, isInline } of findMathFormulas(view)) {
    // Skip math inside code blocks
    const tree = syntaxTree(view.state)
    const isInCodeBlock = tree.resolve(from, 1).name.includes('CodeText')

    // Check if cursor is on the same line as the formula
    const fromLine = view.state.doc.lineAt(from)
    const cursorLine = view.state.doc.lineAt(cursor)
    const cursorIsNear = fromLine.number === cursorLine.number

    if (!isInCodeBlock && !cursorIsNear) {
      // Render formula normally if cursor is not near
      widgets.push(
        Decoration.replace({
          widget: new MathWidget(formula, isInline),
          inclusive: true
        }).range(from, to)
      )
    }
    // If cursor is near, we don't add a decoration, showing the original text
  }

  return Decoration.set(widgets)
}

export const mathFormulaPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = mathPlugin(view)
    }

    update(update: ViewUpdate): void {
      if (update.docChanged || update.viewportChanged || update.selectionSet) {
        this.decorations = mathPlugin(update.view)
      }
    }
  },
  {
    decorations: (v) => v.decorations
  }
)
