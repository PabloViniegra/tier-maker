export type WebsiteJsonLd = {
  '@context': string
  '@type': string
  name: string
  url: string
}

export function htmlSafeJson(value: WebsiteJsonLd): string {
  return JSON.stringify(value).replace(/[<>&]/g, (char) => {
    if (char === '<') return '\\u003c'
    if (char === '>') return '\\u003e'
    return '\\u0026'
  })
}
