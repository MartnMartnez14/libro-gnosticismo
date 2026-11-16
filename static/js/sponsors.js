/* ==========================================================================
   Motor de Espacios Patrocinados y Google AdSense
   Obra: GNOSTICISMO, la verdad más allá del velo (Martín Martínez · Bluffer)
   ========================================================================== */
(function () {
  "use strict";

  /**
   * CONFIGURACIÓN CENTRAL DE GOOGLE ADSENSE
   * Para activar anuncios reales de Google AdSense cuando tu cuenta esté aprobada:
   * 1. Cambiá `adsenseEnabled` a `true`.
   * 2. Reemplazá `clientId` por tu ID real (ej. "ca-pub-1234567890123456").
   * 3. Colocá los IDs numéricos de cada bloque creado en tu panel de AdSense.
   */
  var DEFAULT_ADS_CONFIG = {
    adsenseEnabled: false,
    clientId: "ca-pub-0000000000000000",
    slots: {
      "rail-left-top": "1111111111",
      "rail-left-bottom": "2222222222",
      "rail-right-top": "3333333333",
      "rail-right-bottom": "4444444444",
      "banner-top": "5555555555",
      "banner-bottom": "6666666666",
      "in-article": "7777777777"
    }
  };

  window.GNOSTIC_ADS_CONFIG = window.GNOSTIC_ADS_CONFIG || DEFAULT_ADS_CONFIG;

  var HOUSE_CARDS = {
    "rail-left-top": {
      badge: "COMPRA DIRECTA · USD 4,99",
      format: "Vertical · 300×600",
      eyebrow: "PDF + eBook Completo · Único Pago",
      title: "Recibí el libro completo en PDF y eBook por USD 4,99",
      body: "Comunicate personalmente conmigo por WhatsApp o correo y te envío los 27 capítulos completos en PDF + EPUB por tan solo 4,99 dólares (único pago). También en Wrixy y Amazon.",
      ctaText: "Pedir PDF + eBook por WhatsApp ↗",
      ctaHref: "https://wa.me/59892663680?text=Hola%20Mart%C3%ADn%2C%20quiero%20comprar%20el%20libro%20completo%20de%20Gnosticismo%20(PDF%20%2B%20eBook)%20por%20USD%204%2C99%20%C3%BAnico%20pago.",
      secondaryText: "Ver también en Wrixy o escribir correo →",
      secondaryHref: "#edicion-completa",
      accent: "gold"
    },
    "rail-left-bottom": {
      badge: "PROYECTO DESTACADO",
      format: "Rectángulo · 300×250",
      eyebrow: "App Web Gratuita · Sin Cuentas",
      title: "Checklist Gato · Todo tiene un hilo",
      body: "Organizá notas, listas de lectura y mapas de ideas en tu propio dispositivo. Funciona offline y con copias de seguridad locales.",
      ctaText: "Probar Checklist Gato ↗",
      ctaHref: "https://checklistgato.com/",
      secondaryText: "Ver portfolio completo ↗",
      secondaryHref: "https://martnmartnez14.github.io/bluffer-style-23/",
      accent: "lime"
    },
    "rail-right-top": {
      badge: "APOYO AL AUTOR",
      format: "Vertical · 300×600",
      eyebrow: "Edición Independiente · Uruguay",
      title: "¿Disfrutás la lectura? Invitame un mate o cafecito",
      body: "Tu apoyo voluntario ayuda a mantener esta edición web abierta y financiar nuevas investigaciones filosóficas y herramientas libres.",
      ctaText: "Invitar en Ko-fi ☕ ↗",
      ctaHref: "https://ko-fi.com/martinmartinezgarcia",
      secondaryText: "PayPal · Prex (35502) · Mercado Pago",
      secondaryHref: "#apoyar-autor",
      accent: "purple"
    },
    "rail-right-bottom": {
      badge: "HERRAMIENTA DE ESTUDIO",
      format: "Rectángulo · 300×250",
      eyebrow: "Extensión Chrome · Manifest V3",
      title: "YT Temporal Comments · Volvé al minuto exacto",
      body: "Guardá notas privadas con marcadores de color en videos y conferencias de filosofía o estudio en YouTube, 100% en tu navegador.",
      ctaText: "Ver en GitHub ↗",
      ctaHref: "https://github.com/MartnMartnez14/yt-temporal-comments",
      secondaryText: "Más proyectos de Bluffer ↗",
      secondaryHref: "https://martnmartnez14.github.io/bluffer-style-23/",
      accent: "gold"
    },
    "banner-top": {
      badge: "EDICIÓN CON PATROCINIO · GOOGLE ADSENSE",
      format: "Horizontal · 728×90",
      eyebrow: "Edición Digital Financiada con Publicidad",
      title: "GNOSTICISMO, la verdad más allá del velo — Muestra de los 3 primeros capítulos",
      body: "Explorá gratuitamente el Prefacio, el Glosario de los 27 capítulos y los Capítulos 1 al 3 completos. Pedí el PDF + eBook completo por USD 4,99 único pago o leelo en Wrixy.",
      ctaText: "Pedir PDF + eBook (USD 4,99) ↗",
      ctaHref: "https://wa.me/59892663680?text=Hola%20Mart%C3%ADn%2C%20quiero%20comprar%20el%20libro%20completo%20de%20Gnosticismo%20(PDF%20%2B%20eBook)%20por%20USD%204%2C99%20%C3%BAnico%20pago.",
      secondaryText: "Configurar Google AdSense",
      secondaryHref: "#guia-adsense",
      accent: "gold"
    },
    "banner-bottom": {
      badge: "ESPACIO DESTACADO · PIE DE LECTURA",
      format: "Horizontal · 728×90",
      eyebrow: "Universo Creativo · Martín Martínez (Bluffer)",
      title: "Software, bienestar y filosofía desde Canelones, Uruguay",
      body: "Visitá Bluffer Style 23 para descubrir las 22 aplicaciones, juegos y herramientas educativas abiertas.",
      ctaText: "Explorar Bluffer Style 23 ↗",
      ctaHref: "https://martnmartnez14.github.io/bluffer-style-23/",
      secondaryText: "Apoyar con Prex / Mercado Pago",
      secondaryHref: "#apoyar-autor",
      accent: "purple"
    },
    "in-article": {
      badge: "ESPACIO PATROCINADO · INTERCALADO",
      format: "Google AdSense In-Article Fluid",
      eyebrow: "PDF + eBook Completo · USD 4,99 Único Pago",
      title: "¿Querés el libro completo en PDF y eBook sin publicidad?",
      body: "Escribime personalmente a mi WhatsApp (+598 92 663 680) o correo (mmartinez23bio@hotmail.com) y te envío la obra íntegra de 27 capítulos en PDF + eBook por tan solo USD 4,99 único pago.",
      ctaText: "Pedir directo al autor (USD 4,99) ↗",
      ctaHref: "https://wa.me/59892663680?text=Hola%20Mart%C3%ADn%2C%20quiero%20comprar%20el%20libro%20completo%20de%20Gnosticismo%20(PDF%20%2B%20eBook)%20por%20USD%204%2C99%20%C3%BAnico%20pago.",
      secondaryText: "O leer en Wrixy ↗",
      secondaryHref: "https://wrixy.app/book/qj2cnCIX",
      accent: "gold"
    }
  };

  var STORAGE_KEY_PREVIEW = "gnostic-reader-slot-preview-mode";
  var previewMode = "house";

  try {
    var savedMode = localStorage.getItem(STORAGE_KEY_PREVIEW);
    if (savedMode === "wireframe" || savedMode === "house") {
      previewMode = savedMode;
    }
  } catch (err) {
    /* ignore */
  }

  function isRealAdsenseConfigured() {
    var cfg = window.GNOSTIC_ADS_CONFIG;
    return Boolean(
      cfg &&
        cfg.adsenseEnabled === true &&
        typeof cfg.clientId === "string" &&
        cfg.clientId.indexOf("ca-pub-") === 0 &&
        cfg.clientId !== "ca-pub-0000000000000000"
    );
  }

  function ensureAdsenseScriptLoaded() {
    if (!isRealAdsenseConfigured()) {
      return;
    }
    if (document.getElementById("google-adsense-sdk")) {
      return;
    }
    var script = document.createElement("script");
    script.id = "google-adsense-sdk";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" +
      encodeURIComponent(window.GNOSTIC_ADS_CONFIG.clientId);
    document.head.appendChild(script);
  }

  function buildCardMarkup(slotKey, cardData, mode) {
    if (mode === "wireframe") {
      return (
        '<div class="promo-card promo-wireframe" data-slot-key="' +
        slotKey +
        '">' +
        '<div class="promo-head-bar">' +
        '<span class="promo-tag">BLOQUE GOOGLE ADSENSE</span>' +
        '<span class="promo-dim">' +
        cardData.format +
        "</span>" +
        "</div>" +
        '<div class="promo-wireframe-box">' +
        '<p class="promo-wireframe-title">Espacio Google AdSense listo</p>' +
        '<code class="promo-wireframe-code">data-ad-slot="' +
        (window.GNOSTIC_ADS_CONFIG.slots[slotKey] || "7777777777") +
        '"</code>' +
        '<p class="promo-wireframe-sub">Medida: <strong>' +
        cardData.format +
        "</strong><br>Se activa al colocar tu ID <code>ca-pub-...</code>.</p>" +
        '<a class="promo-wireframe-link" href="#guia-adsense">Ver guía de activación →</a>' +
        "</div>" +
        "</div>"
      );
    }

    var isExternal = cardData.ctaHref.indexOf("http") === 0;
    var relAttr = isExternal ? ' target="_blank" rel="noopener"' : "";
    var isSecExternal = cardData.secondaryHref.indexOf("http") === 0;
    var secRelAttr = isSecExternal ? ' target="_blank" rel="noopener"' : "";

    return (
      '<div class="promo-card promo-accent-' +
      cardData.accent +
      '" data-slot-key="' +
      slotKey +
      '">' +
      '<div class="promo-head-bar">' +
      '<span class="promo-tag">' +
      cardData.badge +
      "</span>" +
      '<span class="promo-dim">' +
      cardData.format +
      "</span>" +
      "</div>" +
      '<div class="promo-card-body">' +
      '<p class="promo-eyebrow">' +
      cardData.eyebrow +
      "</p>" +
      '<h3 class="promo-title">' +
      cardData.title +
      "</h3>" +
      '<p class="promo-copy">' +
      cardData.body +
      "</p>" +
      '<div class="promo-actions">' +
      '<a class="promo-cta" href="' +
      cardData.ctaHref +
      '"' +
      relAttr +
      ">" +
      cardData.ctaText +
      "</a>" +
      '<a class="promo-secondary" href="' +
      cardData.secondaryHref +
      '"' +
      secRelAttr +
      ">" +
      cardData.secondaryText +
      "</a>" +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function renderSlotElement(container) {
    var slotKey =
      container.getAttribute("data-slot-box") ||
      "in-article";
    var lookupKey = HOUSE_CARDS[slotKey] ? slotKey : "in-article";
    var cardData = HOUSE_CARDS[lookupKey];

    if (isRealAdsenseConfigured() && previewMode !== "wireframe") {
      var cfg = window.GNOSTIC_ADS_CONFIG;
      var slotId =
        cfg.slots[lookupKey] || cfg.slots["in-article"] || "7777777777";
      var isFluid = lookupKey === "in-article";
      container.innerHTML =
        '<div class="promo-card promo-live">' +
        '<div class="promo-head-bar"><span class="promo-tag">ESPACIO PATROCINADO</span></div>' +
        '<ins class="adsbygoogle"' +
        ' style="display:block"' +
        ' data-ad-client="' +
        cfg.clientId +
        '"' +
        ' data-ad-slot="' +
        slotId +
        '"' +
        (isFluid
          ? ' data-ad-layout="in-article" data-ad-format="fluid"'
          : ' data-ad-format="auto" data-full-width-responsive="true"') +
        "></ins>" +
        "</div>";
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        container.innerHTML = buildCardMarkup(lookupKey, cardData, "house");
      }
      return;
    }

    container.innerHTML = buildCardMarkup(lookupKey, cardData, previewMode);
  }

  function renderAllSlots() {
    ensureAdsenseScriptLoaded();
    var containers = document.querySelectorAll("[data-slot-box]");
    for (var i = 0; i < containers.length; i++) {
      renderSlotElement(containers[i]);
    }
    updateStatusToolbar();
  }

  function updateStatusToolbar() {
    var statusBadge = document.getElementById("ad-mode-badge");
    var toggleBtn = document.getElementById("toggle-ad-preview");
    if (statusBadge) {
      if (isRealAdsenseConfigured()) {
        statusBadge.textContent = "Google AdSense Activo";
        statusBadge.className = "promo-status-pill is-live";
      } else if (previewMode === "wireframe") {
        statusBadge.textContent = "Vista Técnica de Slots IAB / AdSense";
        statusBadge.className = "promo-status-pill is-wireframe";
      } else {
        statusBadge.textContent = "Modo Patrocinio Propio (Pre-AdSense)";
        statusBadge.className = "promo-status-pill is-house";
      }
    }
    if (toggleBtn) {
      toggleBtn.textContent =
        previewMode === "wireframe"
          ? "Ver anuncios patrocinados de muestra"
          : "Inspeccionar medidas Google AdSense";
      toggleBtn.setAttribute(
        "aria-pressed",
        previewMode === "wireframe" ? "true" : "false"
      );
    }
  }

  function togglePreviewMode() {
    previewMode = previewMode === "house" ? "wireframe" : "house";
    try {
      localStorage.setItem(STORAGE_KEY_PREVIEW, previewMode);
    } catch (err) {
      /* ignore */
    }
    renderAllSlots();
  }

  window.GnosticAds = {
    renderAll: renderAllSlots,
    togglePreviewMode: togglePreviewMode,
    getPreviewMode: function () {
      return previewMode;
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    renderAllSlots();
    var toggleBtn = document.getElementById("toggle-ad-preview");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", togglePreviewMode);
    }
  });
})();
