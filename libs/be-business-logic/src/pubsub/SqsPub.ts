import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { Pub } from './Pub';

export class SqsPub implements Pub {
    private readonly sqsClient: SQSClient;

    constructor(
        private readonly sqsQueueUrl: string,
    ) {
        this.sqsClient = new SQSClient({});
    }

    async publish(routingKey: string, event: object): Promise<void> {
        await this.sqsClient.send(new SendMessageCommand({
            QueueUrl: this.sqsQueueUrl,
            MessageBody: JSON.stringify({
                routingKey,
                ...event,
            }),
        }));

        return Promise.resolve();
    }
}
