import { NextResponse, NextRequest } from 'next/server'; 
import { getToken, JWT } from 'next-auth/jwt';
import { jwtVerify } from 'jose';
import { JwtPayload } from 'jsonwebtoken'; 

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'votre_secret_de_test');

export async function middleware(req: NextRequest) { 
    const token: JWT | null = await getToken({ req });

    if (!token || !token.jwt) {
        return NextResponse.redirect(new URL('/login', req.url)); 
    }

    try {
        const userJwt: JwtPayload = await jwtVerify(token.jwt as string, JWT_SECRET);

        const userRole: string = (userJwt['payload'].role).toLowerCase();
        const emailVerified: boolean = userJwt['payload'].emailVerified;
        const isGoogleUser: boolean = userJwt['payload'].isGoogleUser || false; 

        const isAdminPage: boolean = req.nextUrl.pathname.startsWith('/admin');
        const isProfilePage: boolean = req.nextUrl.pathname.startsWith('/profil');

        if (isAdminPage && userRole !== 'admin') {
            return NextResponse.redirect(new URL('/', req.url)); 
        }

        if (isProfilePage && (userRole === 'user' || userRole === 'admin') && (isGoogleUser || emailVerified)) {
            return NextResponse.next();
        }

        if (isProfilePage && !emailVerified && !isGoogleUser) {
            return NextResponse.redirect(new URL('/resend-email', req.url)); 
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Erreur de vérification du JWT :', error);
        return NextResponse.redirect(new URL('/login', req.url)); 
    }
}

export const config: { matcher: string[] } = {
    matcher: ['/profil/:path*', '/admin/:path*'], 
};
