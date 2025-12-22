# Log Ui Ts

> *Submodule compartido para unificar componentes, autenticación y core entre micro-frontend's Next.js*

## ⚙️ Requisitos
App Router (Next.js 15+), Node 18+, Tailwind CSS 4 con shadcn/ui configurado 🚀

### 📦 Domain Package
Este submodule depende de `@skrteeeeee/profile-domain` para tipos de dominio compartidos. **Importante:** El package NO se instala en log-ui-ts sino en el proyecto host que lo usa (ej: admin-next, agora-next).

**Configurar en el proyecto host:**
```bash
# 1. Crear .npmrc en la raíz del proyecto
echo "@skrteeeeee:registry=https://npm.pkg.github.com" > .npmrc

# 2. Instalar el package
npm install @skrteeeeee/profile-domain

# 3. log-ui-ts usará el package desde node_modules del host
```
**GitHub Token requerido:** Necesitas un token con scope `read:packages`. Sigue las [instrucciones de instalación](https://github.com/SKRTEEEEEE/profile-domain#installation).
#### 🚨 [Auto-toast errors](error-handling-quick-guide.md)
### 🌈 Tailwind CSS 4
Respeta `@log-ui/lib/globals.css` para tokens de color, gradientes y temas. Rompe diseños sin esta importación 🌈
### 🌓 next-themes
Requerido para toggle de tema y persistencia. Provider debe envolver tu app en el layout raíz (12 temas disponibles) 🌓
### 📤 uploadthing
Router en `/api/uploadthing` usando `@log-ui/core/infrastructure/connectors/uploadthing-st`. Auth middleware valida JWT antes de upload 🚀
### 🌍 next-intl
`SiteNavConfig<TPath>` es genérico para soportar tus rutas personalizadas. Define paths en `routing.ts` del host y pásalos al config 🧭
### 🎨 Shadcn/ui
Componentes UI necesarios: `button`, `dialog`, `dropdown-menu`, `navigation-menu`, `popover`, `avatar`, `sheet`, `separator`, `input`, `form`, `select`, `label`, `alert`, `tabs`. Instala con `npx shadcn@latest add [componente]` para que `@/components/ui/*` resuelva correctamente 🎯
### 🔐 Thirdweb
Env vars requeridas: `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`, `NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN`, `THIRDWEB_ADMIN_PRIVATE_KEY`. Sin ellas el ConnectButton no renderiza 🔐
## 🚀 Setup Rápido
### 📦 Dependencias
```bash
npm install thirdweb uploadthing @uploadthing/react next-themes react-hook-form @hookform/resolvers zod
npm install @radix-ui/react-label @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-tabs
```
### 🧩 Submodule
```bash
git submodule add https://github.com/SKRTEEEEEE/log-ui-ts.git log-ui-ts
git submodule update --init --recursive
```
### 🧭 tsconfig.json
```json
"paths": {
  "@/*": ["./src/*"],
  "@log-ui/*": ["./log-ui-ts/*"]
}
```
### 🎨 globals.css
```css
@import "@log-ui/lib/globals.css";
```
### 🪛 Config
- [`<app>/src/lib/log-ui-data.tsx`](#-appsrcliblog-ui-datatsx): Configuración especifica del repositorio
- `<app>/src/data/*/log-ui.json`: Config i18n especifica del repositorio
- `./i18n/*/common.json`: Configuración i18n para 'log-ui'
- `./lib/config/apps-config.ts`: Configuración endpoints que utilizan 'log-ui'
### 🏗️ Core Architecture
- `@log-ui/core`: Domain entities, repos base, flows compartidos (úsalo para tipos y lógica)
- `@/components/ui`: UI components del host (log-ui importa desde aquí)
- `@log-ui/lib/hooks`: Hooks compartidos como `use-media-query`, `use-error-toast`
### 🎛️ Vercel Deploy
```json
{ "installCommand": "git submodule update --init --recursive && npm install" }
```
## 🔧 Uso
Importa controllers con `@log-ui/core/presentation/controllers/*`, componentes con `@log-ui/components/*`, hooks con `@log-ui/lib/hooks/*`, y core con `@log-ui/core/*`. Los componentes de navegación aceptan `SiteNavConfig<TPath>` genérico para tus rutas específicas 🎯

### 🚨 [Sistema de Toast para Errores](error-handling-quick-guide.md)

Sistema completo de manejo de errores con **toasts automáticos** que muestran:
- **Título** contextual del error
- **Descripción** detallada multiidioma
- **Icono** visual según tipo de error (🛡️ ShieldX, 💥 ServerCrash, ⚠️ AlertCircle)

**Flujo Completo (Server → Client):**

1. **Server Component** captura error y serializa:
   - `analyzeError()` convierte `DomainError` → `SerializedError` (JSON-serializable)
   - Detecta automáticamente el icono por tipo de error (`meta.desc` o contenido)
   - Permite override de título para contexto específico

2. **Client Component** muestra toast:
   - `<SectionFallbackProvider>` envuelve el fallback UI
   - `useToastOnce()` muestra el toast automáticamente (solo una vez)
   - `getErrorIcon()` resuelve el icono apropiado

**Comportamiento según `friendlyDesc`:**
- `'d'` → Silencioso (no muestra toast, solo logs)
- `'credentials'` → Toast con icono 🛡️ ShieldX (autenticación)
- `'tryAgainOrContact'` → Toast con icono 💥 ServerCrash (servidor/red)
- `IntlBase` personalizado → Toast con icono ⚠️ AlertCircle (genérico)
- `undefined` → Lanza error y rompe con ErrorBoundary

**Iconos con Enum ErrorIcon:**
- `ErrorIcon.CREDENTIALS` → 🛡️ ShieldX (autenticación)
- `ErrorIcon.TRY_AGAIN_OR_CONTACT` → 💥 ServerCrash (servidor/red)
- `ErrorIcon.ALERT_CIRCLE` → ⚠️ AlertCircle (genérico, fallback)
- Especificar en `meta.icon` o usar strings predefinidos que lo incluyen automáticamente

**📖 Documentación Completa:** Ver [error-handling-quick-guide.md](docs/error-handling-quick-guide.md) para ejemplos detallados en cada capa (Repository, Use Case, Server Component, Client Component).

**🎯 Exports Principales:**
- `analyzeError()` - Analiza y serializa DomainError
- `getErrorIcon()` - Resuelve ErrorIcon a componente React
- `useToastOnce()` - Hook para mostrar toast automático
- `SectionFallbackProvider` - Componente wrapper genérico
- `ErrorIcon` - Enum para iconos ('credentials', 'tryAgainOrContact', 'alert-circle')
- `SerializedError`, `IconType` - Tipos TypeScript
### 🔶 `<app>/src/lib/log-ui-data.tsx`
#### Nav - 'fast links'
```ts
const siteConfig: {
    name: string;
    description: string;
    icon: JSX.Element;
    //endpoints que se muestran
    // i18n -> nav.{localeRoute.id}
    paths: {
        id: string;
        path: string;
    }[];
}
```