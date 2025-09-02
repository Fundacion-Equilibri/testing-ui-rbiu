import { test, expect } from "@playwright/test";
import { ProductsPage } from "../pages/products-page";
import { CreateProductPage, ProductData } from "../pages/create-product-page";
import path from "path";
import { EditProductPage } from "../pages/edit-product-page";
import { MyProductsPage } from "../pages/my-products-page";

test.describe("Pagina de Mercado /mercado (Auth)", () => {
  let productsPage: ProductsPage;
  let createProductPage: CreateProductPage;
  let myProductsPage: MyProductsPage;
  let editProductPage: EditProductPage;
  let productData: ProductData;

  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    createProductPage = new CreateProductPage(page);
    editProductPage = new EditProductPage(page);
    myProductsPage = new MyProductsPage(page);

    // Datos del producto a crear. Se genera antes de cada test.
    productData = {
      name: `Producto de Prueba ggg ${Date.now()}`,
      price: "100000",
      quantity: "5",
      description: "Aviones de combate utilizados en misiones de prueba.",
      imagePath: path.resolve(__dirname, "../../assets/F-22A_Raptor.jpg"),
      visible: "Sí",
      reservable: "No",
      deliveryDetails:
        "Las entregas se realizan desde las 08:00 hasta las 15:00 de lunes a viernes",
      expirationDate: { day: "1", month: "12", year: "2025" },
    };

    // Setup: Crear un producto antes de cada test.
    await createProductPage.goto();
    await createProductPage.fillForm(productData);
    await createProductPage.submit();
    await createProductPage.verifySuccess(productData.name);

    // Navegar a la página de productos para empezar el test
    await productsPage.goto();
  });

  // Teardown: Se ejecuta después de cada test para limpiar el producto creado.
  test.afterEach(async () => {
    try {
      await myProductsPage.goto();
      await myProductsPage.editProduct(productData.name);
      await editProductPage.verifyPageLoaded();
      await editProductPage.deleteProduct();
    } catch (error) {
      console.warn(
        `ADVERTENCIA: No se pudo limpiar el producto "${productData.name}" en el afterEach. Puede que ya haya sido eliminado o que el test haya fallado antes.`
      );
    }
  });

  test("Buscar un producto existente", async () => {
    await productsPage.searchProduct(productData.name);
    await productsPage.verifyProductIsVisible(productData.name);
  });

  test("Buscar un producto inexistente", async () => {
    const productName = "ProductoInexistente12345";
    await productsPage.searchProduct(productName);
    await productsPage.verifyProductIsNotVisible(productName);
  });

  test("Buscar con campo de búsqueda vacío", async () => {
    await productsPage.searchProduct("");
    // Si se espera que la lista de productos esté visible (todos los productos):
    await expect(productsPage.productList).toBeVisible();
  });
});
