import Image from "next/image";
import { AccountProfile } from "@/components/auth/AccountProfile";
import { AuthAccessView } from "@/components/auth/AuthAccessView";
import { getProfile } from "@/lib/supabase/profile";

export default async function AccountPage() {
  const profile = await getProfile();
  if (!profile) {
    return <AuthAccessView initialMode="login" />;
  }
  return (
    <div className="account-bg">
      <div className="container account-wrap account-wrap-narrow">
        <div className="account-heading">
          <Image
            src="/images/logo-allicam.png"
            alt="Allicam"
            width={180}
            height={90}
            style={{ objectFit: "contain" }}
          />
          <span className="eyebrow">✿ BOUTIQUE DE REGALOS & EXPERIENCIAS</span>
          <h1>Qué gusto verte de nuevo</h1>
          <p>Consulta tu perfil y accede a tu panel.</p>
        </div>
        <AccountProfile profile={profile} />
      </div>
    </div>
  );
}
