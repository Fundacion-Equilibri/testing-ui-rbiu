import { type Locator, type Page, expect } from "@playwright/test";
import { config } from "../config/configs";

// PAGINA DE MERCADO  ->  /mercado
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
    this.searchInput = page.getByPlaceholder("Buscar productos o servicios");
    this.searchIcon = page.locator("#searchled");
    this.categoryFilter = page.locator("#filterbycategory");
    this.countryFilter = page.locator("#filterbycountry");
    this.productListContainer = page.locator("#container-market");
    // Se prioriza getByRole por ser más resiliente. El regex /Ver \d+ productos más/i
    // asegura que funcione aunque el número de productos cambie.
    this.loadMoreButton = page.getByRole("link", {
      name: /Ver \d+ productos más/i,
    });
    this.loader = page.locator("#loader_more_products");
  }
  // Navega a la pagina de productos
  async goto() {
    await this.page.goto(`${config.URL_BASE}/mercado`);
  }

  // Busca un producto con un nombre
  async searchProduct(productName: string) {
    await this.searchInput.fill(productName);
    await this.searchIcon.click();
    // Esperar a que las llamadas de red finalicen después de la búsqueda
    await this.page.waitForLoadState("networkidle");
  }

  // Verifica que el producto exista con un nombre
  async verifyProductIsVisible(productName: string) {
    await expect(this.getProductCard(productName)).toBeVisible();
  }

  // Verifica que el producto no este presente con un nombre
  async verifyProductIsNotVisible(productName: string) {
    await expect(this.getProductCard(productName)).not.toBeVisible();
  }

  // Hace click en un producto
  async clickProduct(productName: string) {
    await this.getProductCard(productName).click();
  }

  // Filtra los productos por categoria
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
    // Es una mejor práctica esperar a que el loader sea visible y luego esperar a que se oculte.
    // Esto evita race conditions donde el loader aparece y desaparece muy rápido.
    await expect(this.loader).toBeVisible();
    await expect(this.loader).toBeHidden({ timeout: 10000 });
  }

  // Cuenta los productos visibles
  async getProductCount(): Promise<number> {
    return this.productListContainer.locator("a.card-link").count();
  }

  //  Encuentra un producto por el nombre del producto
  getProductCard(productName: string): Locator {
    return this.productListContainer.locator("a.card-link", {
      hasText: productName,
    });
  }

  // Hace click en el boton de cookies
  async handleCookies() {
    // Este método es un placeholder. Si aparece un banner de cookies,
    // la lógica para aceptarlo iría aquí.
    const acceptButton = this.page.getByRole("button", { name: /Aceptar/i });
    if (await acceptButton.isVisible({ timeout: 2000 })) {
      await acceptButton.click();
    }
  }
}
