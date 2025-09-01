import { type Locator, type Page, expect } from "@playwright/test";
import { config } from "../config/configs";

// PAGINA DE MERCADO  ->  /mercado
export class ProductsPage {
  readonly page: Page;
  readonly productList: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productList = page.locator(".container-market");
    this.searchInput = page.getByPlaceholder("Buscar productos o servicios");
  }
  // Navega a la pagina de productos
  async goto() {
    await this.page.goto(`${config.URL_BASE}/mercado`);
  }

  // Busca un producto con un nombre
  async searchProduct(productName: string) {
    await this.searchInput.fill(productName);
    await this.searchInput.press("Enter", { timeout: 2000 });
  }

  // Verifica que el producto exista con un nombre
  async verifyProductIsVisible(productName: string) {
    const productCard = this.productList.locator(".card-demand", {
      hasText: productName,
    });
    await expect(productCard).toBeVisible();
  }

  // Verifica que el producto no este presente con un nombre
  async verifyProductIsNotVisible(productName: string) {
    const productCard = this.productList.locator(".card-demand", {
      hasText: productName,
    });
    await expect(productCard).not.toBeVisible();
  }

  // Hace click en un producto
  async clickProduct(productName: string) {
    const product = this.productList.locator(".card-demand", {
      hasText: productName,
    });
    await product.click();
  }
}
