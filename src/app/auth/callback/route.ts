import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 이메일로 받은 매직링크가 도착하는 곳.
 *
 * 이 프로젝트는 무료 요금제라 이메일 템플릿을 직접 커스터마이즈할 수 없어,
 * 링크는 Supabase가 자체 호스팅하는 검증 페이지를 거친 뒤 여기로 `code`를 붙여
 * 리다이렉트한다 (PKCE 방식). 그래서 token_hash가 아니라 code를 세션과 교환한다.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect(next);
    }
  }

  redirect("/login?error=expired");
}
