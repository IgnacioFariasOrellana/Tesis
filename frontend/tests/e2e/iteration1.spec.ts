import { expect, test, type APIRequestContext } from "@playwright/test";
import path from "node:path";
import {
  cleanupTemporaryProduct,
  createTemporaryAdmin,
  deleteTemporaryAdmin,
} from "./test-admin-fixture";

const apiUrl = process.env.E2E_API_URL || "http://localhost:8000";

type CatalogProduct = {
  slug: string;
  name: string;
  price: number;
  supplies: Array<{ name: string; quantity: number; unit: string }>;
};

async function catalogProducts(request: APIRequestContext): Promise<CatalogProduct[]> {
  let lastStatus = 0;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await request.get(`${apiUrl}/api/products`);
    lastStatus = response.status();
    if (response.ok()) return (await response.json()) as CatalogProduct[];
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`El catálogo no respondió correctamente después de 3 intentos (${lastStatus})`);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
});

test("CP-I1-03: un producto disponible aparece en el catálogo", async ({ page, request }) => {
  const products = await catalogProducts(request);
  test.skip(products.length === 0, "La base de prueba no contiene productos disponibles");

  const product = products[0];
  await page.goto("/catalogo");

  await expect(page.getByRole("link", { name: product.name, exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: `Ver ${product.name}` })).toHaveAttribute(
    "href",
    `/producto/${product.slug}`,
  );
});

test("CP-I1-04: el administrador crea un producto y queda registrado", async ({ page, request }) => {
  const suffix = Date.now().toString();
  const productName = `Producto E2E ${suffix}`;
  const productSlug = `producto-e2e-${suffix}`;
  const categoryName = `Pruebas E2E ${suffix}`;
  let temporarySupplyName: string | undefined;
  const admin = await createTemporaryAdmin();
  try {
    await page.goto("/cuenta");
    await page.getByLabel("Correo electrónico").fill(admin.email);
    await page.getByLabel("Contraseña").fill(admin.password);
    await page.getByRole("button", { name: /^Ingresar/ }).click();
    await page.getByLabel("Contraseña").fill("");
    await expect(page).toHaveURL(/\/admin(?:\/)?$/, { timeout: 30_000 });

    await page.goto("/admin/productos");
    await page.getByRole("button", { name: "Nuevo producto" }).click();
    const dialog = page.getByRole("dialog", { name: "Agregar producto" });
    await expect(dialog).toBeVisible();

    await dialog.getByLabel(/^Nombre/).fill(productName);
    await dialog.getByLabel(/^Categoría/).fill(categoryName);
    await dialog.getByLabel(/^Precio/).fill("15990");
    await dialog.getByLabel(/^Descripción/).fill("Producto creado por la prueba automatizada.");
    await dialog.getByLabel(/^Ocasiones/).fill("Prueba automatizada");

    const supplySelect = dialog.locator("section[aria-label='Insumos del producto'] select").first();
    const optionCount = await supplySelect.locator("option").count();
    if (optionCount < 2) {
      temporarySupplyName = `Insumo E2E ${suffix}`;
      await dialog.getByRole("button", { name: "Crear insumo nuevo" }).click();
      await dialog.getByLabel(/^Nombre del insumo/).fill(temporarySupplyName);
      await dialog.getByRole("button", { name: /^Crear insumo$/ }).click();
      await expect(dialog.getByText("Insumo creado y disponible en el inventario.")).toBeVisible();
    } else {
      await supplySelect.selectOption({ index: 1 });
    }
    await dialog.getByLabel(/^Cantidad por producto/).fill("1.250");
    await dialog.locator("input[type='file']").setInputFiles(
      path.join(process.cwd(), "public", "images", "desayuno.jpg"),
    );

    const created = page.waitForResponse(
      (response) => response.url().endsWith("/api/admin/products") && response.request().method() === "POST",
    );
    await dialog.getByRole("button", { name: "Guardar producto" }).click();
    const createdResponse = await created;
    expect(createdResponse.status()).toBe(201);
    expect((await createdResponse.json()).slug).toBe(productSlug);
    await expect(page.getByText("Producto guardado. Ya está disponible en el catálogo.")).toBeVisible();

    const catalog = await catalogProducts(request);
    const saved = catalog.find((product) => product.name === productName);
    expect(saved).toBeTruthy();
    expect(saved?.supplies[0]?.quantity).toBe(1.25);
  } finally {
    try {
      await cleanupTemporaryProduct(productSlug, temporarySupplyName);
    } finally {
      await deleteTemporaryAdmin(admin.id);
    }
  }
});

test("CP-I1-06: agregar un producto actualiza el carrito y su resumen", async ({ page, request }) => {
  const products = await catalogProducts(request);
  test.skip(products.length === 0, "La base de prueba no contiene productos disponibles");
  const product = products[0];

  await page.goto(`/producto/${product.slug}`);
  await page.getByRole("button", { name: /Agregar al carrito de regalos/ }).click();

  await expect(page).toHaveURL(/\/carrito$/);
  await expect(page.getByRole("link", { name: product.name, exact: true }).last()).toBeVisible();
  await expect(page.getByText("Subtotal productos (1)")).toBeVisible();
  await expect(page.getByText("Total estimado")).toBeVisible();
  await expect(page.getByRole("link", { name: "Continuar pedido" })).toBeVisible();
});

