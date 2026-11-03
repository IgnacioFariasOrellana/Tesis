import Image from "next/image";
import { LoginForm } from "@/components/LoginForm";
import { AccountProfile } from "@/components/AccountProfile";
import { getProfile } from "@/lib/supabase/profile";

export default async function AccountPage() {
  const profile = await getProfile();
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
          <p>{profile ? "Consulta tu perfil y accede a tu panel." : "Ingresa para acceder a tu perfil."}</p>
        </div>
        {profile ? <AccountProfile profile={profile} /> : <LoginForm />}
      </div>
    </div>
  );
}
