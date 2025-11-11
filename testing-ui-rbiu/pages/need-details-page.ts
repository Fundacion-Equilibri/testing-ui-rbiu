import { type Locator, type Page, expect } from "@playwright/test";

export class NeedDetailsPage {
  readonly page: Page;
  readonly productTitle: Locator;
  readonly productPrice: Locator;
  readonly sellerName: Locator;
  readonly editProductButton: Locator;
  readonly startExchangeButton: Locator;
  readonly loginButton: Locator;
  readonly vendedorTab: Locator;
  readonly chatTab: Locator;
  readonly cardDialog: Locator;

  constructor(page: Page) {
    this.page = page;

    this.cardDialog = page.locator("#card-dialog");

    // --- Localizadores de la sección de detalles del producto ---
    this.productTitle = page.locator("p.demand-title-select");
    this.productPrice = page.locator("p.demand-price-select");

    // --- Localizadores de la sección del vendedor y acciones ---
    this.sellerName = page.locator(
      ".select-chat-header-user .card-text-select"
    );

    // --- Botón para iniciar sessio(solo visible para usuarios no logueados)
    // El elemento clicable es un div con una clase específica que contiene el texto.
    this.loginButton = page.locator("div.inicia-intercambio", {
      hasText: "Inicia sesión",
    });

    // --- Botón para editar un producto (solo visible si el producto es del usuario actual)
    this.editProductButton = page.getByText("Editar necesidad", {
      exact: true,
    });

    // --- Boton de Iniciar intercambio si el producto no es mio
    this.startExchangeButton = page.getByText("Iniciar intercambio", {
      exact: true,
    });

    // --- Localizadores de las pestañas ---
    this.vendedorTab = page.getByText("Vendedor", { exact: true });
    this.chatTab = page.locator("#tab2", { hasText: "Chat" });
  }

  /**
   * Verifica que la página de detalles del producto se ha cargado correctamente
   * esperando a que el título del producto sea visible.
   */
  async verifyPageLoaded() {
    await expect(this.productTitle).toBeVisible({ timeout: 10000 });
  }

  /**
   * Hace clic en el botón "Editar producto".
   * Este método debe usarse en pruebas donde se espera que el botón esté presente.
   * Si el botón no es visible, la acción fallará y la prueba también, lo cual es el comportamiento deseado.
   */
  async clickButtonEditProduct() {
    await this.editProductButton.click();
  }

  async dialogVisible(paragraph: string) {
    await expect(this.cardDialog).toContainText(paragraph);
  }

  /**
   * Hace clic en el botón "Iniciar intercambio" para comenzar un nuevo intercambio.
   */
  async clickExchangeProduct() {
    await this.startExchangeButton.click();
  }

  async clickLoginButton() {
    await this.loginButton.click();
  }

  async switchToChatTab() {
    await this.chatTab.click();
  }
}
