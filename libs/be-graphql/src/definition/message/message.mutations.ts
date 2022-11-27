import { mutationField, nonNull } from 'nexus';

export const sendMessage = mutationField('sendMessage', {
    type: nonNull('Message'),
    args: {
        message: nonNull('MessageInput'),
    },
    resolve: async (_, { message }, ctx) => {
        await ctx.typedPub.publishNewMessage({
            toIdentifier: message.receiverId,
            fromIdentifier: ctx.identifier,
            content: message.content,
        });
        return {
            fromIdentifier: ctx.identifier,
            content: message.content,
            toIdentifier: message.receiverId,
        };
    },
});
