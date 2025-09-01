import { test, expect } from "@playwright/test";
import { ProductDetailsPage } from "../pages/product-details-page";
import { ProductsPage } from "../pages/products-page";
import { MyProductsPage } from "../pages/my-products-page";
import { CreateProductPage, ProductData } from "../pages/create-product-page";
import { EditProductPage } from "../pages/edit-product-page";
import path from "path";

test.describe("Página de Detalles del Producto - Usuario Autenticado", () => {
  let productDetailsPage: ProductDetailsPage;
  let myProductsPage: MyProductsPage;
  let productsPage: ProductsPage;
  let createProductPage: CreateProductPage;
  let editProductPage: EditProductPage;
  let product: ProductData;
  let productWasCreated: boolean;

  test.beforeEach(async ({ page }) => {
    // Inicializar todos los Page Objects necesarios para los tests
    productsPage = new ProductsPage(page);
    productDetailsPage = new ProductDetailsPage(page);
    myProductsPage = new MyProductsPage(page);
    createProductPage = new CreateProductPage(page);
    editProductPage = new EditProductPage(page);
    productWasCreated = false; // Reiniciar el flag antes de cada test
    // Usamos datos únicos para cada ejecución del test para evitar conflictos
    product = {
      name: `Producto de Test ${Date.now()}`,
      price: "150,50",
      description: "Descripción detallada del producto de prueba.",
      deliveryDetails: "Detalles de entrega",
      imagePath: path.join(__dirname, "../../assets/SAMSUNG-S24.jpg"),
      quantity: "10",
      expirationDate: {
        day: `20`,
        month: `12`,
        year: `2025`,
      },
      visible: "Sí",
      reservable: "Sí",
    };

    // Cada test creará su propio producto para asegurar que son independientes y no dependen de datos preexistentes.
  });

  test.afterEach(async ({ page }) => {
    // El hook afterEach se ejecuta después de cada test, incluso si este falla.
    // Es el lugar ideal para la limpieza de datos.
    if (productWasCreated) {
      // Navegamos a la página de "Mis Productos" para empezar la limpieza.
      await myProductsPage.goto();

      // Solo intentamos borrar si el producto todavía existe.
      if (await myProductsPage.isProductListed(product.name)) {
        await myProductsPage.editProduct(product.name); //Click en el producto
        await editProductPage.verifyPageLoaded();
        await editProductPage.deleteProduct();
        // Verificamos que la redirección post-borrado fue exitosa.
        await myProductsPage.verifyProductIsNotListed(product.name);
      }
    }
  });

  test("Debería mostrar los detalles correctos de un producto recién creado", async ({
    page,
  }) => {
    // Arrange: Crear un producto para asegurar un estado conocido y predecible.
    await createProductPage.goto();
    await createProductPage.fillForm(product);
    await createProductPage.submit();
    await createProductPage.verifySuccess(product.name);
    productWasCreated = true; // Marcamos que el producto fue creado para que afterEach lo limpie.
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
  });

  test("Debería permitir navegar a la página de edición si el usuario es el propietario Button: Editar producto", async ({
    page,
  }) => {
    // Arrange: Crear un producto que vamos a editar.
    await createProductPage.goto();
    await createProductPage.fillForm(product);
    await createProductPage.submit();
    await createProductPage.verifySuccess(product.name);
    productWasCreated = true; // Marcamos que el producto fue creado para que afterEach lo limpie.

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

    // Verificamos que el botón de editar es visible y el de intercambiar no.
    await expect(productDetailsPage.editProductButton).toBeVisible();
    await expect(productDetailsPage.startExchangeButton).not.toBeVisible();
    await productDetailsPage.clickButtonEditProduct();

    // Assert: Verificar que hemos llegado a la página de edición y que contiene los datos del producto.
    await editProductPage.verifyPageLoaded();
  });

  // test("Debería permitir iniciar un intercambio si el usuario es no el propietario Button: Iniciar intercambio", async ({
  //   page,
  // }) => {
  //   // Arrange: Crear un producto que vamos a editar.
  //   await createProductPage.goto();
  //   await createProductPage.fillForm(product);
  //   await createProductPage.submit();
  //   await createProductPage.verifySuccess(product.name);
  //   productWasCreated = true; // Marcamos que el producto fue creado para que afterEach lo limpie.

  //   // Act: Navegar a la página de  ->  /mercado    donde se listan todos los productos de todos los usuarios
  //   await productsPage.goto();
  //   await productsPage.searchProduct(product.name);
  //   await productsPage.verifyProductIsVisible(product.name);
  //   await productsPage.clickProduct(product.name); // Esto navega a prduct/?id=400  ejemplo

  //   // Assert: Verificar que los detalles mostrados en la página son los correctos.
  //   await productDetailsPage.verifyPageLoaded();
  //   // En la ruta dinamica de /product?id= y uno o más dígitos". busca el patron
  //   await expect(page).toHaveURL(/.*\/producto\/\?id=\d+/);
  //   await expect(productDetailsPage.productTitle).toHaveText(product.name);
  //   // Usamos toContainText para el precio por si la UI le añade símbolos como '€' o '$'.
  //   await expect(productDetailsPage.productPrice).toContainText(product.price);

  //   // Verificamos que el botón de editar es visible y el de intercambiar no.
  //   await expect(productDetailsPage.editProductButton).not.toBeVisible();
  //   await expect(productDetailsPage.startExchangeButton).toBeVisible();
  //   // Hacer click en el boton de Iniciar Intercambio
  // });
});
