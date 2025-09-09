import { test, expect } from "@playwright/test";
import { ProductDetailsPage } from "../pages/product-details-page";
import { ProductsPage } from "../pages/products-page";

test.describe("Página de Detalles del Producto - Usuario no autenticado", () => {
  let productDetailsPage: ProductDetailsPage;
  let productsPage: ProductsPage;

  test.beforeEach(async ({ page }) => {
    // Inicializar todos los Page Objects necesarios para los tests
    productsPage = new ProductsPage(page);
    productDetailsPage = new ProductDetailsPage(page);

    await productsPage.goto();
  });

  test.afterEach(async ({ page }) => {});

  test("Debería mostrar los detalles correctos de un producto", async ({
    page,
  }) => {
    // Encontrar uno o el primer producto
    const firstProduct = (await productsPage.getProductCards()).first();
    // Navegar hacia el producto selecionado
    await firstProduct.click();
    // Verficar que la pagina carga
    await productDetailsPage.verifyPageLoaded();
    // Un usuario real aceptaría las cookies primero. Esto evita que el banner bloquee otros clics.
    await page.getByRole("button", { name: "Aceptar" }).click();

    // En la ruta dinamica de /product?id= y uno o más dígitos
    await expect(page).toHaveURL(/.*\/producto\/\?id=\d+/);
    // Verificamos que los botones de acción no son visibles para usuarios no autenticados
    await expect(productDetailsPage.editProductButton).not.toBeVisible();
    await expect(productDetailsPage.startExchangeButton).not.toBeVisible();

    // Muestra un diálogo que sugiere iniciar sesión
    await expect(productDetailsPage.cardDialog).toBeVisible();
    // Al hacer clic en el botón de inicio de sesión...
    await productDetailsPage.clickLoginButton();
    // ...la página debe redirigir a la URL de login con los parámetros correctos.
    await expect(page).toHaveURL(/.*\/login\/\?origen=producto&id=\d+/);
  });
});
