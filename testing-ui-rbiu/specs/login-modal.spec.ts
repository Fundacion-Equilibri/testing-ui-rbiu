import { test, expect } from "@playwright/test";
import { config } from "../config/configs";

test.describe("Modal de login", () => {
  test("Login fallido con modal por credenciales incorrectos", async ({
    page,
  }) => {
    await page.goto(`${config.URL_BASE}`);
    const credentials = {
      email: "correo@ejemplo.com",
      password: "contraseña123",
    };

    // Esperar y llenar el email
    const email = page.getByPlaceholder("Correo electrónico o usuario");
    await expect(email).toBeVisible();
    await email.fill(credentials.email);

    // Esperar y llenar la contraseña (modal)
    // Acotar la búsqueda al contenedor del formulario para evitar ambigüedad
    const loginForm = page.locator("#mb-login_form_container");
    const password = loginForm.getByPlaceholder("Contraseña");
    await expect(password).toBeVisible();
    await password.fill(credentials.password);

    // Enviar formulario
    await page.getByRole("button", { name: /iniciar sesión/i }).click();

    // Verificar que el login fallo y muestra un mensaje
    await expect(
      page.locator("#mb-login_form_container p", {
        hasText: "Su intento de inicio de sesión no tuvo éxito",
      })
    ).toBeVisible({ timeout: 5000 });
  });

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
