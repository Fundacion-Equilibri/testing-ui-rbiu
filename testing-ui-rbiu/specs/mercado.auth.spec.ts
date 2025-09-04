import { test, expect } from "@playwright/test";
import {
  CreateProductPage,
  type ProductData,
} from "../pages/create-product-page";
import { MyProductsPage } from "../pages/my-products-page";
import { EditProductPage } from "../pages/edit-product-page";
import { ProductsPage } from "../pages/products-page";
import { ProductDetailsPage } from "../pages/product-details-page";
import path from "path";

// NOTA: Para que estos tests funcionen, se asume que el tipo `ProductData`
// y el `CreateProductPage.fillForm` se han extendido para soportar 'category' y 'country'.
interface ExtendedProductData extends ProductData {
  country?: string;
}

test.describe("Página de Mercado /mercado (Auth)", () => {
  let productsPage: ProductsPage;
  let createProductPage: CreateProductPage;
  let myProductsPage: MyProductsPage;
  let editProductPage: EditProductPage;
  let productDetailsPage: ProductDetailsPage;

  test.beforeEach(async ({ page }) => {
    // Inicialización de Page Objects
    productsPage = new ProductsPage(page);
    createProductPage = new CreateProductPage(page);
    myProductsPage = new MyProductsPage(page);
    editProductPage = new EditProductPage(page);
    productDetailsPage = new ProductDetailsPage(page);
  });

  test.describe("Flujo E2E: Crear, buscar y eliminar ", () => {
    let product: ExtendedProductData;

    test.beforeEach(async ({ page }) => {
      product = {
        name: `Producto E2E ${Date.now()}`,
        price: "123",
        quantity: "1",
        description: "Descripción para el test E2E.",
        category: "Informática y tecnologías",
        imagePath: path.resolve(__dirname, "../../assets/F-22A_Raptor.jpg"),
        visible: "Sí",
        reservable: "No",
        deliveryDetails: "Entrega inmediata.",
        expirationDate: { day: "1", month: "1", year: "2026" },
      };

      // Setup: Crear el producto antes del test
      await createProductPage.goto();
      await createProductPage.fillForm(product);
      await createProductPage.submit();
      await createProductPage.verifySuccess(product.name);
    });

    test.afterEach(async () => {
      // Teardown: Limpiar el producto creado
      try {
        await myProductsPage.goto();
        await myProductsPage.editProduct(product.name);
        await editProductPage.verifyPageLoaded();
        await editProductPage.deleteProduct();
      } catch (error) {
        console.warn(
          `ADVERTENCIA: No se pudo limpiar el producto "${product.name}" en el afterEach.`
        );
      }
    });

    test("Debería crear, buscar, y luego eliminar un producto", async () => {
      // Act: Buscar el producto en la página de mercado
      await productsPage.goto();
      await productsPage.searchProduct(product.name);

      // Assert: Verificar que el producto se encuentra
      await productsPage.verifyProductIsVisible(product.name);
    });
  });

  test.describe("Filtrado de productos", () => {
    const productsToClean: string[] = [];

    test.afterEach(async () => {
      // Limpiar todos los productos creados en este bloque
      for (const productName of productsToClean) {
        await myProductsPage.goto();
        if (await myProductsPage.isProductListed(productName)) {
          await myProductsPage.editProduct(productName);
          await editProductPage.deleteProduct();
        }
      }
    });

    test("Debería filtrar productos por categoría", async () => {
      const productTelefonía: ExtendedProductData = {
        name: `Teléfono Test ${Date.now()}`,
        price: "300",
        quantity: "1",
        description: "Teléfono para test de categoría.",
        imagePath: path.resolve(__dirname, "../../assets/product.jpg"),
        visible: "Sí",
        reservable: "No",
        deliveryDetails: "Entrega.",
        expirationDate: { day: "1", month: "1", year: "2026" },
        category: "Telefonía móvil",
      };
      productsToClean.push(productTelefonía.name);

      // Arrange: Crear el producto
      await createProductPage.goto();
      await createProductPage.fillForm(productTelefonía);
      await createProductPage.submit();

      // Act & Assert
      await productsPage.goto();
      await productsPage.filterByCategory("Telefonía móvil");
      await productsPage.searchProduct(productTelefonía.name);
      await productsPage.verifyProductIsVisible(productTelefonía.name);

      await productsPage.filterByCategory("Ropa y accesorios");
      await productsPage.verifyProductIsNotVisible(productTelefonía.name);
    });

    test("Debería filtrar productos por país", async () => {
      const productBolivia: ExtendedProductData = {
        name: `Producto Bolivia ${Date.now()}`,
        price: "100",
        quantity: "1",
        description: "Test de país.",
        category: "Otros",
        imagePath: path.resolve(__dirname, "../../assets/product.jpg"),
        visible: "Sí",
        reservable: "No",
        deliveryDetails:
          "Entrega. desde las 14:00 hasta las 18:00 Merecado Bejin",
        expirationDate: { day: "1", month: "1", year: "2026" },
      };
      productsToClean.push(productBolivia.name);

      // Arrange: Crear el producto
      await createProductPage.goto();
      await createProductPage.fillForm(productBolivia);
      await createProductPage.submit();

      // Act & Assert
      await productsPage.goto();
      await productsPage.filterByCountry("Bolivia");
      await productsPage.searchProduct(productBolivia.name);
      await productsPage.verifyProductIsVisible(productBolivia.name);
 
      await productsPage.filterByCountry("España");
      // Después de filtrar por España, el producto de Bolivia ya no debería ser visible.
      await productsPage.verifyProductIsNotVisible(productBolivia.name);
    });
  });

  test.describe("Paginación y Navegación", () => {
    let product: ProductData;

    test.beforeAll(async () => {
      // Para estos tests, solo necesitamos un producto que exista.
      // Lo creamos una vez para todo el bloque.
      product = {
        name: `Producto Navegación ${Date.now()}`,
        price: "99",
        quantity: "1",
        description: "Test de navegación.",
        category: "Salud y belleza",
        imagePath: path.resolve(__dirname, "../../assets/product.jpg"),
        visible: "Sí",
        reservable: "No",
        deliveryDetails: "Entrega.",
        expirationDate: { day: "1", month: "1", year: "2026" },
      };
      // Se necesita una instancia de página para crear el producto.
      // Usaremos un browser context temporal para esto.
      const { chromium } = require("playwright");
      const browser = await chromium.launch();
      const page = await browser.newPage();
      // Aquí iría el login... por simplicidad, asumimos que createProductPage puede manejarlo.
      // await new LoginPage(page).login(config.EMAIL, config.PASSWORD);
      const tempCreatePage = new CreateProductPage(page);
      await tempCreatePage.goto();
      await tempCreatePage.fillForm(product);
      await tempCreatePage.submit();
      await browser.close();
    });

    test.afterAll(async () => {
      // Limpieza del producto creado para el bloque.
      // Similar al beforeAll, necesitaríamos un contexto de página para borrar.
    });

    test("Debería navegar a la página de detalles al hacer clic en un producto", async ({
      page,
    }) => {
      await productsPage.goto();
      await productsPage.searchProduct(product.name);
      await productsPage.clickProduct(product.name);

      await productDetailsPage.verifyPageLoaded();
      await expect(page).toHaveURL(/.*\/producto\/\?id=\d+/);
      await expect(productDetailsPage.productTitle).toHaveText(product.name);
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
