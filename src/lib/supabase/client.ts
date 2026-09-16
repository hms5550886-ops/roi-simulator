// 브라우저(클라이언트 컴포넌트)에서 쓰는 Supabase 클라이언트.
// 로그인 게이트 용도로만 쓰며, 여기서 만든 클라이언트로 다른 데이터를 저장하지 않는다.

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
