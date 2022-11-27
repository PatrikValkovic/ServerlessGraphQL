import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

// eslint-disable-next-line @typescript-eslint/ban-types
type EventQueueProps = {};

export class EventQueue extends Queue {

    constructor(scope: Construct, id: string, _props: EventQueueProps) {
        super(scope, id, {

        });
    }
}
