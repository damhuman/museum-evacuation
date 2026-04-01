# MuseumAID

AI-система підтримки рішень для евакуації музейних предметів під час воєнного стану в Україні.

Система в реальному часі дає конкретні, нормативно обґрунтовані інструкції на основі КМУ №229, МКІП №424, ICCROM First Aid та інших джерел.

## Архітектура

```
Запит користувача
       │
       ▼
  ORCHESTRATOR (Claude Haiku)
  ├── Класифікує: emergency / planned / consultation
  ├── Перевіряє достатність інформації → questionnaire
  └── Визначає агентів та витягує параметри
       │
       ├── Достатньо інформації
       │         │
       │    ┌────┴─────────────────┐
       │    ▼         ▼            ▼
       │  TRIAGE    PACKING    LOGISTICS
       │  AGENT     AGENT      AGENT
       │    │         │            │
       │    └────┬────┘────────────┘
       │         ▼
       │   Streaming response з inline citations
       │
       └── Бракує інформації
                 │
                 ▼
           Questionnaire → збір деталей → повторна класифікація
```

Кожен агент має окремий system prompt (`prompts/*.md`) з вшитою нормативною базою. Промпти легко редагувати без зміни коду.

## Стек

| Шар | Технологія |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, framer-motion |
| LLM | Claude Haiku 4.5 (Anthropic SDK) |
| Тести | Playwright (25 E2E specs) |
| Деплой | Vercel |

## Швидкий старт

```bash
git clone git@github.com:damhuman/museum-evacuation.git
cd museum-evacuation/museumaid
npm install
```

Створити `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Запустити:

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
```

## Структура проекту

```
museumaid/
├── prompts/                     # System prompts агентів (md)
│   ├── orchestrator.md          # Класифікація та маршрутизація
│   ├── triage.md                # Пріоритезація евакуації
│   ├── packing.md               # Інструкції пакування
│   └── logistics.md             # Документи та логістика
│
├── src/
│   ├── app/
│   │   ├── page.tsx             # Landing: hero, сценарії, quick actions
│   │   ├── chat/page.tsx        # AI чат з agent pipeline
│   │   ├── checklists/          # Інтерактивні чеклісти (8 типів)
│   │   ├── documents/           # Шаблони документів + PDF export
│   │   ├── knowledge/page.tsx   # База знань (нормативні документи)
│   │   └── api/chat/route.ts    # Streaming API (orchestrator → agents)
│   │
│   ├── components/
│   │   ├── ChatInterface.tsx    # Чат UI зі streaming та markdown
│   │   ├── AgentPipeline.tsx    # Візуалізація pipeline агентів
│   │   ├── SmartText.tsx        # Інтерактивні citations + checklist links
│   │   ├── Navigation.tsx       # Навігація з dark mode toggle
│   │   └── ThemeProvider.tsx    # Dark/light theme
│   │
│   └── lib/
│       ├── orchestrator.ts      # Orchestrator: classify → route
│       ├── agents.ts            # Agent runner: load prompts → stream
│       ├── sources-data.ts      # 8 нормативних документів з URL + anchors
│       ├── checklists-data.ts   # 8 типів предметів, 56 кроків
│       └── documents-data.ts    # 4 шаблони документів
│
├── e2e/                         # Playwright E2E тести (25 specs)
│   ├── smoke.spec.ts            # Landing, навігація
│   ├── emergency-flow.spec.ts   # Екстрений сценарій
│   ├── consultation-flow.spec.ts
│   ├── checklists.spec.ts       # Чеклісти, прогрес, експорт
│   ├── documents.spec.ts        # Шаблони, PDF
│   ├── responsive.spec.ts       # Mobile 375px, tablet 768px
│   ├── darkmode.spec.ts
│   ├── edge-cases.spec.ts       # Empty, long, rapid-fire, navigate-away
│   ├── accessibility.spec.ts    # ARIA, landmarks, tab nav
│   └── citations.spec.ts        # 5 domain questions, source validation
│
└── playwright.config.ts
```

## Сторінки

| Сторінка | Шлях | Опис |
|---|---|---|
| Головна | `/` | Hero, 3 сценарії (екстрена/планова/консультація), quick actions |
| Чат | `/chat` | AI чат з agent pipeline, streaming, інтерактивні citations |
| Чеклісти | `/checklists` | 8 типів предметів, інтерактивні чекбокси, прогрес, друк/експорт |
| Документи | `/documents` | 4 шаблони (наказ, перелік, акт, лист), форма + PDF export |
| База знань | `/knowledge` | 8 нормативних документів з ключовими положеннями та посиланнями |

## Агенти

### Orchestrator

Класифікує запит, витягує параметри (колекція, час, ресурси), перевіряє достатність інформації. Якщо бракує деталей — генерує уточнювальні питання перед тим, як передавати запит агентам.

### Triage Agent

Пріоритезація за системою ICCROM:
- 🔴 Червоний (негайно) — унікальні, вразливі матеріали
- 🟡 Жовтий (другий пріоритет) — стабільніші предмети
- 🟢 Зелений (якщо є час) — копії, дублікати

Фактори: унікальність, вразливість матеріалу, габарити vs транспорт, стан збереженості.

### Packing Agent

Покрокові інструкції пакування для 8 типів предметів: живопис, кераміка, ікони, текстиль, скульптура, документи/книги, метал, нумізматика. Базовий принцип ICCROM: м'який шар → захисний шар → жорсткий контейнер.

### Logistics Agent

Процедура евакуації за КМУ №229:
1. Рішення керівника (п.9)
2. Перелік предметів (п.11)
3. Транспортування + координація з ДСНС (п.13)
4. Акт передачі
5. Лист до Мінкульту (2 к.д.)

Розрахунок рейсів, документи, контакти.

## Нормативна база

| Документ | Що регулює |
|---|---|
| КМУ №229 від 18.02.2026 | Порядок евакуації культурних цінностей |
| ЗУ №249/95-ВР | Закон про музеї та музейну справу |
| КМУ №841 від 30.10.2013 | Фінансування евакуації |
| КМУ №1147 від 2000 | Категорії музеїв |
| МКІП №424 від 11.08.2023 | Методичні рекомендації (пакування по типах) |
| Інструкція №580 від 2016 | Облік музейних предметів |
| ICCROM First Aid | Система тріажу, принципи пакування |
| ICCROM Endangered Heritage | Workflow екстреної евакуації |

Всі рекомендації системи містять inline citations з посиланням на конкретний пункт документа. Цитати клікабельні — відкривають документ на zakon.rada.gov.ua або PDF на iccrom.org.

## Тестування

```bash
# Встановити браузер
npx playwright install chromium

# Запустити всі тести
npx playwright test

# З HTML звітом
npx playwright test --reporter=html

# Конкретний файл
npx playwright test e2e/emergency-flow.spec.ts
```

25 E2E тестів покривають:

| Категорія | Тестів | Що перевіряє |
|---|---|---|
| Smoke | 3 | Landing, навігація, quick actions |
| Emergency flow | 1 | Сценарій екстреної евакуації, streaming, citations |
| Consultation | 1 | Запит пакування ікони |
| Checklists | 3 | Типи, чекбокси, прогрес, друк/експорт |
| Documents | 2 | Шаблони, форма, PDF export |
| Responsive | 2 | Mobile 375px, tablet 768px |
| Dark mode | 1 | Toggle, всі сторінки |
| Edge cases | 4 | Empty, long message, rapid-fire, navigate-away |
| Accessibility | 3 | ARIA labels, tab nav, landmarks |
| Citations | 5 | 5 domain questions, source validation |

## Редагування промптів

System prompts агентів знаходяться в `prompts/*.md`:

```
prompts/orchestrator.md   # Класифікація та маршрутизація
prompts/triage.md         # Пріоритезація
prompts/packing.md        # Пакування
prompts/logistics.md      # Логістика та документи
```

Зміни в промптах застосовуються без перебілду — файли читаються при кожному запиті.

## Деплой (Vercel)

1. Імпортувати репозиторій у [vercel.com](https://vercel.com)
2. **Root Directory**: `museumaid`
3. **Environment Variables**: `ANTHROPIC_API_KEY`
4. Deploy

> Netlify не підходить: streaming API routes та `readFileSync` для промптів потребують Node.js runtime.

## Ліцензія

MIT
