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

    // 1. Verifica que el contenedor de la necesidad sea visible.
    await expect(needCard).toBeVisible();

    // 2. Verifica que el nombre y el precio dentro de ese contenedor sean correctos.
    await expect(needCard.locator("p.name")).toHaveText(name);
    await expect(needCard.locator("p.min-price")).toHaveText(minPrice);
    await expect(needCard.locator("p.max-price")).toHaveText(maxPrice);
  }
}