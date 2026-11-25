/* ==========================================================================
   Motor de Lectura Editorial — GNOSTICISMO, la verdad más allá del velo
   Autor: Martín Martínez García (Bluffer) · Edición Web con Publicidad 2026
   ========================================================================== */
(function () {
  "use strict";

  var THEME_KEY = "gnostic-reader-theme";
  var FONT_SIZE_KEY = "gnostic-reader-font-size";
  var FONT_FAMILY_KEY = "gnostic-reader-font-family";
  var LAST_SECTION_KEY = "gnostic-reader-last-section";
  var READ_SECTIONS_KEY = "gnostic-reader-read-sections";

  // Aplicar tema guardado inmediatamente
  function applyInitialTheme() {
    var theme = "dark";
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") {
        theme = saved;
      }
    } catch (e) {
      /* ignore */
    }
    document.documentElement.setAttribute("data-theme", theme);
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", theme === "light" ? "#f6f2ea" : "#08070c");
    }
  }

  applyInitialTheme();

  document.addEventListener("DOMContentLoaded", function () {
    var bookData = window.GNOSTIC_BOOK_DATA;
    if (!bookData || !bookData.sections) {
      return;
    }

    var sections = bookData.sections;
    var glossary = bookData.glossary || [];
    var currentSectionId = "capitulo-1";
    var fontSizeStep = 0; // -1, 0, +1, +2
    var fontFamily = "serif"; // "serif" | "sans"
    var readSections = {};

    try {
      var savedSection = localStorage.getItem(LAST_SECTION_KEY);
      if (savedSection && findSectionById(savedSection)) {
        currentSectionId = savedSection;
      }
      var savedSize = parseInt(localStorage.getItem(FONT_SIZE_KEY) || "0", 10);
      if (!isNaN(savedSize) && savedSize >= -1 && savedSize <= 2) {
        fontSizeStep = savedSize;
      }
      var savedFont = localStorage.getItem(FONT_FAMILY_KEY);
      if (savedFont === "sans" || savedFont === "serif") {
        fontFamily = savedFont;
      }
      var savedRead = JSON.parse(localStorage.getItem(READ_SECTIONS_KEY) || "{}");
      if (savedRead && typeof savedRead === "object") {
        readSections = savedRead;
      }
    } catch (e) {
      /* ignore */
    }

    // Si la URL trae un hash válido (#capitulo-2, #preliminares, etc.), priorizarlo
    if (window.location.hash) {
      var hashId = window.location.hash.replace(/^#/, "");
      if (findSectionById(hashId)) {
        currentSectionId = hashId;
      }
    }

    function findSectionById(id) {
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].id === id) {
          return sections[i];
        }
      }
      return null;
    }

    function findSectionIndex(id) {
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].id === id) {
          return i;
        }
      }
      return 0;
    }

    // Poblar lista de capítulos en la barra lateral y en el <select> superior
    var tocList = document.getElementById("toc-list");
    var chapterSelect = document.getElementById("chapter-select");

    function renderNavigationLists() {
      if (tocList) {
        var html = "";
        for (var i = 0; i < sections.length; i++) {
          var sec = sections[i];
          var isActive = sec.id === currentSectionId;
          var isDone = Boolean(readSections[sec.id]);
          var statusIcon = sec.unlocked
            ? isDone
              ? '<span class="toc-status is-read" title="Capítulo leído">✓</span>'
              : '<span class="toc-status is-open" title="Disponible gratis con publicidad">Abierto</span>'
            : '<span class="toc-status is-locked" title="Vista previa · Completo en Amazon Kindle">Vista previa</span>';

          var labelTitle =
            sec.kind === "chapter"
              ? "Cap. " + sec.number + " · " + sec.title
              : sec.badge;

          html +=
            '<li class="toc-item">' +
            '<button type="button" class="toc-btn' +
            (isActive ? " is-active" : "") +
            (sec.unlocked ? " is-unlocked" : " is-preview") +
            '" data-section-id="' +
            sec.id +
            '" aria-current="' +
            (isActive ? "true" : "false") +
            '">' +
            '<span class="toc-btn-title">' +
            labelTitle +
            "</span>" +
            statusIcon +
            "</button>" +
            "</li>";
        }
        tocList.innerHTML = html;
      }

      if (chapterSelect) {
        var opts = "";
        for (var j = 0; j < sections.length; j++) {
          var s = sections[j];
          var prefix = s.unlocked ? "📖 " : "🔒 ";
          var text =
            s.kind === "chapter"
              ? prefix + "Capítulo " + s.number + ": " + s.title + (s.unlocked ? " (Gratis con anuncios)" : " (Vista previa)")
              : prefix + s.badge + ": " + s.title;
          opts +=
            '<option value="' +
            s.id +
            '"' +
            (s.id === currentSectionId ? " selected" : "") +
            ">" +
            text +
            "</option>";
        }
        chapterSelect.innerHTML = opts;
      }
    }

    // Construir el HTML de un capítulo o sección
    function renderSection(sectionId, shouldScrollToReader) {
      var sec = findSectionById(sectionId) || sections[1] || sections[0];
      currentSectionId = sec.id;
      readSections[sec.id] = true;

      try {
        localStorage.setItem(LAST_SECTION_KEY, currentSectionId);
        localStorage.setItem(READ_SECTIONS_KEY, JSON.stringify(readSections));
      } catch (e) {
        /* ignore */
      }

      var container = document.getElementById("reader-article-body");
      var badgeEl = document.getElementById("reader-section-badge");
      var titleEl = document.getElementById("reader-section-title");
      var metaEl = document.getElementById("reader-section-meta");
      var prevBtn = document.getElementById("prev-chapter-btn");
      var nextBtn = document.getElementById("next-chapter-btn");

      if (!container) {
        return;
      }

      if (badgeEl) {
        badgeEl.textContent =
          sec.unlocked
            ? sec.badge + " · LECTURA GRATUITA CON PUBLICIDAD"
            : sec.badge + " · VISTA PREVIA DE LA EDICIÓN COMPLETA";
        badgeEl.className =
          "chapter-badge " + (sec.unlocked ? "badge-open" : "badge-locked");
      }

      if (titleEl) {
        titleEl.textContent =
          sec.kind === "chapter"
            ? "Capítulo " + sec.number + ": " + sec.title
            : sec.title;
      }

      if (metaEl) {
        metaEl.textContent =
          "~" +
          sec.word_count.toLocaleString("es-UY") +
          " palabras en el manuscrito · Lectura estimada: " +
          sec.reading_minutes +
          " min";
      }

      var bodyHtml = "";

      // Si el capítulo está abierto gratuitamente con publicidad
      if (sec.unlocked) {
        for (var i = 0; i < sec.blocks.length; i++) {
          var b = sec.blocks[i];
          if (b.type === "h2") {
            bodyHtml += '<h3 class="chapter-subhead">' + b.text + "</h3>";
          } else if (b.type === "h3") {
            bodyHtml += '<h4 class="chapter-subhead-sm">' + b.text + "</h4>";
          } else if (b.type === "p") {
            var dropcapClass = i === 0 ? ' class="lead-paragraph"' : "";
            bodyHtml += "<p" + dropcapClass + ">" + b.html + "</p>";
          } else if (b.type === "li") {
            bodyHtml += '<p class="chapter-bullet">• ' + b.html + "</p>";
          } else if (b.type === "ad_slot") {
            bodyHtml +=
              '<div class="in-article-promo-wrapper" data-slot-box="in-article" aria-label="Espacio destacado intercalado"></div>';
          }
        }

        // Si estamos en Preliminares, renderizar también el Glosario interactivo de los 27 capítulos
        if (sec.id === "preliminares" && glossary.length > 0) {
          bodyHtml +=
            '<h3 class="chapter-subhead">Glosario e Índice Descriptivo de los XXVII Capítulos</h3>' +
            '<p class="glossary-intro">Pulsá sobre cualquiera de los 27 capítulos para abrirlo en el lector (los Capítulos 1, 2 y 3 están completos y abiertos con publicidad; del 4 al 27 podés consultar su apertura, sinopsis y subtemas):</p>' +
            '<div class="glossary-grid">';
          for (var g = 0; g < glossary.length; g++) {
            var item = glossary[g];
            var chNum = parseInt(item.number, 10);
            var isOpenCh = chNum <= bookData.meta.unlocked_chapters;
            bodyHtml +=
              '<article class="glossary-card ' +
              (isOpenCh ? "is-open-card" : "is-preview-card") +
              '">' +
              '<div class="glossary-card-head">' +
              '<span class="glossary-num">Capítulo ' +
              item.number +
              "</span>" +
              '<span class="glossary-pill">' +
              (isOpenCh ? "Gratis con anuncios" : "Vista previa") +
              "</span>" +
              "</div>" +
              "<h4>" +
              item.title +
              "</h4>" +
              "<p>" +
              item.summary_html +
              "</p>" +
              '<button type="button" class="glossary-jump-btn" data-section-id="capitulo-' +
              item.number +
              '">' +
              (isOpenCh
                ? "Leer Capítulo " + item.number + " ahora →"
                : "Ver vista previa del Capítulo " + item.number + " →") +
              "</button>" +
              "</article>";
          }
          bodyHtml += "</div>";
        }
      } else {
        // Capítulo 4..27 en modo Resumen Cortado / Gancho (protege la obra completa e invita a Wrixy / Amazon)
        bodyHtml +=
          '<div class="preview-synopsis-box">' +
          '<p class="preview-eyebrow">RESUMEN DEL CAPÍTULO ' +
          sec.number +
          "</p>" +
          "<p>" +
          sec.summary_html +
          "</p>" +
          "</div>";

        if (sec.preview_html) {
          bodyHtml +=
            '<div class="preview-excerpt">' +
            '<p class="preview-eyebrow">LECTURA DE MUESTRA (FRAGMENTO CORTADO)</p>' +
            '<p class="lead-paragraph">' +
            sec.preview_html +
            "</p>" +
            (sec.teaser_cut_html
              ? '<p class="teaser-cut-paragraph">' +
                sec.teaser_cut_html +
                ' <span class="cut-marker">[Continúa en la edición completa…]</span></p>'
              : "") +
            '<div class="preview-fade" aria-hidden="true"></div>' +
            "</div>";
        }

        if (sec.subheadings && sec.subheadings.length > 0) {
          bodyHtml +=
            '<div class="preview-subtopics">' +
            "<h4>Lo que vas a descubrir al desbloquear este capítulo (" +
            sec.subheadings.length +
            " apartados):</h4>" +
            '<ul class="subtopics-list">';
          for (var k = 0; k < sec.subheadings.length; k++) {
            bodyHtml += "<li>" + sec.subheadings[k] + "</li>";
          }
          bodyHtml += "</ul></div>";
        }

        bodyHtml +=
          '<div class="unlock-card">' +
          '<span class="unlock-badge">✂ LECTURA INTERRUMPIDA · CAPÍTULO ' +
          sec.number +
          " DE 27</span>" +
          "<h3>¿Te quedaste con ganas de seguir leyendo este capítulo?</h3>" +
          "<p>En esta web están abiertos gratis los <strong>primeros 3 capítulos completos</strong>. A partir del Capítulo 4 mostramos este avance cortado para que puedas conocer de qué trata cada parte antes de ir a la obra completa.</p>" +
          "<p><strong>Opción directa con el autor (USD 4,99 único pago):</strong> comunicate personalmente conmigo por WhatsApp o correo y te envío el libro completo en <strong>PDF + eBook (EPUB)</strong> todo por tan solo <strong>4,99 dólares (único pago)</strong>, o leelo en las plataformas oficiales:</p>" +
          '<div class="unlock-actions">' +
          '<a class="button primary" href="https://www.amazon.es/dp/B0H4X4X14W" target="_blank" rel="noopener">Comprar en Amazon Kindle (USD 4,99) ↗</a>' +
          '<a class="button primary" href="https://wa.me/59892663680?text=Hola%20Mart%C3%ADn%2C%20quiero%20comprar%20el%20libro%20completo%20de%20Gnosticismo%20(PDF%20%2B%20eBook)%20por%20USD%204%2C99%20%C3%BAnico%20pago." target="_blank" rel="noopener">Pedir PDF + eBook por WhatsApp (USD 4,99) ↗</a>' +
          '<a class="button ghost" href="mailto:mmartinez23bio@hotmail.com?subject=Compra%20directa%20Libro%20Gnosticismo%20(PDF%20%2B%20eBook%20-%20USD%204,99)">Pedir por Correo ↗</a>' +
          '<a class="button subtle" href="https://wrixy.app/book/NoXSw7tI" target="_blank" rel="noopener">Ver los 3 primeros capítulos en Wrixy ↗</a>' +
          '<a class="button subtle" href="#edicion-completa">Medios de pago (Prex / Mercado Pago / PayPal)</a>' +
          "</div>" +
          '<p class="unlock-fine">Contacto directo: <strong>+598 92 663 680</strong> · <strong>mmartinez23bio@hotmail.com</strong> · También en Amazon Kindle (KDP · USD 4,99 · ASIN B0H4X4X14W · <a href="https://www.amazon.com.mx/dp/B0H4X4X14W" target="_blank" rel="noopener">México</a>).</p>' +
          "</div>" +
          '<div class="in-article-promo-wrapper" data-slot-box="in-article" aria-label="Espacio destacado en vista previa"></div>';
      }

      container.innerHTML = bodyHtml;

      // Actualizar botones Anterior / Siguiente
      var idx = findSectionIndex(sec.id);
      if (prevBtn) {
        if (idx > 0) {
          var prevSec = sections[idx - 1];
          prevBtn.disabled = false;
          prevBtn.setAttribute("data-section-id", prevSec.id);
          prevBtn.innerHTML =
            '<span class="nav-dir">← Anterior</span><span class="nav-name">' +
            (prevSec.kind === "chapter"
              ? "Cap. " + prevSec.number + ": " + prevSec.title
              : prevSec.badge) +
            "</span>";
        } else {
          prevBtn.disabled = true;
          prevBtn.removeAttribute("data-section-id");
          prevBtn.innerHTML =
            '<span class="nav-dir">Inicio del libro</span><span class="nav-name">Preliminares</span>';
        }
      }

      if (nextBtn) {
        if (idx < sections.length - 1) {
          var nextSec = sections[idx + 1];
          nextBtn.disabled = false;
          nextBtn.setAttribute("data-section-id", nextSec.id);
          nextBtn.innerHTML =
            '<span class="nav-dir">Siguiente →</span><span class="nav-name">' +
            (nextSec.kind === "chapter"
              ? "Cap. " +
                nextSec.number +
                ": " +
                nextSec.title +
                (nextSec.unlocked ? "" : " (Vista previa)")
              : nextSec.badge) +
            "</span>";
        } else {
          nextBtn.disabled = true;
          nextBtn.removeAttribute("data-section-id");
          nextBtn.innerHTML =
            '<span class="nav-dir">Fin del recorrido</span><span class="nav-name">Contraportada</span>';
        }
      }

      renderNavigationLists();

      if (window.GnosticAds && typeof window.GnosticAds.renderAll === "function") {
        window.GnosticAds.renderAll();
      }

      if (shouldScrollToReader) {
        var readerAnchor = document.getElementById("lector");
        if (readerAnchor) {
          readerAnchor.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
      updateReadingProgress();
    }

    // Aplicar controles tipográficos (tamaño y familia de fuente)
    function applyTypographyPreferences() {
      var article = document.getElementById("reader-article-body");
      var fontBtn = document.getElementById("font-family-toggle");
      if (!article) {
        return;
      }
      article.setAttribute("data-font-size", String(fontSizeStep));
      article.setAttribute("data-font-family", fontFamily);
      if (fontBtn) {
        fontBtn.textContent = fontFamily === "serif" ? "Tipografía: Serif" : "Tipografía: Sans";
      }
    }

    // Delegación de clics para navegar entre capítulos ([data-section-id])
    document.addEventListener("click", function (ev) {
      var target = ev.target.closest("[data-section-id]");
      if (target) {
        var secId = target.getAttribute("data-section-id");
        if (secId) {
          ev.preventDefault();
          if (history.replaceState) {
            history.replaceState(null, "", "#" + secId);
          }
          renderSection(secId, true);
        }
      }
    });

    if (chapterSelect) {
      chapterSelect.addEventListener("change", function () {
        var val = chapterSelect.value;
        if (val) {
          if (history.replaceState) {
            history.replaceState(null, "", "#" + val);
          }
          renderSection(val, true);
        }
      });
    }

    // Controles de tamaño de letra y familia tipográfica
    var btnSmaller = document.getElementById("font-decrease");
    var btnLarger = document.getElementById("font-increase");
    var btnFamily = document.getElementById("font-family-toggle");

    if (btnSmaller) {
      btnSmaller.addEventListener("click", function () {
        if (fontSizeStep > -1) {
          fontSizeStep -= 1;
          try {
            localStorage.setItem(FONT_SIZE_KEY, String(fontSizeStep));
          } catch (e) {}
          applyTypographyPreferences();
        }
      });
    }

    if (btnLarger) {
      btnLarger.addEventListener("click", function () {
        if (fontSizeStep < 2) {
          fontSizeStep += 1;
          try {
            localStorage.setItem(FONT_SIZE_KEY, String(fontSizeStep));
          } catch (e) {}
          applyTypographyPreferences();
        }
      });
    }

    if (btnFamily) {
      btnFamily.addEventListener("click", function () {
        fontFamily = fontFamily === "serif" ? "sans" : "serif";
        try {
          localStorage.setItem(FONT_FAMILY_KEY, fontFamily);
        } catch (e) {}
        applyTypographyPreferences();
      });
    }

    // Conmutador de tema Oscuro / Claro
    var themeToggle = document.getElementById("theme-toggle");
    function updateThemeButtonLabel() {
      var curr = document.documentElement.getAttribute("data-theme") || "dark";
      if (themeToggle) {
        themeToggle.textContent = curr === "dark" ? "☀ Modo Claro" : "☾ Modo Oscuro";
        themeToggle.setAttribute(
          "aria-label",
          curr === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
        );
      }
    }
    updateThemeButtonLabel();

    if (themeToggle) {
      themeToggle.addEventListener("click", function () {
        var curr = document.documentElement.getAttribute("data-theme") || "dark";
        var next = curr === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try {
          localStorage.setItem(THEME_KEY, next);
        } catch (e) {}
        var metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
          metaTheme.setAttribute("content", next === "light" ? "#f6f2ea" : "#08070c");
        }
        updateThemeButtonLabel();
      });
    }

    // Selector de arte de portada (Portada Holo / Portada Clásica / Contraportada)
    var coverImg = document.getElementById("hero-cover-img");
    var coverCaption = document.getElementById("hero-cover-caption");
    var coverTabs = document.querySelectorAll("[data-cover-src]");
    for (var c = 0; c < coverTabs.length; c++) {
      coverTabs[c].addEventListener("click", function () {
        var src = this.getAttribute("data-cover-src");
        var caption = this.getAttribute("data-cover-caption");
        if (coverImg && src) {
          coverImg.src = src;
        }
        if (coverCaption && caption) {
          coverCaption.textContent = caption;
        }
        for (var j = 0; j < coverTabs.length; j++) {
          coverTabs[j].classList.remove("is-active");
          coverTabs[j].setAttribute("aria-pressed", "false");
        }
        this.classList.add("is-active");
        this.setAttribute("aria-pressed", "true");
      });
    }

    // Buscador de conceptos filosóficos en todo el libro
    var searchInput = document.getElementById("book-search-input");
    var searchResults = document.getElementById("book-search-results");

    function normalizeText(str) {
      return (str || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    }

    if (searchInput && searchResults) {
      searchInput.addEventListener("input", function () {
        var q = normalizeText(searchInput.value.trim());
        if (q.length < 2) {
          searchResults.hidden = true;
          searchResults.innerHTML = "";
          return;
        }

        var matches = [];
        for (var i = 0; i < sections.length; i++) {
          var s = sections[i];
          var hayTitle = normalizeText(s.title + " " + (s.summary || ""));
          var matchedSnippet = "";

          if (hayTitle.indexOf(q) !== -1) {
            matchedSnippet = s.summary || s.subtitle || "";
          } else if (s.subheadings) {
            for (var h = 0; h < s.subheadings.length; h++) {
              if (normalizeText(s.subheadings[h]).indexOf(q) !== -1) {
                matchedSnippet = "Subcapítulo: " + s.subheadings[h];
                break;
              }
            }
          }

          if (!matchedSnippet && s.blocks) {
            for (var b = 0; b < s.blocks.length; b++) {
              var plain = (s.blocks[b].html || s.blocks[b].text || "").replace(
                /<[^>]+>/g,
                ""
              );
              if (normalizeText(plain).indexOf(q) !== -1) {
                matchedSnippet =
                  plain.length > 140 ? plain.slice(0, 140) + "…" : plain;
                break;
              }
            }
          }

          if (matchedSnippet) {
            matches.push({
              id: s.id,
              badge: s.badge,
              title: s.title,
              unlocked: s.unlocked,
              snippet: matchedSnippet
            });
          }
        }

        if (matches.length === 0) {
          searchResults.hidden = false;
          searchResults.innerHTML =
            '<div class="search-empty">No se encontraron secciones con «' +
            searchInput.value.replace(/[<>&]/g, "") +
            "». Probá términos como <em>gnosis</em>, <em>Demiurgo</em>, <em>Pléroma</em>, <em>Sofía</em>, <em>catarismo</em> o <em>caverna</em>.</div>";
          return;
        }

        var resHtml = "";
        for (var m = 0; m < Math.min(matches.length, 8); m++) {
          var hit = matches[m];
          resHtml +=
            '<button type="button" class="search-hit" data-section-id="' +
            hit.id +
            '">' +
            '<div class="search-hit-top">' +
            "<strong>" +
            hit.badge +
            ": " +
            hit.title +
            "</strong>" +
            '<span class="search-hit-tag">' +
            (hit.unlocked ? "Capítulo abierto" : "Vista previa") +
            "</span>" +
            "</div>" +
            '<p class="search-hit-snippet">' +
            hit.snippet +
            "</p>" +
            "</button>";
        }
        searchResults.hidden = false;
        searchResults.innerHTML = resHtml;
      });

      document.addEventListener("click", function (ev) {
        if (
          !searchResults.hidden &&
          !ev.target.closest(".search-box-wrap")
        ) {
          searchResults.hidden = true;
        }
      });
    }

    // Barra de progreso de lectura
    var progressBar = document.getElementById("reading-progress-bar");
    function updateReadingProgress() {
      var readerCard = document.getElementById("reader-card");
      if (!readerCard || !progressBar) {
        return;
      }
      var rect = readerCard.getBoundingClientRect();
      var total = Math.max(1, readerCard.offsetHeight - window.innerHeight * 0.6);
      var scrolled = Math.min(total, Math.max(0, -rect.top + 120));
      var pct = Math.round((scrolled / total) * 100);
      progressBar.style.width = pct + "%";
    }

    window.addEventListener("scroll", updateReadingProgress, { passive: true });

    // Botones Copiar (Prex, Mercado Pago, correo, WhatsApp)
    var copyButtons = document.querySelectorAll("button.copy[data-copy]");
    var copyStatus = document.getElementById("copy-status");

    function copyTextToClipboard(text, onDone) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(onDone).catch(function () {
          fallbackCopy(text, onDone);
        });
      } else {
        fallbackCopy(text, onDone);
      }
    }

    function fallbackCopy(text, onDone) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "readonly");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch (e) {}
      document.body.removeChild(ta);
      onDone();
    }

    for (var b = 0; b < copyButtons.length; b++) {
      copyButtons[b].addEventListener("click", function () {
        var btn = this;
        var val = btn.getAttribute("data-copy") || "";
        var originalText = btn.getAttribute("data-original-label") || btn.textContent;
        btn.setAttribute("data-original-label", originalText);

        copyTextToClipboard(val, function () {
          btn.textContent = "Copiado ✓";
          btn.classList.add("is-copied");
          if (copyStatus) {
            copyStatus.textContent = "Copiado al portapapeles: " + val;
          }
          setTimeout(function () {
            btn.textContent = originalText;
            btn.classList.remove("is-copied");
          }, 2000);
        });
      });
    }

    // Render inicial
    applyTypographyPreferences();
    renderSection(currentSectionId, false);
  });
})();
