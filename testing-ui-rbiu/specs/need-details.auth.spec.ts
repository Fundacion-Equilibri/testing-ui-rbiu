import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import path from "path";

import { NeedDetailsPage } from "../pages/need-details-page";
import { NeedsPage } from "../pages/needs-page";
import { CreateNeedPage, NeedData } from "../pages/create-need-page";
import { EditNeedPage } from "../pages/edit-need-page";
import { MyNeedsPage } from "../pages/my-needs-page";
import { config } from "../config/configs";
import { LoginPage } from "../pages/login-page";

test.describe("Página de Detalles de la Necesidad - Usuario Autenticado  /necesidad/?id=", () => {
  let needDetailsPage: NeedDetailsPage;
  let myNeedsPage: MyNeedsPage;
  let needsPage: NeedsPage;
  let createNeedPage: CreateNeedPage;
  let editNeedPage: EditNeedPage;
  let needData: NeedData;

  test.beforeEach(async ({ page }) => {
    // Inicializar todos los Page Objects necesarios para los tests
    needsPage = new NeedsPage(page);
    needDetailsPage = new NeedDetailsPage(page);
    myNeedsPage = new MyNeedsPage(page);
    createNeedPage = new CreateNeedPage(page);
    editNeedPage = new EditNeedPage(page);

    needData = {
      name: `Necesidad ${Date.now()}`,
      needDetails: "Detalles de la necesidad de prueba.",
      reasonNeed: "Razón de la necesidad de prueba.",
      minPrice: "100",
      maxPrice: "200",
      category: "Servicios profesionales",
      visible: "Sí",
      imagePath: path.join(__dirname, "../../assets/F-22A_Raptor.jpg"),
    };
  });

  test("Debería mostrar detalles y permitir editar una necesidad propia", async () => {
    // Arrange: Crear una nueva necesidad.
    await createNeedPage.goto();
    await createNeedPage.handleCookies();
    await createNeedPage.fillForm(needData);
    await createNeedPage.submit();
    await createNeedPage.verifySuccess(needData.name);

    // Act: Navegar a la página de detalles de la necesidad.
    await needsPage.goto();
    await needsPage.verifyPageLoaded();
    await needsPage.searchNeed(needData.name);
    await needsPage.verifyNeedIsVisible(needData.name);
    await needsPage.clickNeed(needData.name);

    // Assert: Verificar detalles y la presencia del botón de editar.
    await needDetailsPage.verifyPageLoaded();
    await expect(needDetailsPage.editProductButton).toBeVisible();

    // Act: Probar la funcionalidad de edición.
    await needDetailsPage.clickButtonEditProduct();
    await editNeedPage.verifyPageLoaded();

    // Teardown: Limpiar la necesidad creada.
    try {
      // Como ya estamos en la página de edición, procedemos a eliminar.
      await editNeedPage.deleteNeed();
    } catch (error) {
      console.warn(
        `ADVERTENCIA: No se pudo limpiar la necesidad "${needData.name}" durante el teardown.`,
        error
      );
    }
  });

  // TESTEAR TABS VENDEDOR | CHAT
  test.describe("Testeando procesos como usuario no propietario", () => {
    let ownerContext: BrowserContext;
    let ownerPage: Page;
    let needProduct: NeedData;
    let myNeedsPage: MyNeedsPage;

    test.beforeEach(async ({ browser }) => {
      needProduct = {
        name: `Necesidad Tabs ${Date.now()}`,
        category: "Alimentación",
        imagePath: path.join(__dirname, "../../assets/SAMSUNG-S24.jpg"),
        visible: "Sí",
        minPrice: "150",
        maxPrice: "300",
        needDetails: "Detalles de la necesidad para testear tabs.",
        reasonNeed: "Razón de la necesidad para testear tabs.",
      };
      // 1. Creamos un contexto de navegador aislado para el Usuario A.
      ownerContext = await browser.newContext({ storageState: undefined });
      ownerPage = await ownerContext.newPage();

      // 2. Logueamos al Usuario A.
      const ownerLoginPage = new LoginPage(ownerPage);
      await ownerLoginPage.goto();
      await ownerLoginPage.login(config.SECOND_EMAIL, config.SECOND_PASSWORD);

      // 3. El Usuario A crea una nueva necesidad (producto).
      const ownerCreateNeedPage = new CreateNeedPage(ownerPage);
      await ownerCreateNeedPage.goto();
      await ownerCreateNeedPage.handleCookies();
      await ownerCreateNeedPage.fillForm(needProduct);
      await ownerCreateNeedPage.submit();
      await ownerCreateNeedPage.verifySuccess(needProduct.name);
    });

    test.afterEach(async () => {
      // Limpiar la necesidad creada por el Usuario A.
      if (ownerContext) {
        const ownerMyNeedsPage = new MyNeedsPage(ownerPage);
        const ownerEditNeedPage = new EditNeedPage(ownerPage);

        await ownerMyNeedsPage.goto();
        await ownerMyNeedsPage.verifyNeedIsListed(
          needProduct.name,
          needProduct.minPrice,
          needProduct.maxPrice
        );
        await ownerMyNeedsPage.editNeed(needProduct.name);
        await ownerEditNeedPage.verifyPageLoaded();
        await ownerEditNeedPage.deleteNeed();

        await ownerContext.close();
      }
    });

    test(`Testeando los tabs en /necesidades de Vendedor | Chat`, async ({ page }) => {
      // Navegar a la página de  ->  /necesidad    donde se listan todos los productos de todos los usuarios
      await needsPage.goto();
      await needsPage.searchNeed(needProduct.name);
      await needsPage.verifyNeedIsVisible(needProduct.name);
      await needsPage.clickNeed(needProduct.name); // Esto navega a need/?id=400  ejemplo

      // Assert: Verificar que los detalles mostrados en la página son los correctos.
      await needDetailsPage.verifyPageLoaded();
      // En la ruta dinamica de /need?id= y uno o más dígitos". busca el patron
      await expect(page).toHaveURL(/.*\/necesidad\/\?id=\d+/);
      await expect(needDetailsPage.productTitle).toHaveText(needProduct.name);
      // Usamos toContainText para el precio por si la UI le añade símbolos como '€' o '$'.
      await expect(needDetailsPage.productPrice).toContainText(
        needProduct.maxPrice
      );

      await needDetailsPage.switchToChatTab();
    });
  });
});
