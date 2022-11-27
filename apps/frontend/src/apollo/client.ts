import { ApolloClient, createHttpLink, InMemoryCache, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

export type CreateApolloArgs = {
    userName: string;
    userIdentifier: string;
    queryEndpoint: string;
    subscriptionEndpoint: string;
}
export const createApollo = (args: CreateApolloArgs) => {
    const context = {
        'x-user-id': args.userIdentifier,
        'x-user-name': args.userName,
    };

    const httpLink = createHttpLink({
        uri: args.queryEndpoint,
        headers: context,
    });
    const wsLink = new GraphQLWsLink(createClient({
        url: args.subscriptionEndpoint,
        connectionParams: context,
    }));
    const link = split(
        ({ query }) => {
            const definition = getMainDefinition(query);
            return (
                definition.kind === 'OperationDefinition' &&
                definition.operation === 'subscription'
            );
        },
        wsLink,
        httpLink,
    );

    return new ApolloClient({
        link,
        cache: new InMemoryCache(),
        defaultOptions: {
            mutate: {
                errorPolicy: 'all',
            },
        },
    });
};
