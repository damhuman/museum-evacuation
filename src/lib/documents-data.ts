export interface DocumentField {
  id: string;
  label: string;
  type: "text" | "date" | "textarea" | "number";
  placeholder: string;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  icon: string;
  description: string;
  source: string;
  fields: DocumentField[];
  template: string;
}

export const documentTemplates: DocumentTemplate[] = [
  {
    id: "nakaz-evakuatsiia",
    title: "Наказ про евакуацію",
    icon: "📋",
    description: "Наказ керівника закладу про тимчасове переміщення культурних цінностей",
    source: "п.9(3) КМУ №229 від 18.02.2026",
    fields: [
      { id: "museum_name", label: "Назва музею", type: "text", placeholder: "Національний музей..." },
      { id: "director_name", label: "ПІБ директора", type: "text", placeholder: "Іванов Іван Іванович" },
      { id: "date", label: "Дата наказу", type: "date", placeholder: "" },
      { id: "reason", label: "Підстава евакуації", type: "textarea", placeholder: "У зв'язку із загрозою..." },
      { id: "destination", label: "Пункт призначення", type: "text", placeholder: "Місто, заклад" },
      { id: "items_count", label: "Кількість предметів", type: "number", placeholder: "100" },
    ],
    template: `НАКАЗ №___

{museum_name}

від {date}

Про тимчасове переміщення (евакуацію) культурних цінностей

На підставі п.9(3) Порядку тимчасового переміщення (евакуації) культурних цінностей, затвердженого постановою КМУ №229 від 18.02.2026,

у зв'язку з: {reason}

НАКАЗУЮ:

1. Провести тимчасове переміщення (евакуацію) культурних цінностей у кількості {items_count} одиниць зберігання до {destination}.

2. Відповідальним особам забезпечити:
   - складання переліку культурних цінностей, що підлягають переміщенню (інв.номер, назва, автор, кількість);
   - належне пакування та маркування предметів;
   - оформлення акту передачі при прибутті;
   - повідомлення Мінкульту протягом 2 календарних днів після прибуття.

3. Контроль за виконанням наказу залишаю за собою.

Директор _____________ {director_name}`,
  },
  {
    id: "perelik-predmetiv",
    title: "Перелік предметів для евакуації",
    icon: "📝",
    description: "Перелік культурних цінностей, що підлягають тимчасовому переміщенню",
    source: "п.11 КМУ №229 від 18.02.2026",
    fields: [
      { id: "museum_name", label: "Назва музею", type: "text", placeholder: "Національний музей..." },
      { id: "date", label: "Дата складання", type: "date", placeholder: "" },
      { id: "responsible", label: "Відповідальна особа", type: "text", placeholder: "ПІБ зберігача" },
    ],
    template: `ПЕРЕЛІК
культурних цінностей, що підлягають тимчасовому переміщенню (евакуації)

{museum_name}
Дата: {date}

| № | Інв. номер | Назва предмета | Автор | Матеріал | К-сть | Стан | Примітка |
|---|-----------|----------------|-------|----------|-------|------|----------|
| 1 |           |                |       |          |       |      |          |
| 2 |           |                |       |          |       |      |          |
| 3 |           |                |       |          |       |      |          |

Відповідальна особа: _____________ {responsible}`,
  },
  {
    id: "akt-peredachi",
    title: "Акт передачі",
    icon: "🤝",
    description: "Акт приймання-передачі культурних цінностей на тимчасове зберігання",
    source: "п.13 КМУ №229 від 18.02.2026",
    fields: [
      { id: "museum_from", label: "Звідки (музей)", type: "text", placeholder: "Назва музею-відправника" },
      { id: "museum_to", label: "Куди (заклад)", type: "text", placeholder: "Назва закладу-отримувача" },
      { id: "date", label: "Дата передачі", type: "date", placeholder: "" },
      { id: "items_count", label: "Кількість предметів", type: "number", placeholder: "100" },
      { id: "person_from", label: "Хто передав (ПІБ)", type: "text", placeholder: "ПІБ" },
      { id: "person_to", label: "Хто прийняв (ПІБ)", type: "text", placeholder: "ПІБ" },
    ],
    template: `АКТ
приймання-передачі культурних цінностей на тимчасове зберігання

від {date}

{museum_from} (далі — Сторона, що передає) в особі {person_from}
передає, а
{museum_to} (далі — Сторона, що приймає) в особі {person_to}
приймає на тимчасове зберігання культурні цінності у кількості {items_count} одиниць зберігання згідно з переліком (додається).

Стан предметів на момент передачі: задовільний / потребує реставрації (підкреслити).

Передав: _____________ {person_from}
Прийняв: _____________ {person_to}`,
  },
  {
    id: "lyst-minkult",
    title: "Лист до Мінкульту",
    icon: "✉️",
    description: "Повідомлення Мінкульту про евакуацію (протягом 2 к.д. після прибуття)",
    source: "п.9(3) КМУ №229 від 18.02.2026",
    fields: [
      { id: "museum_name", label: "Назва музею", type: "text", placeholder: "Національний музей..." },
      { id: "director_name", label: "ПІБ директора", type: "text", placeholder: "ПІБ" },
      { id: "date", label: "Дата листа", type: "date", placeholder: "" },
      { id: "destination", label: "Куди евакуйовано", type: "text", placeholder: "Місто, заклад" },
      { id: "items_count", label: "Кількість предметів", type: "number", placeholder: "100" },
      { id: "arrival_date", label: "Дата прибуття", type: "date", placeholder: "" },
    ],
    template: `Міністерство культури та інформаційної політики України

від {museum_name}
{date}

Повідомлення про тимчасове переміщення (евакуацію) культурних цінностей

Відповідно до п.9(3) Порядку тимчасового переміщення (евакуації) культурних цінностей (КМУ №229 від 18.02.2026), повідомляємо, що {date} було прийнято рішення про евакуацію культурних цінностей {museum_name}.

Культурні цінності у кількості {items_count} одиниць зберігання було переміщено до {destination}.

Дата прибуття: {arrival_date}.

Перелік евакуйованих предметів та акт передачі додаються.

Директор {museum_name}
_____________ {director_name}`,
  },
];
