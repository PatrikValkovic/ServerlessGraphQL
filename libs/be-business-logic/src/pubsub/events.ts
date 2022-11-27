export enum UserStatus {
    online = 'online',
    offline = 'offline'
}

export type UserStatusChangeEvent = {
    identifier: string;
    name: string;
    newStatus: UserStatus;
}

export type NewMessageEvent = {
    content: string;
    fromIdentifier: string;
    toIdentifier: string;
}
