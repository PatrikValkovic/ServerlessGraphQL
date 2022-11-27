import { nonNull, subscriptionField } from 'nexus';
import { UserStatusChangeEvent } from '@agora/be-business-logic';

export const userStatusChanged = subscriptionField('userStatusChanged', {
    type: nonNull('UserStatusChanged'),
    // @ts-expect-error TS can't correctly deduce async iterator type
    subscribe(_, __, ctx) {
        return ctx.typedSub.createUserStatusChange(ctx.sub, ctx);
    },
    resolve(obj: UserStatusChangeEvent) {
        return obj;
    },
});
