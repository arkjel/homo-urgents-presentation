# Źródła i pochodzenie materiałów

## Raport Inquiry / Glovo

Materiał dostarczony przez użytkownika: `PUBLIKACJA 6.10 INQ.pdf`, 26 stron, raport „Homo Urgens. Człowiek pilnej potrzeby”, wrzesień 2026. Plik źródłowy pozostaje w Pobranych użytkownika; do przenośnej prezentacji nie jest potrzebny.

| Slajd | Strona PDF | Wartości i znaczenie |
|---|---|---|
| 6 | 5 | Homo Urgens jest trybem sytuacyjnym, nie trwałym segmentem lub generacją. |
| 7 | 6 | 78% chce produktu/usługi wtedy, kiedy ich potrzebuje. 48% woli szybko zdecydować niż długo rozważać możliwości. |
| 8 | 7 | Oczekiwanie realizacji potrzeby do maksymalnie kilku godzin: brakujący produkt spożywczy 53%, prezent/produkt na specjalną okazję 20%. |
| 9 | 11 | 55% zawsze lub często zna mniej więcej potrzebę, ale konkretny produkt wybiera podczas przeglądania aplikacji. 41% wybiera markę podczas przeglądania oferty. |
| 10 | 14 | Model otwartej, zawężanej i domykanej decyzji. |
| 12 | 14 | 48% uważa, że trafne rekomendacje pomagają szybciej znaleźć produkt. |
| 15 | 18, 20 | 67% często zwraca uwagę na promocje i oferty. 18% deklaruje częsty efekt w postaci szybszej decyzji, co kupić. Odrębne deklaracje, bez obliczania konwersji lub wnioskowania przyczynowego. |
| 16 | 21 | Wybrane kryteria produktu: cena 55%, promocja 37%, dostępność 28%, marka 23%. Jest to wybór kryteriów, nie kompletny ranking: wcześniejsze doświadczenia mają 26%. Odpowiedzi nie sumują się do 100%. |
| 17–19 | 17, 22 | Rola Retail Media w pokazaniu możliwości, ułatwieniu wyboru i domknięciu zakupu. |
| 20 | 19, 24, 25 | Implikacje i ograniczenie: zakup po ekspozycji nie jest sam w sobie dowodem przyczynowego wpływu reklamy. |

Metodologia (s. 4 raportu): CAWI objęło N=1002 mieszkańców miast, 18+. FGI to 2 grupy, łącznie 12 osób. Decision Lab obejmuje 11 ścieżek zakupowych w Glovo. Metodologia pozostaje w dokumentacji; osobny slajd został usunięty na prośbę użytkownika.

N=1002 nie jest automatycznie podstawą wszystkich procentów dotyczących użytkowników q-commerce. Przy slajdach tej podgrupy zaznaczono, że jej liczebność nie została podana w raporcie. Obserwacje Decision Lab pozostają jakościowe.

## Brandbook i grafiki konferencji

- `sprawny_marketing_brandbook.pdf`: sekcje I love marketing i I love marketing & technology, w tym typografia Lato, czerwień #ee312f, pole ochronne i zakaz zmiany proporcji oraz kolorów logo.
- `ILOVEMKT_Szablon_16-9.pptx.pdf`: format 1920×1080, tytułowe Lato Black/Bold, oryginalne grafiki.
- `assets/brand/conference-logo.png`: oryginalny przezroczysty obraz Image4 ze strony 1 PDF szablonu.
- `assets/brand/conference-heart.png`: oryginalny przezroczysty obraz Image8 ze strony 2 PDF szablonu.
- `assets/brand/conference-logo-stacked.png`: oryginalny przezroczysty obraz Image9 ze strony 2.

Obrazy wyodrębniono z PDF bez przerysowywania logotypu. Loader i wykresy danych są elementami HTML/CSS/SVG. Logo konferencji nie jest animowane ani przekształcane.

Podpisy prowadzących: [program organizatora](https://sprawnymarketing.pl/konferencja/poznan/), odczytany 8 października 2026. Zachowano nazwiska zgodne z aktualnym wpisem: Uliana Jelonek i Joanna Wysocka.

## Fonty

Lato Regular, Bold i Black pobrano z [repozytorium Google Fonts](https://github.com/google/fonts/tree/main/ofl/lato). Oryginalna licencja SIL Open Font License znajduje się w `assets/fonts/OFL.txt`. Fonty są lokalne.

## Autorski przykład i grafika

Ekrany zakupów, produkty, ceny i sytuacja „Goście za 20 minut” służą ilustracji wniosków. Nie są zrzutami prawdziwego interfejsu, aktualną ofertą, deklaracją czasu dostawy ani case study kampanii. Suma trzech przykładowych produktów to 25,47 zł, bez wyliczania dostawy i opłat.

Grafika `assets/images/party-groceries.png` powstała przy użyciu wbudowanego narzędzia imagegen. Zachowano przezroczystość. Nie przedstawia konkretnej marki ani rzeczywistego produktu.

Prompt:

> Use case: product-mockup. Asset type: transparent photographic cutout for a Polish conference HTML presentation. A single beautiful unbranded kraft paper grocery bag standing upright, viewed slightly from above at a three-quarter angle, overflowing with recognizable party groceries: a large matte red bag of potato chips with NO writing, a glass bottle of sparkling orange beverage with a minimal plain cream label with NO writing, a small glass jar of green olives, a lemon and some green herbs. Premium advertising still-life photography, crisp realistic paper and glass textures, natural soft shadows tightly around the base. Compact asymmetrical arrangement, bag fills the frame, isolated with generous margin on an ACTUAL fully transparent background. Warm welcoming studio lighting, red and citrus yellow accents. No people, no logos, no letters, no numbers, no badges, no decorations outside the grocery arrangement. Not a scene or a mockup of a slide, just the grocery bag cutout.

## Kod

Sterowanie zachowuje semantykę odsłaniania i normalizację klikera z lokalnego `tgc-presentation`. Edytor tekstów/pozycji i format eksportu zaadaptowano z tego repo, usuwając zależności od starych slajdów, migracji i wariantów. Nowa prezentacja korzysta z własnych kluczy zapisu.
