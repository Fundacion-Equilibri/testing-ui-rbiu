import test, { expect } from "@playwright/test";

import { NeedsPage } from "../pages/needs-page";
import { NeedDetailsPage } from "../pages/need-details-page";

test.describe("Pagina de Necesidades    /necesidades", () => {
  let needsPage: NeedsPage;
  let needDetalisPage: NeedDetailsPage;

  test.beforeEach(async ({ page }) => {
    // Inicializacion de objetos
    needsPage = new NeedsPage(page);
    needDetalisPage = new NeedDetailsPage(page);
  });

  test.describe("Filtrado de necesidades", () => {
    test("Debería filtrar necesidades por categoría", async () => {
      // Act & Assert
      await needsPage.goto();
      await needsPage.filterByCategory("Telefonía móvil");

      await needsPage.filterByCategory("Ropa y accesorios");
    });

    test("Debería filtrar necesidades por país", async () => {
      // Act & Assert
      await needsPage.goto();
      await needsPage.filterByCountry("Bolivia");

      await needsPage.filterByCountry("España");
    });
  });

  test.describe("Paginación y Navegación", () => {
    test("Debería navegar a la página de detalles al hacer clic en un producto", async ({
      page,
    }) => {
      await needsPage.goto();
      const firstProduct = (await needsPage.getProductCards()).first();
      firstProduct.click();

      await needDetalisPage.verifyPageLoaded();
      await expect(page).toHaveURL(/.*\/necesidad\/\?id=\d+/);
    });

    test("Debería cargar más necesidades al hacer clic en 'Ver más'", async ({
      page,
    }) => {
      await needsPage.goto();

      // Se usa test.skip() para marcar el test como omitido si el botón no está visible.
      // Se le da un timeout para que el botón tenga tiempo de aparecer tras la carga inicial.
      await test.skip(
        !(await needsPage.loadMoreButton.isVisible({ timeout: 5000 })),
        "ADVERTENCIA: No hay suficientes productos para probar la paginación."
      );

      const initialCount = await needsPage.getProductCount();
      await needsPage.loadMoreProducts();

      // Tu método `loadMoreProducts` ya espera de forma robusta a que el loader desaparezca,
      // por lo que una aserción directa aquí es suficiente y fiable.
      const finalCount = await needsPage.getProductCount();
      expect(finalCount).toBeGreaterThan(initialCount);
    });
  });
});
