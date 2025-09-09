import { test, expect } from "@playwright/test";
import { NeedDetailsPage } from "../pages/need-details-page";
import { NeedsPage } from "../pages/needs-page";

test.describe("Página de Detalles de le necesidad - Usuario no autenticado  /necesidades", () => {
  let needDetailsPage: NeedDetailsPage;
  let needsPage: NeedsPage;

  test.beforeEach(async ({ page }) => {
    // Inicializar todos los Page Objects necesarios para los tests
    needsPage = new NeedsPage(page);
    needDetailsPage = new NeedDetailsPage(page);

    await needsPage.goto();
  });

  test.afterEach(async ({ page }) => {});

  test("Debería mostrar los detalles de un producto", async ({ page }) => {
    // Encontrar uno o el primer producto
    const firstProduct = (await needsPage.getProductCards()).first();
    // Navegar hacia el producto selecionado
    await firstProduct.click();
    // Verficar que la pagina carga
    await needDetailsPage.verifyPageLoaded();
    // Un usuario real aceptaría las cookies primero. Esto evita que el banner bloquee otros clics.
    await page.getByRole("button", { name: "Aceptar" }).click();

    // En la ruta dinamica de /necesidad?id= y uno o más dígitos
    await expect(page).toHaveURL(/.*\/necesidad\/\?id=\d+/);
    // Verificamos que los botones de acción no son visibles para usuarios no autenticados
    await expect(needDetailsPage.editProductButton).not.toBeVisible();
    await expect(needDetailsPage.startExchangeButton).not.toBeVisible();

    // Muestra un diálogo que sugiere iniciar sesión
    await expect(needDetailsPage.cardDialog).toBeVisible();
    await needDetailsPage.dialogVisible(
      "Inicia sesión para poder realizar intercambios y comunicarte con otros usuarios."
    );
    // Al hacer clic en el botón de inicio de sesión...
    await needDetailsPage.clickLoginButton();
    // ...la página debe redirigir a la URL de login con los parámetros correctos.
    await expect(page).toHaveURL(/.*\/login\/\?origen=necesidad&id=\d+/);
  });
});
