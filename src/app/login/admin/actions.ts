"use server";

import { redirect } from "next/navigation";
import { ADMIN_EMAILS } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

export type AdminLoginState = {
  error: string | null;
};

/**
 * 관리자 전용 비밀번호 로그인. 이메일 링크를 기다릴 필요가 없다.
 * ADMIN_EMAILS에 없는 이메일은 계정에 비밀번호가 남아 있어도 이 경로로 로그인할 수 없다
 * (일반 계정은 매직링크만 쓰도록 강제하기 위한 장치).
 */
export async function adminSignIn(
  _prevState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!ADMIN_EMAILS.includes(email)) {
    return { error: "관리자 계정만 비밀번호로 로그인할 수 있습니다." };
  }

  if (!password) {
    return { error: "비밀번호를 입력해 주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  redirect("/");
}
