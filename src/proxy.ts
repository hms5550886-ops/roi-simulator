// Next.js 16부터 middleware.ts가 proxy.ts로 이름이 바뀌었다.
// (node_modules/next/dist/docs/01-app/03-file-conventions/proxy.md 참고)
import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
