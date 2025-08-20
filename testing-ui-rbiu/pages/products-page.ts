import { type Locator, type Page, expect } from "@playwright/test";
import { config } from "../config/configs";

export class ProductsPage {
  readonly page: Page;
  readonly productList: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productList = page.locator(".container-market");
    this.searchInput = page.getByPlaceholder("Buscar productos o servicios");
  }

  async goto() {
    await this.page.goto(`${config.URL_BASE}/mercado`);
  }

  async searchProduct(productName: string) {
    await this.searchInput.fill(productName);
    await this.searchInput.press("Enter");
  }

  async verifyProductIsVisible(productName: string) {
    const productCard = this.productList.locator(".card-demand", {
      hasText: productName,
    });
    await expect(productCard).toBeVisible();
  }

  async verifyProductIsNotVisible(productName: string) {
    const productCard = this.productList.locator(".card-demand", {
      hasText: productName,
    });
    await expect(productCard).not.toBeVisible();
  }
}
