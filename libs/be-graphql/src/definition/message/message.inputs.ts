import { inputObjectType } from 'nexus';

export const MessageInput = inputObjectType({
    name: 'MessageInput',
    definition(t) {
        t.nonNull.id('receiverId');
        t.nonNull.string('content');
    },
});
