import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOK_ORIGINAL_DIR = Path.home() / "Libro Gnostiscismo "


class TestGnosticBookAdSite(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.index_html = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.css = (ROOT / "static" / "css" / "style.css").read_text(encoding="utf-8")
        cls.ads_js = (ROOT / "static" / "js" / "ads.js").read_text(encoding="utf-8")
        cls.reader_js = (ROOT / "static" / "js" / "reader.js").read_text(encoding="utf-8")
        cls.sponsors_js = (ROOT / "static" / "js" / "sponsors.js").read_text(encoding="utf-8")
        cls.ads_txt = (ROOT / "ads.txt").read_text(encoding="utf-8")
        cls.book_data = json.loads(
            (ROOT / "static" / "data" / "book-data.json").read_text(encoding="utf-8")
        )

    def test_01_book_data_structure_and_3_unlocked_chapters(self) -> None:
        """Verifica que existan las 29 secciones, con los 3 primeros capítulos completos abiertos y del 4 al 27 en vista previa."""
        meta = self.book_data["meta"]
        self.assertEqual(meta["total_chapters"], 27)
        self.assertEqual(meta["unlocked_chapters"], 3)

        sections = self.book_data["sections"]
        self.assertEqual(len(sections), 29)  # Preliminares + 27 capítulos + Contraportada

        # Preliminares abierto
        self.assertTrue(sections[0]["unlocked"])
        self.assertEqual(sections[0]["id"], "preliminares")

        # Capítulos 1, 2 y 3 abiertos y con bloques completos + slot in-article
        for cap_num in (1, 2, 3):
            sec = sections[cap_num]
            self.assertEqual(sec["id"], f"capitulo-{cap_num}")
            self.assertTrue(sec["unlocked"])
            self.assertGreater(len(sec["blocks"]), 5)
            has_ad_slot = any(b.get("type") == "ad_slot" for b in sec["blocks"])
            self.assertTrue(has_ad_slot, f"Capítulo {cap_num} debe tener slot publicitario intercalado")

        # Capítulos 4 al 27 bloqueados (modo resumen cortado) sin exponer todo el texto
        for cap_num in range(4, 28):
            sec = sections[cap_num]
            self.assertEqual(sec["id"], f"capitulo-{cap_num}")
            self.assertFalse(sec["unlocked"])
            self.assertLessEqual(len(sec["blocks"]), 2)
            self.assertTrue(len(sec["summary"]) > 20)
            self.assertTrue(sec["teaser_cut_html"].endswith("…"))

    def test_02_glossary_has_all_27_chapters(self) -> None:
        glossary = self.book_data["glossary"]
        self.assertEqual(len(glossary), 27)
        self.assertEqual(glossary[0]["number"], "1")
        self.assertEqual(glossary[26]["number"], "27")

    def test_03_side_ad_rails_and_banners_in_html(self) -> None:
        """Verifica que estén presentes los carriles laterales (izquierdo y derecho) y banners con grid-column explícito."""
        expected_positions = [
            'data-slot-box="banner-top"',
            'data-slot-box="rail-left-top"',
            'data-slot-box="rail-left-bottom"',
            'data-slot-box="rail-right-top"',
            'data-slot-box="rail-right-bottom"',
            'data-slot-box="banner-bottom"',
        ]
        for pos in expected_positions:
            self.assertIn(pos, self.index_html, f"Falta posición {pos}")
        self.assertIn("grid-column: 2;", self.css)

    def test_04_ads_txt_and_adsense_integration_ready(self) -> None:
        self.assertIn("google.com, pub-", self.ads_txt)
        self.assertIn("DIRECT, f08c47fec0942fa0", self.ads_txt)
        self.assertIn("pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", self.ads_js)
        self.assertIn("adsbygoogle", self.ads_js)

    def test_05_author_links_and_copy_buttons(self) -> None:
        self.assertIn("https://wrixy.app/book/qj2cnCIX", self.index_html)
        self.assertIn("https://ko-fi.com/martinmartinezgarcia", self.index_html)
        self.assertIn("https://www.paypal.com/paypalme/blufferedtwitch", self.index_html)
        self.assertIn('data-copy="35502"', self.index_html)
        self.assertIn('data-copy="1006269736963"', self.index_html)
        self.assertIn('data-copy="mmartinez23bio@hotmail.com"', self.index_html)
        # Verificar oferta de compra directa PDF + eBook por USD 4,99 único pago
        self.assertIn("PDF + eBook", self.index_html)
        self.assertIn("4,99", self.index_html)
        self.assertIn("único pago", self.index_html)
        self.assertIn("PDF + eBook", self.reader_js)
        self.assertIn("4,99", self.ads_js)

    def test_06_images_exist_and_non_empty(self) -> None:
        for img_name in ("portada-holo.jpg", "portada-clasica.jpg", "contraportada.jpg"):
            img_path = ROOT / "static" / "img" / img_name
            self.assertTrue(img_path.is_file(), f"Falta imagen {img_name}")
            self.assertGreater(img_path.stat().st_size, 10_000)

    def test_07_privacy_policy_for_adsense_present(self) -> None:
        self.assertIn("Política de Privacidad, Cookies y Derechos de Autor", self.index_html)
        self.assertIn("DoubleClick DART", self.index_html)
        self.assertIn("adssettings.google.com", self.index_html)

    def test_08_original_book_folder_untouched(self) -> None:
        """Verifica que la carpeta original del libro existe y su archivo Markdown original permanece intacto."""
        md_file = BOOK_ORIGINAL_DIR / "Libro GNOSTICISMO la verdad más allá del velo 2026  .md"
        self.assertTrue(md_file.is_file())
        self.assertEqual(md_file.stat().st_size, 3038180)

    def test_09_amazon_kindle_storefront_links(self) -> None:
        """Verifica que el libro enlace a la Tienda Kindle con el ASIN real en HTML, JS y datos."""
        amazon_url = "https://www.amazon.es/dp/B0H4X4X14W"
        asin = "B0H4X4X14W"

        meta = self.book_data["meta"]
        self.assertEqual(meta["amazon_url"], amazon_url)
        self.assertEqual(meta["amazon_asin"], asin)
        self.assertEqual(meta["amazon_url_mx"], "https://www.amazon.com.mx/dp/B0H4X4X14W")

        self.assertIn(amazon_url, self.index_html)
        self.assertIn("https://www.amazon.com.mx/dp/B0H4X4X14W", self.index_html)
        self.assertIn(asin, self.index_html)
        self.assertIn(amazon_url, self.reader_js)
        self.assertIn(amazon_url, self.sponsors_js)
        # Ya no debe afirmarse que el manuscrito está en revisión
        self.assertNotIn("Manuscrito enviado y en revisión", self.index_html)


if __name__ == "__main__":
    unittest.main()
