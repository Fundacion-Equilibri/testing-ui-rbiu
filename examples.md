# 🎯 Playwright Selectors Cheat Sheet

> Guía rápida para localizar elementos de forma precisa y evitar errores de *strict mode*.

---

## 1️⃣ Por ID (lo más rápido y único)
```ts
// Por ID exacto
page.locator('#mi-id-unico')

// Ejemplo real
page.locator('#mb-login_form_container')
```

## 2️⃣ Por clase CSS
```ts
// Por una clase
page.locator('.mi-clase')

// Por múltiples clases
page.locator('.clase1.clase2')
```

## 3️⃣ Por etiqueta HTML
```ts
// Todos los párrafos
page.locator('p')

// Todos los botones
page.locator('button')
```

## 4️⃣ Por atributo
```ts
// Atributo exacto
page.locator('[placeholder="Correo electrónico"]')

// Contiene texto en atributo
page.locator('[placeholder*="Correo"]')

// Empieza por...
page.locator('[id^="user_"]')

// Termina en...
page.locator('[id$="_container"]')
```

## 5️⃣ Por texto
```ts
// Texto exacto
page.getByText('Iniciar sesión')

// Contiene texto
page.getByText('Iniciar', { exact: false })
```

## 6️⃣ Por rol y nombre accesible
```ts
page.getByRole('button', { name: 'Iniciar sesión' })
page.getByRole('textbox', { name: 'Correo electrónico' })
```

## 7️⃣ Usando contenedor padre
```ts
// P dentro de un contenedor específico
page.locator('#mb-login_form_container p')

// Solo inputs dentro del modal
page.locator('.modal-content input')
```

## 8️⃣ Filtros de selección
```ts
page.locator('input').first()
page.locator('input').nth(1)
page.locator('input').last()
```

## 9️⃣ Combinando has o hasText
```ts
// Elemento que contiene un texto
page.locator('p', { hasText: 'Error' })

// Div que contiene un botón específico
page.locator('div', { has: page.getByRole('button', { name: 'Enviar' }) })
```

## 🔟 Selectores CSS avanzados
```ts
// Hijo directo
page.locator('div > p')

// Hermano adyacente
page.locator('h2 + p')

// Descendientes combinados
page.locator('form#login input[type="password"]')
```
