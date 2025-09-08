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
const navLinksOwn = [
  { name: "Mis productos", path: "/mis-productos" },
  { name: "Mis necesidades", path: "/mis-necesidades/" },
  { name: "Mis Intercambios", path: "/mis-intercambios" },
  { name: "Crear entidad", optional: true, path: "/crear-comunidad" },
  // { name: "Cerrar sesión", path: "/wp-login.php?action=logout" },
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

// ============================================================================
//                  NAVEGACION SUPERIOR ESCRITORIO DEL SUBMENU
// ============================================================================
test.describe("Navegación - Escritorio (Auth) - Submenú de perfil", () => {
  let headerPage: HeaderPage;

  test.beforeEach(async ({ page }) => {
    headerPage = new HeaderPage(page);
    await headerPage.goto();
  });

  // Filtramos los enlaces para probar la navegación principal por separado del logout.
  // El logout cambia el estado de la sesión y es mejor probarlo de forma aislada.
  const mainSubMenuLinks = navLinksOwn.filter(
    (link) => link.name !== "Cerrar sesión"
  );

  for (const link of mainSubMenuLinks) {
    test(`El enlace del submenú "${link.name}" navega a la página correcta`, async ({
      page,
    }) => {
      await headerPage.openSubMenu();
      await expect(headerPage.profileSubMenu).toBeVisible();

      await headerPage.clickSubMenuLink(link.name);

      await expect(page).toHaveURL(
        new RegExp(`${config.URL_BASE}${link.path}`)
      );
    });
  }

  test('El enlace "Cerrar sesión" finaliza la sesión correctamente', async ({
    page,
  }) => {
    await headerPage.openSubMenu();
    await headerPage.clickSubMenuLink("Cerrar sesión");

    // Después de cerrar sesión, verificamos que somos redirigidos a la página de inicio
    await expect(page).toHaveURL(new RegExp(`${config.URL_BASE}/`));
    await expect(headerPage.getLoginButton()).toBeVisible();
  });
});
