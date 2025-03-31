## Architecture

- **IPC Pattern**: Main exposes handlers via `ipcMain.handle`, renderer calls via `window.api`
- **State Management**: React contexts for app state (`FileListContext`, `FocusContext`, `EditorContext`)
- **Plugin System**: Editor functionality extended via plugins (internal links, mermaid, math formulas, etc.)
- **File Operations**: All file I/O handled in main process via IPC
- **Editor**: Uses CodeMirror 6 with custom plugins
- **Styling**: Tailwind CSS for UI components
- **Localization**: react-intl for multilingual support
- **Storage**: electron-store for configuration persistence
- **CSP**: Content Security Policy controls resource loading (fonts, styles, scripts)

## References

Please review the following files before starting work

- Product overview:
  - `README.md`
- Commands:
  - `package.json`
- Base Style:
  - `eslint.config.mjs`
  - `tsconfig.json`
  - `.prettierrc.yaml`
- React:
  - `src/renderer/src/components/Page.tsx`
- Types:
  - `src/preload/index.d.ts`
- Testing:
  - `tests/editor.spec.ts`
- CodeMirror plugins:
  - `src/renderer/src/lib/table-plugin.ts`
  - `src/renderer/src/lib/math-plugin.ts`

## Key Concepts

- **Internal Links**: Link between notes with `[[title]]` syntax
- **File**: A markdown note with metadata
- **Full Text Search**: Search across all note content (ripgrep)
- **Plugins**: Editor extensions for special features
- **Debounced Saves**: Automatic file saving with performance optimization
- **Math Formulas**: Support for KaTeX mathematical notation with `$inline$` and `$$block$$` syntax
- **Interactive Editing**: Line-aware rendering that shows raw markdown when cursor is on the same line

## Implementation Patterns

- **ViewPlugin Pattern**: CodeMirror extensions use ViewPlugin class to create interactive document decorations
- **Widget Replacement**: Custom widgets replace text content with interactive elements (e.g., math formulas)
- **Line Detection**: Track cursor line position to provide context-aware editing experience
- **CSP Management**: Properly configure Content-Security-Policy for external resources
- **Test Strategies**: Use role-based selectors for reliable UI testing