import { redirect } from "next/navigation";
import RoiCalculator from "@/components/RoiCalculator";
import { createClient } from "@/lib/supabase/server";

/**
 * 로그인 여부만 확인하는 서버 컴포넌트.
 * 이 앱은 사용자별 데이터를 저장하지 않으므로, 로그인 후 화면은 누구에게나 동일하다.
 */
export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  const email = data.claims.email ?? "";

  return <RoiCalculator userEmail={email} />;
}
