# dev2 — workspace, проектҳо, давраҳо, модулҳо ва огоҳиномаҳо

**[API Guide — Dev 2 дар Figma](https://www.figma.com/design/VDtvtPvAQy2ZwdxDJjMHTx/Tracker-%E2%80%94-Interactive-Prototype?node-id=55-7217)**

Дар шохаи `dev2` кор кун. Ҳар линк файли компонентро мустақим мекушояд.

## Workspace

| Файл | Вазифа |
| --- | --- |
| [create-workspace.tsx](../app/%28tracker%29/workspaces/new/create-workspace.tsx) | Формаи сохтани workspace |
| [invitation.tsx](../app/%28access%29/invitations/%5Btoken%5D/invitation.tsx) | Саҳифаи қабули даъват |
| [workspace-settings.tsx](../app/%28tracker%29/workspaces/%5BworkspaceId%5D/settings/workspace-settings.tsx) | Танзимоти workspace |
| [workspace-members.tsx](../app/%28tracker%29/workspaces/%5BworkspaceId%5D/settings/members/workspace-members.tsx) | Аъзо ва нақшҳои workspace |
| [invite-member-dialog.tsx](../app/%28tracker%29/workspaces/%5BworkspaceId%5D/settings/members/dialogs/invite-member-dialog.tsx) | Диалоги даъвати аъзо |

## Проектҳо

| Файл | Вазифа |
| --- | --- |
| [projects.tsx](../app/%28tracker%29/workspaces/%5BworkspaceId%5D/projects/projects.tsx) | Рӯйхати проектҳои фаъол |
| [archived-projects.tsx](../app/%28tracker%29/workspaces/%5BworkspaceId%5D/projects/archived/archived-projects.tsx) | Рӯйхати проектҳои архившуда |
| [new-project-dialog.tsx](../app/%28tracker%29/workspaces/%5BworkspaceId%5D/projects/dialogs/new-project-dialog.tsx) | Диалоги сохтани проект |
| [project-settings.tsx](../app/%28tracker%29/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/settings/project-settings.tsx) | Танзимоти умумии проект |
| [project-members.tsx](../app/%28tracker%29/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/settings/members/project-members.tsx) | Аъзо ва нақшҳои проект |
| [add-project-member-dialog.tsx](../app/%28tracker%29/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/settings/members/dialogs/add-project-member-dialog.tsx) | Диалоги илова кардани аъзои проект |
| [project-statuses.tsx](../app/%28tracker%29/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/settings/statuses/project-statuses.tsx) | Статусҳои проект |
| [new-status-dialog.tsx](../app/%28tracker%29/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/settings/statuses/dialogs/new-status-dialog.tsx) | Диалоги сохтани статус |
| [project-labels.tsx](../app/%28tracker%29/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/settings/labels/project-labels.tsx) | Нишонаҳои проект |
| [new-label-dialog.tsx](../app/%28tracker%29/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/settings/labels/dialogs/new-label-dialog.tsx) | Диалоги сохтани нишона |

## Давраҳо ва модулҳо

| Файл | Вазифа |
| --- | --- |
| [cycles.tsx](../app/%28tracker%29/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/cycles/cycles.tsx) | Рӯйхати давраҳо |
| [cycle-detail.tsx](../app/%28tracker%29/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/cycles/%5BcycleId%5D/cycle-detail.tsx) | Як давра ва вазифаҳояш |
| [new-cycle-dialog.tsx](../app/%28tracker%29/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/cycles/dialogs/new-cycle-dialog.tsx) | Диалоги сохтани давра |
| [modules.tsx](../app/%28tracker%29/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/modules/modules.tsx) | Рӯйхати модулҳо |
| [module-detail.tsx](../app/%28tracker%29/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/modules/%5BmoduleId%5D/module-detail.tsx) | Як модул ва вазифаҳояш |
| [new-module-dialog.tsx](../app/%28tracker%29/workspaces/%5BworkspaceId%5D/projects/%5BprojectId%5D/modules/dialogs/new-module-dialog.tsx) | Диалоги сохтани модул |

## Огоҳиномаҳо

| Файл | Вазифа |
| --- | --- |
| [notifications.tsx](../app/%28tracker%29/workspaces/%5BworkspaceId%5D/notifications/notifications.tsx) | Ҳамаи огоҳиномаҳо |
| [unread-notifications.tsx](../app/%28tracker%29/workspaces/%5BworkspaceId%5D/notifications/unread/unread-notifications.tsx) | Огоҳиномаҳои хонданашуда ва ҳолати холӣ |
