import { type Locator, type Page, expect } from "@playwright/test";
import { config } from "../config/configs";
import { HeaderPage } from "./header-page";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  // Header de la pagina
  readonly header: HeaderPage;


  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder("Correo electrónico", {
      exact: true,
    });
    this.passwordInput = page.getByPlaceholder("Contraseña", { exact: true });
    this.loginButton = page.getByRole("button", { name: "Iniciar sesión" });
    this.errorMessage = page.locator("#login-error");

    this.header = new HeaderPage(page);
  }

  async goto() {
    await this.page.goto(`${config.URL_BASE}/login/`);
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async verifyErrorMessage(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }

  async verifySuccessfulLogin() {
    // Después de un login exitoso, el usuario es redirigido a la página de inicio
    await expect(this.page).toHaveURL(new RegExp(`${config.URL_BASE}`));
    // También puedes verificar la presencia de un elemento que solo aparece cuando el usuario está logueado.
    await this.header.getContainersFromNabBar()
  }
}
