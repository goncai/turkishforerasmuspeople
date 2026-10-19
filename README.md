# Turkish Learning App — Erasmus Edition

A free, static website that helps Erasmus students learn survival Turkish: the alphabet, basic grammar, 100 everyday words, and phrases for university, housing, travel, public transport and food. Every phrase has a 🔊 listen button, and each module ends with a matching game and a quiz.

## Modules

| Page | Topic |
| --- | --- |
| `alphabet.html` | The 29 letters and the sounds that are tricky for English speakers |
| `grammar.html` | Vowel harmony, yes/no questions with *mi*, *sen* / *siz*, *var* / *yok* |
| `cultural.html` | Everyday expressions and customs |
| `flashcards.html` | Top 100 daily words |
| `university.html` | Campus vocabulary, Erasmus phrases, dialogues |
| `music.html` | Learning with popular Turkish songs |
| `residence.html` | Housing and the residence permit process |
| `travel.html` | Travel phrases and destinations |
| `transportation.html` | Buses, metro, ferries and travel cards |
| `food-drinks.html` | Ordering food, allergies, street food |

## Running locally

No build step is needed. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Notes

- Pronunciation uses the browser's built-in speech synthesis with a Turkish (`tr-TR`) voice. Chrome and Safari usually include one; other browsers may need a Turkish voice installed in the system settings.
- `.nojekyll` must stay in the repository: without it GitHub Pages skips `_shared.js`, which every page needs.
- Some photos are loaded from [Unsplash](https://unsplash.com); song clips are embedded from YouTube.
