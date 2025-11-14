import { test, expect } from "@playwright/test";
import { config } from "../config/configs";

// Definimos los casos de prueba fuera del test para mayor claridad.
const failedLoginCases = [
  {
    case: "correo inexistente",
    email: "emailInexistente@test.com",
    password: "contraseña123",
    expectedMessage: "El correo electrónico no existe.",
  },
  {
    case: "cuenta no verificada",
    email: "bifave2594@baxidy.com", // Correo registrado pero sin validar
    password: "contraseña123",
    expectedMessage: "Tu cuenta aún no está verificada. Revisa tu correo",
  },
  {
    case: "contraseña incorrecta",
    email: config.EMAIL!, // Usamos un correo válido de la configuración
    password: "contraseñaIncorrecta123",
    expectedMessage: "Credenciales inválidas. Inténtalo de nuevo.",
  },
];

test.describe("Modal de login   /mercado", () => {
  // Iteramos sobre cada caso de prueba para crear un test individual.
  for (const credentials of failedLoginCases) {
    test(`Login fallido con ${credentials.case}`, async ({ page }) => {
      await page.goto(`${config.URL_BASE}`);

      // Esperar y llenar el email
      const emailInput = page.getByPlaceholder("Correo electrónico o usuario");
      await expect(emailInput).toBeVisible();
      await emailInput.fill(credentials.email);

      // Esperar y llenar la contraseña (acotando al modal)
      const loginForm = page.locator("#mb-login_form_container");
      const passwordInput = loginForm.getByPlaceholder("Contraseña");
      await expect(passwordInput).toBeVisible();
      await passwordInput.fill(credentials.password);

      // Enviar formulario
      await page.getByRole("button", { name: /iniciar sesión/i }).click();

      // Verificar que el mensaje de error esperado es visible
      const errorMessage = loginForm.locator("p", {
        hasText: credentials.expectedMessage,
      });
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });
  }

  test("Click en el enlace Olvidó su contraseña y navegar a la página de restaurar contraseña", async ({
    page,
  }) => {
    await page.goto(`${config.URL_BASE}`);

    // Click en el enlace "Olvidó su contraseña?"
    await page.getByRole("link", { name: "¿Olvidó su contraseña?" }).click();

    // Verifica que la URL cambió a la página de restaurar contraseña
    await expect(page).toHaveURL(`${config.URL_BASE}/restablecer-contrasena/`);

    // Verifica que un elemento de la página de restaurar contraseña es visible
    await expect(
      page.locator("div.et_pb_text_inner", {
        hasText: "Restablecer la contraseña",
      })
    ).toBeVisible();
  });

  test("Click en el enlace de registro y navegar a la página de registro", async ({
    page,
  }) => {
    await page.goto(`${config.URL_BASE}`);

    // Click en el enlace de registro
    await page.getByRole("link", { name: "Regístrate desde aquí" }).click();

    // Verificar que la URL cambió a la página de registro
    await expect(page).toHaveURL(`${config.URL_BASE}/alta-usuario/`);

    // Verificar que estamos en la pagina de  /alta-usuario/
    // Verificar que un elemento de la página de registro es visible
    await expect(
      page.locator("div.et_pb_text_inner", { hasText: "Regístrate en RBIU" })
    ).toBeVisible();
  });
});
