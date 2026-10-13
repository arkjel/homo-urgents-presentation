# Sprawdzenie prezentacji

## Historia „Goście za 20 minut” (13 października 2026, tylko HTML)

Wersja HTML: **23 slajdy, 50 stanów odsłonięć, pięć wartości z raportu (78%, 55%, 41%, 27%, 48%)**. Suma planowanych czasów to **15:15** przy limicie 18 minut (plan, nie pomiar próby na głos).

- `npm test` (16 testów) i `npm run validate` przechodzą. Walidacja sprawdza teraz także: okładkę jako pierwszy slajd, loader 4 + 6 s do 99%, zegar opowieści na każdym slajdzie 9–18 z rosnącą wartością i brak nazwy platformy w makiecie aplikacji.
- Chrome (bez interfejsu), okno 1280×720: zrzuty końcowego stanu wszystkich 23 slajdów i automatyczna kontrola geometrii (tekst i grafiki w granicach slajdu, bez kolizji ze źródłem, numerem slajdu i zegarem). Po poprawkach brak problemów i błędów konsoli. Zrzuty przejrzano ręcznie.
- Odtworzenie do przodu z animacjami przez 49 przejść, ze zrzutami w trakcie ruchu na nowych scenach (kropki „pisze…”, lodówka i postać, wskazówka zegara, kliknięcia kursorem, stół). Po zakończeniu nie zostały warstwy przejść, kursor ani wskaźnik pisania. Szybkie przeklikanie (co 25 ms) do końca i z powrotem na początek bez błędów i bez pozostałości.
- `?motion=off`: przejście przez wszystkie stany bez błędów, postać przy lodówce widoczna statycznie. Edytor **E** na slajdzie z aplikacją: 23 edytowalne teksty, wszystkie odsłonięcia widoczne. **R** wraca do okładki.

Nie sprawdzono: 1920×1080 na projektorze, docelowy laptop, próba na głos. Strona 41 i N=619 dla wyniku 27% pochodzą z pełnego raportu, którego nie było w materiałach; w publikacji wartość jest na s. 15.

## Eksport dla Prezentacji Google (13 października 2026)

Zrzuty od prowadzącej pokazały, że w Prezentacjach Google tytuły z pełnego eksportu PowerPointa zawijały się („Potrzebuj / ę”, „55 / %”), a wiersze były szerzej rozstawione. Google pomija odstępy między literami i dokładny odstęp wierszy. Powstał osobny tryb eksportu (`DECK_PPTX.export({target:'google'})`, w edytorze **PPTX dla Google**) i plik `exports/Homo-Urgens-Google.pptx`.

- **Struktura:** 23 slajdy, 1143 kształty, 184 efekty: wyłącznie przenikanie na wejście i wyjście (preset 10). Liczba kliknięć na każdym slajdzie równa się liczbie odsłonięć w HTML. Przejścia to zwykłe `<p:fade/>` bez rozszerzeń. Każda ramka tekstu ma jeden wiersz, nie zawija i nie ma dokładnego odstępu. Żaden kształt nie leży poza slajdem, każda animacja wskazuje istniejący kształt, XML jest poprawny (`xmllint`), `unzip -t` bez błędów, 23 notatki.
- **Wygląd:** wszystkie 50 stanów porównano z HTML. Każdy slajd pliku narysowano z jego XML (`exports/dev/preview.js`), ukrywając elementy wchodzące później i te, które już wyszły. Różnica pikseli wynosi najwyżej 5,4% (wygładzanie tekstu). Ręcznie obejrzano stany z kliknięciami w aplikacji i na osi faz.
- **Poprawione przy okazji:** fasetki serca na okładce miały złą wysokość, bo obraz nie był jeszcze wczytany, gdy okładka stała się pierwszym slajdem. Dotyczyło to też składania serca na żywo w HTML. Przyciski zmieniające kolor po kliknięciu mają teraz osobne stany.
- `npm test` (17 testów, w tym zapis wersji Google) i `npm run validate` przechodzą.

**Pliku nie otwarto w Prezentacjach Google** (brak dostępu z tego komputera). Do sprawdzenia po imporcie: czy kliknięcia odsłaniają elementy (panel Animacje), czy przyciski „+” → „✓” na slajdach 16–17 przełączają się bez nakładania i czy fonty Lato oraz Lato Black są rozpoznane.

Sekcje poniżej opisują poprzednią wersję (antyperspirant, 20 slajdów) i pozostają jako historia kontroli.

Wersja z 8 października 2026: **20 slajdów, 44 stany odsłonięć i cztery metryki raportu: 78%, 55%, 41%, 48%**. Suma planowanych czasów w notatkach wynosi **15:40**, przy limicie 18 minut. Jest to plan czasu, nie wynik próby wystąpienia na głos.

## Treść

Wartości i etykiety pozostałych wykresów porównano z dostarczonym PDF-em Inquiry / Glovo. Każdy slajd danych wskazuje stronę raportu oraz właściwą podstawę. Rozróżniono całą próbę CAWI, podgrupy q-commerce i obserwacje jakościowe. Źródła opisuje `SOURCES.md`.

Scena antyperspirantu jest oznaczonym przykładem. Wybór marki A ilustruje możliwą rolę Retail Media; nie jest wynikiem kampanii ani dowodem przyczynowego wpływu reklamy.

## Przegląd wizualny i offline

W Chrome otwarto lokalny `index.html` przy wyłączonej sieci. Sprawdzono wszystkie 44 stany w 1920×1080 i 1280×720, łącznie 88 widoków. Przejrzano slajdy i kolejne odsłonięcia. Kontrola nie wykazała błędów JavaScript, żądań sieciowych ani uciętych treści lub kolizji ekranu zakupów ze źródłem.

Sprawdzono także widoczny podgląd w przeglądarce Codex po odświeżeniu. Slajd dwóch planów zachowuje podział na ciemną stronę marki i jasną stronę konsumenta.

## Sterowanie i edytor

Sprawdzono 4- i 6-sekundowe loadery bez automatycznej zmiany slajdu, szybkie przechodzenie przez 44 stany, cofanie odsłonięć oraz ograniczony ruch. Pełny ekran został uruchomiony klawiszem F. Animacja wykresu rozwija pierścień, zachowując dokładną wartość liczbową.

Edycja tekstu i przesunięcie elementu zachowały się po przeładowaniu. Pobrano rzeczywisty eksport i zaimportowano go w nowej sesji. Import odrzucił plik innej prezentacji. Reset przywrócił oryginalne podziały wierszy i układ.

W nowych scenach sprawdzono odsłonięcie i cofnięcie potrzeby konsumenta, połączenia dwóch planów, wyniku sponsorowanego i wyboru marki. Animacja zapytania działa, a w koszyku pozostaje ta sama marka A. Slajd trafności zawiera jeden wykres: 48%. Slajd 14 nie zawiera aplikacji, nazwy ani logotypu Glovo; ilustruje ogólny schemat komunikacji.

Kontrole kodu: `npm test` (11 testów), `npm run validate`, sprawdzenie składni skryptów.

## Ruch (13 października 2026)

W Chrome przez lokalny serwer sprawdzono otwarcie (loader, postać, przełamanie przy 99%, „TERAZ”), składanie serca na okładce, oś faz, kliknięcie kursorem w scenie zakupowej oraz finał 99% → 100%. Szybkie przeklikanie wszystkich stanów w trzech tempach (co 25, 90 i 260 ms) i cofnięcie do początku zakończyło się bez błędów konsoli i bez pozostałych warstw animacji. Pozycje nagłówków po animacji są identyczne jak bez niej. Tryb edycji E wyłącza animacje i zachowuje edycję tekstu; `?motion=off` pokazuje postać statycznie.

`npm test` obejmuje teraz 11 testów, w tym krzywą loadera: start i koniec dokładnie na wartościach slajdów, brak cofania, widoczne zrywy i przestoje.

Nie zmierzono płynności na docelowym laptopie i projektorze. Warto przejść otwarcie i finał na sprzęcie konferencyjnym.

## Eksport PPTX (13 października 2026)

`exports/Homo-Urgens.pptx` wygenerowano przyciskiem **Eksportuj PPTX** w Chrome (okno 1920×1080), zaczynając od slajdu 11. Eksport trwał 6,8 s. Prezentacja wróciła na ten sam slajd i krok, edytor otworzył się ponownie, a konsola nie pokazała błędów.

- **Zawartość:** 20 slajdów, 2262 kształty, 2662 efekty animacji, 20 notatek, 3 osadzone fonty Lato i 2 oryginalne pliki PNG. Każdy slajd ma grupę efektów startującą automatycznie, a 24 grupy na kliknięcie odpowiadają 24 odsłonięciom, razem 44 stanom HTML. Przejścia: 8 × Morph, 10 × fala (krótkie przenikanie i trójkąty); slajdy 1 i 3 nie mają przejścia (slajd 3 zaczyna się cięciem i rozpadem echa slajdu 2).
- **Format:** wszystkie części XML przechodzą walidację w `xmllint` względem schematów ECMA-376 (wersja przejściowa). Rozszerzenia PowerPointa (Morph, czas przejścia) walidowano w ich wersji zastępczej (Markup Compatibility); samej gałęzi Morph schemat nie sprawdza. `unzip -t` nie wykazał błędów, a każde odwołanie animacji wskazuje istniejący kształt.
- **Powtarzalność:** eksport rozpoczęty na slajdzie 1 i na slajdzie 11 daje identyczną treść pliku (różni się tylko data utworzenia). W oknie 1366×768 kształty i efekty są te same, współrzędne różnią się najwyżej o 1 EMU (0,0002 piksela), a wygładzone tory ruchu mają czasem klatki kluczowe w innych chwilach tego samego toru.
- **Wygląd:** podgląd pliku PPTX w przeglądarce (widok edycji) porównano ze wszystkimi 20 slajdami HTML. Treść, układ i kolory są zgodne. Na slajdzie 2 widok edycji pokazuje czerwone fasetki tła, które w pokazie wchodzą po 4–5 s, jak w HTML.
- **Ruch:** osie czasu przejrzano dla slajdów 1–5, 7, 11, 14, 16–18 i 20: zacięcia loadera, wiersze spod maski, litery HOMO URGENS, pisanie, pierścienie metryk, fale, echo i rozpad przy 99%, liczniki loadera i finału, kliknięcie kursorem oraz wyciszenie natłoku do kolejnego kliknięcia.
- **HTML bez zmian:** po eksporcie w tej samej karcie przeklikano 44 stany. Każde z 19 przejść miało właściwy typ (przejście przeglądarki albo mozaika), loader liczył dalej, a po animacjach nie zostały żadne warstwy ani błędy.
- **Poprawione przy końcowej kontroli:** eksport uruchomiony z innego slajdu niż pierwszy dodawał slajdowi 1 falę przejścia. Teraz wynik nie zależy od slajdu, na którym zaczyna się eksport.

`npm test` obejmuje 16 testów, w tym 5 testów zapisu PPTX: części i relacje pliku, odwołania animacji, Morph z zastępczym przenikaniem, nagłówek osadzonego fontu i wszystkie rodzaje efektów. `npm run validate` przechodzi.

**Pliku nie otwarto w PowerPoincie.** Na komputerze roboczym nie ma PowerPointa, Keynote'a ani LibreOffice. Do sprawdzenia w PowerPoincie 365/2021 na Windows:

- plik otwiera się bez komunikatu o naprawie;
- teksty są w Lato i leżą tak jak w HTML (położenie linii bazowej wyliczono z metryk fontu, bez pomiaru w PowerPoincie);
- Morph łączy obiekty `!!` także wtedy, gdy mają własne animacje;
- slajdy z kilkuset efektami (1–3 i 20) odtwarzają się płynnie;
- przezroczystość działa (wyciszenie natłoku na slajdzie 14).

`exports/pptx-test.pptx` (7 slajdów, `node scripts/pptx-calibration.mjs`) pokazuje osobno każdą technikę eksportu: fonty z liniami pomocniczymi, kształty, efekty, Morph i falę. Jeśli coś w pełnym pliku wygląda inaczej niż w HTML, ten plik pomaga szybko znaleźć przyczynę.

## Próba sceniczna

Do wykonania na docelowym laptopie przez prowadzące: próba wystąpienia na głos z fizycznym klikerem i pomiar rzeczywistego czasu. Nie przeprowadzono tej próby zdalnie.
