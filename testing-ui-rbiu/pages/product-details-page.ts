import { type Locator, type Page, expect } from "@playwright/test";

export class ProductDetailsPage {
  readonly page: Page;
  readonly productTitle: Locator;
  readonly productPrice: Locator;
  readonly productStock: Locator;
  readonly sellerName: Locator;
  readonly editProductButton: Locator;
  readonly startExchangeButton: Locator;
  readonly loginButton: Locator;
  readonly vendedorTab: Locator;
  readonly chatTab: Locator;
  readonly cardDialog: Locator;

  constructor(page: Page) {
    this.page = page;

    this.cardDialog = page.getByText(
      "Inicia sesión para poder realizar intercambios y comunicarte con el vendedor.",
      { exact: true }
    );

    // --- Localizadores de la sección de detalles del producto ---
    this.productTitle = page.locator("p.demand-title-select");
    this.productPrice = page.locator("p.demand-price-select");
    this.productStock = page.locator("p.stock-txt");

    // --- Localizadores de la sección del vendedor y acciones ---
    this.sellerName = page.locator(
      ".select-chat-header-user .card-text-select"
    );

    // --- Botón para iniciar sessio(solo visible para usuarios no logueados)
    // El elemento clicable es un div con una clase específica que contiene el texto.
    this.loginButton = page.locator("div.inicia-intercambio");

    // --- Botón para editar un producto (solo visible si el producto es del usuario actual)
    this.editProductButton = page.getByText("Editar producto", {
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
    // En la ruta dinamica de /product?id= y uno o más dígitos". busca el patron
    await expect(this.page).toHaveURL(/.*\/producto\/\?id=\d+/, {
      timeout: 30000,
    });
    // Espera a que el título del producto sea visible, lo que indica que la página se ha cargado.
    await expect(this.productTitle).toBeVisible({ timeout: 30000 });
  }

  /**
   * Hace clic en el botón "Editar producto".
   * Este método debe usarse en pruebas donde se espera que el botón esté presente.
   * Si el botón no es visible, la acción fallará y la prueba también, lo cual es el comportamiento deseado.
   */
  async clickButtonEditProduct() {
    await this.editProductButton.click();
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
