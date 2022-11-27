import { MaybePromise } from 'nexus/src/typegenTypeHelpers';
import { NewMessageEvent, UserStatusChangeEvent } from './events';

export interface Sub<ContextType> {
    createAsyncIterator<T>(routingKey: string, context: ContextType): MaybePromise<AsyncIterable<T>>;
}

export interface TypedSub<ContextType> {
    createUserStatusChange(pubsub: Sub<ContextType>, context: ContextType): MaybePromise<AsyncIterable<UserStatusChangeEvent>>;
    createNewMessage(pubsub: Sub<ContextType>, context: ContextType, identifier: string): MaybePromise<AsyncIterable<NewMessageEvent>>;
}
