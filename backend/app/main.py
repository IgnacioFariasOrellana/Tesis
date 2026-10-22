"""FastAPI inicial: catálogo de demostración y salud de API."""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Allicam API", version="0.1.0", description="API inicial; sin autenticación ni pagos reales")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], allow_methods=["GET"], allow_headers=["*"])

class Product(BaseModel):
    id: str
    slug: str
    name: str
    category: str
    occasions: list[str]
    description: str
    price: int
    image: str
    badge: str
    availableToday: bool
    features: list[str]

PRODUCTS = [
    Product(id="p1",slug="bandeja-amanecer",name="Bandeja Amanecer Dulce Amor",category="Bandejas de Desayuno",occasions=["Pareja","Aniversario"],description="Bandeja de haya natural con bollería francesa, infusión de jazmín y mini ramo silvestre.",price=68000,image="/images/desayuno.jpg",badge="Favorito Aniversario",availableToday=True,features=["Bandeja de madera natural","Bollería artesanal fresca","Mini ramo floral","Tarjeta caligrafiada"]),
    Product(id="p2",slug="caja-noble-cafe",name="Caja Noble Roble & Café Gourmet",category="Cajas de Pino Grabadas",occasions=["Papá","Agradecimiento"],description="Caja de madera con grabado láser personalizado, café de origen y taza de gres artesanal.",price=84000,image="/images/caja-cafe.jpg",badge="Edición Papá",availableToday=False,features=["Caja de pino grabada","Café de origen seleccionado","Taza de gres artesanal","Tarjeta personalizada"]),
    Product(id="p3",slug="cesta-lavanda",name="Cesta Silvestre Lavanda & Miel",category="Cestas Dulces",occasions=["Agradecimiento","Mamá"],description="Cesto de mimbre natural con galletas de mantequilla, vela de cera de soja y atado de lavanda.",price=56000,image="/images/lavanda.jpg",badge="Agradecimiento",availableToday=False,features=["Cesta tejida a mano","Galletas de mantequilla","Lavanda preservada","Vela botánica"]),
    Product(id="p4",slug="box-cumpleanos",name="Box Cumpleaños Festivo & Cava",category="Cajas de Pino Grabadas",occasions=["Cumpleaños"],description="Caja lacada en tono empolvado, dulces artesanales y tarjeta especial para celebrar.",price=72000,image="/images/cumpleanos.jpg",badge="Edición Cumpleaños",availableToday=True,features=["Caja especial de celebración","Dulces artesanales","Flores de temporada","Dedicatoria manuscrita"]),
    Product(id="p5",slug="arreglo-jardin-rose",name="Arreglo Floral Jardín Rosé",category="Detalles Florales",occasions=["Mamá","Pareja"],description="Flor preservada y natural en jarrón cerámico esmaltado con dedicatoria en papel de algodón.",price=49000,image="/images/flores.jpg",badge="Especial Mamá",availableToday=False,features=["Jarrón de cerámica","Flores frescas y preservadas","Tarjeta de algodón"]),
    Product(id="p6",slug="bandeja-campina",name="Bandeja Campiña & Masa Madre",category="Bandejas de Desayuno",occasions=["Mamá","Agradecimiento"],description="Hogaza rústica, quesos madurados, mermelada de higos y fruta de estación.",price=78000,image="/images/campina.jpg",badge="Bestseller",availableToday=False,features=["Hogaza de masa madre","Quesos artesanales","Mermelada de higos","Arreglo floral"]),
    Product(id="p7",slug="caja-sorpresa-noble",name="Caja Sorpresa Noble Roble & Flores Silvestres",category="Cajas de Pino Grabadas",occasions=["Pareja","Aniversario","Mamá"],description="Caja de madera pulida a mano, aroma a café recién molido y pétalos preservados que conservan su frescura.",price=64000,image="/images/caja-sorpresa.jpg",badge="Edición limitada matutina",availableToday=True,features=["Caja de madera de pino noble","Ramillete floral silvestre","Taza de gres artesanal","Dúo dulce de campo","Desayuno artesanal recién horneado"]),
]

@app.get("/health")
def health():
    return {"status": "ok", "service": "allicam-api"}

@app.get("/api/products", response_model=list[Product])
def list_products():
    return PRODUCTS

@app.get("/api/products/{slug}", response_model=Product)
def get_product(slug: str):
    for product in PRODUCTS:
        if product.slug == slug:
            return product
    raise HTTPException(status_code=404, detail="Producto no encontrado")
