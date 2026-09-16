// 서버 컴포넌트·서버 액션·라우트 핸들러에서 쓰는 Supabase 클라이언트.
// 쿠키를 통해 로그인 세션을 읽고 쓴다.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // 서버 컴포넌트에서는 쿠키를 쓸 수 없어 예외가 날 수 있다.
          // proxy.ts가 매 요청마다 세션을 갱신하므로 여기서는 무시해도 안전하다.
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // 서버 컴포넌트에서 호출된 경우 — 무시.
          }
        },
      },
    },
  );
}
