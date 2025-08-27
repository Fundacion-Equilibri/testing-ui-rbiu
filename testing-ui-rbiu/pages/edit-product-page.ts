import { type Locator, type Page, expect } from "@playwright/test";

export class EditProductPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly deleteLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // El selector getByRole('heading') falla porque el texto del título no está en una etiqueta
    this.pageTitle = page
      .locator("article")
      .getByText("Modifica un producto", { exact: true });
    // Localiza el boton de eliminar
    this.deleteLink = page.locator(
      ".et_pb_button.et_pb_button_eliminar_producto"
    );
  }

  async verifyPageLoaded() {
    // Añadimos un timeout explícito para dar margen a que la página cargue completamente.
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 });
  }

  async deleteProduct() {
    // Manejar el banner de cookies si está presente, ya que podría bloquear clics en modo headed.
    // Idealmente, esto debería manejarse de forma global (ej. en un hook beforeEach o una función de setup).
    const acceptCookiesButton = this.page
      .locator("#cookie-law-info-bar")
      .getByRole("button", { name: "Aceptar" });
    // Usamos un bloque try/catch con un timeout corto para manejar el banner de cookies
    // de forma segura, sin que el test falle si el banner no aparece.
    try {
      await acceptCookiesButton.click({ timeout: 3000 });
    } catch (error) {
      // El banner no apareció o ya fue aceptado, lo cual es correcto. Ignoramos el error.
      console.log(
        "Banner de cookies no encontrado o ya gestionado, continuando con el test."
      );
    }

    // Nos aseguramos de que el botón esté en la vista antes de hacer clic.
    // Esto es crucial en modo --headed si el botón está al final de la página.
    await this.deleteLink.scrollIntoViewIfNeeded();
    await this.deleteLink.click();

    // Localiza el modal por su ID y espera a que sea visible.
    const confirmationModal = this.page.locator("#confirmationPopup", {
      has: this.page.getByRole("heading", {
        name: "¿Estás seguro de que quieres eliminar el producto?",
      }),
    });

    await expect(confirmationModal).toBeVisible();
    await confirmationModal.getByRole("button", { name: "Sí" }).click();
  }
}
