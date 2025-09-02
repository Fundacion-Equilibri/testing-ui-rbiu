import { type Locator, type Page, expect } from "@playwright/test";
import { config } from "../config/configs";

// Interfaz para los datos del producto, para mayor claridad y seguridad de tipos.
export interface ProductData {
  name: string;
  price: string;
  quantity: string;
  description: string;
  imagePath: string;
  visible: "Sí" | "No";
  reservable: "Sí" | "No";
  deliveryDetails: string;
  expirationDate: { day: string; month: string; year: string };
}

export class CreateProductPage {
  // Propiedades de la clase (Locators)
  readonly page: Page;
  readonly cookieAcceptButton: Locator;
  readonly productNameInput: Locator;
  readonly priceInput: Locator;
  readonly quantityInput: Locator;
  readonly descriptionTextarea: Locator;
  readonly imageInput: Locator;
  readonly visibleSelect: Locator;
  readonly reservableSelect: Locator;
  readonly deliveryDetailsInput: Locator;
  readonly expirationDaySelect: Locator;
  readonly expirationMonthSelect: Locator;
  readonly expirationYearSelect: Locator;
  readonly submitButton: Locator;
  readonly confirmationMessage: Locator;
  readonly validationContainer: Locator;

  constructor(page: Page) {
    this.page = page;

    // Locators del formulario
    // Se prioriza getByRole y getByLabel por ser más resilientes a cambios y más legibles.
    this.cookieAcceptButton = page.getByRole("button", { name: "Aceptar" });
    this.productNameInput = page.getByLabel("Nombre del producto*");
    this.priceInput = page.getByLabel("Precio (en logos)*");
    this.quantityInput = page.getByLabel("Cantidad");
    this.descriptionTextarea = page.getByLabel("Descripción*");
    this.imageInput = page.getByLabel("Imagen*");
    this.visibleSelect = page.getByRole("combobox", { name: "Visible" });
    this.reservableSelect = page.getByRole("combobox", { name: "Reservable" });
    this.deliveryDetailsInput = page.getByLabel("Detalles de entrega");
    this.expirationDaySelect = page.getByRole("combobox", { name: "Día" });
    this.expirationMonthSelect = page.getByRole("combobox", { name: "Mes" });
    this.expirationYearSelect = page.getByRole("combobox", { name: "Año" });
    this.submitButton = page.getByRole("button", { name: /^Crear/i });
    this.confirmationMessage = page.locator("#gform_confirmation_message_9");
    //Mensajes de errores
    this.validationContainer = page.locator("#gform_9_validation_container");
  }

  // Métodos de acción
  async goto() {
    await this.page.goto(`${config.URL_BASE}/crea-un-producto/`);
  }

  async handleCookies() {
    // Encapsulamos la lógica de las cookies en su propio método.
    // Playwright espera automáticamente, por lo que la comprobación isVisible() es innecesaria.
    // Para elementos opcionales como banners de cookies, se intenta hacer clic con un timeout
    // corto y se captura el error si no aparece, evitando que la prueba falle.
    await this.cookieAcceptButton.click({ timeout: 3000 }).catch(() => {});
  }

  async fillForm(data: ProductData, file: boolean = true) {
    await this.productNameInput.fill(data.name);
    await this.priceInput.fill(data.price);
    await this.quantityInput.fill(data.quantity);
    await this.descriptionTextarea.fill(data.description);
    if (file) await this.imageInput.setInputFiles(data.imagePath);
    await this.visibleSelect.selectOption({ label: data.visible });
    await this.reservableSelect.selectOption({ label: data.reservable });
    await this.deliveryDetailsInput.fill(data.deliveryDetails);
    await this.expirationDaySelect.selectOption(data.expirationDate.day);
    await this.expirationMonthSelect.selectOption(data.expirationDate.month);
    await this.expirationYearSelect.selectOption(data.expirationDate.year);
  }

  async submit() {
    await this.submitButton.click();
  }

  // Método de aserción
  async verifySuccess(productName: string) {
    const expectedText = `Tu producto ${productName} ha sido creado con éxito.`;
    await expect(this.confirmationMessage).toContainText(expectedText);
  }

  // Verificar mensaje o mensajes de error
  async verifyErrorMessages(expectedMessages: string | string[]) {
    await expect(this.validationContainer).toBeVisible();

    const messages = Array.isArray(expectedMessages)
      ? expectedMessages
      : [expectedMessages];

    // localizar todos los <li> dentro del contenedor de validación
    const errorItems = this.validationContainer.locator("ol li");
    const errorCount = await errorItems.count();
    const actualMessages: string[] = [];

    for (let i = 0; i < errorCount; i++) {
      actualMessages.push(await errorItems.nth(i).innerText());
    }

    // Verificamos que todos los mensajes esperados estén en la lista
    for (const message of messages) {
      await expect
        .soft(actualMessages, `Error esperado no encontrado: "${message}"`)
        .toContain(message);
    }
  }
}
