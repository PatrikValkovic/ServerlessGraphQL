import { shield } from 'graphql-shield';
import { Query } from './Query';

export const permissions = shield({
    Query,
}, {
    debug: true,
    allowExternalErrors: true,
});
