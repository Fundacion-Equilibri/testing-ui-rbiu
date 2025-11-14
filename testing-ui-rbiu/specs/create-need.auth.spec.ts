// tests/crear-producto.spec.ts
import { test, expect } from "@playwright/test";
import path from "path";
import { CreateNeedPage, type NeedData } from "../pages/create-need-page";
import { MyNeedsPage } from "../pages/my-needs-page";
import { EditNeedPage } from "../pages/edit-need-page";

test.describe("Página de crear una necesidad /crea-una-necesidad (Auth)", () => {
  test.describe("Flujo exitoso", () => {
    let need: NeedData;
    let myNeedsPage: MyNeedsPage;
    let editNeedPage: EditNeedPage;

    test.beforeEach(({ page }) => {
      myNeedsPage = new MyNeedsPage(page);
      editNeedPage = new EditNeedPage(page);

      const needName = "Aeronave F-22 Raptor " + Date.now();
      need = {
        name: needName,
        minPrice: "5000",
        maxPrice: "10000",
        needDetails: "Aviones de combate utilizados en misiones de prueba.",
        reasonNeed: "Necesito un avión para mis viajes de negocios.",
        category: "Informática y tecnologías",
        imagePath: path.resolve(__dirname, "../../assets/F-22A_Raptor.jpg"),
        visible: "Sí",
      };
    });

    test.afterEach(async ({ page }) => {
      // Limpieza: se elimina la necesidad creada para mantener el entorno limpio.
      await myNeedsPage.goto();
      await myNeedsPage.editNeed(need.name);
      await editNeedPage.verifyPageLoaded();
      await editNeedPage.deleteNeed();
    });

    test("Debería crear una necesidad nueva exitosamente", async ({ page }) => {
      const createNeedPage = new CreateNeedPage(page);
      await createNeedPage.goto();
      await createNeedPage.handleCookies();
      await createNeedPage.fillForm(need);
      await createNeedPage.submit();

      await createNeedPage.verifySuccess(need.name);
    });

    test("Debería mostrar un error al intentar crear una necesidad con un nombre duplicado", async ({
      page,
    }) => {
      const createNeedPage = new CreateNeedPage(page);

      // --- 1. Crear la necesidad inicial ---
      await createNeedPage.goto();
      await createNeedPage.handleCookies();
      await createNeedPage.fillForm(need);
      await createNeedPage.submit();
      await createNeedPage.verifySuccess(need.name);
      
      // --- 2. Intentar crear la misma necesidad de nuevo ---
      await createNeedPage.goto(); // Volvemos a la página de creación
      await createNeedPage.fillForm(need);
      await createNeedPage.submit();
      // Verificar el mensaje de error de nombre duplicado

      // --- 3. Verificar el mensaje de error ---
      await createNeedPage.verifyErrorMessages(
        "¿Qué necesitas?: Ya tienes una necesidad con el mismo nombre."
      );
    });
  });

  test.describe("Validaciones de formulario", () => {
    const baseNeed: NeedData = {
      name: "Producto de prueba",
      minPrice: "100",
      maxPrice: "200",
      needDetails: "Esta es una descripción de prueba.",
      reasonNeed: "Razón de la necesidad.",
      category: "Informática y tecnologías",
      imagePath: path.resolve(__dirname, "../../assets/F-22A_Raptor.jpg"),
      visible: "Sí",
    };

    const validationTestCases = [
      {
        case: "cuando todos los campos están vacíos",
        needData: {
          ...baseNeed,
          name: "",
          minPrice: "",
          maxPrice: "",
          needDetails: "",
          reasonNeed: "",
          imagePath: "",
        },
        expectedError: [
          "¿Qué necesitas?: Este campo es obligatorio.",
          "Detalla un poco más lo que necesitas: Este campo es obligatorio.",
          "Explícanos que uso le vas a dar y el motivo de la necesidad: Este campo es obligatorio.",
          "Precio mínimo (en logos): El precio mínimo no puede ser inferior a 1 λ.",
          "Precio máximo (en logos): El precio máximo no puede ser inferior a 1 λ.",
          "Imagen: Este campo es obligatorio.",
        ],
      },
      {
        case: "cuando el nombre de la necesidad está vacío",
        needData: { ...baseNeed, name: "" },
        expectedError: "¿Qué necesitas?: Este campo es obligatorio.",
      },
      {
        case: "cuando el detalle de la necesidad está vacía",
        needData: { ...baseNeed, needDetails: "" },
        expectedError: "Detalla un poco más lo que necesitas: Este campo es obligatorio.",
      },
      {
        case: "cuando la razon o el motivo de la necesidad está vacía",
        needData: { ...baseNeed, reasonNeed: "" },
        expectedError: "Explícanos que uso le vas a dar y el motivo de la necesidad: Este campo es obligatorio.",
      },
      {
        case: "cuando el precio es inferior a 1",
        needData: { ...baseNeed, minPrice: "0" },
        expectedError:
          "Precio mínimo (en logos): El precio mínimo no puede ser inferior a 1 λ.",
      },
      {
        case: "cuando no se sube una imagen",
        needData: { ...baseNeed, imagePath: "" }, // Asumimos que un path vacío significa no subir imagen
        expectedError: "Imagen: Este campo es obligatorio.",
      },
    ];

    for (const tc of validationTestCases) {
      test(`debería mostrar error ${tc.case}`, async ({ page }) => {
        const createNeedPage = new CreateNeedPage(page);
        await createNeedPage.goto();
        await createNeedPage.handleCookies();
        // Usamos un 'if' para decidir si llamamos a setInputFiles
        await createNeedPage.fillForm(
          tc.needData,
          !!tc.needData.imagePath
        );

        await createNeedPage.submit();

        await createNeedPage.verifyErrorMessages(tc.expectedError);
      });
    }
  });
});
