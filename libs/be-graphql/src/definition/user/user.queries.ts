import { nonNull, queryField, list } from 'nexus';

export const onlineUsers = queryField('onlineUsers', {
    type: nonNull(list(nonNull('User'))),
    resolve: (_, __, ctx) => ctx.repositories.online.getOnlineUsers(),
});
