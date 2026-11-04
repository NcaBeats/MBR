# Mini-Proyecto (Frontend)

Tienda de videojuegos — frontend **Next.js** que consume el backend Spring Boot
(`Proyecto-Juegos-Monolito`).

## Stack

| | |
|---|---|
| Framework | Next.js **16.3.0** (App Router, Turbopack) |
| UI | React **19.2.8**, TypeScript 5, Tailwind CSS **4** |
| Componentes | shadcn/ui (Base UI), lucide-react |
| Extras | embla-carousel, gsap, react-dropzone, zod |
| Package manager | pnpm 11 |

## Requisitos

- **Node.js 20+**
- **pnpm**
- El **backend corriendo** en `http://127.0.0.1:9090` (ver README de Proyecto-Juegos-Monolito)

## Configuración

Un `.env` con dos variables:

```bash
API_BASE_URL=http://127.0.0.1:9090/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=   # opcional: sin esto el botón de Google no se muestra
```

El navegador no usa variables: llama siempre a la ruta relativa `/api/v1`,
que Next.js reescribe al backend (`next.config.ts` → `rewrites`). En el
servidor (Server Actions, SSR) se usa `API_BASE_URL` porque `fetch` necesita
URL absoluta.

### Google Sign-In

El botón lo renderiza **Google Identity Services** (`renderButton`): no es un
componente nuestro y no se puede reestilizar con CSS, solo elegir `theme`,
`shape`, `size`, `text` y `width`.

```
[ Log In ] / [ Create account ]
────── or ──────
[ G  Continue with Google ]
```

Flujo:

1. El botón entrega un `credential` (ID token) a la Server Action `googleLoginAction`.
2. Si la cuenta ya existe, se setea la cookie httpOnly `token` y se redirige por rol
   (o a `?next=` si la página de auth lo traía).
3. Si es nueva, el backend devuelve `ONBOARDING_REQUIRED`; el `onboardingToken`
   se guarda en la cookie httpOnly `google_onboarding` (10 min) y se redirige a
   `/sign-up/google`, donde se completan RUN, nickname, región/comuna y dirección.
4. `googleCompleteAction` crea la cuenta, setea la sesión y redirige a `?next=` o al home del rol.

El access token y el onboarding token **nunca** pasan por JavaScript ni por la URL.

### Redirects de autenticación

- Los links entre `/log-in` y `/sign-up` usan `next/link` (navegación client-side) y
  conservan el `?next=` para volver a la página original (ej. `/cart` desde el carrito).
- Después de un login/registro exitoso: si `?next=` es una ruta interna válida se va
  ahí; si no, al home del rol (`ADMIN` → `/admin`, `VENDEDOR` → `/studio/games`, resto → `/`).
- `lib/auth-redirect.ts` valida el destino (`safeInternalPath`) para evitar open redirects.
- Un usuario ya autenticado que entra a `/log-in` o `/sign-up` es redirigido a su home.

Requisitos:

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (acá) y `GOOGLE_CLIENT_ID` (backend/Render) deben
  tener el **mismo valor**.
- En Google Cloud Console → OAuth Client ID (Web application) → *Authorized
  JavaScript origins*: `http://localhost:3000` y el dominio de producción.
- En Vercel, la variable se inlinea en build: hay que **redeployar** después de
  cambiarla.


## Comandos

```bash
pnpm install
pnpm dev        # desarrollo (Turbopack, http://localhost:3000)
pnpm build      # build de producción
pnpm start      # servir el build de producción
pnpm lint       # eslint
pnpm vitest run # suite de tests
pnpm coverage   # suite + reporte HTML en coverage/ (ignorado por git)
```

## Estructura

- `app/(main)/` — rutas públicas: home, `catalog`, `games/[id]`, `blog`,
  `cart`, `checkout`, `library`, `contact`, `about`
- `app/(auth)/` — login/signup
- `app/(admin)/` y `app/(studio)/` — paneles de administración y estudios (vendedores)
- `actions/` — Server Actions (muta datos, define revalidaciones)
- `lib/session.ts` — cookie de sesión, rol del usuario y redirect post-login
- `lib/api/` — `fetchAPI` (server, JWT, `API_BASE_URL`) + clientes de navegador
  (`search.ts`, `regions.ts`, ruta `/api/v1` vía rewrite)
- `stores/` — store del carrito (Zustand + `persist`, solo cliente)
- `hooks/use-location.ts` — `useRegions` / `useComunas` para selects de ubicación
- `schemas/` — validación Zod
- `components/` — UI compartida (games, cart, blog, admin, studio)
- `test/` — suite Vitest (23 archivos); `docs/tests.md` — qué cubre cada test
- `vitest.config.mts` — entorno jsdom + reporte de cobertura (texto y HTML)

## Arquitectura API

Todas las llamadas del navegador van a `/api/v1/*` (mismo origen, sin CORS).
Next.js las reescribe al backend según entorno:

| Entorno | Destino del rewrite |
|---------|---------------------|
| Local | `http://127.0.0.1:9090/api/v1/:path*` |
| Vercel | `${API_BASE_URL}/:path*` (backend en Render) |

`lib/api/config.ts` resuelve la base según contexto: `API_BASE_URL` en el
servidor, `/api/v1` en el navegador.

## Regiones y comunas

El backend expone el catálogo geográfico como tablas con FK:

- `GET /regions` → `[{ id, nombre }]` (texto listo para UI)
- `GET /regions/{regionId}/comunas` → `[{ id, nombre, regionId }]`

Los formularios envían solo `comunaId`; la región se deriva en el servidor.
El perfil (`GET /profile/{userId}`) devuelve `regionId`, `region`, `comunaId`,
`comuna` (strings en español, son nombres propios).

## Roles y permisos

| Rol | Alcance |
|-----|---------|
| `ADMIN` | Ve todo el catálogo, gestiona usuarios/blogs/órdenes, edita y borra cualquier juego. No crea juegos. |
| `VENDEDOR` | CRUD solo sobre sus juegos (`sellerId` del token). Panel en `/studio`. |
| `CLIENTE` | Compra, biblioteca, wallet. |

Guards: `requireAdmin()` y `requireRole([...], redirectTo)` en layouts y páginas.
El layout principal no redirige a vendedores: pueden navegar la tienda como
clientes.

## Wallet

- `getMyWalletAction` / `depositToWalletAction` en `actions/wallet.ts`.
- `DepositFundsSheet` (`components/cart/`): sheet lateral en checkout para
  agregar fondos. Al confirmar dispara el evento `wallet:updated`.
- `WalletBalance` (header) escucha `wallet:updated` y se refresca al instante,
  igual que el balance del checkout vía callback `onSuccess`.

## Carrito

- `useCartStore` (`stores/cart-store.ts`): estado global cliente, sin Context.
  Persiste solo `items` en `localStorage` (`persist` + `partialize`).
- `_hasHydrated` (vía `onRehydrateStorage`) evita el mismatch SSR: los
  componentes muestran skeleton hasta hidratar.
- Selectores (`s.items`, `selectCartTotal`, `selectIsInCart(id)`): cada
  componente re-renderiza solo si cambia lo que selecciona.
- El total es derivado, no se persiste. El backend valida precios al comprar.

## Tests

Detalle por archivo en `docs/tests.md` (requisito → test, cobertura por
vista y por componente). Convenciones: queries por `screen`, `fireEvent`
para lo mecánico, `userEvent` donde se necesita comportamiento real,
`async` solo donde hay `await`.

## Formularios

- React Hook Form + Zod en formularios de usuario (`mode: "onBlur"`,
  `reValidateMode: "onChange"`).
- `FormLabel required` renderiza el icono `Asterisk` de lucide.
- `DatePickerField` (Popover + Calendar shadcn): prop `disableFuture`
  (default `true`). Los formularios de juego la desactivan con
  `COMING_SOON` para permitir fechas de lanzamiento futuras.
- Campos de ubicación: región como estado local (filtra comunas), `comunaId`
  como campo del formulario.

## Sidebar admin/studio

`AppSidebar` (`components/admin/dashboard/`) con variante `admin` | `studio`:

- `collapsible="icon"` + `SidebarRail`: al colapsar queda rail de iconos con
  tooltips. El `SidebarTrigger` está en `SiteHeader`.
- Admin: Dashboard, Games, Blogs, Orders, Users + "Back to site".
- Studio: Games, Orders + "Back to site" (sin dashboard propio).
- Tablas con `RowActions` (dropdown de 3 puntos): admin con Edit/Delete,
  studio games con Edit/Delete, studio orders solo View.
- Columnas ordenables vía `?sort=campo,dir` (`parseSortParam` con allowlist por
  tabla; el header alterna asc → desc → sin orden y resetea la página).
  Requiere soporte del backend (`Pageable`): `price` ordena por precio
  efectivo en `/games` y `/manage/games`.

## Deploy

### Vercel (frontend)

| Variable | Valor |
|----------|-------|
| `API_BASE_URL` | `https://<backend>.onrender.com/api/v1` |

Solo esa. Redploy tras cambiarla (el rewrite se resuelve al arrancar).

### Render (backend)

| Variable | Valor |
|----------|-------|
| `APP_CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000,http://<ip-lan>:3000,https://<frontend>.vercel.app,https://<frontend>-*.vercel.app` |

## Desarrollo en red local

Para probar desde otros dispositivos (móvil en la misma red):

- `allowedDevOrigins` en `next.config.ts` con las IPs explícitas
  (Next.js no acepta rangos CIDR).
- El rewrite hace que el navegador llame al mismo origen: no hay CORS ni
  IPs hardcodeadas en el frontend.

## Notas y decisiones

- **Autenticación**: JWT en cookie `token`; las acciones y lecturas con `auth: true`
  envían `Authorization: Bearer <token>` automáticamente.
- **Caché**: las lecturas públicas de juegos/catálogo usan `noStore` — siempre se
  consultan al backend, por lo que borrar un juego se refleja al instante (404 en su
  detalle) sin depender de invalidaciones de caché.
- **Imágenes y vídeos**: subidos directo a Cloudflare R2 con URL prefirmada desde
  el navegador. El backend guarda la URL pública absoluta que devuelve R2, así que
  el frontend la usa tal cual (imágenes vía `next/image`). `lib/media.ts` solo
  valida que sea absoluta y falla en voz alta si aparece una ruta.
- **Idioma**: UI en inglés. Nombres de regiones/comunas en español (nombres
  propios). Fechas y moneda en formato `en-US`.
