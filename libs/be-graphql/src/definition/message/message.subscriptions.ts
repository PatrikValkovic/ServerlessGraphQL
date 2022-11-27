import { nonNull, subscriptionField } from 'nexus';
import { NewMessageEvent } from '@agora/be-business-logic';

export const newMessage = subscriptionField('newMessage', {
    type: nonNull('Message'),
    // @ts-expect-error
    subscribe(_, __, ctx) {
        return ctx.typedSub.createNewMessage(ctx.sub, ctx, ctx.identifier);
    },
    resolve(obj: NewMessageEvent) {
        console.log('New message subscription', obj);
        return obj;
    },
});
