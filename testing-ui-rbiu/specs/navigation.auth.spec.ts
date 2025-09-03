import { test, expect } from "@playwright/test";
import { HeaderPage } from "../pages/header-page";
import { config } from "../config/configs";

// Datos de los enlaces a probar para no repetir código.
const navLinks = [
  { name: "Mercado", path: "/mercado/" },
  { name: "Necesidades", path: "/necesidades/" },
  { name: "Invitaciones", path: "/invita-amigo/" },
  // Este enlace abre una nueva pestaña, el test lo manejará correctamente.
];

// ============================================================================
//                  NAVEGACION SUPERIOR ESCRITORIO
// ============================================================================
test.describe("Navegación - Escritorio (Visitante) Auth", () => {
  let headerPage: HeaderPage;

  test.beforeEach(async ({ page }) => {
    headerPage = new HeaderPage(page);
    await headerPage.goto();
  });

  // Test data-driven para los enlaces de navegación
  for (const link of navLinks) {
    test(`El enlace "${link.name}" navega a la página correcta`, async ({
      page,
      context,
    }) => {
      const navLink = headerPage.getNavLinkDesk(link.name);

      // Si el enlace abre una nueva pestaña (target="_blank")
      if ((await navLink.getAttribute("target")) === "_blank") {
        const pagePromise = context.waitForEvent("page");
        await navLink.click();
        const newPage = await pagePromise;
        await expect(newPage).toHaveURL(link.path);
      } else {
        // Si navega en la misma pestaña
        await navLink.click();
        await expect(page).toHaveURL(
          new RegExp(`${config.URL_BASE}${link.path}`)
        );
      }
    });
  }
});

// ============================================================================
//        NAVEGACION SUPERIOR ICONOS DE MENSAJES; NOTIFICACIONES Y PERFIL
// ============================================================================
test.describe("Navegación - Escritorio (Visitante) Auth - Iconos", () => {
  let headerPage: HeaderPage;

  test.beforeEach(async ({ page }) => {
    headerPage = new HeaderPage(page);
    await headerPage.goto();
  });

  test("Ver los iconos de mensaje, notificaciones y perfil", async () => {
    const containers = headerPage.getContainersFromNabBar();

    for (const container of containers) {
      await expect(container).toBeVisible();
    }
  });
});

// ============================================================================
//        NAVEGACION SUPERIOR ICONOS DE MENSAJES; NOTIFICACIONES Y PERFIL
// ============================================================================
test.describe("Navegación - Movil (Visitante) Auth - Iconos", () => {
  // Usamos un viewport de móvil para este grupo de tests
  test.use({ viewport: { width: 390, height: 844 } });
  let headerPage: HeaderPage;

  test.beforeEach(async ({ page }) => {
    headerPage = new HeaderPage(page);
    await headerPage.goto();
  });

  test("Ver los iconos de mensaje, notificaciones y perfil", async () => {
    const containers = headerPage.getContainersFromNabBar();

    for (const container of containers) {
      await expect(container).toBeVisible();
    }
  });
});

// ============================================================================
//                  NAVEGACION INFERIOR MOVIL
// ============================================================================
test.describe("Navegación - Móvil (Visitante) Auth", () => {
  // Usamos un viewport de móvil para este grupo de tests
  test.use({ viewport: { width: 390, height: 844 } });
  let headerPage: HeaderPage;

  test.beforeEach(async ({ page }) => {
    headerPage = new HeaderPage(page);
    await headerPage.goto();
  });

  // Reutilizamos los mismos datos de enlaces
  for (const link of navLinks) {
    test(`El enlace móvil "${link.name}" navega a la página correcta`, async ({
      page,
      context,
    }) => {
      const navLink = headerPage.getNavLinkMovil(link.name);

      if ((await navLink.getAttribute("target")) === "_blank") {
        const pagePromise = context.waitForEvent("page");
        await navLink.click();
        const newPage = await pagePromise;
        await expect(newPage).toHaveURL(link.path);
      } else {
        await navLink.click();
        await expect(page).toHaveURL(
          new RegExp(`${config.URL_BASE}${link.path}`)
        );
      }
    });
  }
});
