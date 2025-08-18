import { test, expect } from "@playwright/test";
import { config } from "./config/configs";

test("Login fallido con modal", async ({ page }) => {
  await page.goto(`${config.URL_BASE}`);

  // Esperar y llenar el email
  const email = page.getByPlaceholder("Correo electrónico o usuario");
  await expect(email).toBeVisible();
  await email.fill("correo@ejemplo.com");

  // Esperar y llenar la contraseña (modal)
  // Acotar la búsqueda al contenedor del formulario para evitar ambigüedad
  const loginForm = page.locator("#mb-login_form_container");
  const password = loginForm.getByPlaceholder("Contraseña");
  await expect(password).toBeVisible();
  await password.fill("contraseña123");

  // Enviar formulario
  await page.getByRole("button", { name: /iniciar sesión/i }).click();

  // Verificar que el login fallo y muestra un mensaje
  await expect(
    page.locator("#mb-login_form_container p", {
      hasText: "Su intento de inicio de sesión no tuvo éxito",
    })
  ).toBeVisible({ timeout: 5000 });
});
