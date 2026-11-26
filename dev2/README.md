# Dev 2 — workspace, проектҳо ва огоҳиномаҳо

**[API Guide — Dev 2 дар Figma](https://www.figma.com/design/VDtvtPvAQy2ZwdxDJjMHTx/Tracker-%E2%80%94-Interactive-Prototype?node-id=55-7217)**

Дар муҳаррир файли зерро кушоед ё бо `Ctrl+P` номашро ёбед. Дар сатри якум `// Dev 2` навишта шудааст. Дизайни экран ва ҷузъҳои shadcn/ui барои ҳар ду яканд. [Прототипи Figma](https://www.figma.com/design/VDtvtPvAQy2ZwdxDJjMHTx/Tracker-%E2%80%94-Interactive-Prototype?node-id=0-1)

## Workspace

| Файл | Вазифа |
| --- | --- |
| [create-workspace.tsx](../app/workspaces/new/create-workspace.tsx) | Формаи сохтани workspace |
| [invitation.tsx](../app/invitations/%5Btoken%5D/invitation.tsx) | Саҳифаи қабули даъват |
| [workspace-settings.tsx](../app/workspaces/%5BworkspaceId%5D/settings/workspace-settings.tsx) | Танзимоти workspace |
| [workspace-members.tsx](../app/workspaces/%5BworkspaceId%5D/settings/members/workspace-members.tsx) | Аъзо ва нақшҳои workspace |
| [invite-member-dialog.tsx](../app/workspaces/%5BworkspaceId%5D/settings/members/dialogs/invite-member-dialog.tsx) | Диалоги даъвати аъзо |

## Проектҳо

| Файл | Вазифа |
| --- | --- |
| [projects.tsx](../app/workspaces/%5BworkspaceId%5D/projects/projects.tsx) | Рӯйхати проектҳои фаъол |
| [archived-projects.tsx](../app/workspaces/%5BworkspaceId%5D/projects/archived/archived-projects.tsx) | Рӯйхати проектҳои архившуда |
| [new-project-dialog.tsx](../app/workspaces/%5BworkspaceId%5D/projects/dialogs/new-project-dialog.tsx) | Диалоги сохтани проект |
| [project-settings.tsx](../app/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/settings/project-settings.tsx) | Танзимоти умумии проект |
| [project-members.tsx](../app/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/settings/members/project-members.tsx) | Аъзо ва нақшҳои проект |
| [add-project-member-dialog.tsx](../app/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/settings/members/dialogs/add-project-member-dialog.tsx) | Диалоги илова кардани аъзои проект |
| [project-statuses.tsx](../app/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/settings/statuses/project-statuses.tsx) | Статусҳои проект |
| [new-status-dialog.tsx](../app/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/settings/statuses/dialogs/new-status-dialog.tsx) | Диалоги сохтани статус |
| [project-labels.tsx](../app/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/settings/labels/project-labels.tsx) | Нишонаҳои проект |
| [new-label-dialog.tsx](../app/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/settings/labels/dialogs/new-label-dialog.tsx) | Диалоги сохтани нишона |

## Давраҳо ва модулҳо

| Файл | Вазифа |
| --- | --- |
| [cycles.tsx](../app/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/cycles/cycles.tsx) | Рӯйхати давраҳо |
| [cycle-detail.tsx](../app/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/cycles/%5BcycleId%5D/cycle-detail.tsx) | Як давра ва вазифаҳояш |
| [new-cycle-dialog.tsx](../app/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/cycles/dialogs/new-cycle-dialog.tsx) | Диалоги сохтани давра |
| [modules.tsx](../app/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/modules/modules.tsx) | Рӯйхати модулҳо |
| [module-detail.tsx](../app/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/modules/%5BmoduleId%5D/module-detail.tsx) | Як модул ва вазифаҳояш |
| [new-module-dialog.tsx](../app/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/modules/dialogs/new-module-dialog.tsx) | Диалоги сохтани модул |

## Огоҳиномаҳо

| Файл | Вазифа |
| --- | --- |
| [notifications.tsx](../app/workspaces/%5BworkspaceId%5D/notifications/notifications.tsx) | Ҳамаи огоҳиномаҳо |
| [unread-notifications.tsx](../app/workspaces/%5BworkspaceId%5D/notifications/unread/unread-notifications.tsx) | Огоҳиномаҳои хонданашуда ва ҳолати холӣ |

## Пеш аз push

Вақте ҳар ду каркасро аз `main` гирифтанд, барои вазифаи худ branch кушоед. Баъди таҳрир танҳо файли лозимро ба commit илова кунед.

```bash
git switch -c dev2/create-workspace
npm run check
git add -- app/workspaces/new/create-workspace.tsx
git commit -m "feat: build create workspace screen"
git push -u origin dev2/create-workspace
```

Пас ба `main` Pull Request кушоед. [Қоидаи файлҳои умумӣ](../README.md#кори-дунафара)
