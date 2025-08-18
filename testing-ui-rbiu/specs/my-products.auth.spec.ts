import { test, expect } from "@playwright/test";
import {
  CreateProductPage,
  type ProductData,
} from "../pages/create-product-page";
import { MyProductsPage } from "../pages/my-products-page";
import { config } from "../config/configs";
import path from "path";

test.describe("Gestión de Mis Productos", () => {
  let createProductPage: CreateProductPage;
  let myProductsPage: MyProductsPage;

  // Datos del producto a crear. Usamos un nombre único para cada ejecución.
  const productData: ProductData = {
    name: `Producto de Prueba ${Date.now()}`,
    price: "15.050",
    quantity: "10",
    description:
      "Descripción detallada del producto de prueba. esta descripcion es de test",
    // Asegúrate de que esta ruta apunte a una imagen de prueba real en tu proyecto.
    imagePath: path.resolve(__dirname, "../../assets/product.jpg"),
    visible: "Sí",
    reservable: "No",
    deliveryDetails: "Entrega en mano en la zona centro.",
    expirationDate: { day: "15", month: "11", year: "2025" },
  };

  test.beforeEach(async ({ page }) => {
    // Inicializamos las páginas aquí para que estén disponibles en todos los tests del describe.
    // El login se maneja a través de `storageState` en la configuración, por lo que no es
    // necesario navegar o hacer aserciones de login aquí. Cada test se encargará de su propia navegación.
    createProductPage = new CreateProductPage(page);
    myProductsPage = new MyProductsPage(page);
  });

  test('El producto creado aparece en la lista de "Mis productos"', async (page) => {
    // Usamos las instancias de Page Objects creadas en el `beforeEach`.
    await createProductPage.goto();
    await createProductPage.fillForm(productData);
    await createProductPage.submit();
    await createProductPage.verifySuccess(productData.name);

    await myProductsPage.goto();
    await myProductsPage.verifyProductIsListed(
      productData.name,
      productData.price
    );
  });
});
