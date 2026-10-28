# Homo Urgens: Tryb TERAZ

Prezentacja dla Uliany Jelonek i Joanny Wysockiej z Glovo.

**24 slajdy. Trzy wartości z raportu. Scenariusz 14:45. Limit 18 minut.**

## Uruchomienie

Otwórz `index.html` w Chrome lub Edge (płynne przejścia między slajdami wymagają wersji 111 lub nowszej). Wszystkie zasoby są lokalne; internet i instalowanie pakietów nie są potrzebne. Pełny ekran włącz klawiszem **F**. Na drugim komputerze przenieś cały folder.

Prezentacja zaczyna się okładką z prowadzącymi. Slajdy „Proszę czekać” (3 i 4) zaplanowano na 4 i 6 sekund. Zmiany slajdów wykonuje prowadząca. Loader nie przełącza slajdów i nie blokuje klikera. Okładkę można otworzyć przed wejściem na scenę: pierwsze kliknięcie na niej powtarza złożenie serca, a dopiero drugie przechodzi do slajdu 2. **R** z dowolnego slajdu wraca do okładki i powtarza jej wejście.

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

Prezentację prowadzi jedna historia: **„Goście za 20 minut”**. Bohaterka dostaje wiadomość „Będziemy za 20 minut 😊”, otwiera prawie pustą lodówkę (w środku tylko pół cytryny: „o-shit commerce”) i potrzebuje napojów, przekąsek i czegoś słodkiego (czekolada). W aplikacji przechodzi cztery etapy: banner na spotkanie („Nie wiem, od czego zacząć.”), sponsorowane nachosy po wpisaniu „przekąski” („Gdzie są przekąski?”), wybór czekolady po packshocie, wariancie i cenie („Które kupić?”) oraz dip do nachosów przy koszyku („Nie szukałam, ale tego mi brakowało.”). Potem padają nazwy formatów i wnioski, a finał to nakryty stół: „Marka dostała miejsce przy stole, bo pomogła go przygotować”.

Na slajdach 9–18 w prawym górnym rogu jest zegar opowieści: tarcza bez cyfr, jeden obrót to 20 minut do przyjścia gości. Zegar buduje napięcie; nie pokazuje i nie obiecuje czasu dostawy. Ekrany pokazują ilustracyjną „Aplikację szybkich dostaw” w neutralnych kolorach, bez logo i barw konkretnej platformy, na ekranie grafitowego telefonu (bez godziny i ikon na pasku statusu). Marki A–D, produkty i ceny są umowne. Scena nie jest wynikiem kampanii.

Cytaty na slajdzie 2 to trzy sformułowania raportu (s. 22) oddające głos konsumenta, nie wypowiedzi konkretnych osób. CAWI N=1002 dotyczy całej próby mieszkańców miast 18+; raport nie podaje liczebności wszystkich podgrup q-commerce. Decision Lab N=11 opisuje ścieżki jakościowe, nie rozkład w populacji. Retail Media może współtworzyć wybór w aplikacji; sam zakup po reklamie nie jest dowodem jej przyczynowego wpływu.

## Ruch

Animacje są w jednym, geometrycznym stylu fasetek serca konferencji (`motion.js`, `motion.css`, postać w `mascot.js`). Serce na okładce składa się z trójkątów. Na slajdach 3–4 loader zacina się, a postać „Homo Urgens” (dziewczynka low-poly) czeka coraz bardziej zniecierpliwiona; kliknięcie przy 99% rozbija ekran na czerwone fasetki. Ta sama postać jest bohaterką historii: przy lodówce patrzy na zegarek. W historii wiadomość poprzedzają kropki „pisze…”, lodówka otwiera się w ciemności i zapala światło, kamera wjeżdża do środka aż do połówki cytryny („o-shit commerce”), a na następnym slajdzie odjeżdża z powrotem do bohaterki, wskazówka zegara przesuwa się z każdym slajdem, kursor klika banner, czekoladę i dip, a na stół spadają produkty, nachosy z fasetek. Na slajdzie 12 goście jadą czerwonym autem z fasetek: auto stoi w miejscu, koła się kręcą, goście kołyszą się na wybojach, z rury lecą spaliny, a pasażerka opuszcza szybę i wychyla się z okna, z wiatrem we włosach; na drugim kliknięciu czerwona wstęga rozwija się pod kołami jak droga (w Prezentacjach Google auto jest nieruchome, ze śladem spalin). Finał wraca do loadera: 99% → 100%. W Prezentacjach Google oba przejścia lodówki są zwykłym przenikaniem. Pozostałe slajdy są spokojne: nagłówki wyłaniają się wierszami, liczby metryk liczą się razem z pierścieniem, a ekran aplikacji płynnie przechodzi między slajdami.

Ruch nie zmienia czasów ani kolejności: nic nie przełącza się samo, a każde kliknięcie przerywa trwającą animację. Cofnięcie pokazuje od razu stan końcowy slajdu. W trybie edycji **E** animacji nie ma. Prezentacja nie ma dźwięku.

Tryb ograniczonego ruchu respektuje ustawienia systemowe. Możesz też otworzyć `index.html?motion=off`; postać jest wtedy widoczna, ale się nie porusza.

## PowerPoint (wersja docelowa)

Plik: **`exports/Homo-Urgens.pptx`** (28 października, 24 slajdy). Nowy wygenerujesz w Chrome lub Edge: **E** → **Eksportuj PPTX**. Eksport trwa kilkanaście sekund, działa offline i uwzględnia poprawki tekstów i pozycji z edytora. Po pobraniu pliku prezentacja wraca do tego samego slajdu.

Plik jest przygotowany dla PowerPointa 365 na Windows i na Macu:

- Te same slajdy i stany co w HTML. Wejście slajdu startuje samo, a każde odsłonięcie to jedno kliknięcie.
- Teksty są edytowalnymi polami w foncie Lato, osadzonym w pliku. Kształty, wykresy, tła z fasetek, auto i postać to natywne kształty PowerPointa; każda fasetka to osobny kształt, stąd ich liczba. Logo i serce w rogu to oryginalne pliki PNG.
- Ruch to natywne efekty (okienko **Animacje**). Slajdy jednego motywu łączy przejście Morph, a zmianę motywu fala trójkątów, jak w HTML.
- Przeniesione sceny: złożenie serca na okładce z biciem serca, karty potrzeb rozkładane z rogu (efekt Paski) na slajdzie 7, kamera wjeżdżająca do lodówki (slajd 10) i odjeżdżająca od niej (slajd 11), auto gości na slajdzie 12 (składanie z fasetek, kręcące się koła, kołysanie, spaliny, wychylona pasażerka, podskok na wstędze), słupki wykresu rosnące od lewej (slajd 14), telefon z ramką i wygaszeniem na slajdach 15–18 oraz serce organizatora na slajdzie 24 (lot fasetek, wejście kamery w serce, zmiana kolorów, panel z podziękowaniem).
- Notatki slajdów to scenariusz Joanny (wersja solo), wiersz po wierszu, z nagłówkami aktów i wskazówkami scenicznymi w nawiasach. Nie ma w nich czasów ani źródeł.

Edycja w PowerPoincie:

- Elementy widoczne tylko w ruchu (iskry, konfetti, kursor, echo poprzedniego slajdu, kolejne wartości liczników, miny postaci, kłęby spalin) leżą poza slajdem, po prawej stronie. Animacja wprowadza je na slajd; nie usuwaj ich.
- Obiekty o nazwach zaczynających się od `!!` (okienko zaznaczenia, Alt+F10) łączy Morph z sąsiednim slajdem. Po zmianie nazwy obiekt nie przejdzie płynnie.
- Na slajdach z falą trójkąty w nowym kolorze tworzą tło, a tło samego slajdu ma kolor poprzedniego. Po zmianie kolejności slajdów fala pokaże stary kolor.
- Wiersze są łamane jawnie, jak w HTML. Po wydłużeniu tekstu sprawdź podział wierszy.

Różnice względem HTML: nie ma rozmycia ani wstrząsu ekranu, miny postaci zmieniają się krótkim przenikaniem, a liczby metryk pojawiają się bez odliczania (licznik mają tylko loader i finał). Slajd 12 z autem jest najcięższy (ok. 1000 efektów); jeśli na słabszym komputerze zacznie się przycinać, daj znać. Zmiany wprowadzone w PowerPoincie nie wracają do HTML.

Jeśli PowerPoint pokaże inny font (np. gdy osadzanie fontów jest zablokowane), zainstaluj Lato z `assets/fonts`. Plik przeszedł kontrolę struktury, ale nie został jeszcze otwarty w PowerPoincie. Przed wystąpieniem przejrzyj go na docelowym komputerze w trybie prezentera (szczegóły w `VERIFICATION.md`).

## Prezentacje Google

Plik do importu: **`exports/Homo-Urgens-Google.pptx`** (28 października, 24 slajdy, notatki ze scenariusza Joanny). Pełnego pliku PowerPointa nie wrzucaj do Google: Morph, ścieżki ruchu i efekty wyróżnienia się tam rozsypią. Nowy wygenerujesz w Chrome lub Edge: **E** → **PPTX dla Google** (eksport trwa ok. sekundy i uwzględnia poprawki z edytora). Import: Dysk Google → Nowy → Prześlij plik → Otwórz w Prezentacjach Google (albo w Prezentacjach: Plik → Importuj slajdy).

Prezentacje Google nie mają przejścia Morph, ścieżek ruchu, efektów wyróżnienia ani opóźnień. Pomijają też odstępy między literami i dokładny odstęp wierszy, a tekst zawsze zawijają do szerokości ramki. Dlatego wersja dla Google jest celowo prostsza:

- Każdy slajd pokazuje swój stan spoczynkowy, taki jak w HTML po wejściu.
- Każde kliknięcie z HTML to jedno kliknięcie w Google: elementy z tego kroku pojawiają się przenikaniem, a zastępowane (np. „+” zamienione na „✓”) znikają przenikaniem. Na pozostałych slajdach przejście to zwykłe przenikanie.
- Każdy wiersz tekstu jest osobną ramką, szerszą od tekstu o ok. 20%, wyśrodkowaną w pionie. Nic się nie zawija i nie rozjeżdża, nawet gdy Google mierzy tekst szerzej.
- Nie ma iskier, kursora, mozaiki przejść, pisania na żywo ani liczników. Loader na slajdach 3–4 stoi na 87% i 99%, a zegar opowieści przeskakuje między slajdami.
- Notatki slajdów to scenariusz Joanny, tak jak w PowerPoincie.

Teksty są edytowalne w Google. Po zmianie tekstu sprawdź, czy wiersz nadal mieści się w swojej ramce.

## Kontrole lokalne

```sh
npm test
npm run validate
node --check app.js
```

Te polecenia wymagają Node, ale nie wymagają instalowania zależności. Samo prezentowanie nie wymaga Node.

Przed konferencją przećwicz wystąpienie na docelowym laptopie i fizycznym klikerze. Notatki zawierają scenariusz Joanny; orientacyjne czasy slajdów pokazuje nagłówek nakładki **O**.
