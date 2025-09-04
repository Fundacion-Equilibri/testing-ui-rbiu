// tests/crear-producto.spec.ts
import { test, expect } from "@playwright/test";
import path from "path";
import {
  CreateProductPage,
  type ProductData,
} from "../pages/create-product-page";
import { MyProductsPage } from "../pages/my-products-page";
import { EditProductPage } from "../pages/edit-product-page";

test.describe("Página de crear un producto /crea-un-producto (Auth)", () => {
  test.describe("Flujo exitoso", () => {
    let product: ProductData;

    test.beforeEach(() => {
      const productName = "Aeronave F-22 Raptor " + Date.now();
      product = {
        name: productName,
        price: "50000",
        quantity: "3",
        description: "Aviones de combate utilizados en misiones de prueba.",
        category: "Informática y tecnologías",
        imagePath: path.resolve(__dirname, "../../assets/F-22A_Raptor.jpg"),
        visible: "Sí",
        reservable: "No",
        deliveryDetails:
          "Las entregas se realizan desde las 08:00 hasta las 15:00 de lunes a viernes",
        expirationDate: { day: "1", month: "12", year: "2025" },
      };
    });

    test.afterEach(async ({ page }) => {
      const myProductsPage = new MyProductsPage(page);
      const editProductPage = new EditProductPage(page);

      await myProductsPage.goto();
      await myProductsPage.editProduct(product.name);
      await editProductPage.verifyPageLoaded();
      await editProductPage.deleteProduct();
    });

    test("Debería crear un producto nuevo exitosamente", async ({ page }) => {
      const createProductPage = new CreateProductPage(page);
      await createProductPage.goto();
      await createProductPage.handleCookies();

      await createProductPage.fillForm(product);
      await createProductPage.submit();

      await createProductPage.verifySuccess(product.name);
    });

    test("debería mostrar un error al intentar crear un producto con un nombre duplicado", async ({
      page,
    }) => {
      const createProductPage = new CreateProductPage(page);

      // --- 1. Crear el producto inicial ---
      await createProductPage.goto();
      await createProductPage.handleCookies();
      await createProductPage.fillForm(product);
      await createProductPage.submit();
      await createProductPage.verifySuccess(product.name);

      // --- 2. Intentar crear el mismo producto de nuevo ---
      await createProductPage.goto(); // Volvemos a la página de creación
      await createProductPage.fillForm(product);
      await createProductPage.submit();

      // --- 3. Verificar el mensaje de error ---
      await createProductPage.verifyErrorMessages(
        "Nombre del producto: Ya tienes un producto con el mismo nombre."
      );
    });
  });

  test.describe("Validaciones de formulario", () => {
    const baseProduct: ProductData = {
      name: "Producto de prueba",
      price: "100",
      quantity: "10",
      description: "Esta es una descripción de prueba.",
      category: "Informática y tecnologías",
      imagePath: path.resolve(__dirname, "../../assets/F-22A_Raptor.jpg"),
      visible: "Sí",
      reservable: "No",
      deliveryDetails: "Detalles de entrega.",
      expirationDate: { day: "1", month: "12", year: "2025" },
    };

    const validationTestCases = [
      {
        case: "cuando todos los campos están vacíos",
        productData: {
          ...baseProduct,
          name: "",
          price: "",
          quantity: "",
          description: "",
          imagePath: "",
          deliveryDetails: "",
          expirationDate: { day: "", month: "", year: "" },
        },
        expectedError: [
          "Nombre del producto: Este campo es obligatorio.",
          "Precio (en logos): El precio no puede ser inferior a 1 λ.",
          "Descripción: Este campo es obligatorio.",
          "Imagen: Este campo es obligatorio.",
        ],
      },
      {
        case: "cuando el nombre está vacío",
        productData: { ...baseProduct, name: "" },
        expectedError: "Nombre del producto: Este campo es obligatorio.",
      },
      {
        case: "cuando el precio es inferior a 1",
        productData: { ...baseProduct, price: "0" },
        expectedError:
          "Precio (en logos): El precio no puede ser inferior a 1 λ.",
      },
      {
        case: "cuando la descripción está vacía",
        productData: { ...baseProduct, description: "" },
        expectedError: "Descripción: Este campo es obligatorio.",
      },
      {
        case: "cuando no se sube una imagen",
        productData: { ...baseProduct, imagePath: "" }, // Asumimos que un path vacío significa no subir imagen
        expectedError: "Imagen: Este campo es obligatorio.",
      },
    ];

    for (const tc of validationTestCases) {
      test(`debería mostrar un error ${tc.case}`, async ({ page }) => {
        const createProductPage = new CreateProductPage(page);
        await createProductPage.goto();
        await createProductPage.handleCookies();
        // Usamos un 'if' para decidir si llamamos a setInputFiles
        await createProductPage.fillForm(
          tc.productData,
          !!tc.productData.imagePath
        );

        await createProductPage.submit();

        await createProductPage.verifyErrorMessages(tc.expectedError);
      });
    }
  });
});
