---
'@backstage-community/plugin-rbac-backend': patch
---

Reduces the number of times that we build the group hierarchy graphs during evaluation. Originally, during time of evaluation, we would build a graph to of all of the groups that a user was directly or indirectly a member of. Now, we only build the graph once and pass along all of the roles that the user is directly or indirectly attached to.
