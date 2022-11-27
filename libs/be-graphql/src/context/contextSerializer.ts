import { SubscriptionGqlContext } from './SubscriptionGqlContext';

export const contextSerializer = (context: SubscriptionGqlContext): object => ({
    connectionId: context.connectionId,
    identifier: context.identifier,
    subscriptionId: context.subscriptionId,
    name: context.name,
});
