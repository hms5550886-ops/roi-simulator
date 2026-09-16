"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  status: "idle" | "sent" | "error";
  message: string | null;
};

/**
 * 등록된 이메일로만 매직링크를 보낸다. 비밀번호는 쓰지 않는다.
 * shouldCreateUser: false — 계정이 없는 이메일은 링크 발송 자체가 거부된다
 * (회원가입 화면을 두지 않는다는 원칙을 여기서도 한 번 더 강제한다).
 */
export async function sendMagicLink(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { status: "error", message: "이메일을 입력해 주세요." };
  }

  // 서버 액션에는 요청 URL이 직접 전달되지 않아, 헤더에서 접속 주소를 읽어 구성한다.
  const headerList = await headers();
  const host = headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "https";
  const origin = headerList.get("origin") ?? `${proto}://${host}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return {
      status: "error",
      message:
        "등록되지 않은 이메일이거나 발송에 실패했습니다. 관리자에게 문의해 주세요.",
    };
  }

  return {
    status: "sent",
    message: `${email} 주소로 로그인 링크를 보냈습니다. 메일함을 확인해 주세요.`,
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
