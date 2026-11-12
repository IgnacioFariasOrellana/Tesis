"""CP-I1-01 y CP-I1-02: autorización por sesión y rol en FastAPI."""

from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app


ADMIN = {"id": 10, "rol": "admin", "activo": True}
CLIENTE = {"id": 20, "rol": "cliente", "activo": True}


def test_cp_i1_01_admin_autenticado_accede_a_operacion_de_su_rol():
    """Un administrador autenticado puede asociar insumos a un producto."""
    with (
        patch("app.core.auth.SupabaseClient") as auth_client_factory,
        patch("app.core.auth.get_by_auth_id", return_value=ADMIN),
        patch("app.api.producto.SupabaseClient"),
        patch("app.api.producto.replace_supplies") as replace_supplies,
        patch("app.api.producto.invalidate_catalog_cache"),
        TestClient(app) as client,
    ):
        auth_client_factory.return_value.request.return_value = {"id": "usuario-de-prueba"}
        response = client.patch(
            "/api/admin/products/7/supplies",
            headers={"Authorization": "Bearer sesion-de-prueba"},
            json={"supplies": [{"insumoId": 3, "quantity": "1.250"}]},
        )

    assert response.status_code == 200
    assert response.json() == {"updated": True}
    auth_client_factory.return_value.request.assert_called_once()
    replace_supplies.assert_called_once()


def test_cp_i1_02_cliente_recibe_403_al_intentar_crear_producto():
    """El rol cliente no alcanza el servicio de creación administrativa."""
    with (
        patch("app.core.auth.SupabaseClient") as auth_client_factory,
        patch("app.core.auth.get_by_auth_id", return_value=CLIENTE),
        patch("app.api.producto.create_product") as create_product,
        TestClient(app) as client,
    ):
        auth_client_factory.return_value.request.return_value = {"id": "usuario-de-prueba"}
        response = client.post(
            "/api/admin/products",
            headers={"Authorization": "Bearer sesion-de-prueba"},
            data={
                "name": "Producto bloqueado",
                "category": "Prueba",
                "description": "No debe guardarse",
                "price": "1000",
                "supplies": '[{"insumoId": 1, "quantity": "1"}]',
            },
            files={"photo": ("prueba.jpg", b"\xff\xd8\xfftest", "image/jpeg")},
        )

    assert response.status_code == 403
    assert response.json()["detail"] == "Se requiere acceso de administración"
    auth_client_factory.return_value.request.assert_called_once()
    create_product.assert_not_called()

