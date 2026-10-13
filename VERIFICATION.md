# Sprawdzenie prezentacji

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

## Próba sceniczna

Do wykonania na docelowym laptopie przez prowadzące: próba wystąpienia na głos z fizycznym klikerem i pomiar rzeczywistego czasu. Nie przeprowadzono tej próby zdalnie.
