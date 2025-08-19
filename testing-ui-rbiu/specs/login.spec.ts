import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login-page";
import { HeaderPage } from "../pages/header-page";
import { config } from "../config/configs";

test.describe("Login de Usuarios", () => {
  let loginPage: LoginPage;
  let headerPage: HeaderPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    headerPage = new HeaderPage(page);
    await loginPage.goto();
  });

  test("Login exitoso con credenciales válidas", async ({ page }) => {
    await loginPage.login(config.EMAIL, config.PASSWORD);
    await loginPage.verifySuccessfulLogin();
    // Opcional: Verificar que los elementos de usuario logueado son visibles
    const containers = headerPage.getContainersFromNabBar();
    for (const container of containers) {
      await expect(container).toBeVisible();
    }
  });

  // Casos de prueba para login fallido
  const invalidLoginData = [
    {
      case: "contraseña incorrecta",
      email: config.EMAIL,
      password: "contraseñaIncorrecta",
    },
    {
      case: "usuario no registrado",
      email: "usuarioNoRegistrado@example.com",
      password: "password123",
    },
    { case: "campos vacíos", email: "", password: "" },
  ];

  for (const data of invalidLoginData) {
    test(`Login fallido con ${data.case}`, async () => {
      await loginPage.login(data.email, data.password);
      await loginPage.verifyErrorMessage(
        "Su intento de inicio de sesión no tuvo éxito. Inténtalo de nuevo."
      );
    });
  }
});
