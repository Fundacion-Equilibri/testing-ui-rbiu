import { test, expect } from "@playwright/test";
import { HeaderPage } from "../pages/header-page";
import { config } from "../config/configs";

// Datos de los enlaces a probar para no repetir código.
const navLinks = [
  { name: "Mercado", path: "/mercado/" },
  { name: "Necesidades", path: "/necesidades/" },
  { name: "Proyecto RBIU", mobileName: "RBIU", path: "https://project.rbiu.org/en/" },
  { name: "Métricas", path: "/ver-resultados/" },
  { name: "Contacto", path: "/contacta-con-nosotros/" },
  // Este enlace abre una nueva pestaña, el test lo manejará correctamente.
];

// ============================================================================
//                  NAVEGACION SUPERIOR ESCRITORIO
// ============================================================================
test.describe("Navegación - Escritorio (Visitante)", () => {
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
        await expect(page).toHaveURL(new RegExp(`${config.URL_BASE}${link.path}`));
      }
    });
  }

  test('El botón "Regístrate o Inicia sesión" navega a la página de login', async ({
    page,
  }) => {
    await headerPage.getLoginButton().click();
    await expect(page).toHaveURL(new RegExp(`${config.URL_BASE}/login/`));
  });
});

// ============================================================================
//                  NAVEGACION INFERIOR MOVIL
// ============================================================================
test.describe("Navegación - Móvil (Visitante)", () => {
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
      const linkName = link.mobileName ?? link.name;
      const navLink = headerPage.getNavLinkMovil(linkName);

      if ((await navLink.getAttribute("target")) === "_blank") {
        const pagePromise = context.waitForEvent("page");
        await navLink.click();
        const newPage = await pagePromise;
        await expect(newPage).toHaveURL(link.path);
      } else {
        await navLink.click();
        await expect(page).toHaveURL(new RegExp(`${config.URL_BASE}${link.path}`));
      }
    });
  }

  test('El botón "Inicia sesión" navega a la página de login', async ({
    page,
  }) => {
    await headerPage.getLoginButtonMovil().click();
    await expect(page).toHaveURL(new RegExp(`${config.URL_BASE}/login/`));
  });
});