import { type Locator, type Page, expect } from "@playwright/test";
import { config } from "../config/configs";

import path from "path";

// Definimos una interfaz para los datos del formulario para mayor seguridad de tipos.
export interface RegistrationData {
  nombre?: string;
  apellidos?: string;
  telefonoMovil?: string;
  fechaNacimiento?: { dia: string; mes: string; anio: string };
  nombrePublico?: string;
  presentacion?: string;
  ubicacion?: string;
  direccion?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export class RegisterPage {
  // Propiedades de la clase (Locators)
  readonly page: Page;
  readonly form: Locator;
  readonly nombreInput: Locator;
  readonly apellidosInput: Locator;
  readonly nacionalidadSelect: Locator;
  readonly telefonoMovilInput: Locator;
  readonly diaNacimientoSelect: Locator;
  readonly mesNacimientoSelect: Locator;
  readonly anioNacimientoSelect: Locator;
  readonly nombrePublicoInput: Locator;
  readonly presentacionTextarea: Locator;
  readonly ubicacionInput: Locator;
  readonly direccionInput: Locator;
  readonly profileImageInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly confirmationMessage: Locator;
  readonly validationContainer: Locator;
  readonly mapLoadingIndicator: Locator;
  readonly imagePath = path.resolve(__dirname, "../../assets/jaden_smith.jpg");

  constructor(page: Page) {
    this.page = page;
    this.form = page.locator("#gform_34");
    this.nombreInput = this.form.getByLabel("Nombre*");
    this.apellidosInput = this.form.getByLabel("Apellidos*");
    this.nacionalidadSelect = this.form.getByRole("combobox", { name: "Nacionalidad" });
    this.telefonoMovilInput = this.form.getByLabel("Teléfono móvil*");
    this.diaNacimientoSelect = this.form.getByRole("combobox", { name: "Día" });
    this.mesNacimientoSelect = this.form.getByRole("combobox", { name: "Mes" });
    this.anioNacimientoSelect = this.form.getByRole("combobox", { name: "Año" });
    this.nombrePublicoInput = this.form.getByLabel("Nombre público*");
    this.presentacionTextarea = this.form.getByLabel("Mi presentación");
    this.ubicacionInput = this.form.locator("#search");
    this.direccionInput = this.form.getByLabel("Dirección*");
    this.profileImageInput = this.form.locator('input[type="file"]');
    this.emailInput = this.form.getByLabel("Correo electrónico*");
    this.passwordInput = this.form.getByRole("textbox", { name: "Introduce la constraseña" });
    this.confirmPasswordInput = this.form.getByRole("textbox", { name: "Confirmar contraseña" });
    this.submitButton = this.form.getByRole("button", { name: "Regístrate" });
    this.confirmationMessage = page.locator("div.congratulations");
    this.validationContainer = page.locator("#gform_34_validation_container");
    this.mapLoadingIndicator = this.form.locator('#map-container');
  }

  // Métodos de acción
  async goto() {
    await this.page.goto(`${config.URL_BASE}/alta-usuario/`);
    await expect(this.form).toBeVisible();
  }

  async fillForm(data: RegistrationData) {
    await this.page.waitForLoadState("networkidle"); // Esperar a cargar el mapa
    if (data.nombre !== undefined) await this.nombreInput.fill(data.nombre);
    if (data.apellidos !== undefined) await this.apellidosInput.fill(data.apellidos);
    if (data.telefonoMovil !== undefined) await this.telefonoMovilInput.fill(data.telefonoMovil);
    if (data.fechaNacimiento) {
      await this.diaNacimientoSelect.selectOption(data.fechaNacimiento.dia);
      await this.mesNacimientoSelect.selectOption(data.fechaNacimiento.mes);
      await this.anioNacimientoSelect.selectOption(data.fechaNacimiento.anio);
    }
    if (data.nombrePublico !== undefined) await this.nombrePublicoInput.fill(data.nombrePublico);
    if (data.presentacion !== undefined) await this.presentacionTextarea.fill(data.presentacion);
    if (data.ubicacion !== undefined) await this.ubicacionInput.fill(data.ubicacion);
    if (data.direccion !== undefined) {
      // Esperamos a que el indicador "Cargando..." del mapa desaparezca.
      await expect(this.mapLoadingIndicator).toBeVisible({ timeout: 10000 });
      await this.direccionInput.fill(data.direccion);
    }
    if (data.email !== undefined) await this.emailInput.fill(data.email);
    if (data.password !== undefined) await this.passwordInput.fill(data.password);
    if (data.confirmPassword !== undefined) await this.confirmPasswordInput.fill(data.confirmPassword);

    // Rellenar campos comunes o con valores por defecto
    await this.nacionalidadSelect.selectOption({ label: "Argentina" });
    await this.profileImageInput.setInputFiles(this.imagePath);
    if (data.direccion !== undefined) await this.direccionInput.fill(data.direccion);
  }

  async submit() {
    await this.submitButton.click();
  }

  // Métodos de aserción/verificación
  async verifySuccess(expectedMessage: string) {
    await expect(this.confirmationMessage).toContainText(expectedMessage, { timeout: 10000 });
  }

  async verifyError(expectedMessages: string | string[]) {
    await expect(this.validationContainer).toBeVisible();
    const messages = Array.isArray(expectedMessages) ? expectedMessages : [expectedMessages];
    for (const message of messages) {
      await expect(this.validationContainer).toContainText(message);
    }
  }
}
