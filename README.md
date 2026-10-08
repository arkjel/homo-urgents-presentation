# Homo Urgens: Tryb TERAZ

Prezentacja dla Uliany Jelonek i Joanny Wysockiej z Glovo.

**20 slajdów. Cztery metryki raportu. Scenariusz 15:40. Limit 18 minut.**

## Uruchomienie

Otwórz `index.html` w Chrome lub Edge. Wszystkie zasoby są lokalne; internet i instalowanie pakietów nie są potrzebne. Pełny ekran włącz klawiszem **F**. Na drugim komputerze przenieś cały folder.

Pierwsze dwa slajdy zaplanowano na 4 i 6 sekund. Zmiany slajdów wykonuje prowadząca. Loader nie przełącza slajdów i nie blokuje klikera. **R** powtarza otwarcie; użyj go, jeśli pierwszy slajd był otwarty długo przed wejściem na scenę.

## Sterowanie

| Klawisz | Działanie |
|---|---|
| →, ↓, Page Down, Spacja, Enter | Kolejny element, następnie slajd |
| ←, ↑, Page Up, Backspace | Cofnięcie elementu, następnie slajdu |
| F | Pełny ekran / powrót |
| E | Edytor tekstów i pozycji |
| O | Notatki do aktualnego slajdu |
| R | Powtórzenie otwarcia |
| Home / End | Początek / koniec |
| Esc | Zamknięcie panelu, notatek lub pełnego ekranu |

Kliknięcie slajdu odsłania kolejny etap. Przytrzymanie klikera nie pomija treści. Okno prezentacji musi być aktywne. Pasek sterowania znika po chwili i wraca po ruchu myszy.

**Notatki O pojawiają się na bieżącym ekranie.** Służą do przygotowania i próby; otwieranie ich podczas projekcji pokaże je także widowni.

## Edycja

Naciśnij **E**, kliknij tekst i wpisz poprawkę. Tryb **Przesuwaj** pozwala przeciągać elementy. Strzałki przesuwają zaznaczony element o 1 piksel slajdu, Shift + strzałka o 10 pikseli. Wyjście: **Gotowe** lub **Esc**.

Poprawki zapisują się w tej przeglądarce. **Eksportuj zmiany** zapisuje teksty i pozycje do pliku. Aby przenieść je na drugi komputer, zapisz pobrany plik jako `text-overrides.js` obok `index.html`, albo użyj przycisku **Importuj**. Import nie wykonuje kodu i odrzuca pliki innych prezentacji. W razie niedostępnej pamięci przeglądarki użyj eksportu.

Treści, czasy, dane badania i notatki są w `slides.js`. Liczby wykresów zmienia się w tym pliku, aby zachować spójność wartości i grafiki. Po wydłużeniu tekstu sprawdź, czy nadal mieści się na slajdzie.

## Dane i sceny zakupowe

Źródła, podstawy badania, strony PDF oraz pochodzenie grafik opisano w `SOURCES.md`. Motyw przewodni to spotkanie planu marki i pilnej potrzeby konsumenta. Scena „potrzebuję antyperspirantu, marki jeszcze nie wybrałem” jest autorskim przykładem. Marki A–C, ekrany i cena są umowne. Scena nie jest wynikiem kampanii ani obietnicą czasu dostawy. Slajd 14 pokazuje ogólny schemat natłoku komunikacji bez aplikacji lub marki Glovo; ekrany Glovo ilustrują pomoc w decyzji zakupowej.

CAWI N=1002 dotyczy całej próby mieszkańców miast 18+; raport nie podaje liczebności wszystkich podgrup q-commerce. Decision Lab N=11 opisuje ścieżki jakościowe, nie rozkład w populacji. Retail Media może współtworzyć wybór w aplikacji; sam zakup po reklamie nie jest dowodem jej przyczynowego wpływu.

Tryb ograniczonego ruchu respektuje ustawienia systemowe. Możesz też otworzyć `index.html?motion=off`.

## Kontrole lokalne

```sh
npm test
npm run validate
node --check app.js
```

Te polecenia wymagają Node, ale nie wymagają instalowania zależności. Samo prezentowanie nie wymaga Node.

Przed konferencją przećwicz wystąpienie na docelowym laptopie i fizycznym klikerze. Notatki zawierają orientacyjne czasy oraz proponowany podział między prowadzące.
