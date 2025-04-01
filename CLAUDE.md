# TextZen アーキテクチャガイド

## 概要

TextZen は、マークダウン記法によるノート管理のための、以下の特徴を持つデスクトップアプリケーションです：

- **シンプルな UI**: 執筆に集中できるミニマルなインターフェース
- **マークダウン中心**: GFM（GitHub Flavored Markdown）をベースとした拡張構文
- **拡張可能**: プラグインによる機能拡張
- **自動保存**: 変更内容の自動保存
- **内部リンク**: `[[title]]` 構文によるノート間リンク
- **カスタマイズ**: 設定とショートカットのカスタマイズ

## アーキテクチャの基本構成

- **Electron + React**: クロスプラットフォーム対応のデスクトップアプリ
- **IPC パターン**: メインプロセスは `ipcMain.handle` でハンドラを公開し、レンダラーは `window.api` で呼び出し
- **状態管理**: React Context API による状態管理 (`FileListContext`, `FocusContext`, `EditorContext`)
- **CodeMirror エディタ**: カスタムプラグインを使用した拡張可能なエディタ
- **設定管理**: electron-store による永続的な設定管理
- **多言語対応**: react-intl によるローカライゼーション
- **テーマ**: Tailwind CSS を使用したスタイリング
- **セキュリティ**: CSP（Content Security Policy）によるリソース制御

## 主要概念と機能

### ノート管理

- **ファイルベース**: 各ノートは独立したマークダウンファイルとして管理
- **内部リンク**: `[[title]]` 構文によるノート間のナビゲーション
- **バックリンク**: 参照元の追跡と表示
- **全文検索**: 高速な全文検索機能

### 拡張マークダウン

- **数式**: KaTeX を使用した数式レンダリング（`$inline$` と `$$block$$`）
- **図表**: Mermaid.js による図表作成と表示
- **テーブル**: マークダウンテーブルの視覚的なプレビュー
- **コンテキスト認識**: カーソル位置に応じた編集体験の最適化
- **デバウンス保存**: 自動保存と性能最適化の両立

### ユーザーインターフェース

- **サイドバー**: ファイル一覧とナビゲーション
- **エディタ**: 拡張マークダウンエディタ
- **フォーカス管理**: コンテキストに応じたフォーカス切替
- **ショートカットキー**: カスタマイズ可能なキーボードショートカット

## 開発ガイドライン

### コード品質と標準

- **型安全性**: TypeScript による厳格な型チェック
- **コードスタイル**: ESLint と Prettier による一貫したコード形式
- **コンポーネント設計**: 責任の明確な分離と再利用性の高いコンポーネント
- **テスト**: Playwright による E2E テスト
- **ドキュメント**: 明確なコメントと README

### テスト戦略

- **セレクタ**: 実装詳細ではなく、役割（role）やテキストに基づいたセレクタ
- **ユーザー行動**: 実際のユーザー操作をシミュレートしたテスト
- **機能テスト**: 個別機能に焦点を当てたテスト組織
- **視覚的検証**: 要素の表示状態の検証

## 実装パターン例

### IPC 通信パターン

メインプロセスとレンダラープロセス間の安全な通信を確立するパターン。

```typescript
// メインプロセス側
import { ipcMain } from 'electron'

export const setupFilesHandler = (): void => {
  ipcMain.handle('getFiles', async () => {
    try {
      return await getFiles()
    } catch (error) {
      console.error('Error getting files:', error)
      return []
    }
  })
}

// プリロードスクリプト側
import { contextBridge, ipcRenderer } from 'electron'

const api = {
  getFiles: (): Promise<Array<FileType>> => ipcRenderer.invoke('getFiles'),
}

// 安全のため contextBridge を使用
if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('api', api)
}

// レンダラー側 (React)
export const FileList = (): JSX.Element => {
  const [files, setFiles] = useState<Array<File>>([])

  useEffect(() => {
    window.api.getFiles()
      .then(files => setFiles(files))
      .catch(error => console.error('Failed to load files:', error))
  }, [])

  return (
    <div className="file-list">
      {files.map(file => (
        <div key={file.id}>{file.title}</div>
      ))}
    </div>
  )
}
```

### Context API による状態管理

アプリケーション状態を管理し、コンポーネント間で共有するパターン。

```typescript
// コンテキスト定義
import { createContext } from 'react'

export type FocusTarget = 'fileList' | 'editor' | 'search' | null

interface FocusContextType {
  focus: FocusTarget
  setFocus: (target: FocusTarget) => void
  toggleFocus: (target: FocusTarget) => void
}

export const FocusContext = createContext<FocusContextType>({
  focus: null,
  setFocus: () => {},
  toggleFocus: () => {}
})

// プロバイダー実装
export default function App(): JSX.Element {
  const [focus, setFocus] = useState<FocusTarget>('fileList')

  const toggleFocus = (target: FocusTarget): void => {
    setFocus(target === focus ? 'editor' : target)
  }

  return (
    <FocusContext.Provider value={{ focus, setFocus, toggleFocus }}>
      {/* アプリコンポーネント */}
    </FocusContext.Provider>
  )
}

// コンシューマー
export default function Sidebar(): JSX.Element {
  const { focus, setFocus } = useContext(FocusContext)

  return (
    <div
      className={`sidebar ${focus === 'fileList' ? 'focused' : ''}`}
      onClick={() => setFocus('fileList')}
    >
      {/* サイドバー内容 */}
    </div>
  )
}
```

### CodeMirror ViewPlugin パターン

エディタの機能を拡張するためのプラグイン実装パターン。

```typescript
import {
  ViewPlugin,
  DecorationSet,
  Decoration,
  EditorView,
  ViewUpdate,
  WidgetType
} from '@codemirror/view'
import { Range } from '@codemirror/state'

// カスタムウィジェット
class CustomWidget extends WidgetType {
  constructor(private readonly content: string) {
    super()
  }

  eq(other: CustomWidget) {
    return this.content === other.content
  }

  toDOM() {
    const element = document.createElement('div')
    element.className = 'custom-widget'
    element.textContent = this.content
    return element
  }
}

// コンテンツ検出関数
function findCustomContent(view: EditorView): Range<Decoration>[] {
  const ranges: Range<Decoration>[] = []
  const content = view.state.doc.toString()

  // パターンマッチング: [[example]]
  const regex = /\[\[(.*?)\]\]/g
  let match

  while ((match = regex.exec(content)) !== null) {
    // ウィジェット作成
    const widget = Decoration.widget({
      widget: new CustomWidget(match[1]),
      side: 1
    })

    ranges.push(widget.range(match.index + match[0].length))
  }

  return ranges
}

// ViewPlugin 定義
export const customViewPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = Decoration.set(findCustomContent(view))
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = Decoration.set(findCustomContent(update.view))
      }
    }
  },
  {
    decorations: (instance) => instance.decorations
  }
)
```

### 非破壊的設定管理パターン

ユーザー設定を安全に初期化、保存、管理するパターン。

```typescript
import { store } from './store'

// 非破壊的設定初期化
const initialize = (key: string, defaultValue: any): void => {
  if (store.get(key) === undefined) {
    store.set(key, defaultValue)
  }
}

// アプリケーション設定初期化
export const initializeConfig = (): void => {
  // UI 設定
  initialize('view.sidebar.visible', true)
  initialize('view.sidebar.width', 250)
  initialize('view.theme', 'default')

  // エディタ設定
  initialize('edit.autoSave', true)

  // ショートカットキー（カテゴリ分類）
  initialize('shortcuts', {
    // ファイル操作
    fileOpen: 'Cmd+O',
    fileNew: 'Cmd+N',
    fileSearch: 'Cmd+P',

    // ナビゲーション
    focusSidebar: 'Cmd+1',
    focusEditor: 'Cmd+2'
  })
}
```

### ショートカットキー管理パターン

クロスプラットフォーム対応のキーボードショートカット管理パターン。

```typescript
import { store } from './store'
import { useEffect } from 'react'

// ショートカット取得
export const getShortcut = (key: string): string => {
  const shortcuts = store.get('shortcuts') as Record<string, string>
  return shortcuts?.[key] || ''
}

// プラットフォーム変換
export const toAccelerator = (shortcut: string): string => {
  return shortcut
    .replace('Cmd', process.platform === 'darwin' ? 'Command' : 'Control')
    .replace('Option', 'Alt')
}

// ショートカット一致チェック
export const matchesShortcut = (event: KeyboardEvent, shortcut: string): boolean => {
  if (!shortcut) return false

  const keys = shortcut.split('+')
  const mainKey = keys.pop()?.toLowerCase() || ''
  const modifiers = keys.map((key) => key.toLowerCase())

  // 修飾キーチェック
  const hasCommand = modifiers.includes('cmd') || modifiers.includes('command')
  const hasShift = modifiers.includes('shift')
  const hasAlt = modifiers.includes('alt') || modifiers.includes('option')

  if (hasCommand !== event.metaKey) return false
  if (hasShift !== event.shiftKey) return false
  if (hasAlt !== event.altKey) return false

  // メインキーチェック
  return event.key.toLowerCase() === mainKey.toLowerCase()
}

// React フック
export const useShortcuts = (handlers: Record<string, () => void>): void => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      for (const [id, handler] of Object.entries(handlers)) {
        if (matchesShortcut(event, getShortcut(id))) {
          event.preventDefault()
          handler()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers])
}
```

### デバウンス保存パターン

パフォーマンス最適化のためのデバウンス保存パターン。

```typescript
import { useDebouncedCallback } from 'use-debounce'
import { useState, useEffect } from 'react'

export function Editor({ fileId, initialContent, onSave }: EditorProps): JSX.Element {
  const [content, setContent] = useState(initialContent)
  const [isDirty, setIsDirty] = useState(false)

  // デバウンス保存関数（500ms）
  const debouncedSave = useDebouncedCallback(async (content: string) => {
    try {
      await window.api.writeFile(fileId, content)
      setIsDirty(false)
      onSave?.(content)
    } catch (error) {
      console.error('Failed to save file:', error)
    }
  }, 500)

  // 内容変更処理
  const handleChange = (newContent: string): void => {
    setContent(newContent)
    setIsDirty(true)
    debouncedSave(newContent)
  }

  // アンマウント時の強制保存
  useEffect(() => {
    return () => {
      if (isDirty) {
        debouncedSave.flush()
      }
    }
  }, [content, debouncedSave, isDirty])

  return (
    <div className="editor">
      <div className="status">{isDirty ? '保存中...' : '保存済み'}</div>
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  )
}
```

### 特殊記法のレンダリングパターン

数式などの特殊記法を対話的にレンダリングするパターン。

```typescript
import katex from 'katex'
import { WidgetType } from '@codemirror/view'

// 数式ウィジェット
class MathWidget extends WidgetType {
  constructor(
    private readonly formula: string,
    private readonly isBlock: boolean
  ) {
    super()
  }

  eq(other: MathWidget): boolean {
    return this.formula === other.formula && this.isBlock === other.isBlock
  }

  toDOM(): HTMLElement {
    const container = document.createElement('span')
    container.className = this.isBlock ? 'math-block' : 'math-inline'

    try {
      // KaTeXでレンダリング
      katex.render(this.formula, container, {
        displayMode: this.isBlock,
        throwOnError: false,
        output: 'html'
      })
    } catch (error) {
      // エラー時のフォールバック
      console.error('KaTeX error:', error)
      container.textContent = this.isBlock ? `$$${this.formula}$$` : `$${this.formula}$`
      container.classList.add('math-error')
    }

    return container
  }
}

// 数式抽出関数
function extractMathFormulas(text: string): Array<{
  formula: string
  start: number
  end: number
  isBlock: boolean
}> {
  const results = []

  // インライン数式: $formula$
  const inlineRegex = /\$((?!\s)(?:[^$\\]|\\[\s\S])+?(?!\s))\$/g
  let match

  while ((match = inlineRegex.exec(text)) !== null) {
    results.push({
      formula: match[1],
      start: match.index,
      end: match.index + match[0].length,
      isBlock: false
    })
  }

  // ブロック数式: $$formula$$
  const blockRegex = /\$\$((?:[^$\\]|\\[\s\S])+?)\$\$/g

  while ((match = blockRegex.exec(text)) !== null) {
    results.push({
      formula: match[1],
      start: match.index,
      end: match.index + match[0].length,
      isBlock: true
    })
  }

  return results.sort((a, b) => a.start - b.start)
}
```

### テスト実装パターン

ユーザー操作を模倣したエンドツーエンドテストパターン。

```typescript
import { test, expect } from '@playwright/test'

test('エディタの基本機能', async ({ page }) => {
  // アプリに移動
  await page.goto('http://localhost:3000')

  // ロールベースセレクタを使用して新規ファイル作成
  await page.getByRole('button', { name: '新規作成' }).click()

  // タイトル入力
  await page.getByRole('textbox', { name: 'タイトル' }).fill('テスト文書')

  // エディタにフォーカスして内容入力
  await page.locator('.cm-editor').click()
  await page.keyboard.type('# 見出し1\n\nこれはテスト段落です。')

  // 要素が正しく表示されていることを確認
  await expect(page.getByRole('heading', { name: '見出し1' })).toBeVisible()
  await expect(page.getByText('これはテスト段落です。')).toBeVisible()

  // フォーマットのテスト
  await page.keyboard.type('\n\n')
  await page.keyboard.press('Control+b') // 太字開始
  await page.keyboard.type('太字テキスト')
  await page.keyboard.press('Control+b') // 太字終了

  // フォーマットが適用されていることを確認
  await expect(page.locator('strong').filter({ hasText: '太字テキスト' })).toBeVisible()
})
```
