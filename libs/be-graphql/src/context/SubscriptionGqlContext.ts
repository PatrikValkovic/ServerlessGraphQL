import { Repositories } from '@agora/be-data';
import { Sub, TypedPub, TypedSub } from '@agora/be-business-logic';

export type SubscriptionGqlContext = {
    repositories: Repositories;
    sub: Sub<SubscriptionGqlContext>;
    typedSub: TypedSub<SubscriptionGqlContext>;
    identifier: string;
    name: string;
    connectionId: string;
    subscriptionId: string;
    typedPub: TypedPub;
}
