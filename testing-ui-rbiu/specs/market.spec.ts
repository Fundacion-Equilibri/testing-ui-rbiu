import { test, expect } from "@playwright/test";

import { ProductsPage } from "../pages/products-page";
import { ProductDetailsPage } from "../pages/product-details-page";

test.describe("Página de Mercado /mercado", () => {
  let productsPage: ProductsPage;
  let productDetailsPage: ProductDetailsPage;

  test.beforeEach(async ({ page }) => {
    // Inicialización de Page Objects
    productsPage = new ProductsPage(page);
    productDetailsPage = new ProductDetailsPage(page);
  });

  test.describe("Filtrado de productos", () => {
    test("Debería filtrar productos por categoría", async () => {
      // Act & Assert
      await productsPage.goto();
      await productsPage.filterByCategory("Telefonía móvil");

      await productsPage.filterByCategory("Ropa y accesorios");
    });

    test("Debería filtrar productos por país", async () => {
      // Act & Assert
      await productsPage.goto();
      await productsPage.filterByCountry("Bolivia");

      await productsPage.filterByCountry("España");
    });
  });

  test.describe("Paginación y Navegación", () => {
    test("Debería navegar a la página de detalles al hacer clic en un producto", async ({
      page,
    }) => {
      await productsPage.goto();
      const firstProduct = (await productsPage.getProductCards()).first();
      firstProduct.click();

      await productDetailsPage.verifyPageLoaded();
      await expect(page).toHaveURL(/.*\/producto\/\?id=\d+/);
    });

    test("Debería cargar más productos al hacer clic en 'Ver más'", async ({
      page,
    }) => {
      await productsPage.goto();

      // Se usa test.skip() para marcar el test como omitido si el botón no está visible.
      // Se le da un timeout para que el botón tenga tiempo de aparecer tras la carga inicial.
      await test.skip(
        !(await productsPage.loadMoreButton.isVisible({ timeout: 5000 })),
        "ADVERTENCIA: No hay suficientes productos para probar la paginación."
      );

      const initialCount = await productsPage.getProductCount();
      await productsPage.loadMoreProducts();

      // Tu método `loadMoreProducts` ya espera de forma robusta a que el loader desaparezca,
      // por lo que una aserción directa aquí es suficiente y fiable.
      const finalCount = await productsPage.getProductCount();
      expect(finalCount).toBeGreaterThan(initialCount);
    });
  });
});
