import { test, expect } from "@playwright/test";
import path from "path";

import { MyNeedsPage } from "../pages/my-needs-page";
import { EditNeedPage } from "../pages/edit-need-page";
import { CreateNeedPage, NeedData } from "../pages/create-need-page";

test.describe("Página de Mis Necesidades /mis-necesidades (Auth)", () => {
  let needData: NeedData;
  let myNeedsPage: MyNeedsPage;
  let editNeedPage: EditNeedPage;
  let createNeedPage: CreateNeedPage;

  test.beforeEach(async ({ page }) => {
    myNeedsPage = new MyNeedsPage(page);
    editNeedPage = new EditNeedPage(page);
    createNeedPage = new CreateNeedPage(page);

    // Generamos datos únicos para cada test para evitar colisiones.
    needData = {
      name: `Producto de Prueba ${Date.now()}`,
      needDetails:
        "Descripción detallada del producto de prueba. esta descripcion es de test",
      reasonNeed: "Necesito un avión para mis viajes de negocios.",
      minPrice: "15.050",
      maxPrice: "20.000",
      visible: "Sí",
      category: "Transportes y desplazamientos",
      imagePath: path.resolve(__dirname, "../../assets/product.jpg"),
    };
  });

  test.afterEach(async () => {
    // Limpieza: Este hook se ejecuta después de cada test para eliminar la necesidad creada.
    // Esto asegura que los tests no interfieran entre sí y que el entorno quede limpio.
    await myNeedsPage.goto();
    // Usamos un `if` para evitar errores si el test falló antes de crear la necesidad.
    if (await myNeedsPage.isNeedListed(needData.name)) {
      await myNeedsPage.editNeed(needData.name);
      await editNeedPage.verifyPageLoaded();
      await editNeedPage.deleteNeed();
    }
  });

  test('Verifica que el boton "Crea una necesidad" exista y navegue a la página de creación', async ({
    page,
  }) => {
    // 1. Navegar a la página "Mis Necesidades"
    await myNeedsPage.goto();
    // 2. Verificar que el botón es visible
    await myNeedsPage.verifyButtonCreateNeedIsVisible();
    // 3. Hacer clic en el botón
    await myNeedsPage.clickButtonCreateNeed();
    // 4. Verificar que la URL es la correcta después del clic
    await expect(page).toHaveURL(/.*\/crea-una-necesidad\/?/);
  });

  test("Debería mostrar una necesidad recién creada en la lista de 'Mis Necesidades'", async () => {
    // Arrange: Crear una nueva necesidad.
    await createNeedPage.goto();
    await createNeedPage.fillForm(needData);
    await createNeedPage.submit();
    await createNeedPage.verifySuccess(needData.name);

    // Act: Navegar a la página "Mis Necesidades".
    await myNeedsPage.goto();

    // Assert: Verificar que la necesidad creada está visible en la lista con los datos correctos.
    await myNeedsPage.verifyNeedIsListed(
      needData.name,
      needData.minPrice,
      needData.maxPrice
    );
  });

  test("Se puede eliminar una necesidad desde la página de edición", async () => {
    // Arrange: Crear una necesidad para asegurarnos de que existe algo que eliminar.
    await createNeedPage.goto();
    await createNeedPage.fillForm(needData);
    await createNeedPage.submit();
    await createNeedPage.verifySuccess(needData.name);

    // Assert: Verificar que la necesidad ya no aparece en la lista y que fuimos redirigidos correctamente.
    await myNeedsPage.verifyNeedIsNotListed(needData.name);
  });
});
