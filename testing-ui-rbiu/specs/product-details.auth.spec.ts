import path from "path";
import { test, expect, type BrowserContext, type Page } from "@playwright/test";
 
import { ProductDetailsPage } from "../pages/product-details-page";
import { ProductsPage } from "../pages/products-page";
import { LoginPage } from "../pages/login-page";
import { MyProductsPage } from "../pages/my-products-page";
import { CreateProductPage, ProductData } from "../pages/create-product-page";
import { EditProductPage } from "../pages/edit-product-page";
import { config } from "../config/configs";
 
test.describe("Página de Detalles del Producto - Usuario Autenticado  /producto/?id=", () => {
  // let loginPage = LoginPage; No se usa, se puede eliminar.
  let productDetailsPage: ProductDetailsPage;
  let myProductsPage: MyProductsPage;
  let productsPage: ProductsPage;
  let createProductPage: CreateProductPage;
  let editProductPage: EditProductPage;

  test.beforeEach(async ({ page }) => {
    // Inicializar todos los Page Objects necesarios para los tests
    productsPage = new ProductsPage(page);
    productDetailsPage = new ProductDetailsPage(page);
    myProductsPage = new MyProductsPage(page);
    createProductPage = new CreateProductPage(page);
    editProductPage = new EditProductPage(page);
  });

  test("Debería mostrar los detalles correctos de un producto recién creado", async ({
    page,
  }) => {
    const product: ProductData = {
      name: `Producto Detalles ${Date.now()}`,
      price: "150,50",
      description: "Descripción detallada del producto de prueba.",
      category: "Alimentación",
      deliveryDetails: "Detalles de entrega",
      imagePath: path.join(__dirname, "../../assets/SAMSUNG-S24.jpg"),
      quantity: "10",
      expirationDate: { day: `${new Date().getDate()}`, month: `${new Date().getMonth() + 1}`, year: `${new Date().getFullYear()}` },
      visible: "Sí",
      reservable: "Sí",
    };

    // Arrange: Crear un producto para asegurar un estado conocido y predecible.
    await createProductPage.goto();
    await createProductPage.handleCookies();
    await createProductPage.fillForm(product);
    await createProductPage.submit();
    await createProductPage.verifySuccess(product.name);

    // Act: Navegar a la página de  ->  /mercado    donde se listan todos los productos de todos los usuarios
    await productsPage.goto();
    await productsPage.searchProduct(product.name);
    await productsPage.verifyProductIsVisible(product.name);
    await productsPage.clickProduct(product.name); // Esto navega a prduct/?id=400  ejemplo
    // Assert: Verificar que los detalles mostrados en la página son los correctos.
    await productDetailsPage.verifyPageLoaded();
    // En la ruta dinamica de /product?id= y uno o más dígitos". busca el patron
    await expect(page).toHaveURL(/.*\/producto\/\?id=\d+/);
    await expect(productDetailsPage.productTitle).toHaveText(product.name);
    // Usamos toContainText para el precio por si la UI le añade símbolos como '€' o '$'.
    await expect(productDetailsPage.productPrice).toContainText(product.price);

    // Teardown: Limpiar el producto creado dentro del mismo test.
    await myProductsPage.goto();
    await myProductsPage.editProduct(product.name);
    await editProductPage.verifyPageLoaded();
    await editProductPage.deleteProduct();
  });

  test("Debería permitir navegar a la página de edición si el usuario es el propietario Button: Editar producto", async ({
    page,
  }) => {
    const product: ProductData = {
      name: `Producto Edición ${Date.now()}`,
      price: "200",
      description: "Descripción para editar.",
      category: "Informática y tecnologías",
      deliveryDetails: "Detalles de entrega",
      imagePath: path.join(__dirname, "../../assets/SAMSUNG-S24.jpg"),
      quantity: "5",
      expirationDate: { day: `${new Date().getDate()}`, month: `${new Date().getMonth() + 1}`, year: `${new Date().getFullYear()}` },
      visible: "Sí",
      reservable: "No",
    };

    // Arrange: Crear un producto que vamos a editar.
    await createProductPage.goto();
    await createProductPage.handleCookies();
    await createProductPage.fillForm(product);
    await createProductPage.submit();
    await createProductPage.verifySuccess(product.name);

    // Act: Navegar a la página de  ->  /mercado    donde se listan todos los productos de todos los usuarios
    await productsPage.goto();
    await productsPage.searchProduct(product.name);
    await productsPage.verifyProductIsVisible(product.name);
    await productsPage.clickProduct(product.name); // Esto navega a product/?id=400  ejemplo

    // Assert: Verificar que los detalles mostrados en la página son los correctos.
    await productDetailsPage.verifyPageLoaded();

    await expect(productDetailsPage.productTitle).toContainText(product.name);
    await expect(productDetailsPage.productPrice).toContainText(product.price);

    // Verificamos que el botón de editar es visible y el de intercambiar no.
    await expect(productDetailsPage.editProductButton).toBeVisible();
    await expect(productDetailsPage.startExchangeButton).not.toBeVisible();
    await productDetailsPage.clickButtonEditProduct();

    // // Assert: Verificar que hemos llegado a la página de edición y que contiene los datos del producto.
    await editProductPage.verifyPageLoaded();

    // Teardown: Limpiar el producto. Ya estamos en la página de edición, así que solo borramos.
    await editProductPage.deleteProduct();
  });

  // Bloque de tests para escenarios con un segundo usuario (propietario del producto)
  test.describe("Interacción con producto de otro usuario", () => {
    let ownerContext: BrowserContext;
    let ownerPage: Page;
    let product: ProductData;

    test.beforeEach(async ({ browser }) => {
      // --- ARRANGE: Crear un producto con un USUARIO A (el propietario) ---
      product = {
        name: `Producto Intercambio ${Date.now()}`,
        price: "99,99",
        description: "Producto de otro usuario.",
        category: "Otros",
        deliveryDetails: "Entrega a convenir",
        imagePath: path.join(__dirname, "../../assets/F-22A_Raptor.jpg"),
        quantity: "1",
        expirationDate: { day: `${new Date().getDate()}`, month: `${new Date().getMonth() + 1}`, year: `${new Date().getFullYear()}` },
        visible: "Sí",
        reservable: "Sí",
      };

      // 1. Creamos un contexto de navegador aislado para el Usuario A.
      ownerContext = await browser.newContext({ storageState: undefined });
      ownerPage = await ownerContext.newPage();

      // 2. Logueamos al Usuario A.
      const ownerLoginPage = new LoginPage(ownerPage);
      await ownerLoginPage.goto();
      await ownerLoginPage.login(config.SECOND_EMAIL, config.SECOND_PASSWORD);

      // 3. El Usuario A crea el producto.
      const ownerCreateProductPage = new CreateProductPage(ownerPage);
      await ownerCreateProductPage.goto();
      await ownerCreateProductPage.fillForm(product);
      await ownerCreateProductPage.submit();
      await ownerCreateProductPage.verifySuccess(product.name);
    });

    test.afterEach(async () => {
      // --- TEARDOWN: El USUARIO A borra su propio producto ---
      if (ownerContext) {
        const ownerMyProductsPage = new MyProductsPage(ownerPage);
        const ownerEditProductPage = new EditProductPage(ownerPage);

        await ownerMyProductsPage.goto();
        await ownerMyProductsPage.editProduct(product.name);
        await ownerEditProductPage.verifyPageLoaded();
        await ownerEditProductPage.deleteProduct();

        await ownerContext.close();
      }
    });

    test("Debería permitir iniciar un intercambio si el usuario no es el propietario", async () => {
      // --- ACT: El USUARIO B (el del test) busca y accede al producto ---
      await productsPage.goto();
      await productsPage.searchProduct(product.name);
      await productsPage.verifyProductIsVisible(product.name);
      await productsPage.clickProduct(product.name);

      // --- ASSERT: Verificar los botones para el USUARIO B ---
      await productDetailsPage.verifyPageLoaded();
      await expect(productDetailsPage.editProductButton).not.toBeVisible();
      await expect(productDetailsPage.startExchangeButton).toBeVisible();

      // --- ACT: El USUARIO B inicia el intercambio ---
      await productDetailsPage.clickExchangeProduct();
    });
  });

  test(`Testeando los tabs de Vendedor | Chat`, async ({ page }) => {
    const product: ProductData = {
      name: `Producto Tabs ${Date.now()}`,
      price: "10",
      description: "Test de tabs.",
      category: "Alimentación",
      deliveryDetails: "Detalles",
      imagePath: path.join(__dirname, "../../assets/SAMSUNG-S24.jpg"),
      quantity: "1",
      expirationDate: { day: `${new Date().getDate()}`, month: `${new Date().getMonth() + 1}`, year: `${new Date().getFullYear()}` },
      visible: "Sí",
      reservable: "Sí",
    };
    // Crear un producto que vamos a editar.
    await createProductPage.goto();
    await createProductPage.fillForm(product);
    await createProductPage.handleCookies();
    await createProductPage.submit();
    await createProductPage.verifySuccess(product.name);

    // Navegar a la página de  ->  /mercado    donde se listan todos los productos de todos los usuarios
    await productsPage.goto();
    await productsPage.searchProduct(product.name);
    await productsPage.verifyProductIsVisible(product.name);
    await productsPage.clickProduct(product.name); // Esto navega a prduct/?id=400  ejemplo

    // Assert: Verificar que los detalles mostrados en la página son los correctos.
    await productDetailsPage.verifyPageLoaded();
    // En la ruta dinamica de /product?id= y uno o más dígitos". busca el patron
    await expect(page).toHaveURL(/.*\/producto\/\?id=\d+/);
    await expect(productDetailsPage.productTitle).toHaveText(product.name);
    // Usamos toContainText para el precio por si la UI le añade símbolos como '€' o '$'.
    await expect(productDetailsPage.productPrice).toContainText(product.price);

    await productDetailsPage.switchToChatTab();

    // Teardown: Limpiar el producto creado.
    await myProductsPage.goto();
    await myProductsPage.editProduct(product.name);
    await editProductPage.verifyPageLoaded();
    await editProductPage.deleteProduct();
  });
});
