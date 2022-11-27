import { enumType, nonNull, objectType } from 'nexus';
import { UserStatus as UserStatusBL } from '@agora/be-business-logic';

export const UserStatusGql = enumType({
    name: 'UserStatus',
    sourceType: {
        module: '@agora/be-business-logic',
        export: 'UserStatus',
    },
    members: UserStatusBL,
});

export const User = objectType({
    name: 'User',
    sourceType: {
        module: '@agora/be-data',
        export: 'OnlineRecord',
    },
    definition(t) {
        t.nonNull.id('id', {
            resolve: obj => obj.identifier,
        });
        t.nonNull.string('name');
    },
});

export const UserStatusChanged = objectType({
    name: 'UserStatusChanged',
    sourceType: {
        module: '@agora/be-business-logic',
        export: 'UserStatusChangeEvent',
    },
    definition(t) {
        t.nonNull.id('identifier');
        t.nonNull.string('name');

        t.field('status', {
            type: nonNull('UserStatus'),
            resolve: obj => obj.newStatus,
        });
    },
});
