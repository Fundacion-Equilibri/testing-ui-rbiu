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
      // Este test asume que existen suficientes productos para que el botón aparezca.
      await productsPage.goto();
      const initialCount = await productsPage.getProductCount();
      if (await productsPage.loadMoreButton.isVisible()) {
        await productsPage.loadMoreProducts();
        const finalCount = await productsPage.getProductCount();
        expect(finalCount).toBeGreaterThan(initialCount);
      } else {
        console.warn(
          "ADVERTENCIA: No hay suficientes productos para probar la paginación."
        );
        test.skip();
      }
    });
  });
});
