import {
  ViewPlugin,
  EditorView,
  Decoration,
  DecorationSet,
  WidgetType,
  ViewUpdate
} from '@codemirror/view'
import { Range } from '@codemirror/state'
import { syntaxTree } from '@codemirror/language'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: { useMaxWidth: false }
})

class MermaidWidget extends WidgetType {
  private readonly source: string
  private readonly id: string

  constructor(source: string) {
    super()
    this.source = source
    this.id = `mermaid-${Math.random().toString(36).substring(2, 11)}`
  }

  eq(other: MermaidWidget): boolean {
    return this.source === other.source
  }

  toDOM(): HTMLElement {
    const container = document.createElement('div')
    container.className = 'cm-mermaid-container'

    mermaid.render(this.id, this.source).then(({ svg }) => {
      container.innerHTML = svg
    })

    return container
  }

  ignoreEvent(): boolean {
    return false
  }
}

function findMermaidBlocks(view: EditorView): DecorationSet {
  const widgets: Array<Range<Decoration>> = []
  const tree = syntaxTree(view.state)

  tree.iterate({
    enter: (ref) => {
      if (
        ref.node.name.includes('FencedCode') &&
        ref.node.getChildren('CodeInfo')[0] &&
        view.state.doc
          .sliceString(
            ref.node.getChildren('CodeInfo')[0].from,
            ref.node.getChildren('CodeInfo')[0].to
          )
          .trim() === 'mermaid' &&
        ref.node.firstChild
      ) {
        const contentNode = ref.node.getChildren('CodeText')[0]
        if (!contentNode) {
          return
        }
        const from = contentNode.from
        const to = contentNode.to
        const content = view.state.doc.sliceString(from, to)

        const widget = Decoration.widget({
          widget: new MermaidWidget(content),
          side: 1
        })

        widgets.push(widget.range(to + 4))
      }
    }
  })

  return Decoration.set(widgets)
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function mermaidExtension() {
  return ViewPlugin.fromClass(
    class MermaidView {
      decorations: DecorationSet

      constructor(view: EditorView) {
        this.decorations = findMermaidBlocks(view)
      }

      update(update: ViewUpdate): void {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = findMermaidBlocks(update.view)
        }
      }
    },
    {
      decorations: (v) => v.decorations
    }
  )
}

export const mermaidStyle = EditorView.baseTheme({
  '.cm-mermaid-container': {
    margin: '1em 0',
    backgroundColor: '#f8f8f8',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '1em'
  },
  '.cm-mermaid-render': {
    textAlign: 'center',
    overflow: 'auto'
  },
  '.cm-mermaid-source': {
    marginTop: '0.5em',
    fontSize: '0.85em'
  },
  '.cm-mermaid-error': {
    color: 'red',
    whiteSpace: 'pre-wrap',
    textAlign: 'left',
    fontFamily: 'monospace'
  }
})

export const mermaidPlugin = [mermaidExtension(), mermaidStyle]
