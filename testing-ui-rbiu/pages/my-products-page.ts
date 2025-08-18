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

  // VERIFICA QUE EL PRODUCTO EXISTE CON UN NOMBRE
  private getProductCardByName(name: string): Locator {
    // Localiza el contenedor de un producto específico buscando por su nombre.
    return this.productList.locator(".elementList", { hasText: name });
  }

  // MEODO QUE ELIMINA UN PRODUCTO
  async editProduct(productName: string): Promise<void> {
    // De la lista de productos hacer click en el producto y navega a dicho producto

    const productCard = this.getProductCardByName(productName);
    await productCard.click();
  }

  // METODO PARA VERIFICAR QUE EL PRODUCTO EXISTE
  async verifyProductIsListed(name: string, price: string) {
    const productCard = this.getProductCardByName(name);

    // 1. Verifica que el contenedor del producto sea visible.
    await expect(productCard).toBeVisible();

    // 2. Verifica que el nombre y el precio dentro de ese contenedor sean correctos.
    await expect(productCard.locator("p.name")).toHaveText(name);
    await expect(productCard.locator("p.precio")).toContainText(
      `${price},00 λ`
    );
  }

  //  Verifica que un producto con un nombre específico NO está visible en la lista.
  async verifyProductIsNotListed(productName: string): Promise<void> {
    // Usamos el mismo selector que en `verifyProductIsListed` pero negamos la aserción.
    const productLocator = this.productList.locator(".elementList", {
      hasText: productName,
    });
    await expect(productLocator).not.toBeVisible();
  }
}
