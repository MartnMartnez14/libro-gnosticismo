#!/usr/bin/env python3
"""Generador de datos para la web de lectura con publicidad:
GNOSTICISMO, la verdad más allá del velo (Martín Martínez García · Bluffer, 2026).
"""

from __future__ import annotations

import argparse
import html
import json
import math
import os
import re
import shutil
from pathlib import Path
from typing import Any

PROJECT_ROOT = Path(__file__).resolve().parent.parent
BOOK_SOURCE_DIR = Path(os.environ.get("BOOK_SOURCE_DIR", str(Path.home() / "Libro Gnostiscismo ")))
BOOK_MD_PATH = BOOK_SOURCE_DIR / "Libro GNOSTICISMO la verdad más allá del velo 2026  .md"

COVER_HOLO_SRC = (
    BOOK_SOURCE_DIR
    / "publicacion archivos con readmi y demas cosas necesarias"
    / "PORTADA_OFICIAL_GOOGLE_PLAY_1600x2560.jpg"
)
COVER_CLASSIC_SRC = (
    BOOK_SOURCE_DIR
    / "publicacion archivos con readmi y demas cosas necesarias"
    / "PORTADA_KDP_1600x2560_ESTANDAR.jpg"
)
BACKCOVER_SRC = (
    BOOK_SOURCE_DIR
    / "imagenes porta contraportada caratula etc"
    / "portadas_holo_pokemon"
    / "00_contraportada_original_limpia_sin_bordes_1600x2560.png"
)


def inline_markdown_to_html(text: str) -> str:
    """Convierte énfasis Markdown (**negrita**, *cursiva*) a HTML seguro."""
    clean = text.replace("\\.", ".").replace("\\-", "-")
    escaped = html.escape(clean, quote=False)
    # **bold**
    escaped = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", escaped)
    # *italic*
    escaped = re.sub(r"\*(.+?)\*", r"<em>\1</em>", escaped)
    return escaped.strip()


def parse_glossary(lines: list[str]) -> dict[int, dict[str, str]]:
    """Extrae las descripciones oficiales de los 27 capítulos desde el Glosario."""
    glossary: dict[int, dict[str, str]] = {}
    pattern = re.compile(
        r"^\*\*Capítulo\s+(\d+),\s*(.+?)\*\*:\s*(.+)$"
    )
    for raw in lines:
        line = raw.strip()
        m = pattern.match(line)
        if m:
            num = int(m.group(1))
            raw_title = re.sub(r"\*(.+?)\*", r"\1", m.group(2)).strip()
            desc = m.group(3).strip()
            glossary[num] = {
                "number": str(num),
                "title": raw_title,
                "summary": desc,
                "summary_html": inline_markdown_to_html(desc),
            }
    return glossary


def parse_book_markdown(md_path: Path, max_unlocked_chapters: int = 3) -> dict[str, Any]:
    """Lee el archivo Markdown en modo de solo lectura y estructura las secciones."""
    with md_path.open("r", encoding="utf-8") as f:
        all_lines = f.readlines()

    # Ignorar las últimas líneas con imágenes en base64 ([image1]:, [image2]:)
    lines = [
        l for l in all_lines
        if not l.startswith("[image1]:") and not l.startswith("[image2]:")
    ]

    glossary = parse_glossary(lines[:105])

    # Extraer Prefacio y Agradecimientos (líneas 88..104)
    preface_paragraphs: list[str] = []
    thanks_paragraphs: list[str] = []
    mode = None
    for raw in lines[88:105]:
        s = raw.strip()
        if not s or s == "#":
            continue
        if s.startswith("## Prefacio"):
            mode = "preface"
            continue
        if s.startswith("## Agradecimientos"):
            mode = "thanks"
            continue
        if mode == "preface":
            preface_paragraphs.append(inline_markdown_to_html(s))
        elif mode == "thanks":
            thanks_paragraphs.append(inline_markdown_to_html(s))

    # Localizar dónde empieza cada capítulo (# Capítulo N: ...) y el Epílogo
    chapter_starts: list[tuple[int, str, int]] = []
    epilogue_line = len(lines)
    chap_regex = re.compile(r"^#\s+\*{0,2}Capítulo\s+(\d+):\s*(.+?)\*{0,2}\s*$")

    for idx, raw in enumerate(lines):
        s = raw.strip()
        m = chap_regex.match(s)
        if m:
            chap_num = int(m.group(1))
            chap_title = m.group(2).rstrip(".").strip()
            chapter_starts.append((chap_num, chap_title, idx))
        elif s.startswith("# Epílogo:"):
            epilogue_line = idx

    sections: list[dict[str, Any]] = []

    # 1. Sección Preliminares (Prefacio + Agradecimientos + Glosario completo de los 27 capítulos)
    prelim_words = sum(
        len(re.sub(r"<[^>]+>", "", p).split())
        for p in preface_paragraphs + thanks_paragraphs
    )
    sections.append(
        {
            "id": "preliminares",
            "kind": "preliminares",
            "number": 0,
            "badge": "Preliminares",
            "title": "Prefacio, Agradecimientos y Mapa de los 27 Capítulos",
            "subtitle": "Invitación filosófica a recorrer la obra sin dogmas ni certezas cerradas",
            "unlocked": True,
            "word_count": prelim_words,
            "reading_minutes": max(3, math.ceil(prelim_words / 200)),
            "summary": (
                "Presentación del propósito filosófico y espiritual del libro, "
                "agradecimientos del autor y glosario descriptivo de los 27 capítulos."
            ),
            "subheadings": [
                "Prefacio",
                "Agradecimientos",
                "Glosario e Índice de los XXVII Capítulos",
            ],
            "blocks": [
                {"type": "h2", "text": "Prefacio"},
                *[{"type": "p", "html": p} for p in preface_paragraphs],
                {"type": "ad_slot", "slot": "in-article-1"},
                {"type": "h2", "text": "Agradecimientos"},
                *[{"type": "p", "html": p} for p in thanks_paragraphs],
            ],
        }
    )

    # 2. Capítulos 1 a 27
    for i, (chap_num, chap_title, start_idx) in enumerate(chapter_starts):
        end_idx = (
            chapter_starts[i + 1][2]
            if i + 1 < len(chapter_starts)
            else epilogue_line
        )
        chunk = lines[start_idx + 1 : end_idx]

        subheadings: list[str] = []
        blocks: list[dict[str, str]] = []
        raw_words = 0

        for raw in chunk:
            s = raw.strip()
            if not s or s in ("#", "##", "###") or s.startswith("![][image"):
                continue
            if s.startswith("## "):
                sub_text = re.sub(r"\*{1,2}(.+?)\*{1,2}", r"\1", s[3:]).strip().rstrip(".")
                if sub_text:
                    subheadings.append(sub_text)
                    blocks.append({"type": "h2", "text": sub_text})
            elif s.startswith("### "):
                sub_text = re.sub(r"\*{1,2}(.+?)\*{1,2}", r"\1", s[4:]).strip().rstrip(".")
                if sub_text:
                    blocks.append({"type": "h3", "text": sub_text})
            elif s.startswith("* "):
                item_html = inline_markdown_to_html(s[2:].strip())
                raw_words += len(s[2:].split())
                blocks.append({"type": "li", "html": item_html})
            else:
                p_html = inline_markdown_to_html(s)
                raw_words += len(s.split())
                blocks.append({"type": "p", "html": p_html})

        is_unlocked = chap_num <= max_unlocked_chapters
        glossary_entry = glossary.get(chap_num, {})
        summary_text = glossary_entry.get(
            "summary",
            f"Capítulo {chap_num} de GNOSTICISMO, la verdad más allá del velo.",
        )
        summary_html = glossary_entry.get(
            "summary_html", inline_markdown_to_html(summary_text)
        )

        if is_unlocked:
            # Insertar un slot publicitario in-article a mitad del capítulo
            mid_idx = max(2, len(blocks) // 2)
            blocks_with_ads = (
                blocks[:mid_idx]
                + [{"type": "ad_slot", "slot": f"in-article-cap-{chap_num}"}]
                + blocks[mid_idx:]
            )
            preview_paragraph = ""
            teaser_cut_html = ""
            for b in blocks:
                if b["type"] == "p":
                    preview_paragraph = b["html"]
                    break
        else:
            # Para capítulos 4..27: incluir el primer párrafo + el segundo párrafo cortado a la mitad ("resumen cortado")
            para_blocks = [b["html"] for b in blocks if b["type"] == "p"]
            first_para = para_blocks[0] if len(para_blocks) > 0 else ""
            second_para_raw = re.sub(r"<[^>]+>", "", para_blocks[1]) if len(para_blocks) > 1 else ""
            words_p2 = second_para_raw.split()
            cut_len = min(55, max(28, len(words_p2) // 2))
            teaser_cut = " ".join(words_p2[:cut_len]).rstrip(".,;:") + "…" if words_p2 else ""
            teaser_cut_html = html.escape(teaser_cut, quote=False)

            blocks_with_ads = []
            if first_para:
                blocks_with_ads.append({"type": "p", "html": first_para})
            if teaser_cut_html:
                blocks_with_ads.append({"type": "p_cut", "html": teaser_cut_html})
            preview_paragraph = first_para

        sections.append(
            {
                "id": f"capitulo-{chap_num}",
                "kind": "chapter",
                "number": chap_num,
                "badge": f"Capítulo {chap_num}",
                "title": chap_title,
                "subtitle": summary_text,
                "summary": summary_text,
                "summary_html": summary_html,
                "unlocked": is_unlocked,
                "word_count": raw_words,
                "reading_minutes": max(4, math.ceil(raw_words / 200)),
                "subheadings": subheadings,
                "preview_html": preview_paragraph,
                "teaser_cut_html": teaser_cut_html,
                "blocks": blocks_with_ads,
            }
        )

    # 3. Ficha de Contraportada y Créditos
    sections.append(
        {
            "id": "contraportada-y-creditos",
            "kind": "backmatter",
            "number": 28,
            "badge": "Contraportada y Créditos",
            "title": "Contraportada, Fuentes y Créditos de la Obra",
            "subtitle": "GNOSTICISMO, la verdad más allá del velo · Una cosmovisión entre la materia y el espíritu",
            "unlocked": True,
            "word_count": 320,
            "reading_minutes": 2,
            "summary": (
                "Texto oficial de contraportada, tradición documental consultada "
                "(Nag Hammadi, canon budista, fuentes clásicas) y créditos artísticos."
            ),
            "subheadings": [
                "Texto de Contraportada",
                "Tradiciones y Fuentes Documentales",
                "Créditos de las Ilustraciones y Autoría",
            ],
            "blocks": [
                {"type": "h2", "text": "Texto de Contraportada"},
                {
                    "type": "p",
                    "html": (
                        "<strong>¿Y si aquello que conocemos de la realidad fuera solamente una ilusión "
                        "o una sola parte de lo que existe en realidad?</strong>"
                    ),
                },
                {
                    "type": "p",
                    "html": (
                        "Desde tiempos inmemoriales, la humanidad ha buscado comprender el origen de su "
                        "existencia, los misterios del universo y el sentido profundo de la conciencia. "
                        "Esta obra invita al lector a recorrer las ideas del gnosticismo y establecer un "
                        "diálogo abierto con el catarismo albigense, el budismo, el cristianismo, el "
                        "estoicismo, la filosofía clásica, la ciencia contemporánea y la ciencia ficción."
                    ),
                },
                {
                    "type": "p",
                    "html": (
                        "A través de preguntas sobre el conocimiento, la libertad, el sufrimiento y la "
                        "trascendencia, el libro propone una exploración rigurosa y accesible que no "
                        "pretende imponer respuestas cerradas, sino despertar preguntas y ofrecer nuevas "
                        "perspectivas para mirar más allá del velo."
                    ),
                },
                {"type": "ad_slot", "slot": "in-article-backmatter"},
                {"type": "h2", "text": "Tradiciones y Fuentes Documentales de la Obra Completa"},
                {
                    "type": "p",
                    "html": (
                        "La edición íntegra de 27 capítulos incluye referencias académicas y fuentes "
                        "antiguas de la <strong>Biblioteca de Nag Hammadi</strong> (<em>Apócrifo de Juan</em>, "
                        "<em>Evangelio de Tomás</em>, <em>Evangelio de la Verdad</em>, <em>Hipóstasis de los "
                        "Arcontes</em>, <em>Pistis Sophia</em>), del <strong>canon budista</strong> "
                        "(<em>Dhammapada</em>, <em>Anattalakkhaṇa Sutta</em>, <em>Satipaṭṭhāna Sutta</em>), "
                        "del <strong>estoicismo clásico</strong> (Epicteto, Marco Aurelio, Séneca), "
                        "del <strong>platonismo</strong> y de estudios históricos contemporáneos."
                    ),
                },
                {"type": "h2", "text": "Créditos de las Ilustraciones y Derechos"},
                {
                    "type": "p",
                    "html": (
                        "Obra escrita por <strong>Martín Martínez García (Bluffer)</strong> · Año 2026. "
                        "La concepción artística, selección simbólica y edición final de portada y "
                        "contraportada fueron desarrolladas por el autor. Todos los derechos reservados."
                    ),
                },
            ],
        }
    )

    total_book_words = sum(s["word_count"] for s in sections)
    unlocked_words = sum(s["word_count"] for s in sections if s["unlocked"])

    return {
        "meta": {
            "title": "GNOSTICISMO, la verdad más allá del velo",
            "subtitle": (
                "Cosmovisión entre materia y espíritu: Reflexiones desde la filosofía gnóstica "
                "del catarismo albigense, el budismo, el cristianismo temprano y presente, el "
                "estoicismo y otras filosofías de vida reales y de la ciencia ficción."
            ),
            "author": "Martín Martínez García",
            "pseudonym": "Bluffer",
            "year": 2026,
            "price_usd": "4.99",
            "total_chapters": 27,
            "unlocked_chapters": max_unlocked_chapters,
            "total_book_words": total_book_words,
            "unlocked_words": unlocked_words,
            "wrixy_url": "https://wrixy.app/book/qj2cnCIX",
            "portfolio_url": "https://martnmartnez14.github.io/bluffer-style-23/",
            "checklist_url": "https://checklistgato.com/",
            "github_url": "https://github.com/MartnMartnez14",
            "kofi_url": "https://ko-fi.com/martinmartinezgarcia",
            "paypal_url": "https://www.paypal.com/paypalme/blufferedtwitch",
            "starlink_url": "https://starlink.com/es?referral=RC-DF-5848974-78640-68&app_source=share",
            "prex_account": "35502",
            "mercadopago_account": "1006269736963",
            "contact_email": "mmartinez23bio@hotmail.com",
            "secondary_email": "mmartinez23bio@gmail.com",
            "whatsapp_url": "https://wa.me/59892663680",
            "whatsapp_display": "+598 92 663 680",
            "linkedin_url": "https://www.linkedin.com/in/tipitincho/",
        },
        "glossary": [glossary[k] for k in sorted(glossary.keys())],
        "sections": sections,
    }


def copy_and_optimize_images(dest_img_dir: Path) -> None:
    """Copia las portadas desde la carpeta original (solo lectura) hacia static/img/."""
    dest_img_dir.mkdir(parents=True, exist_ok=True)
    try:
        from PIL import Image  # type: ignore

        targets = [
            (COVER_HOLO_SRC, dest_img_dir / "portada-holo.jpg", (900, 1440)),
            (COVER_CLASSIC_SRC, dest_img_dir / "portada-clasica.jpg", (900, 1440)),
            (BACKCOVER_SRC, dest_img_dir / "contraportada.jpg", (900, 1440)),
        ]
        for src, dst, max_size in targets:
            with Image.open(src) as im:
                rgb = im.convert("RGB")
                rgb.thumbnail(max_size, Image.Resampling.LANCZOS)
                rgb.save(dst, format="JPEG", quality=86, optimize=True)
    except Exception:
        shutil.copyfile(COVER_HOLO_SRC, dest_img_dir / "portada-holo.jpg")
        shutil.copyfile(COVER_CLASSIC_SRC, dest_img_dir / "portada-clasica.jpg")
        shutil.copyfile(BACKCOVER_SRC, dest_img_dir / "contraportada.jpg")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Genera los datos estructurados del libro para la web con publicidad."
    )
    parser.add_argument(
        "--max-chapters",
        type=int,
        default=3,
        help="Cantidad de capítulos iniciales abiertos gratuitamente con publicidad (por defecto: 3).",
    )
    args = parser.parse_args()

    data = parse_book_markdown(BOOK_MD_PATH, max_unlocked_chapters=args.max_chapters)

    data_dir = PROJECT_ROOT / "static" / "data"
    img_dir = PROJECT_ROOT / "static" / "img"
    data_dir.mkdir(parents=True, exist_ok=True)

    json_path = data_dir / "book-data.json"
    js_path = data_dir / "book-data.js"

    json_str = json.dumps(data, ensure_ascii=False, indent=2)
    json_path.write_text(json_str, encoding="utf-8")
    js_path.write_text(
        f"/* Auto-generado por scripts/build_book_data.py — No editar manualmente */\n"
        f"window.GNOSTIC_BOOK_DATA = {json_str};\n",
        encoding="utf-8",
    )

    copy_and_optimize_images(img_dir)
    print(
        f"OK: Generadas {len(data['sections'])} secciones "
        f"({args.max_chapters} capítulos completos abiertos + {27 - args.max_chapters} en modo catálogo/vista previa)."
    )


if __name__ == "__main__":
    main()
