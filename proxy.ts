import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { createProxy } from 'next-i18next/proxy'
import { NextRequest, NextResponse } from 'next/server'
import i18nConfig from './i18n.config'

const i18nProxy = createProxy(i18nConfig)

/**
 * Routes that require Clerk authentication.
 */
const isAdminRoute = createRouteMatcher(['/admin(.*)'])

/**
 * Redirect old project/blog URLs that contain a numeric ID segment.
 * Old: /:lng/du-an/:id/:categorySlug/:slug → New: /:lng/du-an/:categorySlug/:slug
 * Old: /:lng/projects/:id/:categorySlug/:slug → New: /:lng/projects/:categorySlug/:slug
 * Old: /:lng/blogs/:id/:categorySlug/:slug → New: /:lng/blogs/:categorySlug/:slug
 */
const OLD_URL_WITH_ID = /^\/(en|vi)\/(projects|du-an|blogs)\/(\d+)\/(.+)$/

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { pathname } = request.nextUrl

  // Legacy URL redirect (strip numeric ID segment)
  const match = OLD_URL_WITH_ID.exec(pathname)
  if (match) {
    const [, lang, routeSlug, , rest] = match
    const url = request.nextUrl.clone()
    url.pathname = `/${lang}/${routeSlug}/${rest}`
    return NextResponse.redirect(url, 301)
  }

  // Protect all /admin routes — unauthenticated users get redirected to /sign-in
  if (isAdminRoute(request)) {
    await auth.protect()
  }

  // For non-admin routes, run i18n proxy
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/sign-in') && !pathname.startsWith('/sign-up')) {
    return i18nProxy(request)
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
