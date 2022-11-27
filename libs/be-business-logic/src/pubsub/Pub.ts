export interface Pub {
    publish(routingKey: string, event: object): Promise<void>;
}
