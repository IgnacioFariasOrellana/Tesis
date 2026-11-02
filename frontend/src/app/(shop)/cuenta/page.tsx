import Image from "next/image";
import { LoginForm } from "@/components/LoginForm";

export default function AccountPage() {
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
          <p>Ingresa para acceder a tu perfil cuando esté disponible.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
