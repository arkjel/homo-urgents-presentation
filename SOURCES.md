# Źródła i pochodzenie materiałów

## Raport Inquiry / Glovo

Materiał dostarczony przez użytkownika: `PUBLIKACJA 6.10 INQ.pdf`, 26 stron, raport „Homo Urgens. Człowiek pilnej potrzeby”, wrzesień 2026. Plik źródłowy pozostaje w Pobranych użytkownika; do przenośnej prezentacji nie jest potrzebny.

| Slajd | Strona PDF | Wartości i znaczenie |
|---|---|---|
| 5–6 | — | Schemat dwóch planów i ilustracyjna potrzeba antyperspirantu. |
| 7 | 5 | Homo Urgens jest trybem sytuacyjnym, nie trwałym segmentem lub generacją. |
| 8 | 6 | 78% chce produktu/usługi wtedy, kiedy ich potrzebuje. |
| 9 | 11 | Otwarty wybór marki w ilustracyjnym przykładzie antyperspirantu. Slajd narracyjny. |
| 10 | 11 | 55% zawsze lub często zna mniej więcej potrzebę, ale konkretny produkt wybiera podczas przeglądania aplikacji. 41% wybiera markę podczas przeglądania oferty. |
| 11 | 14, 17 | Retail Media towarzyszy decyzji: pokazuje opcję, pomaga rozważyć konkretny produkt i wspiera domknięcie zakupu. Model jakościowy. |
| 13 | 14 | 48% uważa, że trafne rekomendacje pomagają szybciej znaleźć produkt. |
| 14 | — | Ogólny schemat natłoku komunikacji. Nie jest interfejsem ani opisem działań Glovo. |
| 16–18 | 11, 17, 22 | Ilustracja roli Retail Media: zapytanie o produkt → pasujący wynik sponsorowany → wybór marki → koszyk. |
| 19 | 19, 24, 25 | Implikacje i ograniczenie: zakup po ekspozycji nie jest sam w sobie dowodem przyczynowego wpływu reklamy. |

Metodologia (s. 4 raportu): CAWI objęło N=1002 mieszkańców miast, 18+. FGI to 2 grupy, łącznie 12 osób. Decision Lab obejmuje 11 ścieżek zakupowych w Glovo. Metodologia pozostaje w dokumentacji; osobny slajd został usunięty na prośbę użytkownika.

N=1002 nie jest automatycznie podstawą wszystkich procentów dotyczących użytkowników q-commerce. Przy slajdach tej podgrupy zaznaczono, że jej liczebność nie została podana w raporcie. Obserwacje Decision Lab pozostają jakościowe.

## Brandbook i grafiki konferencji

- `sprawny_marketing_brandbook.pdf`: sekcje I love marketing i I love marketing & technology, w tym typografia Lato, czerwień #ee312f, pole ochronne i zakaz zmiany proporcji oraz kolorów logo.
- `ILOVEMKT_Szablon_16-9.pptx.pdf`: format 1920×1080, tytułowe Lato Black/Bold, oryginalne grafiki.
- `assets/brand/conference-logo.png`: oryginalny przezroczysty obraz Image4 ze strony 1 PDF szablonu.
- `assets/brand/conference-heart.png`: oryginalny przezroczysty obraz Image8 ze strony 2 PDF szablonu.
- `assets/brand/conference-logo-stacked.png`: oryginalny przezroczysty obraz Image9 ze strony 2.

Obrazy wyodrębniono z PDF bez przerysowywania logotypu. Loader i wykresy danych są elementami HTML/CSS/SVG. Logo konferencji z napisem nie jest animowane ani przekształcane.

Serce konferencji (`conference-heart.png`) na okładce składa się w animacji z ośmiu fasetek SVG. Wierzchołki i kolory (#ee312f, #cf1723, #95161d) zmierzono z oryginalnego pliku. Po złożeniu fasetki ustępują oryginalnej grafice PNG, więc stan końcowy to niezmieniony plik brandu. Animacja serca została zaakceptowana przez użytkownika.

Podpisy prowadzących: [program organizatora](https://sprawnymarketing.pl/konferencja/poznan/), odczytany 8 października 2026. Zachowano nazwiska zgodne z aktualnym wpisem: Uliana Jelonek i Joanna Wysocka.

## Fonty

Lato Regular, Bold i Black pobrano z [repozytorium Google Fonts](https://github.com/google/fonts/tree/main/ofl/lato). Oryginalna licencja SIL Open Font License znajduje się w `assets/fonts/OFL.txt`. Fonty są lokalne.

## Autorski przykład i grafika

Ekrany zakupów, marki A–C i potrzeba antyperspirantu służą ilustracji wniosków. Nie są zrzutami prawdziwego interfejsu, aktualną ofertą, deklaracją czasu dostawy ani case study kampanii. Cena 18,99 zł jest umowna, bez wyliczania dostawy i opłat. Konsument w tym przykładzie wybiera pasujący produkt sponsorowany; jest to autorska scena, nie zmierzony efekt reklamy.

Podział ekranu na plan marki i plan konsumenta, ilustracja opakowania antyperspirantu oraz ogólny schemat komunikacji na slajdzie 14 są autorskimi elementami HTML/CSS. Nazwa Glovo jest tekstem wewnątrz schematu zakupów; schemat nie jest kopią interfejsu platformy.

Grafika `assets/images/party-groceries.png` powstała przy użyciu wbudowanego narzędzia imagegen. Zachowano przezroczystość. Nie przedstawia konkretnej marki ani rzeczywistego produktu. Po zmianie przykładu na antyperspirant grafika pozostaje opcjonalnym zasobem i nie jest wyświetlana na slajdach.

Prompt:

> Use case: product-mockup. Asset type: transparent photographic cutout for a Polish conference HTML presentation. A single beautiful unbranded kraft paper grocery bag standing upright, viewed slightly from above at a three-quarter angle, overflowing with recognizable party groceries: a large matte red bag of potato chips with NO writing, a glass bottle of sparkling orange beverage with a minimal plain cream label with NO writing, a small glass jar of green olives, a lemon and some green herbs. Premium advertising still-life photography, crisp realistic paper and glass textures, natural soft shadows tightly around the base. Compact asymmetrical arrangement, bag fills the frame, isolated with generous margin on an ACTUAL fully transparent background. Warm welcoming studio lighting, red and citrus yellow accents. No people, no logos, no letters, no numbers, no badges, no decorations outside the grocery arrangement. Not a scene or a mockup of a slide, just the grocery bag cutout.

## Ruch i postać

Postać „Homo Urgens” (dziewczynka w czerwonej sukience, włosy do ramion) jest autorską grafiką SVG w stylu low-poly serca. Nie przedstawia konkretnej osoby. Występuje tylko w otwarciu (slajdy 1–3) i w finale (slajd 20). Tła z fasetek, mozaika przejść, konfetti i kursor w scenie zakupowej są generowane w kodzie. Prezentacja nie używa dźwięku ani zewnętrznych bibliotek animacji.

## Kod

Sterowanie zachowuje semantykę odsłaniania i normalizację klikera z lokalnego `tgc-presentation`. Edytor tekstów/pozycji i format eksportu zaadaptowano z tego repo, usuwając zależności od starych slajdów, migracji i wariantów. Nowa prezentacja korzysta z własnych kluczy zapisu.
