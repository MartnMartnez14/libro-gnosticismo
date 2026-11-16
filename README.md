# GNOSTICISMO, la verdad más allá del velo — Portal Web con Publicidad

Portal web estático, moderno y dinámico para leer **_GNOSTICISMO, la verdad más allá del velo_** (de **Martín Martínez García · Bluffer**, 2026), diseñado específicamente para **GitHub Pages** con **monetización mediante anuncios en los costados e intercalados (Google AdSense + Patrocinio Propio)**.

---

## Características Principales

- **Estrategia de Monetización por Etapas (3 Capítulos Iniciales Abiertos):**
  - **Abiertos gratuitamente con publicidad:** *Preliminares (Prefacio, Agradecimientos y Glosario interactivo de los 27 capítulos)* + **Capítulo 1 (*Gnosis y despertar*)**, **Capítulo 2 (*El Demiurgo y los arcontes*)** y **Capítulo 3 (*El Pléroma*)** completos.
  - **Capítulos 4 al 27 en Modo Vista Previa / Catálogo:** Muestran su sinopsis oficial del glosario, el primer párrafo real de apertura y el listado de todos sus subtemas reales, invitando a leer la obra completa sin anuncios en **Wrixy** (`https://wrixy.app/book/qj2cnCIX`), **Amazon KDP** o apoyar al autor.
- **Disposición Editorial de 3 Columnas con Carriles Publicitarios (*Ad-Rails*):**
  - **Carril Izquierdo (*Sticky*):** Índice interactivo de las 29 secciones + 2 bloques publicitarios (`300×600` y `300×250`).
  - **Columna Central:** Lector con controles de tipografía (`A-`, `A+`, `Serif/Sans`), modo Oscuro Místico Oro/Amatista y modo Claro Pergamino, buscador en tiempo real, anuncios *In-Article* intercalados y banners horizontales (`728×90`).
  - **Carril Derecho (*Sticky*):** 2 bloques publicitarios laterales (`300×600` y `300×250`).
- **Motor Publicitario Dual (`static/js/ads.js` + `ads.txt`):**
  - Incluye un botón en la barra superior (**«Inspeccionar medidas Google AdSense»**) para alternar en vivo entre las **tarjetas patrocinadas de respaldo (*House Ads*)** y la **vista técnica de bloques IAB / Google AdSense**.
  - Cumple los requisitos de aprobación de Google AdSense: contenido real pre-renderizado en el HTML, archivo `ads.txt` en la raíz, `robots.txt` habilitado para `Mediapartners-Google` y sección de **Política de Privacidad, Cookies y Derechos de Autor**.

---

## Cómo Probar Localmente

Podés abrir `index.html` con doble clic en tu navegador o levantar el servidor local con Python:

```bash
python3 app.py
```

Luego abrí `http://127.0.0.1:8000` en tu navegador.

---

## Cómo Habilitar Más Capítulos en el Futuro

El script `scripts/build_book_data.py` lee en **modo de solo lectura** el archivo original del libro (`/home/martinez-martin-garcia/Libro Gnostiscismo /Libro GNOSTICISMO la verdad más allá del velo 2026  .md`) sin modificar jamás la carpeta original.

Si más adelante querés abrir 5, 10 o los 27 capítulos con publicidad, solo ejecutás:

```bash
python3 scripts/build_book_data.py --max-chapters 5
```

---

## Cómo Activar Google AdSense

1. Subí este repositorio a GitHub y activá **GitHub Pages** (rama `main`, carpeta raíz `/`).
2. *(Recomendado para aprobación rápida en AdSense)*: Si Google AdSense te pide registrar un dominio propio en vez de `github.io`, agregá en el panel DNS de tu dominio `checklistgato.com` un registro `CNAME` llamado `gnosticismo` que apunte a `martnmartnez14.github.io`, y da de alta `gnosticismo.checklistgato.com` en AdSense.
3. Cuando tengas tu ID `ca-pub-XXXXXXXXXXXXXXXX`:
   - En `static/js/ads.js`, cambiá `adsenseEnabled: true` y pegá tu `clientId` y los IDs de cada slot.
   - En `ads.txt`, reemplazá `pub-0000000000000000` por tu ID real.

---

## Verificación Automatizada

```bash
python3 -m unittest discover -s tests -v
node --check static/js/reader.js
node --check static/js/ads.js
python3 -m py_compile app.py scripts/build_book_data.py
```
