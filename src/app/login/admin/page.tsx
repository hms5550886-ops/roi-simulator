"use client";

import { useActionState } from "react";
import { adminSignIn, type AdminLoginState } from "./actions";

const INITIAL_STATE: AdminLoginState = { error: null };

/** 관리자 전용 비밀번호 로그인. 일반 영업팀 계정은 이 경로를 쓰지 않는다. */
export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(
    adminSignIn,
    INITIAL_STATE,
  );

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-lg border border-[var(--hairline)] bg-surface p-6"
      >
        <h1 className="mb-1 text-lg font-semibold">관리자 로그인</h1>
        <p className="mb-5 text-xs text-ink-secondary">
          등록된 관리자 계정만 비밀번호로 로그인할 수 있습니다.
        </p>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-ink-secondary">이메일</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="username"
              className="w-full rounded-md border border-[var(--hairline)] bg-surface px-3 py-2 text-sm outline-none focus:border-ink-muted"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-ink-secondary">비밀번호</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-[var(--hairline)] bg-surface px-3 py-2 text-sm outline-none focus:border-ink-muted"
            />
          </label>
        </div>

        {state.error ? (
          <p className="mt-3 text-xs text-red-600">{state.error}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-5 w-full rounded-md bg-ink px-3 py-2 text-sm font-semibold text-surface hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}
