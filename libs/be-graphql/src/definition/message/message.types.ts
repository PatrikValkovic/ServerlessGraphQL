import { nonNull, objectType } from 'nexus';

export const Message = objectType({
    name: 'Message',
    sourceType: {
        module: '@agora/be-data',
        export: 'Message',
    },
    definition(t) {
        t.nonNull.string('content');

        t.field('sender', {
            type: nonNull('User'),
            resolve: (obj, _, ctx) => {
                if (obj.fromIdentifier === ctx.identifier) {
                    return {
                        name: ctx.name,
                        identifier: ctx.identifier,
                    };
                }
                return ctx.repositories.online.getById(obj.fromIdentifier);
            },
        });

        t.field('receiver', {
            type: nonNull('User'),
            resolve: (obj, _, ctx) => {
                if (obj.toIdentifier === ctx.identifier) {
                    return {
                        name: ctx.name,
                        identifier: ctx.identifier,
                    };
                }
                return ctx.repositories.online.getById(obj.toIdentifier);
            },
        });
    },
});
