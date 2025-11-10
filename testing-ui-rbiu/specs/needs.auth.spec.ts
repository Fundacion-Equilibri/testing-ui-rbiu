import test, { expect } from "@playwright/test";
import path from "path";

import { NeedDetailsPage } from "../pages/need-details-page";
import { NeedsPage } from "../pages/needs-page";
import { CreateNeedPage, NeedData } from "../pages/create-need-page";
import { EditNeedPage } from "../pages/edit-need-page";
import { MyNeedsPage } from "../pages/my-needs-page";

test.describe("Pagina de Necesidades    /necesidades  (Auth)", () => {
  let needsPage: NeedsPage;
  let createNeedPage: CreateNeedPage;
  let needDetailsPage: NeedDetailsPage;
  let editNeedPage: EditNeedPage;
  let myNeedsPage: MyNeedsPage;
  let needData: NeedData;

  test.beforeEach(async ({ page }) => {
    needsPage = new NeedsPage(page);
    needDetailsPage = new NeedDetailsPage(page);
    createNeedPage = new CreateNeedPage(page);
    editNeedPage = new EditNeedPage(page);
    myNeedsPage = new MyNeedsPage(page);
    const name = `Aeronave F-22A_Raptor ${Date.now()}`;
    needData = {
      name: name,
      needDetails: "Detalles de la nueva necesidad",
      reasonNeed: "Razón de la nueva necesidad",
      maxPrice: "500",
      minPrice: "100",
      category: "Telefonía móvil",
      visible: "Sí",
      imagePath: path.resolve(__dirname, "../../assets/F-22A_Raptor.jpg"),
    };
  });

  test.afterEach(async () => {
    // Limpieza: Este hook se ejecuta después de cada test para eliminar la necesidad creada.
    // Esto asegura que los tests no interfieran entre sí y que el entorno quede limpio.
    // Usamos un bloque try/catch para evitar que un fallo en la limpieza detenga toda la suite.
    try {
      await myNeedsPage.goto();
      if (await myNeedsPage.isNeedListed(needData.name)) {
        await myNeedsPage.editNeed(needData.name); // 1. Va a la página de detalles
        // await needDetailsPage.clickEditNeedButton(); // 2. Va a la página de edición
        await editNeedPage.deleteNeed(); // 3. Elimina la necesidad
      }
    } catch (error) {
      console.warn(`ADVERTENCIA: No se pudo limpiar la necesidad "${needData.name}" en el afterEach.`, error);
    }
  });

  test.describe("Verificar elementos en la página", () => {
    test("Verifica que la página de necesidades se cargue correctamente", async () => {
      await needsPage.goto();
      await needsPage.verifyPageLoaded();
    });

    test("Debería mostrar el botón de 'Comparte tus necesidades'", async () => {
      await needsPage.goto();
      await needsPage.verifyShareNeedButtonVisible();
    });
  });

  test.describe("Crear una necesidad y verificar su presencia", () => {
    test("Debería permitir crear una nueva necesidad y verificar su presencia en la lista", async ({
      page,
    }) => {
      await createNeedPage.goto();
      await createNeedPage.handleCookies();
      await createNeedPage.fillForm(needData);
      await createNeedPage.submit();
      await createNeedPage.verifySuccess(needData.name);

      // Verificar que la nueva necesidad aparezca en la lista
      await needsPage.goto();
      await needsPage.searchNeed(needData.name);
      await needsPage.verifyNeedIsVisible(needData.name);
      await needsPage.clickNeed(needData.name);
      await needDetailsPage.verifyPageLoaded();
    });
  });

  test.describe("Filtrado de necesidades", () => {
    test("Debería filtrar necesidades por categoría", async () => {
      await needsPage.goto();
      await needsPage.filterByCategory("Telefonía móvil");
      await needsPage.filterByCategory("Ropa y accesorios");
    });

    test("Debería filtrar necesidades por país", async () => {
      await needsPage.goto();
      await needsPage.filterByCountry("Bolivia");
      await needsPage.filterByCountry("España");
    });
  });

  test.describe("Paginación y Navegación", () => {
    test("Debería navegar a la página de detalles al hacer clic en un producto", async ({
      page,
    }) => {
      await createNeedPage.goto();
      await createNeedPage.handleCookies();
      await createNeedPage.fillForm(needData);
      await createNeedPage.submit();
      await createNeedPage.verifySuccess(needData.name);

      await needsPage.goto();
      await needsPage.searchNeed(needData.name);
      await needsPage.verifyNeedIsVisible(needData.name);
      await needsPage.clickNeed(needData.name);

      await needDetailsPage.verifyPageLoaded();
      await expect(page).toHaveURL(/.*\/necesidad\/\?id=\d+/);
    });

    test("Debería cargar más necesidades al hacer clic en 'Ver más' Auth", async ({
      page,
    }) => {
      await needsPage.goto();

      // Se usa test.skip() para marcar el test como omitido si el botón no está visible.
      // Se le da un timeout para que el botón tenga tiempo de aparecer tras la carga inicial.
      await test.skip(
        !(await needsPage.loadMoreButton.isVisible({ timeout: 5000 })),
        "ADVERTENCIA: No hay suficientes productos para probar la paginación."
      );

      const initialCount = await needsPage.getProductCount();
      await needsPage.loadMoreProducts();
      // Tu método `loadMoreProducts` ya espera de forma robusta a que el loader desaparezca,
      // por lo que una aserción directa aquí es suficiente y fiable.
      const finalCount = await needsPage.getProductCount();
      expect(finalCount).toBeGreaterThan(initialCount);
    });
  });
});
