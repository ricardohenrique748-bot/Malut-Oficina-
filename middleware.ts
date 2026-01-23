import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user

    // Protected routes
    const path = request.nextUrl.pathname
    const isDashboardRoute = path.startsWith('/dashboard') ||
        path.startsWith('/customers') ||
        path.startsWith('/vehicles') ||
        path.startsWith('/work-orders') ||
        path.startsWith('/financial') ||
        path.startsWith('/stock') ||
        path.startsWith('/admin')

    if (isDashboardRoute && !user) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // RBAC check (using user metadata from session for speed)
    const role = user?.user_metadata?.role

    if (path.startsWith('/financial') && role !== 'FINANCEIRO' && role !== 'ADMIN' && role !== 'GERENTE') {
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
    }

    if (path.startsWith('/admin') && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url));
    }

    return response
}


export const config = {
    matcher: [
        "/dashboard/:path*",
        "/customers/:path*",
        "/vehicles/:path*",
        "/work-orders/:path*",
        "/financial/:path*",
        "/stock/:path*",
        "/admin/:path*",
    ],
};
