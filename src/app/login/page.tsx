"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { sendMagicLink, type LoginState } from "./actions";

const INITIAL_STATE: LoginState = { status: "idle", message: null };

/** 링크가 만료·오류일 때 URL의 ?error=expired를 읽어 안내한다. */
function ExpiredNotice() {
  const searchParams = useSearchParams();
  if (searchParams.get("error") !== "expired") {
    return null;
  }
  return (
    <p className="mb-4 rounded-md bg-plane px-3 py-2 text-xs text-red-600">
      링크가 만료되었거나 이미 사용되었습니다. 다시 요청해 주세요.
    </p>
  );
}

/**
 * 로그인 화면. 비밀번호는 쓰지 않는다 — 등록된 이메일로 받은 링크로만 들어온다.
 * 회원가입 링크는 두지 않는다 — 계정은 관리자가 미리 만들어둔다.
 */
export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    sendMagicLink,
    INITIAL_STATE,
  );

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Suspense fallback={null}>
          <ExpiredNotice />
        </Suspense>

        <form
          action={formAction}
          className="rounded-lg border border-[var(--hairline)] bg-surface p-6"
        >
          <h1 className="mb-1 text-lg font-semibold">ROI 시뮬레이터 로그인</h1>
          <p className="mb-5 text-xs text-ink-secondary">
            등록된 이메일을 입력하면 로그인 링크를 보내드립니다. 비밀번호는
            필요 없습니다. 계정이 없다면 관리자에게 문의해 주세요.
          </p>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-ink-secondary">이메일</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="username"
              disabled={state.status === "sent"}
              className="w-full rounded-md border border-[var(--hairline)] bg-surface px-3 py-2 text-sm outline-none focus:border-ink-muted disabled:bg-plane disabled:text-ink-muted"
            />
          </label>

          {state.message ? (
            <p
              className={`mt-3 text-xs ${
                state.status === "error" ? "text-red-600" : "text-ink-secondary"
              }`}
            >
              {state.message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending || state.status === "sent"}
            className="mt-5 w-full rounded-md bg-ink px-3 py-2 text-sm font-semibold text-surface hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending
              ? "발송 중..."
              : state.status === "sent"
                ? "링크를 보냈습니다"
                : "로그인 링크 받기"}
          </button>
        </form>
      </div>
    </div>
  );
}
