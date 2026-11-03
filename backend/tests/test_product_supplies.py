"""Validación y límites de exposición del catálogo con insumos."""

import unittest
from unittest.mock import patch

from pydantic import ValidationError

from app.integrations.supabase import SupabaseError
from app.schemas.insumo import NewInsumo
from app.schemas.producto import NewProduct, Product
from app.schemas.producto_insumo import ProductSupplies, SupplySelection
from app.services.productos import ProductError, catalog_products, create_product


class SupplyValidationTests(unittest.TestCase):
    def test_rejects_invalid_compositions(self):
        for supplies in (
            [], [{"insumoId": 1, "quantity": "0"}],
            [{"insumoId": 1, "quantity": "0.0001"}],
            [{"insumoId": 1, "quantity": "NaN"}],
            [{"insumoId": 1, "quantity": 1}, {"insumoId": 1, "quantity": 2}],
        ):
            with self.subTest(supplies=supplies), self.assertRaises(ValidationError):
                ProductSupplies(supplies=supplies)

    def test_accepts_fractional_quantities_without_rounding(self):
        data = ProductSupplies(supplies=[{"insumoId": 1, "quantity": "0.125"}])
        self.assertEqual(data.model_dump(mode="json")["supplies"][0]["quantity"], "0.125")

    def test_supply_name_and_stocks_are_validated(self):
        self.assertEqual(NewInsumo(nombre=" Yogurt ", unidad_medida=" unidad ").nombre, "Yogurt")
        for values in ({"nombre": " "}, {"stock_actual": -1}, {"stock_minimo": "0.0001"}):
            with self.subTest(values=values), self.assertRaises(ValidationError):
                NewInsumo(**({"nombre": "Yogurt", "unidad_medida": "unidad"} | values))


class ProductSupplyServiceTests(unittest.TestCase):
    def test_catalog_uses_only_published_ids_and_omits_stock(self):
        product = Product(id="7", slug="bandeja", name="Bandeja", category="Desayunos",
                          occasions=[], description="Bandeja", price=1000, image="/photo.jpg",
                          badge="", availableToday=False, features=["Texto anterior"])
        with patch("app.services.productos.SupabaseClient"), \
             patch("app.services.productos.public_products", return_value=[product]), \
             patch("app.services.productos.for_products", return_value=[{
                 "id_producto": 7, "id_insumo": 3, "cantidad_requerida": 2,
                 "insumo": {"nombre": "Yogurt", "unidad_medida": "unidad", "stock_actual": 99},
             }]) as supplies:
            result = catalog_products()
        self.assertEqual(supplies.call_args.args[1], [7])
        self.assertEqual(result[0].features, ["Yogurt · 2 unidad"])
        self.assertNotIn("stock_actual", result[0].model_dump_json())

    def test_failed_product_transaction_removes_uploaded_photo(self):
        data = NewProduct(name="Bandeja", category="Desayunos", description="Bandeja completa",
                          price="1000", badge="", occasions="", available_today=False,
                          supplies=[SupplySelection(insumoId=1, quantity=2)])
        with patch("app.services.productos.SupabaseClient"), \
             patch("app.services.productos.slug_exists", return_value=False), \
             patch("app.services.productos.ensure_category", return_value=1), \
             patch("app.services.productos.upload_photo", return_value="/photo.jpg"), \
             patch("app.services.productos.insert_product", side_effect=SupabaseError(400)), \
             patch("app.services.productos.delete_photo") as cleanup:
            with self.assertRaises(ProductError) as error:
                create_product(data, b"\xff\xd8\xfftest")
        self.assertEqual(error.exception.status, 422)
        cleanup.assert_called_once()


if __name__ == "__main__":
    unittest.main()
