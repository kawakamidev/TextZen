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

const defaultRegexp = /\b((?:https?|ftp):\/\/[^\s/$.?#].[^\s\n)"']*)/gi

export interface HyperLinkState {
  at: number
  url: string
  anchor: HyperLinkExtensionOptions['anchor']
}

class HyperLinkIcon extends WidgetType {
  private readonly state: HyperLinkState
  constructor(state: HyperLinkState) {
    super()
    this.state = state
  }
  eq(other: HyperLinkIcon): boolean {
    return this.state.url === other.state.url && this.state.at === other.state.at
  }
  toDOM(): HTMLAnchorElement {
    const wrapper = document.createElement('a')
    wrapper.href = this.state.url
    wrapper.target = '_blank'
    wrapper.className = 'cm-hyper-link-icon'
    wrapper.rel = 'nofollow'
    wrapper.innerHTML = '↗︎'
    const anchor = this.state.anchor && this.state.anchor(wrapper)
    return anchor || wrapper
  }
}

function hyperLinkDecorations(
  view: EditorView,
  anchor?: HyperLinkExtensionOptions['anchor']
): DecorationSet {
  const widgets: Array<Range<Decoration>> = []
  const doc = view.state.doc.toString()
  let match

  while ((match = defaultRegexp.exec(doc)) !== null) {
    const from = match.index
    const to = from + match[0].length
    const widget = Decoration.widget({
      widget: new HyperLinkIcon({
        at: to,
        url: match[0],
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
  anchor?: HyperLinkExtensionOptions['anchor']
): MatchDecorator =>
  new MatchDecorator({
    regexp: regexp || defaultRegexp,
    decorate: (add, from, to, match): void => {
      const url = match[0]
      let urlStr =
        matchFn && typeof matchFn === 'function' ? matchFn(url, match.input, from, to) : url
      if (matchData && matchData[url]) {
        urlStr = matchData[url]
      }
      const start = to,
        end = to
      const linkIcon = new HyperLinkIcon({ at: start, url: urlStr, anchor })
      add(from, to, Decoration.mark({ class: 'cm-hyper-link-underline' }))
      add(start, end, Decoration.widget({ widget: linkIcon, side: 1 }))
    }
  })

export type HyperLinkExtensionOptions = {
  regexp?: RegExp
  match?: Record<string, string>
  handle?: (value: string, input: string, from: number, to: number) => string
  anchor?: (dom: HTMLAnchorElement) => HTMLAnchorElement
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function hyperLinkExtension({
  regexp,
  match,
  handle,
  anchor
}: HyperLinkExtensionOptions = {}) {
  return ViewPlugin.fromClass(
    class HyperLinkView {
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

export const hyperLinkStyle = EditorView.baseTheme({
  '.cm-hyper-link-icon': {
    display: 'inline-block',
    verticalAlign: 'middle',
    marginLeft: '0.2ch',
    opacity: '0.3',
    transition: 'all'
  },
  '.cm-hyper-link-icon:hover': {
    opacity: '0.5'
  }
})

export const hyperLink: Extension = [hyperLinkExtension(), hyperLinkStyle]
