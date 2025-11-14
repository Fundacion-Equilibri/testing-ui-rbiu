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
    // RECOMENDACIÓN: Reemplazar 'networkidle' por una espera explícita.
    // Esperamos a que el contenedor de productos se actualice.
    // Una buena señal es que el loader aparezca y luego desaparezca.
    // Esto es más fiable que esperar a que la red esté inactiva.
    await this.waitForProductsToLoad();
  }

  // Verifica que el producto exista con un nombre
  async verifyProductIsVisible(productName: string) {
    // Se añade un timeout a la aserción para dar tiempo a que el elemento
    // aparezca después de una acción asíncrona como buscar o filtrar.
    await expect(this.getProductCard(productName)).toBeVisible({ timeout: 10000 });
  }

  // Verifica que el producto no este presente con un nombre
  async verifyProductIsNotVisible(productName: string) {
    // Se añade un timeout a la aserción para confirmar que el elemento
    // realmente no aparece después de un tiempo prudencial.
    await expect(this.getProductCard(productName)).not.toBeVisible({ timeout: 5000 });
  }

  // Hace click en un producto
  async clickProduct(productName: string) {
    // Añadimos una espera para asegurar que el producto es visible antes de hacer clic.
    await this.verifyProductIsVisible(productName);
    await this.getProductCard(productName).click();
  }

  // Filtra los productos por categoria
  async filterByCategory(category: string) {
    await this.categoryFilter.selectOption({
      label: category || "Todas las categorías",
    });
    // RECOMENDACIÓN: Reemplazar 'networkidle'.
    await this.waitForProductsToLoad();
  }

  // Filtra los productos por pais+
  async filterByCountry(country: string) {
    await this.countryFilter.selectOption({ label: country });
    // RECOMENDACIÓN: Reemplazar 'networkidle'.
    await this.waitForProductsToLoad();
  }

  // Hace click en el boton de cargar mas productos
  async loadMoreProducts() {
    await this.loadMoreButton.click();
    // CORRECCIÓN: La lógica de espera del loader estaba duplicada y era incorrecta.
    // La forma correcta es esperar a que el loader desaparezca.
    // Si la carga es muy rápida, el loader puede no aparecer, por lo que
    // `waitFor({ state: "hidden" })` lo manejará correctamente.
    await this.loader.waitFor({ state: "hidden", timeout: 15000 });
  }

  // Cuenta los productos visibles
  async getProductCount(): Promise<number> {
    return this.productListContainer.locator("a.card-link").count();
  }

  getProductCards(): Locator {
    return this.productListContainer.locator("a.card-link");
  }

  //  Encuentra un producto por el nombre del producto
  getProductCard(productName: string): Locator {
    return this.productListContainer.locator("a.card-link", {
      hasText: productName,
    });
  }

  /**
   * Método reutilizable para esperar a que la lista de productos se cargue.
   * Espera a que el spinner/loader desaparezca. Es la forma más robusta
   * de sincronizar los tests con las actualizaciones de la UI.
   */
  async waitForProductsToLoad() {
    // Primero, esperamos a que el loader sea potencialmente visible.
    // Usamos un timeout corto y un catch porque puede que no aparezca si la carga es instantánea.
    await this.loader.waitFor({ state: "visible", timeout: 2000 }).catch(() => {});
    // Luego, y más importante, esperamos a que desaparezca.
    await this.loader.waitFor({ state: "hidden", timeout: 15000 });
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
