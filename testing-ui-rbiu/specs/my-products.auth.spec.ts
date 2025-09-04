import { test, expect } from "@playwright/test";
import path from "path";

import {
  CreateProductPage,
  type ProductData,
} from "../pages/create-product-page";
import { MyProductsPage } from "../pages/my-products-page";
import { EditProductPage } from "../pages/edit-product-page";

test.describe("Pagina de Mis Productos /mis-productos (Auth)", () => {
  let createProductPage: CreateProductPage;
  let myProductsPage: MyProductsPage;
  let editProductPage: EditProductPage;
  let productData: ProductData;

  // Datos del producto a crear. Usamos un nombre único para cada ejecución.

  test.beforeEach(async ({ page }) => {
    // Inicializamos las páginas aquí para que estén disponibles en todos los tests del describe.
    createProductPage = new CreateProductPage(page);
    myProductsPage = new MyProductsPage(page);
    editProductPage = new EditProductPage(page);

    // Generamos datos únicos para cada test para evitar colisiones.
    productData = {
      name: `Producto de Prueba ${Date.now()}`,
      price: "15.050",
      quantity: "10",
      description:
        "Descripción detallada del producto de prueba. esta descripcion es de test",
      imagePath: path.resolve(__dirname, "../../assets/product.jpg"),
      visible: "Sí",
      reservable: "No",
      deliveryDetails: "Entrega en mano en la zona centro.",
      expirationDate: { day: "15", month: "11", year: "2025" },
    };
  });

  test('Verifica que el boton "Crea un producto" exista y navegue a la página de creación', async ({
    page,
  }) => {
    // 1. Navegar a la página "Mis Productos"
    await myProductsPage.goto();
    // 2. Verificar que el botón es visible
    await myProductsPage.verifyButtonCreateProductIsVisible();
    // 3. Hacer clic en el botón
    await myProductsPage.clickButtonCreateProduct();
    // 4. Verificar que la URL es la correcta después del clic
    await expect(page).toHaveURL(/.*\/crea-un-producto\/?/);
  });

  test("Se puede eliminar un producto desde la página de edición", async () => {
    // Paso 1: Crear un producto para asegurarnos de que existe algo que eliminar.
    await createProductPage.goto();
    await createProductPage.fillForm(productData);
    await createProductPage.submit();
    await createProductPage.verifySuccess(productData.name);

    // Paso 2: Ir a la pagina de edicion y eliminar producto
    await myProductsPage.goto();
    await myProductsPage.verifyProductIsListed(productData.name, productData.price)
    await myProductsPage.editProduct(productData.name); // Verifica que existe el producto creado

    // Paso 3: Verificar que estamos en la página de edición y eliminar el producto.
    await editProductPage.verifyPageLoaded();
    await editProductPage.deleteProduct();

    // Paso 4: Verificar que el producto ya no se encuentra en la lista.
    // La acción de eliminar debería redirigirnos a la lista de "Mis productos",
    // donde hacemos la verificación final.
    await myProductsPage.verifyProductIsNotListed(productData.name);
  });
});
