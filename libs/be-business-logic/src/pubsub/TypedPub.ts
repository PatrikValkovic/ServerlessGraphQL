import { Pub } from './Pub';
import { NewMessageEvent, UserStatusChangeEvent } from './events';

export class TypedPub {
    constructor(
        private readonly pub: Pub,
    ) {}

    publishNewMessage(event: NewMessageEvent) {
        return this.pub.publish(`message.${event.toIdentifier}`, event);
    }

    publishStatusChange(event: UserStatusChangeEvent) {
        return this.pub.publish('status', event);
    }
}
