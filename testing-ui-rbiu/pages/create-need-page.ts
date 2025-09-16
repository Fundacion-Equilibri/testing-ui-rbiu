import { type Locator, type Page, expect } from "@playwright/test";
import { config } from "../config/configs";

// Interfaz para los datos del producto, para mayor claridad y seguridad de tipos.
export interface NeedData {
  name: string;
  needDetails: string;
  reasonNeed: string;
  minPrice: string;
  maxPrice: string;
  category: string;
  imagePath: string;
  visible: "Sí" | "No";
}

export class CreateNeedPage {
  // Propiedades de la clase (Locators)
  readonly page: Page;
  readonly cookieAcceptButton: Locator;
  readonly needNameInput: Locator;
  readonly needDetails: Locator;
  readonly reasonNeed: Locator;
  readonly minPrice: Locator;
  readonly maxPrice: Locator;
  readonly categorySelect: Locator;
  readonly imageInput: Locator;
  readonly visibleSelect: Locator;

  readonly submitButton: Locator;
  readonly confirmationMessage: Locator;
  readonly validationContainer: Locator;

  constructor(page: Page) {
    this.page = page;

    // Locators del formulario
    // Se prioriza getByRole y getByLabel por ser más resilientes a cambios y más legibles.
    this.cookieAcceptButton = page.getByRole("button", { name: "Aceptar" });
    this.needNameInput = page.getByLabel("¿Qué necesitas?*");
    this.needDetails = page.getByLabel("Detalla un poco más lo que necesitas*");
    this.reasonNeed = page.getByLabel(
      "Explícanos que uso le vas a dar y el motivo de la necesidad*"
    );
    this.minPrice = page.getByLabel("Precio mínimo (en logos)*");
    this.maxPrice = page.getByLabel("Precio máximo (en logos)*");
    this.categorySelect = page.getByRole("combobox", { name: "Categoría" });
    this.imageInput = page.getByLabel("Imagen*");
    this.visibleSelect = page.getByRole("combobox", { name: "Visible" });

    this.submitButton = page.getByRole("button", { name: /^Crear/i });
    this.confirmationMessage = page.locator("#gform_confirmation_message_21");
    // Mensajes de errores
    this.validationContainer = page.locator("#gform_21_validation_container");
  }

  // Métodos de acción
  async goto() {
    await this.page.goto(`${config.URL_BASE}/crea-una-necesidad/`);
  }

  async handleCookies() {
    // Encapsulamos la lógica de las cookies en su propio método.
    // Playwright espera automáticamente, por lo que la comprobación isVisible() es innecesaria.
    // Para elementos opcionales como banners de cookies, se intenta hacer clic con un timeout
    // corto y se captura el error si no aparece, evitando que la prueba falle.
    await this.cookieAcceptButton.click({ timeout: 3000 }).catch(() => {});
  }

  async fillForm(data: NeedData, file: boolean = true) {
    await this.needNameInput.fill(data.name);
    await this.needDetails.fill(data.needDetails);
    await this.reasonNeed.fill(data.reasonNeed);
    await this.minPrice.fill(data.minPrice);
    await this.maxPrice.fill(data.maxPrice);
    await this.categorySelect.selectOption(data.category);
    if (file) await this.imageInput.setInputFiles(data.imagePath);
    await this.visibleSelect.selectOption({ label: data.visible });
  }

  async submit() {
    await this.submitButton.click();
  }

  // Método de aserción
  async verifySuccess(productName: string) {
    const expectedText = `Tu necesidad ${productName} ha sido creada con éxito.`;
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
