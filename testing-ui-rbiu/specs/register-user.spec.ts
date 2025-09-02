import { test, expect } from "@playwright/test";
import { config } from "../config/configs";
import { RegisterPage, type RegistrationData } from "../pages/register-page";

// =================================================================================
//        VERIFICA LA NAVEGACION A LA PAGINA DE ALTA USUARIO DESDE EL MODAL
// =================================================================================
test("Navegar a la página de registro desde el modal de login", async ({
  page,
}) => {
  // Este test ahora solo navega y verifica la URL.
  // La lógica de rellenar el formulario se ha movido a los tests parametrizados.
  await page.goto(`${config.URL_BASE}`);
  // Esperar y llenar la contraseña (modal)
  // Acotar la búsqueda al contenedor del formulario para evitar ambigüedad
  const loginForm = page.locator("#mb-login_form_container");
  const signUp = loginForm.getByText("Regístrate desde aquí");
  await expect(signUp).toBeVisible();
  await signUp.click();

  await expect(page).toHaveURL(/.*\/alta-usuario\//);
});

// --- Tests de Escenarios de Registro ---
interface TestCase {
  testName: string;
  data: RegistrationData;
  expectedOutcome: "success" | "error";
  expectedMessage?: string;
  expectedMessages?: string[];
}

const testCases: TestCase[] = [
  {
    testName: "Fallo al registrar con todos los campos vacíos",
    data: {}, // No se proporciona ningún dato para rellenar
    expectedOutcome: "error",
    // Array con todos los mensajes de error esperados del contenedor de validación
    expectedMessages: [
      "Nombre: Este campo es obligatorio.",
      "Apellidos: Este campo es obligatorio.",
      "Teléfono móvil: Este campo es obligatorio.",
      "Fecha de nacimiento: Debes indicar tu fecha de nacimiento!",
      "Nombre público: Este campo es obligatorio.",
      "Dirección: Este campo es obligatorio.",
      "Correo electrónico: El formato del correo electrónico no es válido!",
      "Contraseña: Este campo es obligatorio.",
    ],
  },
  {
    testName: "Fallo al registrar con un campo requerido vacío (Nombre)",
    data: {
      nombre: "", // Campo requerido vacío
      apellidos: "White Smith",
      telefonoMovil: "71457000",
      fechaNacimiento: { dia: "1", mes: "12", anio: "2000" },
      nombrePublico: "JadenXR",
      presentacion: "Soy un gamer muy cotizado en el mundo extraterrestre", // campo opcional
      direccion: "Cochabamba",
      email: `test.user.${Date.now()}@example.com`,
      password: "IpssoftSicilia2019!",
      confirmPassword: "IpssoftSicilia2019!",
    },
    expectedOutcome: "error",
    // El mensaje de error puede variar, ajústalo según tu aplicación.
    expectedMessage: "Nombre: Este campo es obligatorio.",
  },
  {
    testName: "Fallo al registrar con celular ya existente",
    data: {
      nombre: "Jaden",
      apellidos: "White Smith",
      telefonoMovil: "74440470", // Este celuar debe ser existente
      fechaNacimiento: { dia: "1", mes: "12", anio: "2000" },
      nombrePublico: "JadenXR",
      presentacion: "Soy un gamer muy cotizado en el mundo extraterrestre", // campo opcional
      direccion: "Cochabamba",
      email: `test.user.${Date.now()}@example.com`,
      password: "IpssoftSicilia2019!",
      confirmPassword: "IpssoftSicilia2019!", // Contraseña incorrecta
    },
    expectedOutcome: "error",
    // El mensaje de error puede variar, ajústalo según tu aplicación.
    expectedMessage: "Teléfono móvil: Este número de teléfono ya está en uso.",
  },
  {
    testName: "Fallo al registrar con correo existente",
    data: {
      nombre: "Jaden",
      apellidos: "White Smith",
      telefonoMovil: `71${Math.floor(100000 + Math.random() * 900000)}`, // Teléfono único para no chocar con otro error
      fechaNacimiento: { dia: "1", mes: "12", anio: "2000" },
      nombrePublico: "JadenXR",
      presentacion: "Soy un gamer muy cotizado en el mundo extraterrestre", // campo opcional
      direccion: "Cochabamba",
      email: `crocha@fundacioequilibri.org`, // Este correo debe existir
      password: "IpssoftSicilia2019!",
      confirmPassword: "IpssoftSicilia2019!",
    },
    expectedOutcome: "error",
    // El mensaje de error puede variar, ajústalo según tu aplicación.
    expectedMessage:
      "Correo electrónico: Este correo electrónico ya está registrado. Por favor, utilice otro correo.",
  },
  {
    testName: "Fallo al registrar con contraseñas que no coinciden",
    data: {
      nombre: "Jaden",
      apellidos: "White Smith",
      telefonoMovil: "71457000",
      fechaNacimiento: { dia: "1", mes: "12", anio: "2000" },
      nombrePublico: "JadenXR",
      presentacion: "Soy un gamer muy cotizado en el mundo extraterrestre", // campo opcional
      direccion: "Cochabamba",
      email: `test.user.${Date.now()}@example.com`,
      password: "IpssoftSicilia2019!",
      confirmPassword: "DIFFERENTPassword123!", // Contraseña incorrecta
    },
    expectedOutcome: "error",
    // El mensaje de error puede variar, ajústalo según tu aplicación.
    expectedMessage: "Contraseña: Tus contraseñas no concuerdan.",
  },
  {
    testName: "Registro exitoso con datos válidos",
    data: {
      nombre: "Jaden",
      apellidos: "White Smith",
      telefonoMovil: `71${Math.floor(100000 + Math.random() * 900000)}`,
      fechaNacimiento: { dia: "1", mes: "12", anio: "2000" },
      nombrePublico: "JadenXR",
      presentacion: "Soy un gamer muy cotizado en el mundo extraterrestre", // campo opcional
      direccion: "Sucre",
      email: `test.user.${Date.now()}@example.com`, // Email único para cada ejecución
      password: "IpssoftSicilia2019!",
      confirmPassword: "IpssoftSicilia2019!",
    },
    expectedOutcome: "success",
    // El mensaje de éxito puede variar, ajústalo según tu aplicación.
    expectedMessage:
      "Un correo fue enviado a su gmail, para verificar su cuenta.",
  },
];

test.describe("Pagina de registro de usuarios /alta-usuario", () => {
  for (const tc of testCases) {
    test(`Escenario: ${tc.testName}`, async ({ page }) => {
      const registerPage = new RegisterPage(page);
      await registerPage.goto();

      // Rellenar el formulario usando el método del Page Object
      await registerPage.fillForm(tc.data);

      // Enviar el formulario
      await registerPage.submit();

      // --- VERIFICACIÓN DE RESULTADOS USANDO MÉTODOS DEL PAGE OBJECT ---
      if (tc.expectedOutcome === "success") {
        // El test solo le pide al Page Object que verifique el éxito. No sabe cómo lo hace.
        await registerPage.verifySuccess(tc.expectedMessage!);
      } else {
        // El test le pide al Page Object que verifique el error, pasándole el/los mensaje(s).
        // Combinamos `expectedMessages` y `expectedMessage` para pasarlos al método de verificación.
        const errorMessages = tc.expectedMessages || tc.expectedMessage;
        if (errorMessages) {
          await registerPage.verifyError(errorMessages);
        } else {
          // Opcional: lanzar un error si un test de tipo 'error' no define un mensaje esperado.
          throw new Error(
            `Test case "${tc.testName}" is expected to fail but has no expectedMessage or expectedMessages.`
          );
        }
      }
    });
  }
});
