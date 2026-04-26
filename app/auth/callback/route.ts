import { NextRequest, NextResponse } from 'next/server';

// With implicit flow, magic links land on the home page directly (not here).
// This route handles any stray PKCE-style redirects gracefully.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const origin = url.origin;
  return NextResponse.redirect(`${origin}/jakaas_bandey`);
}
