import { type Locator, type Page, expect } from "@playwright/test";
import { config } from "../config/configs";

// PAGINA DE MERCADO  ->  /mercado
export class NeedsPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchIcon: Locator;
  readonly categoryFilter: Locator;
  readonly countryFilter: Locator;
  readonly productListContainer: Locator;
  readonly shareNeedButton: Locator;
  readonly loadMoreButton: Locator;
  readonly loader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder("Buscar productos o servicios");
    this.searchIcon = page.locator("#searchled");
    this.categoryFilter = page.locator("#filterbycategory");
    this.countryFilter = page.locator("#filterbycountry");
    this.productListContainer = page.locator("#container-market");
    this.shareNeedButton = page.getByRole("link", {
      name: "Comparte tus necesidades",
    });
    this.loadMoreButton = page.getByRole("link", {
      name: /Ver \d+ necesidades más/i,
    });
    this.loader = page.locator("#loader_more_products");
  }
  // Navega a la pagina de productos
  async goto() {
    await this.page.goto(`${config.URL_BASE}/necesidades`);
  }

  async verifyPageLoaded() {
    await expect(this.page).toHaveURL(/.*\/necesidades/);
    await expect(this.categoryFilter).toBeVisible();
    await expect(this.countryFilter).toBeVisible();
    await this.handleCookies();
  }

  async verifyShareNeedButtonVisible() {
    await expect(this.shareNeedButton).toBeVisible();
  }

  // Busca una necesidad con un nombre
  async searchNeed(needName: string) {
    await this.searchInput.fill(needName);
    await this.searchIcon.click();
    // Esperar a que las llamadas de red finalicen después de la búsqueda
    await this.page.waitForLoadState("networkidle");
  }

  // Verifica que la necesidad exista con un nombre
  async verifyNeedIsVisible(needName: string) {
    await expect(this.getNeedCard(needName)).toBeVisible();
  }

  async isNeedListed(needName: string): Promise<boolean> {
    return await this.getNeedCard(needName).isVisible();
  }

  // // Verifica que la necesidad no este presente con un nombre
  // async verifyNeedIsNotVisible(needName: string) {
  //   await expect(this.getNeedCard(needName)).not.toBeVisible();
  // }

  // Hace click en una necesidad
  async clickNeed(needName: string) {
    await this.getNeedCard(needName).click();
  }

  // Filtra las necesidades por categoria
  async filterByCategory(category: string) {
    await this.categoryFilter.selectOption({
      label: category || "Todas las categorías",
    });
    await this.page.waitForLoadState("networkidle");
  }

  // Filtra los productos por pais+
  async filterByCountry(country: string) {
    await this.countryFilter.selectOption({ label: country });
    await this.page.waitForLoadState("networkidle");
  }

  // Hace click en el boton de cargar mas productos
  async loadMoreProducts() {
    await this.loadMoreButton.click();
    await this.loader
      .waitFor({ state: "visible", timeout: 10000 })
      .catch(() => {
        // Si no llegó a mostrarse, no fallamos — algunos loads son muy rápidos
        console.log("⚠️ Loader no llegó a mostrarse, continuando...");
      });

    await this.loader.waitFor({ state: "hidden", timeout: 10000 });
  }

  // Cuenta los productos visibles
  async getProductCount(): Promise<number> {
    return this.productListContainer.locator("div.card-link").count();
  }

  getProductCards(): Locator {
    return this.productListContainer.locator("div.card-link");
  }

  //  Encuentra una necesidad por el nombre de la necesidad
  getNeedCard(needName: string): Locator {
    return this.productListContainer.locator("div.card-link", {
      hasText: needName ,
    });
  }

  // Hace click en el boton de cookies
  async handleCookies() {
    // Este método es un placeholder. Si aparece un banner de cookies,
    const acceptButton = this.page.getByRole("button", { name: /Aceptar/i });
    if (await acceptButton.isVisible({ timeout: 2000 })) {
      await acceptButton.click();
    }
  }
}
