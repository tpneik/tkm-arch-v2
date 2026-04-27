import { createProxy } from 'next-i18next/proxy'
import { NextRequest, NextResponse } from 'next/server'
import i18nConfig from './i18n.config'

const i18nProxy = createProxy(i18nConfig)

/**
 * Redirect old project/blog URLs that contain a numeric ID segment.
 * Old: /:lng/du-an/:id/:categorySlug/:slug → New: /:lng/du-an/:categorySlug/:slug
 * Old: /:lng/projects/:id/:categorySlug/:slug → New: /:lng/projects/:categorySlug/:slug
 * Old: /:lng/blogs/:id/:categorySlug/:slug → New: /:lng/blogs/:categorySlug/:slug
 */
const OLD_URL_WITH_ID = /^\/(en|vi)\/(projects|du-an|blogs)\/(\d+)\/(.+)$/

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const match = OLD_URL_WITH_ID.exec(pathname)

  if (match) {
    const [, lang, routeSlug, , rest] = match
    const url = request.nextUrl.clone()
    url.pathname = `/${lang}/${routeSlug}/${rest}`
    return NextResponse.redirect(url, 301)
  }

  return i18nProxy(request)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest).*)'],
}
