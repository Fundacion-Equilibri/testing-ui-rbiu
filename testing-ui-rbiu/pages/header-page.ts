import { type Locator, type Page, expect } from "@playwright/test";
import { config } from "../config/configs";

export class HeaderPage {
  readonly page: Page;
  readonly desktopNav: Locator;
  readonly mobileNav: Locator;

  constructor(page: Page) {
    this.page = page;
    // Contenedor del menú de navegación para escritorio
    this.desktopNav = page.locator("#top-menu-nav");
    // Contenedor del menú de navegación para escritorio
    this.desktopNav = page.locator("#main-header");
    // Contenedor de la barra de navegación para móviles
    this.mobileNav = page.locator("nav.bottom_nav");
  }

  async goto() {
    await this.page.goto(`${config.URL_BASE}`);
  }

  // Método genérico para obtener un enlace de navegación por su nombre.
  // Funciona tanto para la vista de escritorio como para la móvil.
  getNavLinkDesk(name: string): Locator {
    return this.desktopNav.getByRole("link", { name });
  }

  getNavLinkMovil(name: string): Locator {
    return this.mobileNav.getByRole("link", { name });
  }

  // Obtener contenedores con usuario logueado
  getContainersFromNabBar(): Locator[] {
    const messages = this.desktopNav.locator("div.h_.h__");
    const notifications = this.desktopNav.locator("div.h_.h_notifications");
    const profile = this.desktopNav.locator("div.h_.h_chat");
    return [messages, notifications, profile];
  }

  getLoginButton(): Locator {
    return this.page.getByRole("link", { name: "Regístrate o Inicia sesión" });
  }
}
