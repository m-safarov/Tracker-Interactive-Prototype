# Dev 1 — воридшавӣ ва вазифаҳо

**[API Guide — Dev 1 дар Figma](https://www.figma.com/design/VDtvtPvAQy2ZwdxDJjMHTx/Tracker-%E2%80%94-Interactive-Prototype?node-id=55-7216)**

Дар муҳаррир файли зерро кушоед ё бо `Ctrl+P` номашро ёбед. Дар сатри якум `// Dev 1` навишта шудааст. Дизайни экран ва ҷузъҳои shadcn/ui барои ҳар ду яканд. [Прототипи Figma](https://www.figma.com/design/VDtvtPvAQy2ZwdxDJjMHTx/Tracker-%E2%80%94-Interactive-Prototype?node-id=0-1)

## Воридшавӣ ва профил

| Файл | Вазифа |
| --- | --- |
| [sign-in.tsx](../app/sign-in/sign-in.tsx) | Формаи воридшавӣ |
| [sign-up.tsx](../app/sign-up/sign-up.tsx) | Формаи сабти ном |
| [profile.tsx](../app/profile/profile.tsx) | Профил ва танзимоти шахсӣ |

## Вазифаҳо

| Файл | Вазифа |
| --- | --- |
| [task-list.tsx](../app/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/tasks/task-list.tsx) | Рӯйхати вазифаҳо аз рӯи статус |
| [board.tsx](../app/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/tasks/board/board.tsx) | Кортҳои вазифаҳо дар сутунҳо |
| [table.tsx](../app/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/tasks/table/table.tsx) | Ҷадвали вазифаҳо |
| [calendar.tsx](../app/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/tasks/calendar/calendar.tsx) | Тақвими вазифаҳо |
| [task-detail.tsx](../app/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/tasks/%5BtaskId%5D/task-detail.tsx) | Саҳифаи пурраи як вазифа |
| [task-detail-sheet.tsx](../app/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/tasks/dialogs/task-detail-sheet.tsx) | Панели ҷузъиёти вазифа дар List |
| [new-task-dialog.tsx](../app/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/tasks/dialogs/new-task-dialog.tsx) | Диалоги сохтани вазифа |
| [my-tasks.tsx](../app/workspaces/%5BworkspaceId%5D/my-tasks/my-tasks.tsx) | Вазифаҳои ба ман таъиншуда |
| [created-by-me.tsx](../app/workspaces/%5BworkspaceId%5D/my-tasks/created/created-by-me.tsx) | Вазифаҳои сохтаи ман |

## Пеш аз push

Вақте ҳар ду каркасро аз `main` гирифтанд, барои вазифаи худ branch кушоед. Баъди таҳрир танҳо файли лозимро ба commit илова кунед.

```bash
git switch -c dev1/sign-in
npm run check
git add -- app/sign-in/sign-in.tsx
git commit -m "feat: build sign-in screen"
git push -u origin dev1/sign-in
```

Пас ба `main` Pull Request кушоед. [Қоидаи файлҳои умумӣ](../README.md#кори-дунафара)
