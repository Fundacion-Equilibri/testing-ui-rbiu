import { type Locator, type Page, expect } from "@playwright/test";

export class ProductsPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchIcon: Locator;
  readonly categoryFilter: Locator;
  readonly countryFilter: Locator;
  readonly productListContainer: Locator;
  readonly loadMoreButton: Locator;
  readonly loader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator("#filterbytext");
    this.searchIcon = page.locator("#searchled");
    this.categoryFilter = page.locator("#filterbycategory");
    this.countryFilter = page.locator("#filterbycountry");
    this.productListContainer = page.locator("#container-market");
    this.loadMoreButton = page.locator("#ver_mas_productos a");
    this.loader = page.locator("#loader_more_products");
  }

  async goto() {
    await this.page.goto("/mercado");
  }
  // OK
  async handleCookies() {
    // Este método es un placeholder. Si aparece un banner de cookies,
    // la lógica para aceptarlo iría aquí.
    const acceptButton = this.page.getByRole("button", { name: /Aceptar/i });
    if (await acceptButton.isVisible({ timeout: 2000 })) {
      await acceptButton.click();
    }
  }

  async searchProduct(productName: string) {
    await this.searchInput.fill(productName);
    await this.searchIcon.click();
    // Esperar a que las llamadas de red finalicen después de la búsqueda
    await this.page.waitForLoadState("networkidle");
  }

  // OK
  async filterByCategory(category: string) {
    await this.categoryFilter.selectOption({
      label: category || "Todas las categorías",
    });
    await this.page.waitForLoadState("networkidle");
  }
  // OK
  async filterByCountry(country: string) {
    await this.countryFilter.selectOption({ label: country });
    await this.page.waitForLoadState("networkidle");
  }
  // OK
  async loadMoreProducts() {
    await this.loadMoreButton.click();
    // Esperar a que el loader aparezca y luego desaparezca
    await expect(this.loader).toBeVisible();
    await expect(this.loader).toBeHidden({ timeout: 10000 });
  }
  // OK
  async getProductCount(): Promise<number> {
    return this.productListContainer.locator("a.card-link").count();
  }
  // OK
  getProductCard(productName: string): Locator {
    return this.productListContainer.locator("a.card-link", {
      hasText: productName,
    });
  }

  async clickProduct(productName: string) {
    await this.getProductCard(productName).click();
  }

  async verifyProductIsVisible(productName: string) {
    await expect(this.getProductCard(productName)).toBeVisible();
  }

  async verifyProductIsNotVisible(productName: string) {
    await expect(this.getProductCard(productName)).toBeHidden();
  }
}
