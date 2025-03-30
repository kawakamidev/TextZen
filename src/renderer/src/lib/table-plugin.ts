import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType
} from '@codemirror/view'
import { syntaxTree } from '@codemirror/language'
import { Range } from '@codemirror/state'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'

async function markdownTableToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown)

  return String(result)
}

class TableWidget extends WidgetType {
  private readonly source: string

  constructor(source: string) {
    super()
    this.source = source
  }

  eq(other: TableWidget): boolean {
    return this.source === other.source
  }

  toDOM(): HTMLElement {
    const container = document.createElement('div')
    container.className = 'cm-table-preview'

    markdownTableToHtml(this.source).then((html) => {
      container.innerHTML = html
    })

    return container
  }

  ignoreEvent(): boolean {
    return false
  }
}

function findTables(view: EditorView): DecorationSet {
  const widgets: Array<Range<Decoration>> = []
  const tree = syntaxTree(view.state)

  tree.iterate({
    enter: (ref) => {
      if (ref.node.name === 'Table') {
        const from = ref.node.from
        const to = ref.node.to
        const content = view.state.doc.sliceString(from, to)

        const widget = Decoration.widget({
          widget: new TableWidget(content),
          side: 1
        })

        widgets.push(widget.range(to))
      }
    }
  })

  return Decoration.set(widgets)
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function tablePreviewExtension() {
  return ViewPlugin.fromClass(
    class TableRenderer {
      decorations: DecorationSet

      constructor(view: EditorView) {
        this.decorations = findTables(view)
      }

      update(update: ViewUpdate): void {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = findTables(update.view)
        }
      }
    },
    {
      decorations: (v) => v.decorations
    }
  )
}

export const tableStyle = EditorView.baseTheme({
  '.cm-table-preview table thead': {
    background: '#eee'
  },
  '.cm-table-preview table th': {
    padding: '3px 30px'
  },
  '.cm-table-preview table td': {
    padding: '10px 30px'
  },
  '.cm-table-preview table tbody tr': {
    borderBottom: '1px solid #ccc'
  }
})

export const tablePreviewPlugin = [tablePreviewExtension(), tableStyle]
