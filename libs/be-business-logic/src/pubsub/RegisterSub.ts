import { Sub } from './Sub';
import { SubscriptionsRepository } from '@agora/be-data';

/**
 * Subscription service used in the subscription function.
 * It just returns done=true directly, but stores subscription record into the database.
 */
export class RegisterSub<ContextType> implements Sub<ContextType> {

    constructor(
        private readonly subscriptionRepository: SubscriptionsRepository,
        private readonly connectionId: string,
        private readonly subscriptionId: string,
        private readonly variables: object,
        private readonly subscription: string,
        private readonly serializer: (context: ContextType) => object,
    ) {}

    async createAsyncIterator<T>(routingKey: string, context: ContextType): Promise<AsyncIterable<T>> {
        await this.subscriptionRepository.recordSubscription({
            connectionId: this.connectionId,
            subscriptionId: this.subscriptionId,
            routingKey,
            variables: this.variables,
            subscription: this.subscription,
            context: this.serializer(context),
        });
        return {
            [Symbol.asyncIterator]() {
                return {
                    next() {
                        return Promise.resolve({ done: true, value: null });
                    },
                };
            },
        };
    }
}
