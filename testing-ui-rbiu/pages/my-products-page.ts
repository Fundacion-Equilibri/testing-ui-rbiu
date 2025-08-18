import { type Locator, type Page, expect } from "@playwright/test";
import { config } from "../config/configs";

export class MyProductsPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly productList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole("heading", { name: "Mis productos" });
    this.productList = page.locator(".genericList");
  }

  async goto() {
    await this.page.goto(`${config.URL_BASE}/mis-productos/`);
  }

  private getProductCardByName(name: string): Locator {
    // Localiza el contenedor de un producto específico buscando por su nombre.
    return this.productList.locator(".elementList", { hasText: name });
  }

  async verifyProductIsListed(name: string, price: string) {
    const productCard = this.getProductCardByName(name);

    // 1. Verifica que el contenedor del producto sea visible.
    await expect(productCard).toBeVisible();

    // 2. Verifica que el nombre y el precio dentro de ese contenedor sean correctos.
    await expect(productCard.locator("p.name")).toHaveText(name);
    await expect(productCard.locator("p.precio")).toContainText(`${price},00 λ`);
  }
}

