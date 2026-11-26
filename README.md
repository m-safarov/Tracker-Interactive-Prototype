# Tracker

[Прототипи Figma](https://www.figma.com/design/VDtvtPvAQy2ZwdxDJjMHTx/Tracker-%E2%80%94-Interactive-Prototype?node-id=0-1) · [Бэкенд](https://github.com/Amsurur/task-management-backend)

## Архитектура

```text
app/
├── (access)/
│   ├── sign-in/
│   ├── sign-up/
│   └── invitations/[token]/
├── (tracker)/
│   ├── profile/
│   └── workspaces/
│       ├── new/
│       └── [workspaceId]/
│           ├── my-tasks/
│           ├── notifications/
│           ├── settings/
│           └── projects/
│               ├── archived/
│               └── [projectId]/
│                   ├── tasks/
│                   ├── cycles/
│                   ├── modules/
│                   └── settings/
├── layout.tsx
└── globals.css
components/ui/
lib/
```

- `(access)` ва `(tracker)` гурӯҳҳои Next.js мебошанд. Ба URL дохил намешаванд. Масалан, [`profile.tsx`](app/%28tracker%29/profile/profile.tsx) аз `/profile` кушода мешавад.
- `page.tsx` маршрутро ба компоненти ҳамон папка мепайвандад. Компонентро дар файли номдори саҳифа таҳрир кун. Барои тарҷумаҳо `page-translations.json` бо калидҳои `en`, `tg` ва `ru` аст.
- Диалог ва панели ҷузъиёт дар `dialogs/` назди экрани худанд. Button, Dialog ва Sheet-и умумӣ дар [`components/ui/`](components/ui/) ҳастанд.

Дар API-и бэкенд роҳҳои workspace аз `workspaceSlug` истифода мебаранд. Вазифаҳои фронтенд ба `issues`, статусҳо ба `states` ва даъватҳо ба `invites` мувофиқанд. Swagger-и бэкенд дар `/docs` дастрас аст. [Масирҳои API](https://github.com/Amsurur/task-management-backend/blob/main/src/app.ts)

## Тақсимоти кор

| Шоха | Вазифа | Файлҳо |
| --- | --- | --- |
| `dev1` | Воридшавӣ, сабти ном, профил, My Tasks ва экранҳои вазифаҳо | [Рӯйхати файлҳои dev1](dev1/README.md) |
| `dev2` | Workspace, даъватҳо, проектҳо, давраҳо, модулҳо ва огоҳиномаҳо | [Рӯйхати файлҳои dev2](dev2/README.md) |

Ҳар кас дар шохаи худ кор мекунад ва ба `main` Pull Request мекушояд. Барои тағйири layout, CSS ё ҷузъҳои умумӣ аввал бо ҳам мувофиқа кунед.

## Оғоз

Бо Node.js 22 ё навтар:

```bash
npm ci
npm run dev
```

Пеш аз Pull Request `npm run check`-ро иҷро кун.
