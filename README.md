# Homo Urgens: Tryb TERAZ

Prezentacja dla Uliany Jelonek i Joanny Wysockiej z Glovo.

**23 slajdy. Cztery wartości z raportu. Scenariusz 15:15. Limit 18 minut.**

## Uruchomienie

Otwórz `index.html` w Chrome lub Edge (płynne przejścia między slajdami wymagają wersji 111 lub nowszej). Wszystkie zasoby są lokalne; internet i instalowanie pakietów nie są potrzebne. Pełny ekran włącz klawiszem **F**. Na drugim komputerze przenieś cały folder.

Prezentacja zaczyna się okładką z prowadzącymi. Slajdy „Proszę czekać” (3 i 4) zaplanowano na 4 i 6 sekund. Zmiany slajdów wykonuje prowadząca. Loader nie przełącza slajdów i nie blokuje klikera. **R** wraca do okładki i powtarza złożenie serca; użyj go, jeśli okładka była otwarta długo przed wejściem na scenę.

## Sterowanie

| Klawisz | Działanie |
|---|---|
| →, ↓, Page Down, Spacja, Enter | Kolejny element, następnie slajd |
| ←, ↑, Page Up, Backspace | Cofnięcie elementu, następnie slajdu |
| F | Pełny ekran / powrót |
| E | Edytor tekstów i pozycji |
| O | Notatki do aktualnego slajdu |
| R | Powrót do okładki i powtórzenie jej wejścia |
| Home / End | Początek / koniec |
| Esc | Zamknięcie panelu, notatek lub pełnego ekranu |

Kliknięcie slajdu odsłania kolejny etap. Przytrzymanie klikera nie pomija treści. Okno prezentacji musi być aktywne. Pasek sterowania znika po chwili i wraca po ruchu myszy.

**Notatki O pojawiają się na bieżącym ekranie.** Służą do przygotowania i próby; otwieranie ich podczas projekcji pokaże je także widowni.

## Edycja

Naciśnij **E**, kliknij tekst i wpisz poprawkę. Tryb **Przesuwaj** pozwala przeciągać elementy. Strzałki przesuwają zaznaczony element o 1 piksel slajdu, Shift + strzałka o 10 pikseli. Wyjście: **Gotowe** lub **Esc**.

Poprawki zapisują się w tej przeglądarce. **Eksportuj zmiany** zapisuje teksty i pozycje do pliku. Aby przenieść je na drugi komputer, zapisz pobrany plik jako `text-overrides.js` obok `index.html`, albo użyj przycisku **Importuj**. Import nie wykonuje kodu i odrzuca pliki innych prezentacji. W razie niedostępnej pamięci przeglądarki użyj eksportu.

Treści, czasy, dane badania i notatki są w `slides.js`. Liczby wykresów zmienia się w tym pliku, aby zachować spójność wartości i grafiki. Po wydłużeniu tekstu sprawdź, czy nadal mieści się na slajdzie.

## Dane i historia

Źródła, podstawy badania, strony PDF oraz pochodzenie grafik opisano w `SOURCES.md`.

Prezentację prowadzi jedna historia: **„Goście za 20 minut”**. Bohaterka dostaje wiadomość „Będziemy za 20 minut 😊”, otwiera prawie pustą lodówkę i potrzebuje napojów, przekąsek i czegoś słodkiego (czekolada). W aplikacji przechodzi cztery etapy: banner na spotkanie („Nie wiem, od czego zacząć.”), sponsorowane nachosy po wpisaniu „przekąski” („Gdzie są przekąski?”), wybór czekolady po packshocie, wariancie i cenie („Które kupić?”) oraz dip do nachosów przy koszyku („Nie szukałam, ale tego mi brakowało.”). Potem pada wynik 27%, nazwy formatów i wnioski, a finał to nakryty stół: „Marka dostała miejsce przy stole, bo pomogła go przygotować”.

Na slajdach 9–18 w prawym górnym rogu jest zegar opowieści: tarcza bez cyfr, jeden obrót to 20 minut do przyjścia gości. Zegar buduje napięcie; nie pokazuje i nie obiecuje czasu dostawy. Ekrany pokazują ilustracyjną „Aplikację szybkich dostaw” w neutralnych kolorach, bez logo i barw konkretnej platformy. Marki A–D, produkty i ceny są umowne. Scena nie jest wynikiem kampanii.

Cytaty na slajdzie 2 to trzy sformułowania raportu (s. 22) oddające głos konsumenta, nie wypowiedzi konkretnych osób. CAWI N=1002 dotyczy całej próby mieszkańców miast 18+; raport nie podaje liczebności wszystkich podgrup q-commerce. Wynik 27% ma podstawę N=619 (osoby, które zmieniały plany lub zainteresowały się innym produktem) według s. 41 pełnego raportu; w publikacji jest na s. 15. Decision Lab N=11 opisuje ścieżki jakościowe, nie rozkład w populacji. Retail Media może współtworzyć wybór w aplikacji; sam zakup po reklamie nie jest dowodem jej przyczynowego wpływu.

## Ruch

Animacje są w jednym, geometrycznym stylu fasetek serca konferencji (`motion.js`, `motion.css`, postać w `mascot.js`). Serce na okładce składa się z trójkątów. Na slajdach 3–4 loader zacina się, a postać „Homo Urgens” (dziewczynka low-poly) czeka coraz bardziej zniecierpliwiona; kliknięcie przy 99% rozbija ekran na czerwone fasetki. Ta sama postać jest bohaterką historii: przy lodówce patrzy na zegarek. W historii wiadomość poprzedzają kropki „pisze…”, lodówka otwiera się i zapala światło, wskazówka zegara przesuwa się z każdym slajdem, kursor klika banner, czekoladę i dip, a na stół spadają produkty, nachosy z fasetek. Finał wraca do loadera: 99% → 100%. Pozostałe slajdy są spokojne: nagłówki wyłaniają się wierszami, liczby metryk liczą się razem z pierścieniem, a ekran aplikacji płynnie przechodzi między slajdami.

Ruch nie zmienia czasów ani kolejności: nic nie przełącza się samo, a każde kliknięcie przerywa trwającą animację. Cofnięcie pokazuje od razu stan końcowy slajdu. W trybie edycji **E** animacji nie ma. Prezentacja nie ma dźwięku.

Tryb ograniczonego ruchu respektuje ustawienia systemowe. Możesz też otworzyć `index.html?motion=off`; postać jest wtedy widoczna, ale się nie porusza.

## Prezentacje Google

Plik do importu: **`exports/Homo-Urgens-Google.pptx`**. Nowy wygenerujesz w Chrome lub Edge: **E** → **PPTX dla Google** (eksport trwa ok. sekundy i uwzględnia poprawki z edytora). Import: Dysk Google → Nowy → Prześlij plik → Otwórz w Prezentacjach Google (albo w Prezentacjach: Plik → Importuj slajdy).

Prezentacje Google nie mają przejścia Morph, ścieżek ruchu, efektów wyróżnienia ani opóźnień. Pomijają też odstępy między literami i dokładny odstęp wierszy, a tekst zawsze zawijają do szerokości ramki. Dlatego wersja dla Google jest celowo prostsza:

- Każdy slajd pokazuje swój stan spoczynkowy, taki jak w HTML po wejściu.
- Każde kliknięcie z HTML to jedno kliknięcie w Google: elementy z tego kroku pojawiają się przenikaniem, a zastępowane (np. „+” zamienione na „✓”) znikają przenikaniem. Na pozostałych slajdach przejście to zwykłe przenikanie.
- Każdy wiersz tekstu jest osobną ramką, szerszą od tekstu o ok. 20%, wyśrodkowaną w pionie. Nic się nie zawija i nie rozjeżdża, nawet gdy Google mierzy tekst szerzej.
- Nie ma iskier, kursora, mozaiki przejść, pisania na żywo ani liczników. Loader na slajdach 3–4 stoi na 87% i 99%, a zegar opowieści przeskakuje między slajdami.
- Notatki prowadzących z czasami i źródłami są w notatkach slajdów.

Teksty są edytowalne w Google. Po zmianie tekstu sprawdź, czy wiersz nadal mieści się w swojej ramce.

## Eksport do PowerPointa (nieużywany)

Prezentację pokazujemy w Prezentacjach Google, więc pełnego pliku PowerPointa nie generujemy. Przycisk zostaje: nowy plik wygenerujesz w Chrome lub Edge: **E** → **Eksportuj PPTX**. Eksport trwa kilka sekund, działa offline i uwzględnia poprawki tekstów i pozycji z edytora. Po pobraniu pliku prezentacja wraca do tego samego slajdu.

Plik jest przygotowany dla PowerPointa 365/2021 na Windows:

- Te same slajdy i stany co w HTML (opis poniżej dotyczy eksportu z 13 października, 20 slajdów i 44 stany). Wejście slajdu startuje samo, a każde odsłonięcie to jedno kliknięcie.
- Teksty są edytowalnymi polami w foncie Lato, osadzonym w pliku. Kształty, wykresy, tła z fasetek i postać to natywne kształty PowerPointa. Logo i serce w rogu to oryginalne pliki PNG.
- Ruch to natywne efekty (okienko **Animacje**). Slajdy jednego motywu łączy przejście Morph, a zmianę motywu fala trójkątów, jak w HTML. Notatki do slajdów zawierają czasy i źródła.

Edycja w PowerPoincie:

- Elementy widoczne tylko w ruchu (iskry, konfetti, kursor, echo slajdu 2, kolejne wartości liczników, miny postaci) leżą poza slajdem, po prawej stronie. Animacja wprowadza je na slajd; nie usuwaj ich.
- Obiekty o nazwach zaczynających się od `!!` (okienko zaznaczenia, Alt+F10) łączy Morph z sąsiednim slajdem. Po zmianie nazwy obiekt nie przejdzie płynnie.
- Na slajdach z falą trójkąty w nowym kolorze tworzą tło, a tło samego slajdu ma kolor poprzedniego. Po zmianie kolejności slajdów fala pokaże stary kolor.
- Wiersze są łamane jawnie, jak w HTML. Po wydłużeniu tekstu sprawdź podział wierszy.

Różnice względem HTML: nie ma rozmycia ani wstrząsu ekranu, miny postaci zmieniają się krótkim przenikaniem, a liczby metryk pojawiają się bez odliczania (licznik mają tylko loader i finał). Zmiany wprowadzone w PowerPoincie nie wracają do HTML.

Jeśli PowerPoint pokaże inny font (np. gdy osadzanie fontów jest zablokowane), zainstaluj Lato z `assets/fonts`. Plik przeszedł walidację formatu, ale nie został jeszcze otwarty w PowerPoincie. Przed wystąpieniem przejrzyj go na docelowym komputerze (szczegóły w `VERIFICATION.md`).

## Kontrole lokalne

```sh
npm test
npm run validate
node --check app.js
```

Te polecenia wymagają Node, ale nie wymagają instalowania zależności. Samo prezentowanie nie wymaga Node.

Przed konferencją przećwicz wystąpienie na docelowym laptopie i fizycznym klikerze. Notatki zawierają orientacyjne czasy oraz proponowany podział między prowadzące.
