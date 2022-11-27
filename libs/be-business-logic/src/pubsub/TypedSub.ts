import { MaybePromise } from 'nexus/src/typegenTypeHelpers';
import { Sub, TypedSub } from './Sub';
import { NewMessageEvent, UserStatusChangeEvent } from './events';

export class TypedSubImplementation<ContextType> implements TypedSub<ContextType> {
    createNewMessage(pubsub: Sub<ContextType>, context: ContextType, identifier: string): MaybePromise<AsyncIterable<NewMessageEvent>> {
        return pubsub.createAsyncIterator<NewMessageEvent>(`message.${identifier}`, context);
    }

    createUserStatusChange(pubsub: Sub<ContextType>, context: ContextType): MaybePromise<AsyncIterable<UserStatusChangeEvent>> {
        return pubsub.createAsyncIterator<UserStatusChangeEvent>('status', context);
    }

}
