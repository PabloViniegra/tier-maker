# Product Requirement Document (PRD) — TierVerse (Modern Tier List Platform)

## 1. Introducción y Visión General

**OwnTierMaker** es una plataforma web de nueva generación diseñada para la creación, personalización y compartición de clasificaciones por niveles (Tier Lists). A diferencia de las alternativas tradicionales del mercado, sobrecargadas de publicidad e interfaces anticuadas, TierVerse apuesta por una experiencia de usuario (UX) radicalmente limpia, minimalista y ultra-moderna.

El objetivo principal es ofrecer un rendimiento fluido en el arrastre de elementos, flujos de autenticación robustos y un sistema ágil para exportar los tableros directamente como imágenes optimizadas para redes sociales.

---

## 2. Pila Tecnológica (Tech Stack)

Para garantizar la escalabilidad, velocidad de renderizado y una experiencia de desarrollo óptima, se ha seleccionado el siguiente stack de última generación:

- **Framework:** Next.js 16 (App Router, optimizado con React 19)
- **Lenguaje:** TypeScript (Tipado estricto en toda la aplicación)
- **Gestor de Paquetes:** pnpm
- **Autenticación:** Better Auth (Soporte nativo para credenciales y Google OAuth)
- **Base de Datos y ORM:** PostgreSQL + Drizzle ORM
- **Estilos:** Tailwind CSS v4 (Compilación nativa por CSS y rendimiento mejorado)
- **Componentes UI:** Shadcn UI (Componentes accesibles y minimalistas basados en Radix)
- **Notificaciones:** Sileo (Sistema reactivo y ligero para alertas _in-app_)
- **Validación:** Zod
- **Gestión de Formularios:** React Hook Form
- **Estado Global:** Zustand (Para el manejo ágil del tablero Drag & Drop)
- **Drag and Drop:** @hello-pangea/dnd

---

## 3. Requerimientos Funcionales y Flujos

### 3.1. Gestión de Usuarios y Autenticación

El sistema delegará el ciclo de vida de las sesiones en **Better Auth**, implementando flujos limpios con validación en tiempo real mediante **React Hook Form** y **Zod**.

- **Registro y Login Tradicional:** Creación de cuenta mediante correo electrónico y contraseña encriptada.
- **Inicio de Sesión con Google:** Flujo OAuth directo para agilizar el _onboarding_.
- **Restablecimiento de Contraseña:**
  1.  Pantalla de "Olvidé mi contraseña" para solicitar un token de un solo uso por correo.
  2.  Pantalla de restablecimiento seguro para introducir la nueva contraseña con validación de complejidad.

### 3.2. Creador de Plantillas (Templates)

Cualquier usuario autenticado puede diseñar una nueva plantilla base para que la comunidad o ellos mismos la rellenen.

- **Metadatos:** Título, descripción y categoría (Videojuegos, Cine, Música, Anime, etc.).
- **Configuración de Filas:** Definición inicial de las filas (S, A, B, C, D, E), permitiendo cambiar el texto del indicador y su color de fondo.
- **Banco de Imágenes:** Zona de carga/arrastre para añadir los elementos (_items_) que se clasificarán. Las imágenes se procesarán y optimizarán.

### 3.3. Tablero Interactivo (Mecánica Core)

El motor visual de la aplicación se centrará en la interacción fluida del usuario al rellenar un Tier.

- **Drag & Drop Inmersivo:** El movimiento de los elementos entre filas o desde el banco de imágenes debe contar con animaciones suaves y un comportamiento elástico sin parpadeos.
- **Gestión del Estado Local:** Implementado con **Zustand** para actualizar el ordenamiento en milisegundos sin necesidad de re-renders costosos ni llamadas constantes al servidor mientras se edita.

### 3.4. Exportación y Compartición

- **Exportación a Imagen:** Integración de librerías cliente para convertir el contenedor HTML del tablero en una imagen PNG de alta resolución de forma nativa.
- **Descarga Limpia:** El proceso omitirá de forma automática los menús de configuración de filas y botones de guardado en la captura final, exportando únicamente la cuadrícula estética del Tier.
- **Feedback Visual:** Uso del sistema **Sileo** para disparar alertas elegantes de éxito al procesar o descargar el archivo.

---

## 4. Modelo de Datos (Drizzle Schema)

```typescript
import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core'

// Tabla de Usuarios (Core Better Auth)
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified'),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
})

// Tabla de Plantillas de Tiers
export const tierTemplates = pgTable('tier_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  creatorId: text('creator_id').references(() => user.id, {
    onDelete: 'cascade',
  }),
  sidebarItems: jsonb('sidebar_items').$type<string[]>().notNull(), // URLs de los elementos
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Tabla de Filas de cada Tier
export const tierRows = pgTable('tier_rows', {
  id: uuid('id').defaultRandom().primaryKey(),
  templateId: uuid('template_id').references(() => tierTemplates.id, {
    onDelete: 'cascade',
  }),
  label: text('label').notNull(), // Ej: "S", "A", "B"
  color: text('color').notNull(), // Código hexadecimal del fondo
  order: integer('order').notNull(), // Index para ordenación vertical
})
```

---

## 5. Criterios de Aceptación y Diseño Visual

- **Estética Visual:** Interfaz nativa en modo oscuro por defecto, con uso de desenfoques (`backdrop-blur`), bordes ultra-finos y paletas de color contemporáneas.
- **Rendimiento:** Las transiciones de arrastre deben mantener una tasa estable de refresco (60 FPS ideales).
- **Seguridad:** Todas las API de mutación de plantillas deben validar la sesión activa mediante los _middlewares_ de Better Auth y validar los esquemas con Zod antes de tocar la base de datos.
