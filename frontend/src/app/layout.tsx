import type { Metadata } from "next";
import { CartProvider } from "@/context/cart-context";
import { ServiceWorkerRegistration } from "@/components/common/ServiceWorkerRegistration";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Allicam | Detallitos hechos con amor", template: "%s | Allicam" },
  description: "Regalos, desayunos y detalles florales artesanales para ocasiones especiales.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/images/logo-allicam.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CL">
      <body>
        <CartProvider>
          <ServiceWorkerRegistration />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
