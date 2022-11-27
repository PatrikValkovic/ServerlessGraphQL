export type SubscriptionRecord = {
    subscriptionId: string;
    connectionId: string;
    routingKey: string;
    subscription: string;
    variables: object;
    context: object;
}
