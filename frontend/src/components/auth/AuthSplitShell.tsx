"use client";

import { Gift, Heart, PackageCheck, Sparkles } from "lucide-react";

export type AuthMode = "login" | "register";

const copy = {
  register: {
    eyebrow: "NUEVO EN ALLICAM",
    title: "Crea tu perfil",
    description: "Regístrate para comprar, personalizar regalos y consultar tus pedidos.",
    storyTitle: "Cada detalle comienza con una historia",
    storyText:
      "Guarda tus datos, revisa tus encargos y acompaña cada sorpresa desde la preparación hasta la entrega.",
  },
  login: {
    eyebrow: "BIENVENIDO DE NUEVO",
    title: "Qué gusto verte",
    description: "Ingresa con tus datos para continuar en tu cuenta.",
    storyTitle: "Tus regalos, siempre cerca",
    storyText:
      "Vuelve a tus pedidos y mantén el seguimiento de cada detalle elaborado en nuestro taller.",
  },
};

export function AuthSplitShell({
  mode,
  onModeChange,
  children,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  children: React.ReactNode;
}) {
  const content = copy[mode];

  return (
    <div className="auth-split-page">
      <div className={`container auth-split-card auth-split-${mode}`}>
        <aside className="auth-story-panel">
          <div className="auth-story-copy">
            <span>✿ DETALLES HECHOS CON AMOR</span>
            <h2>{content.storyTitle}</h2>
            <p>{content.storyText}</p>
          </div>

          <div className="auth-gift-illustration" aria-hidden="true">
            <Sparkles className="auth-spark auth-spark-one" />
            <Heart className="auth-spark auth-spark-two" />
            <div className="auth-gift-halo" />
            <Gift className="auth-gift-icon" strokeWidth={1.35} />
            <span className="auth-gift-line" />
          </div>

          <div className="auth-story-benefit">
            <PackageCheck size={18} />
            <span>Pedidos personalizados y seguimiento en un solo lugar.</span>
          </div>
        </aside>

        <section className="auth-form-panel">
          <nav className="auth-mode-switch" aria-label="Acceso a cuenta">
            <button
              className={mode === "login" ? "is-active" : ""}
              type="button"
              onClick={() => onModeChange("login")}
            >
              Iniciar sesión
            </button>
            <button
              className={mode === "register" ? "is-active" : ""}
              type="button"
              onClick={() => onModeChange("register")}
            >
              Registrarse
            </button>
          </nav>

          <header className="auth-form-heading">
            <span>{content.eyebrow}</span>
            <h1>{content.title}</h1>
            <p>{content.description}</p>
          </header>

          <div className="auth-form-transition" key={mode}>
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
