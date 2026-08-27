# Имена файлов: слаги сортов

Снимок демонстрационного каталога на 25 августа 2026 — 54 сорта. Когда каталог заменят
выгрузкой клиента, слаги изменятся; пересобрать список можно с поднятого сайта:

```bash
pnpm start:seedlings
curl -s http://localhost:3210/sitemap.xml | grep -o '/product/[a-z0-9-]*' | sed 's|/product/||' | sort
```

Имя файла = слаг, дополнительные кадры — суффиксы `-2`, `-3`: `klubnika-polka.jpg`,
`klubnika-polka-2.jpg`. Правила формата и что снимать — в `README.md` рядом.

## Клубника — 12

| Файл | Сорт |
|---|---|
| `klubnika-albion.jpg` | Альбион |
| `klubnika-aziya.jpg` | Азия |
| `klubnika-elsanta.jpg` | Эльсанта |
| `klubnika-gigantella-maksim.jpg` | Гигантелла Максим |
| `klubnika-honey.jpg` | Хоней |
| `klubnika-kleri.jpg` | Клери |
| `klubnika-lord.jpg` | Лорд |
| `klubnika-malvina.jpg` | Мальвина |
| `klubnika-monterey.jpg` | Монтерей |
| `klubnika-polka.jpg` | Полка |
| `klubnika-san-andreas.jpg` | Сан Андреас |
| `klubnika-zenga-zengana.jpg` | Зенга Зенгана |

## Малина — 10

| Файл | Сорт |
|---|---|
| `malina-atlant.jpg` | Атлант |
| `malina-bryanskoe-divo.jpg` | Брянское диво |
| `malina-gerakl.jpg` | Геракл |
| `malina-gusar.jpg` | Гусар |
| `malina-karamelka.jpg` | Карамелька |
| `malina-kaskad-delayt.jpg` | Каскад Делайт |
| `malina-novost-kuzmina.jpg` | Новость Кузьмина |
| `malina-polka.jpg` | Полка |
| `malina-tarusa.jpg` | Таруса |
| `malina-zheltyy-gigant.jpg` | Жёлтый гигант |

## Смородина — 8

| Файл | Сорт |
|---|---|
| `smorodina-bagira.jpg` | Багира |
| `smorodina-dzhonker-van-tets.jpg` | Джонкер ван Тетс |
| `smorodina-ekzotika.jpg` | Экзотика |
| `smorodina-pigmey.jpg` | Пигмей |
| `smorodina-rozetta.jpg` | Розетта |
| `smorodina-selechenskaya-2.jpg` | Селеченская-2 |
| `smorodina-versalskaya-belaya.jpg` | Версальская белая |
| `smorodina-yadrenaya.jpg` | Ядрёная |

## Крыжовник — 5

| Файл | Сорт |
|---|---|
| `kryzhovnik-chernoslivovyy.jpg` | Черносливовый |
| `kryzhovnik-grushenka.jpg` | Грушенька |
| `kryzhovnik-komandor.jpg` | Командор |
| `kryzhovnik-medovyy.jpg` | Медовый |
| `kryzhovnik-uralskiy-izumrud.jpg` | Уральский изумруд |

## Жимолость — 5

| Файл | Сорт |
|---|---|
| `zhimolost-bakcharskiy-velikan.jpg` | Бакчарский великан |
| `zhimolost-doch-velikana.jpg` | Дочь великана |
| `zhimolost-silginka.jpg` | Сильгинка |
| `zhimolost-vostorg.jpg` | Восторг |
| `zhimolost-yugol.jpg` | Юголь |

## Овощная рассада — 8

| Файл | Сорт |
|---|---|
| `ovoshchnaya-rassada-almaz.jpg` | Алмаз |
| `ovoshchnaya-rassada-byche-serdtse.jpg` | Бычье сердце |
| `ovoshchnaya-rassada-cherri-ira.jpg` | Черри Ира |
| `ovoshchnaya-rassada-dzhemini-f1.jpg` | Джемини F1 |
| `ovoshchnaya-rassada-kurazh-f1.jpg` | Кураж F1 |
| `ovoshchnaya-rassada-ratunda.jpg` | Ратунда |
| `ovoshchnaya-rassada-sanka.jpg` | Санька |
| `ovoshchnaya-rassada-slava.jpg` | Слава |

## Цветочная рассада — 6

| Файл | Сорт |
|---|---|
| `tsvety-barhattsy-karmen.jpg` | Бархатцы Кармен |
| `tsvety-floks-metelchatyy-evropa.jpg` | Флокс метельчатый Европа |
| `tsvety-hosta-goluboy-angel.jpg` | Хоста Голубой ангел |
| `tsvety-lavanda-uzkolistnaya.jpg` | Лаванда узколистная |
| `tsvety-petuniya-sofistika.jpg` | Петуния Софистика |
| `tsvety-viola-sviss-dzhaynts.jpg` | Виола Свисс Джайнтс |
