import { SubscriptionGqlContext } from './SubscriptionGqlContext';
import { Sub, TypedPub, TypedSub } from '@agora/be-business-logic';
import { Repositories } from '@agora/be-data';

type DeserializerArgs = {
    sub: Sub<SubscriptionGqlContext>;
    typedSub: TypedSub<SubscriptionGqlContext>;
    repositories: Repositories;
    typedPub: TypedPub;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const contextDeserializer = (context: any, args: DeserializerArgs): SubscriptionGqlContext => ({
    connectionId: context.connectionId as string,
    identifier: context.identifier as string,
    subscriptionId: context.subscriptionId as string,
    name: context.name as string,
    ...args,
});
