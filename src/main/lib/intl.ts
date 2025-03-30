import { createIntl, createIntlCache } from '@formatjs/intl'
import { ja } from './ja'

const cache = createIntlCache()
export const intl = createIntl(
  {
    locale: 'ja',
    messages: ja
  },
  cache
)
