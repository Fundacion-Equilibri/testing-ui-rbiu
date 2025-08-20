// tests/crear-producto.spec.ts
import { test, expect } from "@playwright/test";
import path from "path";
import {
  CreateProductPage,
  type ProductData,
} from "../pages/create-product-page";

test("Crear un producto", async ({ page }) => {
  const createProductPage = new CreateProductPage(page);
  await createProductPage.goto();
  await createProductPage.handleCookies();

  // Definimos los datos del producto en un objeto para mayor claridad.
  const productName = "Aeronave F-22 Raptor " + Date.now();
  const productData: ProductData = {
    name: productName,
    price: "50000",
    quantity: "3",
    description: "Aviones de combate utilizados en misiones de prueba.",
    imagePath: path.resolve(__dirname, "../../assets/F-22A_Raptor.jpg"),
    visible: "Sí",
    reservable: "No",
    deliveryDetails:
      "Las entregas de realizan desde las 08:00 hasta las 15:00 de lunes a viernes",
    expirationDate: { day: "1", month: "12", year: "2025" },
  };

  // Usamos los métodos del Page Object para interactuar con la página.
  // El test es ahora mucho más legible.
  await createProductPage.fillForm(productData);
  await createProductPage.submit();

  // La verificación también se delega al Page Object.
  await createProductPage.verifySuccess(productName);
});
