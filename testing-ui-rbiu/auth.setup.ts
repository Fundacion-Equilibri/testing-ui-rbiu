import { test as setup, expect } from "@playwright/test";
import { config } from "./config/configs";

const authFile = "auth.json";
const email = config.EMAIL;
const password = config.PASSWORD;

setup("Authenticacion de usuario", async ({ page }) => {
  if (!email || !password) {
    throw new Error(
      "Las variables de entorno EUTAXIA_USER y EUTAXIA_PASSWORD deben estar definidas."
    );
  }
  console.log({ email, password });
  // Realiza el proceso de login
  await page.goto(`${config.URL_BASE}`);

  // Usar un selector más robusto para el formulario de login
  const loginForm = page.locator("#mb-login_form_container");

  await loginForm.getByPlaceholder("Correo electrónico o usuario").fill(email);
  await loginForm.getByPlaceholder("Contraseña").fill(password);
  await page.getByRole("button", { name: /iniciar sesión/i }).click();

  // Espera a que la página cargue después del login para asegurar que fue exitoso
  await expect(
    page.getByRole("link", { name: /Crea tus productos/i })
  ).toBeVisible({ timeout: 30 * 1000 });

  // Guarda el estado de autenticación en el archivo auth.json
  await page.context().storageState({ path: authFile });
});
