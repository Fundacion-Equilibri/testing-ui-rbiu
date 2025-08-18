# 📝 Apuntes y Guías Rápidas de Playwright

Este documento sirve como una guía de referencia rápida para los comandos y conceptos más comunes de Playwright.

---

## 🎯 Guía de Selectores (Cheat Sheet)

Localizar elementos de forma precisa es clave para crear pruebas robustas. Aquí tienes los métodos más recomendados, ordenados de más a menos prioritario.

### 1. Por Roles de Accesibilidad (`getByRole`)
**El más recomendado.** Se basa en cómo los usuarios y tecnologías de asistencia perciben la página. Es el más resiliente a cambios de estructura.

```ts
// Un botón con un nombre específico
page.getByRole('button', { name: /iniciar sesión/i });

// Un campo de texto asociado a una etiqueta
page.getByRole('textbox', { name: 'Correo electrónico' });

// Un enlace
page.getByRole('link', { name: 'Ver producto' });
```

### 2. Por Texto Visible (`getByText`)
Útil para localizar elementos no interactivos como párrafos, títulos o mensajes de error.

```ts
// Texto exacto (sensible a mayúsculas)
page.getByText('Producto añadido al carrito');

// Subcadena de texto (insensible a mayúsculas con una expresión regular)
page.getByText(/intento de inicio de sesión no tuvo éxito/i);
```

### 3. Por Placeholder (`getByPlaceholder`)
Específico para campos de entrada (`input`, `textarea`).

```ts
page.getByPlaceholder('Correo electrónico o usuario');
```

### 4. Por ID (`locator('#mi-id')`)
Rápido y fiable si los IDs son únicos y estables.

```ts
page.locator('#mb-login_form_container');
```

### 5. Combinando Selectores (Encadenamiento)
Para acotar la búsqueda a un área específica de la página (un formulario, un modal, una tarjeta de producto).

```ts
// Buscar un botón solo dentro del modal de login
const loginModal = page.locator('#login-modal');
loginModal.getByRole('button', { name: 'Acceder' }).click();

// Localizar la fila de un producto y luego obtener su precio
const productRow = page.locator('article', { hasText: 'Mi Producto Increíble' });
const price = await productRow.locator('.price').innerText();
```

### 6. Selectores CSS (Como último recurso)
Cuando los métodos anteriores no son suficientes, puedes recurrir a selectores CSS.

```ts
// Por clase
page.locator('.clase-principal .sub-clase');
```

---

## 🚀 Cómo Ejecutar Pruebas

Controla exactamente qué pruebas se ejecutan y cómo se ejecutan desde la terminal.

### Modos de Ejecución
Playwright puede correr en diferentes modos. Estos comandos se definen en tu `package.json`.

*   **Ejecutar todas las pruebas (modo headless):** Rápido y ideal para CI/CD.
    ```bash
    npm test
    ```
*   **Ejecutar con navegador visible (modo headed):** Para ver la ejecución en tiempo real.
    ```bash
    npm run headed
    ```
*   **Ejecutar en modo depuración (debug):** Pausa la ejecución en cada paso y te da herramientas para inspeccionar.
    ```bash
    npm run debug
    ```

### Filtrar Pruebas Específicas
No siempre necesitas correr toda la suite.

*   **Por nombre de archivo:**
    ```bash
    # Ejecuta todos los tests dentro de my-products.auth.spec.ts
    npx playwright test testing-ui-rbiu/specs/my-products.auth.spec.ts
    ```
*   **Por título del test (`-g` o `--grep`):**
    ```bash
    # Ejecuta solo el test que contenga "Se puede eliminar" en su título
    npx playwright test -g "Se puede eliminar"
    ```
*   **Por número de línea:**
    ```bash
    # Ejecuta el test que está en la línea 55 del archivo especificado
    npx playwright test testing-ui-rbiu/specs/my-products.auth.spec.ts:55
    ```

### Pruebas que Requieren Autenticación
**No necesitas hacer nada especial.** Gracias a la configuración de `projects` en `playwright.config.ts`, cuando ejecutas un archivo que coincide con el `testMatch` del proyecto `authenticated` (ej. `*.auth.spec.ts`), Playwright automáticamente ejecutará primero el `setup` del que depende.

```bash
# Playwright sabe que este test necesita login y ejecutará el setup primero
npx playwright test testing-ui-rbiu/specs/my-products.auth.spec.ts
```

