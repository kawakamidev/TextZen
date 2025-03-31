## Architecture

- **IPC Pattern**: Main exposes handlers via `ipcMain.handle`, renderer calls via `window.api`
- **State Management**: React contexts for app state (`FileListContext`, `FocusContext`, `EditorContext`)
- **Plugin System**: Editor functionality extended via plugins (internal links, mermaid, etc.)
- **File Operations**: All file I/O handled in main process via IPC
- **Editor**: Uses CodeMirror 6 with custom plugins
- **Styling**: Tailwind CSS for UI components
- **Localization**: react-intl for multilingual support
- **Storage**: electron-store for configuration persistence

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
- CodeMirror plugin:
  - `src/renderer/src/lib/table-plaugin.ts`

## Key Concepts

- **Internal Links**: Link between notes with `[[title]]` syntax
- **File**: A markdown note with metadata
- **Full Text Search**: Search across all note content (ripgrep)
- **Plugins**: Editor extensions for special features
- **Debounced Saves**: Automatic file saving with performance optimization
