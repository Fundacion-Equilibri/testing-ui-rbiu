import { type Locator, type Page, expect } from "@playwright/test";
import { config } from "../config/configs";

export class MyNeedsPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly needList: Locator;
  readonly createNeedButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole("heading", { name: "Mis necesidades" });
    this.needList = page.locator(".genericList");
    this.createNeedButton = page.getByRole("link", {
      name: "Crea una necesidad",
    });
  }

  async goto() {
    await this.page.goto(`${config.URL_BASE}/mis-necesidades/`);
  }

  // VERIFICA QUE LA NECESIDAD EXISTE CON UN NOMBRE
  private getNeedCardByName(name: string): Locator {
    // Localiza el contenedor de una necesidad específica buscando por su nombre.
    return this.needList.locator(".elementList", { hasText: name });
  }

  // METODO QUE NAVEGA A LA NECESIDAD ESPECIFICA PARA ELIMINAR
  async editNeed(needName: string): Promise<void> {
    // De la lista de necesidades hacer click en la necesidad y navega a dicha necesidad
    const needCard = this.getNeedCardByName(needName);
    await needCard.click();
  }

  // METODO QUE HACE CLICK EN EL BOTON
  async clickButtonCreateNeed() {
    // De la lista de necesidades hacer click en la necesidad y navega a dicha necesidad
    await this.createNeedButton.click();
  }

  // METODO PARA VERIFICAR QUE LA NECESIDAD EXISTE
  async verifyNeedIsListed(name: string, minPrice: string, maxPrice: string) {
    const needCard = this.getNeedCardByName(name);

    // 1️⃣ Verifica que el contenedor de la necesidad sea visible
    await expect(needCard).toBeVisible();

    // 2️⃣ Verifica que el nombre esté correcto
    await expect(needCard.locator("p.name")).toContainText(name);

    // 3️⃣ Verifica que el precio contenga ambos valores dentro del mismo párrafo
    const priceLocator = needCard.locator("p.precio");
    await expect(priceLocator).toContainText(minPrice);
    await expect(priceLocator).toContainText(maxPrice);
  }


  // VERIFICA QUE UN PRODUCTO CON UN NOMBRE ESPECIFICO NO ESTE VISIBLE EN LA LISTA
  async verifyNeedIsNotListed(needName: string) {
    // Usamos el mismo selector que en `verifyNeedIsListed` pero negamos la aserción.
    const needCard = this.getNeedCardByName(needName);
    await expect(needCard).not.toBeVisible();
  }

  // Verifica que el botón "Crea una necesidad" es visible.
  async verifyButtonCreateNeedIsVisible() {
    await expect(this.createNeedButton).toBeVisible();
  }

  // Opción extra: Método que devuelve boolean (sin aserciones)
  async isNeedListed(name: string): Promise<boolean> {
    const needCard = this.getNeedCardByName(name);
    return await needCard.isVisible();
  }
}