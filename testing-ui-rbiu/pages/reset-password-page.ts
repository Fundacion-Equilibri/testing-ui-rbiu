import { type Locator, type Page, expect } from "@playwright/test";
import { config } from "../config/configs";

export class ResetPasswordPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly resetButton: Locator;
  readonly confirmationMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder("Correo electrónico");
    this.resetButton = page.getByRole("button", {
      name: "Restablecer contraseña",
    });
    this.confirmationMessage = page.locator("#login-error"); // Reutilizando el mismo locator para mensajes de éxito/error
    this.errorMessage = page.locator("#login-error");
  }

  async goto() {
    await this.page.goto(`${config.URL_BASE}/restablecer-contrasena/`);
  }

  async requestPasswordReset(email: string) {
    await this.emailInput.fill(email);
    await this.resetButton.click();
  }

  async verifyConfirmationMessage(message: string) {
    await expect(this.confirmationMessage).toBeVisible();
    await expect(this.confirmationMessage).toContainText(message);
  }

  async verifyErrorMessage(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }
}
