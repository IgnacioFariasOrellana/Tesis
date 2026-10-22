import Link from "next/link";
import Image from "next/image";
export function Footer(){return <footer className="footer"><div className="container footer-grid">
 <div><Link href="/" className="footer-logo"><Image src="/images/logo-allicam.png" width={30} height={27} alt=""/> Allicam</Link><p>Creaciones y bandejas de autor elaboradas a mano con fibras orgánicas, papel de algodón y detalles florales para momentos entrañables.</p><span className="soft-pill">Boutique floral & artesanal</span></div>
 <div><h4>Compromisos de Taller</h4><p>Caligrafía y tarjetas a mano<br/>Madera noble y lacado botánico<br/>Embalaje ecológico certificado<br/>Envío cuidadoso a temperatura controlada</p></div>
 <div><h4>Atención y Taller</h4><p>Lunes a Sábado: 8:00 AM – 7:00 PM<br/>Domingos especiales: 9:00 AM – 2:00 PM<br/>Entregas programadas matutinas<br/>WhatsApp Concierge Boutique</p></div>
 <div><h4>Seguridad & Transparencia</h4><p>Tus regalos viajan con registro fotográfico y seguimiento.</p><Link href="/cuenta">Política de privacidad (demo)</Link><br/><Link href="/catalogo">Políticas de envío</Link></div>
 </div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Allicam – Regalos y Bandejas Artesanales. Prototipo académico.</span><em>“Un detallito hecho con amor, para cada ocasión”</em></div></footer>}
