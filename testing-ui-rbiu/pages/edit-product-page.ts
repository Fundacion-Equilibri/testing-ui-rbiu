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

    // getByRole('link') no funciona aquí porque el elemento <a> probablemente no tiene un
    // atributo 'href', por lo que no es un enlace semántico.
    // En su lugar, usamos un selector de clase CSS que es más específico para este caso.
    // El selector '.clase1.clase2' busca un elemento que tenga AMBAS clases.
    this.deleteLink = page.locator(
      ".et_pb_button.et_pb_button_eliminar_producto"
    );
  }

  async verifyPageLoaded() {
    // Añadimos un timeout explícito para dar margen a que la página cargue completamente.
    await expect(this.pageTitle).toBeVisible({ timeout: 10000 });
  }

  async deleteProduct() {
    await this.deleteLink.click();

    // Tienes razón, hay dos botones con el texto "Sí". Para seleccionar el correcto,
    // la mejor estrategia es localizar primero el contenedor del modal de confirmación
    // usando su título único, y luego buscar el botón "Sí" DENTRO de ese modal.
    const confirmationModal = this.page.locator("div", {
      has: this.page.getByRole("heading", {
        name: "¿Estás seguro de que quieres eliminar el producto?",
      }),
    });
    await confirmationModal.getByRole("button", { name: "Sí" }).click();
  }
}
