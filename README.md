# Log Ui Ts
Submodule usado para unificar ciertas partes de los micro-frontend
## ⚙️ Necesario para usar en el repositorio
Antes de enlazar este submódulo asegúrate de tener tu microfrontend con App Router listo y Node 18+. Sin esto la autenticación no arranca 💥
### 🎨 Shadcn/ui
Componentes ya generados (ejecuta `npx shadcn@latest init` si no los tienes) para que los imports `@/components/ui/*` resuelvan sin drama 🎯
### 🔐 Thirdweb
Cliente + auth server-side listos con `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`, `NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN` y `THIRDWEB_ADMIN_PRIVATE_KEY`; sin esas envs el connect button no aparece 🔐
### 🌈 TailwindCss
Proyecto migrado a Tailwind CSS 4 con los presets de shadcn; respeta `@log-ui/lib/globals.css` o se rompen los tokens 🌈
### 🌓 next-themes
Necesario para el toggle de tema y el header responsive; instala `next-themes` y añade su provider en tu layout 🌓
### 📤 uploadthing
Activa subida de imágenes y avatars compartidos; define el router en tu API y respeta los permisos del auth repo para que las sesiones validen antes de subir 🚀
### 🌍 i18n -- Future
Reservado para locales compartidos; mantén tu `next-intl` listo porque cuando se active tomará los textos del dominio central 🧭
## 🚀 Empezar
Pasos rápidos para enchufar el módulo sin dolores 🛠️
### 📦 Instalar en raíz del proyecto
```bash
npm install thirdweb uploadthing @uploadthing/react next-themes
npm install -D tailwindcss@next postcss autoprefixer
```
### 🧩 Instalar submodule `domain`
```bash
git submodule add https://github.com/SKRTEEEEEE/log-ui-ts.git log-ui-ts
git submodule update --init --recursive
```
### 🧭 Configurar alias
En `tsconfig.json` añade la ruta `"@log-ui/*": ["./log-ui-ts/*"]` para poder importar acciones, componentes y core sin paths relativos 🎯
### 🧵 Importar globals.css
En tu `app/globals.css` importa `@log-ui/lib/globals.css` para heredar tipografías, gradientes y utilidades de Tailwind que usa el header ✨
