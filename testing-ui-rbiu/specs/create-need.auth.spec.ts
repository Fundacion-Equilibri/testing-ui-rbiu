// tests/crear-producto.spec.ts
import { test, expect } from "@playwright/test";
import path from "path";
import { CreateNeedPage, NeedData } from "../pages/create-need-page";
import { MyNeedsPage } from "../pages/my-needs-page";
import { EditNeedPage } from "../pages/edit-need-page";

test.describe("Página de crear un producto /crea-un-producto (Auth)", () => {
  test.describe("Flujo exitoso", () => {
    let product: NeedData;
    let myNeedsPage: MyNeedsPage;
    let editNeedPage: EditNeedPage;

    test.beforeEach(() => {
      const productName = "Aeronave F-22 Raptor " + Date.now();
      product = {
        name: productName,
        minPrice: "5000",
        maxPrice: "10000",
        needDetails: "Aviones de combate utilizados en misiones de prueba.",
        reasonNeed: "Necesito un avión para mis viajes de negocios.",
        category: "Informática y tecnologías",
        imagePath: path.resolve(__dirname, "../../assets/F-22A_Raptor.jpg"),
        visible: "Sí",
      };
    });

    test.beforeEach(() => {});

    test.afterEach(async ({ page }) => {
      const myNeedsPage = new MyNeedsPage(page);
      const editNeedPage = new EditNeedPage(page);

      await myNeedsPage.goto();
      await myNeedsPage.editNeed(product.name);
      await editNeedPage.verifyPageLoaded();
      await editNeedPage.deleteNeed();
    });

    // test("Debería crear una necesidad nueva exitosamente", async ({ page }) => {
    //   const createNeedPage = new CreateNeedPage(page);
    //   await createNeedPage.goto();
    //   await createNeedPage.handleCookies();

    //   await createNeedPage.fillForm(product);
    //   await createNeedPage.submit();

    //   await createNeedPage.verifySuccess(product.name);
    // });

    test("Debería mostrar un error al intentar crear una necesidad con un nombre duplicado", async ({
      page,
    }) => {
      const createNeedPage = new CreateNeedPage(page);

      // --- 1. Crear la necesidad inicial ---
      await createNeedPage.goto();
      await createNeedPage.handleCookies();
      await createNeedPage.fillForm(product);
      await createNeedPage.submit();
      await createNeedPage.verifySuccess(product.name);
      
      // --- 2. Intentar crear el mismo producto de nuevo ---
      await createNeedPage.goto(); // Volvemos a la página de creación
      await createNeedPage.fillForm(product);
      await createNeedPage.submit();
      // Verificar el mensaje de error de nombre duplicado

      // --- 3. Verificar el mensaje de error ---
      await createNeedPage.verifyErrorMessages(
        "¿Qué necesitas?: Ya tienes una necesidad con el mismo nombre."
      );
    });
  });

  // test.describe("Validaciones de formulario", () => {
  //   const baseProduct: ProductData = {
  //     name: "Producto de prueba",
  //     price: "100",
  //     quantity: "10",
  //     description: "Esta es una descripción de prueba.",
  //     category: "Informática y tecnologías",
  //     imagePath: path.resolve(__dirname, "../../assets/F-22A_Raptor.jpg"),
  //     visible: "Sí",
  //     reservable: "No",
  //     deliveryDetails: "Detalles de entrega.",
  //     expirationDate: { day: "1", month: "12", year: "2025" },
  //   };

  //   const validationTestCases = [
  //     {
  //       case: "cuando todos los campos están vacíos",
  //       productData: {
  //         ...baseProduct,
  //         name: "",
  //         price: "",
  //         quantity: "",
  //         description: "",
  //         imagePath: "",
  //         deliveryDetails: "",
  //         expirationDate: { day: "", month: "", year: "" },
  //       },
  //       expectedError: [
  //         "Nombre del producto: Este campo es obligatorio.",
  //         "Precio (en logos): El precio no puede ser inferior a 1 λ.",
  //         "Descripción: Este campo es obligatorio.",
  //         "Imagen: Este campo es obligatorio.",
  //       ],
  //     },
  //     {
  //       case: "cuando el nombre está vacío",
  //       productData: { ...baseProduct, name: "" },
  //       expectedError: "Nombre del producto: Este campo es obligatorio.",
  //     },
  //     {
  //       case: "cuando el precio es inferior a 1",
  //       productData: { ...baseProduct, price: "0" },
  //       expectedError:
  //         "Precio (en logos): El precio no puede ser inferior a 1 λ.",
  //     },
  //     {
  //       case: "cuando la descripción está vacía",
  //       productData: { ...baseProduct, description: "" },
  //       expectedError: "Descripción: Este campo es obligatorio.",
  //     },
  //     {
  //       case: "cuando no se sube una imagen",
  //       productData: { ...baseProduct, imagePath: "" }, // Asumimos que un path vacío significa no subir imagen
  //       expectedError: "Imagen: Este campo es obligatorio.",
  //     },
  //   ];

  //   for (const tc of validationTestCases) {
  //     test(`debería mostrar un error ${tc.case}`, async ({ page }) => {
  //       const createProductPage = new CreateProductPage(page);
  //       await createProductPage.goto();
  //       await createProductPage.handleCookies();
  //       // Usamos un 'if' para decidir si llamamos a setInputFiles
  //       await createProductPage.fillForm(
  //         tc.productData,
  //         !!tc.productData.imagePath
  //       );

  //       await createProductPage.submit();

  //       await createProductPage.verifyErrorMessages(tc.expectedError);
  //     });
  //   }
  // });
});
