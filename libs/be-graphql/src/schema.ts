import * as path from 'path';
import { makeSchema } from 'nexus';
import { applyMiddleware } from 'graphql-middleware';
import * as types from './definition';
import { permissions } from './permissions';

export const nexusSchema = makeSchema({
    types,
    shouldGenerateArtifacts: process.env.NEXUS_EXIT==='true',
    shouldExitAfterGenerateArtifacts: process.env.NEXUS_EXIT==='true',
    outputs: {
        schema: path.join(__dirname, 'generated', 'schema.graphql'),
        typegen: path.join(__dirname, 'generated', 'typegen.ts'),
    },
    sourceTypes: {
        headers: [
            '// @ts-nocheck',
        ],
        modules: [],
    },
    contextType: {
        module: '@agora/be-graphql',
        export: 'SubscriptionGqlContext',
    },
});

export const schema = applyMiddleware(
    nexusSchema,
    permissions,
);
