# Tracker

## Дар куҷо кор кунам?

**Барои сохтани профил** [`profile.tsx`](app/profile/profile.tsx)-ро кушоед. **Барои навиштани матни профил** [`page-translations.json`](app/profile/page-translations.json)-ро кушоед.

```text
app/
└── profile/
    ├── profile.tsx             ← компоненти саҳифа
    ├── page-translations.json  ← ҷойи матнҳои ҳамин саҳифа
    └── page.tsx                ← файлест, ки Next.js аз он /profile-ро мекушояд
```

Дар файли матн `en` барои англисӣ, `tg` барои тоҷикӣ ва `ru` барои русӣ аст. Ҳар се ҷой холӣ ва барои пур кардан омодаанд.

## Саҳифа ва зерсаҳифа

Саҳифаҳоро аз `app/` ёбед. Дар VS Code метавонед `Ctrl+P` занед ва номи файлро нависед, масалан `task-list.tsx`.

```text
tasks/
├── task-list.tsx
├── page.tsx
├── page-translations.json
├── board/
│   ├── board.tsx
│   ├── page.tsx
│   └── page-translations.json
└── dialogs/
    └── new-task-dialog.tsx
```

Board зерсаҳифаи Tasks аст, барои ҳамин папкааш дар дохили `tasks/` аст. Барои сохтани саҳифаи нав папкаи `profile/`-ро ҳамчун намуна гиред. Номи папка, файли компонент ва функсияи дохили онро иваз кунед ва номи навро дар сатри ягонаи `page.tsx` гузоред.

Button, Dialog ва Sheet-и shadcn/ui дар [`components/ui/`](components/ui/) ҳастанд.

## Кори дунафара

- [Dev 1](dev1/README.md) — воридшавӣ, сабти ном, профил ва вазифаҳо.
- [Dev 2](dev2/README.md) — workspace, даъват, проект, давра, модул ва огоҳинома.

Ҳар кас файли нишондодашударо дар branch-и худаш таҳрир мекунад ва ба `main` Pull Request мекушояд. Барои `app/layout.tsx`, `components/ui/`, CSS ва config аввал мувофиқат кунед ва PR-и ҷудо кушоед.

Бо як дизайни Figma frontend созед. Backend алоҳида дода мешавад. Dev 1 менюи профил ва рӯйхати вазифаҳоро омода мекунад. Dev 2 ҷойи workspace switcher ва тугмаи огоҳиномаро дар layout мувофиқа мекунад. Барои давра ва модул рӯйхати вазифаҳои Dev 1-ро истифода баред. [Тақсимоти устод](https://claude.ai/artifact/6mxK1rbhKEBS64CCsX5HNF#a779056c-3163)

## Оғоз

Бо Node.js 22 ё навтар дар терминали проект `npm ci` ва баъд `npm run dev`-ро иҷро кунед. Барои дидани каркаси профил [`/profile`](http://localhost:3000/profile)-ро кушоед. Пеш аз фиристодани тағйирот `npm run check`-ро иҷро кунед.

[Прототип дар Figma](https://www.figma.com/design/VDtvtPvAQy2ZwdxDJjMHTx/Tracker-%E2%80%94-Interactive-Prototype?node-id=0-1) · [Промпти омода](SCAFFOLD-PROMPT.md)
