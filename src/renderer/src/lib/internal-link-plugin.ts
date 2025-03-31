import {
  ViewPlugin,
  EditorView,
  Decoration,
  DecorationSet,
  MatchDecorator,
  WidgetType,
  ViewUpdate
} from '@codemirror/view'
import { Extension, Range } from '@codemirror/state'
import { syntaxTree } from '@codemirror/language'
import { SyntaxNode } from '@lezer/common'

const defaultRegexp = /\[\[(.+?)\]\]/gi

export interface HyperLinkState {
  at: number
  path: string
  anchor: InternalLinkExtensionOptions['anchor']
}

class InternalLinkIcon extends WidgetType {
  private readonly state: HyperLinkState
  constructor(state: HyperLinkState) {
    super()
    this.state = state
  }
  eq(other: InternalLinkIcon): boolean {
    return this.state.path === other.state.path && this.state.at === other.state.at
  }
  toDOM(): HTMLAnchorElement {
    const wrapper = document.createElement('a')
    wrapper.href = '#'
    wrapper.className = 'cm-internal-link-icon'
    wrapper.ariaLabel = this.state.path
    wrapper.addEventListener('click', () => {
      window.api.navigateFile(this.state.path)
    })
    wrapper.innerHTML = '↗︎'
    const anchor = this.state.anchor && this.state.anchor(wrapper)
    return anchor || wrapper
  }
}

function isInsideCodeBlock(view: EditorView, pos: number): boolean {
  const tree = syntaxTree(view.state)
  const node = tree.resolveInner(pos, -1)

  let current: SyntaxNode | null = node
  while (current) {
    if (current.name.includes('FencedCode')) {
      return true
    }
    current = current.parent
  }

  return false
}

function hyperLinkDecorations(
  view: EditorView,
  anchor?: InternalLinkExtensionOptions['anchor']
): DecorationSet {
  const widgets: Array<Range<Decoration>> = []
  const doc = view.state.doc.toString()
  let match

  while ((match = defaultRegexp.exec(doc)) !== null) {
    const from = match.index
    const to = from + match[0].length

    if (isInsideCodeBlock(view, from)) {
      continue
    }

    const widget = Decoration.widget({
      widget: new InternalLinkIcon({
        at: to,
        path: match[1],
        anchor
      }),
      side: 1
    })
    widgets.push(widget.range(to))
  }

  return Decoration.set(widgets)
}

const linkDecorator = (
  regexp?: RegExp,
  matchData?: Record<string, string>,
  matchFn?: (str: string, input: string, from: number, to: number) => string,
  anchor?: InternalLinkExtensionOptions['anchor']
): MatchDecorator =>
  new MatchDecorator({
    regexp: regexp || defaultRegexp,
    decorate: (add, from, to, match): void => {
      const path = match[1]
      let pathStr =
        matchFn && typeof matchFn === 'function' ? matchFn(path, match.input, from, to) : path
      if (matchData && matchData[path]) {
        pathStr = matchData[path]
      }
      const start = to,
        end = to
      const linkIcon = new InternalLinkIcon({ at: start, path: pathStr, anchor })
      add(from, to, Decoration.mark({ class: 'cm-hyper-link-underline' }))
      add(start, end, Decoration.widget({ widget: linkIcon, side: 1 }))
    }
  })

export type InternalLinkExtensionOptions = {
  regexp?: RegExp
  match?: Record<string, string>
  handle?: (value: string, input: string, from: number, to: number) => string
  anchor?: (dom: HTMLAnchorElement) => HTMLAnchorElement
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function internalLinkExtension({
  regexp,
  match,
  handle,
  anchor
}: InternalLinkExtensionOptions = {}) {
  return ViewPlugin.fromClass(
    class InternalLinkView {
      decorator?: MatchDecorator
      decorations: DecorationSet
      constructor(view: EditorView) {
        if (regexp) {
          this.decorator = linkDecorator(regexp, match, handle, anchor)
          this.decorations = this.decorator.createDeco(view)
        } else {
          this.decorations = hyperLinkDecorations(view, anchor)
        }
      }
      update(update: ViewUpdate): void {
        if (update.docChanged || update.viewportChanged) {
          if (regexp && this.decorator) {
            this.decorations = this.decorator.updateDeco(update, this.decorations)
          } else {
            this.decorations = hyperLinkDecorations(update.view, anchor)
          }
        }
      }
    },
    {
      decorations: (v) => v.decorations
    }
  )
}

export const internalLinkStyle = EditorView.baseTheme({
  '.cm-internal-link-icon': {
    display: 'inline-block',
    verticalAlign: 'middle',
    marginLeft: '0.2ch',
    opacity: '0.3',
    transition: 'all'
  },
  '.cm-internal-link-icon:hover': {
    opacity: '0.5'
  }
})

export const internalLink: Extension = [internalLinkExtension(), internalLinkStyle]
