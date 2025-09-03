 # Documentación y Guía para Pruebas con Playwright
 
 Esta guía te ayudará a entender cómo ejecutar las pruebas existentes y cómo crear nuevas siguiendo las mejores prácticas y las convenciones establecidas en el proyecto.
 
 ## 1. Prerrequisitos
 
 Antes de poder ejecutar las pruebas, es necesario instalar todas las dependencias del proyecto. Esto solo se necesita hacer una vez, o cada vez que se añadan nuevas dependencias.
 
 ```bash
 npm install
 ```
 
 Este comando lee el archivo `package.json` y descarga las librerías necesarias, como Playwright, en la carpeta `node_modules`.
 
 ## 2. Cómo Ejecutar las Pruebas
 
 El archivo `package.json` tiene scripts preconfigurados para facilitar la ejecución de las pruebas de Playwright.
 
 ### 2.1. Ejecutar Todas las Pruebas
 
 -   **Ejecutar todas las pruebas en modo headless (sin interfaz gráfica):**
     ```bash
     npm test
     ```
     Este es el comando ideal para entornos de integración continua (CI) o para una ejecución rápida.
 
 -   **Ejecutar todas las pruebas con navegador (headed):**
     ```bash
     npm run headed
     ```
     Usa este comando para ver la ejecución de las pruebas en un navegador real.
 
 -   **Ejecutar en modo debug:**
     ```bash
     npm run debug
     ```
     Este comando abre el Playwright Inspector, una herramienta muy potente que te permite depurar tus pruebas paso a paso, inspeccionar selectores y ver logs.
 
 ### 2.2. Ejecutar un Archivo o Test Específico
 
 Para agilizar el desarrollo, puedes ejecutar un único archivo de prueba o incluso un test específico dentro de un archivo.
 
 #### Por nombre de archivo
 
 Simplemente añade la ruta al archivo después del comando `npx playwright test`.
 
 -   **Modo normal (headless):**
     ```bash
     npx playwright test specs/login-modal.spec.ts
     ```
 -   **Modo con navegador (headed):**
     ```bash
     npx playwright test specs/login-modal.spec.ts --headed
     ```
 -   **Modo debug:**
     ```bash
     npx playwright test specs/login-modal.spec.ts --debug
     ```
 
 #### Por título del test
 
 Usa la opción `-g` (grep) para ejecutar tests que coincidan con un texto en su título.
 
 ```bash
 # Ejecuta el test "Login fallido..." en modo headed
 npx playwright test -g "Login fallido" --headed
 ```
 
 #### Por número de línea
 
 Puedes ejecutar el test que se encuentre en una línea específica de un archivo.
 
 ```bash
 # Ejecuta el test que está en la línea 5 del archivo
 npx playwright test specs/login-modal.spec.ts:5 --headed
 ```
 
 ## 3. Reglas para Crear Nuevas Pruebas
 
 Para mantener el proyecto organizado y escalable, seguiremos el patrón de diseño **Page Object Model (POM)** y una nomenclatura de archivos específica.
 
 ### 3.1. Estructura de Directorios
 
 La configuración (`playwright.config.ts`) establece que el directorio principal de pruebas es `testing-ui-rbiu/`. Dentro de este, la estructura recomendada es:
 
 ```
 testing-ui-rbiu/
 ├── pages/          # Directorio para los Page Object Models (POM)
 │   └── LoginPage.ts
 │   └── RegisterPage.ts
 │   └── ...
 └── specs/          # Directorio para los archivos de prueba
     └── login-modal.spec.ts
     └── register-user.spec.ts
     └── ...
 ```
 
 -   **`pages/`**: Aquí vivirán las clases que representan las páginas de tu aplicación. Cada clase encapsulará los selectores y las acciones específicas de una página (Ej: `LoginPage`, `HomePage`).
 -   **`specs/`**: Aquí se colocarán los archivos de prueba (`*.spec.ts`) que usarán las clases de los POM para realizar las aserciones.
 
 ### 3.2. Nomenclatura de Archivos de Prueba
 
 La configuración de Playwright (`playwright.config.ts`) define dos tipos de proyectos de prueba basados en si requieren autenticación o no. La nomenclatura del archivo es crucial para que Playwright sepa cuál ejecutar en cada caso.
 
 -   **Pruebas que NO requieren autenticación:**
     -   Deben terminar en `.spec.ts`.
     -   **Ejemplo:** `login-modal.spec.ts`, `contact-form.spec.ts`.
 
 -   **Pruebas que SÍ requieren autenticación:**
     -   Deben terminar en `.auth.spec.ts`.
     -   **Ejemplo:** `edit-profile.auth.spec.ts`, `create-post.auth.spec.ts`.
 
 Playwright ejecutará primero el archivo `auth.setup.ts` para iniciar sesión y guardar el estado, y luego ejecutará todos los archivos `.auth.spec.ts` usando ese estado de autenticación.
 
 ### 3.3. Implementando el Page Object Model (POM)
 
 El POM nos ayuda a crear un código más limpio, reutilizable y fácil de mantener, separando la lógica de la página de la lógica de la prueba.
 
 A continuación, se muestra un ejemplo de cómo crear un POM para la página de login y cómo usarlo en un test.
 
 **1. Crear el archivo del Page Object (`pages/LoginPage.ts`)**
 
 Este archivo contendrá una clase que representa la página o el modal de login.
 
 ```typescript
 import { type Page, type Locator, expect } from "@playwright/test";
 import { config } from "../config/configs";
 
 export class LoginPage {
   // Propiedades de la clase
   readonly page: Page;
   readonly emailInput: Locator;
   readonly passwordInput: Locator;
   readonly loginButton: Locator;
   readonly errorMessage: Locator;
   readonly forgotPasswordLink: Locator;
   readonly registerLink: Locator;
 
   constructor(page: Page) {
     this.page = page;
 
     // Selectores
     this.emailInput = page.getByPlaceholder("Correo electrónico o usuario");
     this.passwordInput = page
       .locator("#mb-login_form_container")
       .getByPlaceholder("Contraseña");
     this.loginButton = page.getByRole("button", { name: /iniciar sesión/i });
     this.errorMessage = page.locator("#mb-login_form_container p", {
       hasText: "Su intento de inicio de sesión no tuvo éxito",
     });
     this.forgotPasswordLink = page.getByRole("link", {
       name: "¿Olvidó su contraseña?",
     });
     this.registerLink = page.getByRole("link", {
       name: "Regístrate desde aquí",
     });
   }
 
   // Métodos de acción
   async goto() {
     await this.page.goto(`${config.URL_BASE}`);
   }
 
   async login(email: string, password_e: string) {
     await this.emailInput.fill(email);
     await this.passwordInput.fill(password_e);
     await this.loginButton.click();
   }
 
   async clickForgotPassword() {
     await this.forgotPasswordLink.click();
   }
 
   async clickRegister() {
     await this.registerLink.click();
   }
 
   // Métodos de aserción
   async expectErrorMessage() {
     await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
   }
 }
 ```
 
 **2. Usar el POM en el Test (`specs/login-modal.spec.ts`)**
 
 Ahora, el test es más legible y mantenible.
 
 ```typescript
 import { test, expect } from "@playwright/test";
 import { config } from "../config/configs";
 import { LoginPage } from "../pages/LoginPage";
 
 test.describe("Modal de login", () => {
   test("Login fallido con modal por credenciales incorrectos", async ({
     page,
   }) => {
     const loginPage = new LoginPage(page);
     await loginPage.goto();
 
     const credentials = {
       email: "correo@ejemplo.com",
       password: "contraseña123",
     };
 
     await loginPage.login(credentials.email, credentials.password);
 
     await loginPage.expectErrorMessage();
   });
 
   // ... otros tests usando los métodos de LoginPage
 });
 ```