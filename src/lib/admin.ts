// 비밀번호 로그인이 허용되는 관리자 계정 목록.
// 나머지 계정은 계정에 비밀번호가 남아 있더라도(최초 일괄 생성 시 부여) 이 경로로는 로그인할 수 없다.
// 실제 이메일 주소는 소스코드(퍼블릭 저장소)에 남기지 않고 환경변수로 관리한다.
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);
