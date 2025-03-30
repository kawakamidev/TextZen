import { markdownLanguage } from '@codemirror/lang-markdown'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

let specs = [
  { tag: tags.meta, color: isDark ? '#b3b5b3' : '#404740' },
  { tag: tags.link, textDecoration: 'underline' },
  { tag: tags.heading, textDecoration: 'underline', fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.keyword, color: isDark ? '#c678dd' : '#708' },
  {
    tag: [tags.atom, tags.bool, tags.url, tags.contentSeparator, tags.labelName],
    color: isDark ? '#61afef' : '#219'
  },
  { tag: [tags.literal, tags.inserted], color: isDark ? '#98c379' : '#164' },
  { tag: [tags.string, tags.deleted], color: isDark ? '#e06c75' : '#a11' },
  {
    tag: [tags.regexp, tags.escape, tags.special(tags.string)],
    color: isDark ? '#d19a66' : '#e40'
  },
  { tag: tags.definition(tags.variableName), color: isDark ? '#61afef' : '#00f' },
  { tag: tags.local(tags.variableName), color: isDark ? '#c678dd' : '#30a' },
  { tag: [tags.typeName, tags.namespace], color: isDark ? '#98c379' : '#085' },
  { tag: tags.className, color: isDark ? '#e5c07b' : '#167' },
  { tag: [tags.special(tags.variableName), tags.macroName], color: isDark ? '#56b6c2' : '#256' },
  { tag: tags.definition(tags.propertyName), color: isDark ? '#61afef' : '#00c' },
  { tag: tags.comment, color: isDark ? '#7f848e' : '#940' },
  { tag: tags.invalid, color: isDark ? '#f00' : '#f00' }
]

if (window.textZen?.editorStyles) {
  specs = window.textZen.editorStyles
}

export const highlights = [
  syntaxHighlighting(
    HighlightStyle.define(specs, {
      scope: markdownLanguage,
      all: { fontFamily: 'sans-serif !important' }
    })
  ),
  syntaxHighlighting(
    HighlightStyle.define(specs, {
      all: { fontFamily: 'monospace' }
    })
  )
]
