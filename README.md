# Tracker

[Прототипи Figma](https://www.figma.com/design/VDtvtPvAQy2ZwdxDJjMHTx/Tracker-%E2%80%94-Interactive-Prototype?node-id=0-1) · [Бэкенд](https://github.com/Amsurur/task-management-backend)

## Архитектура

```text
Tracker-Interactive-Prototype/
├── .agent/
│   └── progress.md
├── app/
│   ├── (access)/
│   │   ├── invitations/
│   │   │   └── [token]/
│   │   │       ├── invitation.tsx
│   │   │       ├── page-translations.json
│   │   │       └── page.tsx
│   │   ├── sign-in/
│   │   │   ├── page-translations.json
│   │   │   ├── page.tsx
│   │   │   └── sign-in.tsx
│   │   └── sign-up/
│   │       ├── page-translations.json
│   │       ├── page.tsx
│   │       └── sign-up.tsx
│   ├── (tracker)/
│   │   ├── profile/
│   │   │   ├── page-translations.json
│   │   │   ├── page.tsx
│   │   │   └── profile.tsx
│   │   └── workspaces/
│   │       ├── [workspaceId]/
│   │       │   ├── my-tasks/
│   │       │   │   ├── created/
│   │       │   │   │   ├── created-by-me.tsx
│   │       │   │   │   ├── page-translations.json
│   │       │   │   │   └── page.tsx
│   │       │   │   ├── my-tasks.tsx
│   │       │   │   ├── page-translations.json
│   │       │   │   └── page.tsx
│   │       │   ├── notifications/
│   │       │   │   ├── unread/
│   │       │   │   │   ├── page-translations.json
│   │       │   │   │   ├── page.tsx
│   │       │   │   │   └── unread-notifications.tsx
│   │       │   │   ├── notifications.tsx
│   │       │   │   ├── page-translations.json
│   │       │   │   └── page.tsx
│   │       │   ├── projects/
│   │       │   │   ├── [projectId]/
│   │       │   │   │   ├── cycles/
│   │       │   │   │   │   ├── [cycleId]/
│   │       │   │   │   │   │   ├── cycle-detail.tsx
│   │       │   │   │   │   │   ├── page-translations.json
│   │       │   │   │   │   │   └── page.tsx
│   │       │   │   │   │   ├── dialogs/
│   │       │   │   │   │   │   └── new-cycle-dialog.tsx
│   │       │   │   │   │   ├── cycles.tsx
│   │       │   │   │   │   ├── page-translations.json
│   │       │   │   │   │   └── page.tsx
│   │       │   │   │   ├── modules/
│   │       │   │   │   │   ├── [moduleId]/
│   │       │   │   │   │   │   ├── module-detail.tsx
│   │       │   │   │   │   │   ├── page-translations.json
│   │       │   │   │   │   │   └── page.tsx
│   │       │   │   │   │   ├── dialogs/
│   │       │   │   │   │   │   └── new-module-dialog.tsx
│   │       │   │   │   │   ├── modules.tsx
│   │       │   │   │   │   ├── page-translations.json
│   │       │   │   │   │   └── page.tsx
│   │       │   │   │   ├── settings/
│   │       │   │   │   │   ├── labels/
│   │       │   │   │   │   │   ├── dialogs/
│   │       │   │   │   │   │   │   └── new-label-dialog.tsx
│   │       │   │   │   │   │   ├── page-translations.json
│   │       │   │   │   │   │   ├── page.tsx
│   │       │   │   │   │   │   └── project-labels.tsx
│   │       │   │   │   │   ├── members/
│   │       │   │   │   │   │   ├── dialogs/
│   │       │   │   │   │   │   │   └── add-project-member-dialog.tsx
│   │       │   │   │   │   │   ├── page-translations.json
│   │       │   │   │   │   │   ├── page.tsx
│   │       │   │   │   │   │   └── project-members.tsx
│   │       │   │   │   │   ├── statuses/
│   │       │   │   │   │   │   ├── dialogs/
│   │       │   │   │   │   │   │   └── new-status-dialog.tsx
│   │       │   │   │   │   │   ├── page-translations.json
│   │       │   │   │   │   │   ├── page.tsx
│   │       │   │   │   │   │   └── project-statuses.tsx
│   │       │   │   │   │   ├── page-translations.json
│   │       │   │   │   │   ├── page.tsx
│   │       │   │   │   │   └── project-settings.tsx
│   │       │   │   │   └── tasks/
│   │       │   │   │       ├── [taskId]/
│   │       │   │   │       │   ├── page-translations.json
│   │       │   │   │       │   ├── page.tsx
│   │       │   │   │       │   └── task-detail.tsx
│   │       │   │   │       ├── board/
│   │       │   │   │       │   ├── board.tsx
│   │       │   │   │       │   ├── page-translations.json
│   │       │   │   │       │   └── page.tsx
│   │       │   │   │       ├── calendar/
│   │       │   │   │       │   ├── calendar.tsx
│   │       │   │   │       │   ├── page-translations.json
│   │       │   │   │       │   └── page.tsx
│   │       │   │   │       ├── dialogs/
│   │       │   │   │       │   ├── new-task-dialog.tsx
│   │       │   │   │       │   └── task-detail-sheet.tsx
│   │       │   │   │       ├── table/
│   │       │   │   │       │   ├── page-translations.json
│   │       │   │   │       │   ├── page.tsx
│   │       │   │   │       │   └── table.tsx
│   │       │   │   │       ├── page-translations.json
│   │       │   │   │       ├── page.tsx
│   │       │   │   │       └── task-list.tsx
│   │       │   │   ├── archived/
│   │       │   │   │   ├── archived-projects.tsx
│   │       │   │   │   ├── page-translations.json
│   │       │   │   │   └── page.tsx
│   │       │   │   ├── dialogs/
│   │       │   │   │   └── new-project-dialog.tsx
│   │       │   │   ├── page-translations.json
│   │       │   │   ├── page.tsx
│   │       │   │   └── projects.tsx
│   │       │   └── settings/
│   │       │       ├── members/
│   │       │       │   ├── dialogs/
│   │       │       │   │   └── invite-member-dialog.tsx
│   │       │       │   ├── page-translations.json
│   │       │       │   ├── page.tsx
│   │       │       │   └── workspace-members.tsx
│   │       │       ├── page-translations.json
│   │       │       ├── page.tsx
│   │       │       └── workspace-settings.tsx
│   │       └── new/
│   │           ├── create-workspace.tsx
│   │           ├── page-translations.json
│   │           └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   └── layout.tsx
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── dialog.tsx
│       └── sheet.tsx
├── dev1/
│   └── README.md
├── dev2/
│   └── README.md
├── lib/
│   └── utils.ts
├── .gitignore
├── AGENTS.md
├── components.json
├── eslint.config.mjs
├── next.config.ts
├── package-lock.json
├── package.json
├── README.md
├── SCAFFOLD-PROMPT.md
└── tsconfig.json
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
