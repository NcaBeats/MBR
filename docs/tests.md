# Pruebas frontend

Cobertura de componentes con Vitest + Testing Library. Los reportes se
regeneran con `pnpm coverage` y se abren en `coverage/index.html`
(directorio ignorado por git, no se versiona).

## Cómo correr

```bash
pnpm vitest run        # suite completa
pnpm coverage          # suite + reporte HTML en coverage/
```

Última ejecución: 27 archivos, 104 tests, 104 aprobados, 0 fallidos.

## Requisitos de la pauta

| Requisito | Test que lo cumple | Qué verifica |
|---|---|---|
| Renderizado: listas muestran todos los items | `test/components/games/CatalogList.test.tsx` | Renderiza cada juego de las props (`getAllBy` + longitud) |
| Renderizado condicional: error solo cuando hay error | `test/components/admin/new-user-form.test.tsx` | El error aparece al enviar y desaparece al corregir (`waitForElementToBeRemoved`) |
| Props: botón recibe label + `onClick` | `test/components/cart/CartItem.test.tsx` | Click en "remove" llama `onRemove` con el id; `GameCard.test.tsx` verifica `id` dinámico → `href` |
| Estado: el form cambia al escribir | `test/components/auth/sign-up-form.test.tsx`, `test/components/contact/contact-form.test.tsx` | Escribir actualiza cada campo (`toHaveValue`) |
| Eventos: click → estado o función | `test/components/cart/deposit-funds-sheet.test.tsx`, `test/components/games/game-detail.test.tsx` | Depósito válido llama a la action y emite `wallet:updated`; "Add to Cart" guarda en el store y notifica |

## Cobertura por vista (1 test por vista como mínimo)

| Vista | Test | Qué verifica |
|---|---|---|
| `/` | `CategoryChips.test.tsx`, `GameCard.test.tsx` | Chips y cards del home |
| `/catalog` | `CatalogList.test.tsx`, `PriceFilter.test.tsx` | Lista completa, slider de precios y navegación con el rango |
| `/cart` | `CartList.test.tsx`, `CartItem.test.tsx` | Estados carga/vacío/lleno, quitar items, checkout según login |
| `/checkout` | `checkout-summary.test.tsx`, `deposit-funds-sheet.test.tsx` | Resumen, compra ok/fallo, saldo insuficiente, depósito |
| `/library` | `LibraryCard.test.tsx` | Card con nombre y enlace |
| `/blog` | `BlogCard.test.tsx` | Card con título y extracto |
| `/games/[id]` | `game-detail.test.tsx` | Compra, estados en carrito/librería |
| `/contact` | `contact-form.test.tsx` | Validación, éxito y error del servidor |
| `/log-in` | `PasswordInput.test.tsx`, `google-sign-in-button.test.tsx` | Alternar visibilidad de contraseña; el botón de Google envía el credential a la action |
| `/sign-up` | `sign-up-form.test.tsx`, `google-onboarding-form.test.tsx` | Estado y errores de requerido; precarga de nickname y validación del onboarding |
| `/sign-up/google` | `google-onboarding-form.test.tsx` | RUN inválido, nickname/dirección requeridos |
| `/admin/games/[id]` | `game-edit-form.test.tsx` | Edición y payload por categorías |
| `/admin/users/new`, `/admin/users/[id]` | `new-user-form.test.tsx`, `user-edit-form.test.tsx` | Creación, validación, región/comuna, rol |
| `/admin/blogs` (lista, nuevo, detalle) | `blog-form.test.tsx` | Validación, categoría y payload |
| `/studio/games` | `row-actions.test.tsx` (`studio-game`) | Acciones por fila |
| `/studio/games/new` | `new-game-form.test.tsx` | Campos, categorías y validación sin imagen |
| Búsqueda global | `SearchBar.test.tsx` | Resultados, vacío, navegación por teclado/mouse |
| Paginación | `Pagination.test.tsx` | Página actual, hrefs, estados |
| Lógica sin DOM | `test/lib/regions.test.ts` | Catálogo de regiones/comunas y errores de fetch |
| Redirects post-login | `test/lib/auth-redirect.test.ts` | `safeInternalPath` rechaza URLs externas; home por rol |

## Cobertura por componente (% líneas, `pnpm coverage`)

| Componente | Líneas |
|---|---|
| `GameCard.tsx` | 100% |
| `CatalogList.tsx` | 100% |
| `CategoryChips.tsx` | 100% |
| `LibraryCard.tsx` | 100% |
| `BlogCard.tsx` | 100% |
| `CartItem.tsx` | 100% |
| `PasswordInput.tsx` | 100% |
| `PriceFilter.tsx` | 100% |
| `Pagination.tsx` | 100% |
| `ContactForm.tsx` | 95.23% |
| `SearchBar.tsx` | 93.05% |
| `NewUserForm.tsx` | 92.72% |
| `CheckoutSummary.tsx` | 91.83% |
| `DepositFundsSheet.tsx` | 91.66% |
| `CartList.tsx` | 91.3% |
| `cart-store.ts` | 86.36% |
| `BlogForm.tsx` | 77.14% |
| `regions.ts` | 68.75% |
| `UserEditForm.tsx` | 66.66% |
| `sign-up/page.tsx` | 51.21% |
| `NewGameForm.tsx` | 42.85% |
| `GameDetail.tsx` | 39.62% |

Global: 60.81% líneas (691/1166). El global incluye páginas, actions y
clientes API sin tests; la métrica por componente es la que refleja el
alcance real de la suite.

## Convenciones usadas

- Queries por `screen` (`getByRole`, `getByLabelText`, `getByPlaceholderText`,
  `findBy*` para lo asíncrono). `container` solo para afirmar DOM vacío.
- `fireEvent` para interacciones mecánicas, `userEvent` donde se necesita
  comportamiento real (selects, combobox, navegación por teclado).
- Mocks: `vi.mock` para aislar módulos (API, router, actions);
  `vi.mocked` solo cuando el test fija respuestas o afirma llamadas.
- `async` solo donde hay `await` (`findBy`, `waitFor`, `user.*`).
