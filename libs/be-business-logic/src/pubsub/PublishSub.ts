import { Sub } from './Sub';

/**
 * Subscription service used by the publish function.
 * It accepts the event via constructor and sends it back as the first record in async iterator.
 */
export class PublishSub<ContextType> implements Sub<ContextType> {

    constructor(
        private readonly payload: object,
    ) {}

    async createAsyncIterator<T>(_routingKey: string): Promise<AsyncIterable<T>> {
        let called = false;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        return {
            [Symbol.asyncIterator]() {
                return {
                    next() {
                        if (!called) {
                            called = true;
                            return Promise.resolve({
                                done: false,
                                value: that.payload as unknown as  T,
                            });
                        }
                        return Promise.resolve({ done: true, value: null });
                    },
                };
            },
        };
    }
}
