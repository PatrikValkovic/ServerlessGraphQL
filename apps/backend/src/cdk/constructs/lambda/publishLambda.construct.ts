import path from 'path';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { IRole } from 'aws-cdk-lib/aws-iam';
import { OnlineTable, SubscriptionTable } from '../dynamodb';
import { EventQueue } from '../eventQueue.construct';
import { SubscriptionGateway } from '../subscriptionGateway.construct';
import { allowGwMessagePublishing } from '../../utils';

export type PublishLambdaProps = {
    subscriptionTable: SubscriptionTable;
    onlineTable: OnlineTable;
    eventQueue: EventQueue;
    gatewayEndpoint: SubscriptionGateway;
}

export class PublishLambda extends NodejsFunction {
    constructor(scope: Construct, id: string, props: PublishLambdaProps) {
        super(scope, id, {
            entry: path.join(__dirname, '..', '..', '..', 'handlers', 'publishHandler.ts'),
            runtime: Runtime.NODEJS_16_X,
            handler: 'handler',
            logRetention: RetentionDays.FIVE_DAYS,
            memorySize: 256,
            environment: {
                DYNAMODB_TABLE_SUBSCRIPTIONS: props.subscriptionTable.tableName,
                DYNAMODB_TABLE_ONLINE: props.onlineTable.tableName,
                NOTIFICATION_QUEUE_URL: props.eventQueue.queueUrl,
                WEBSOCKET_GATEWAY_ENDPOINT: props.gatewayEndpoint.stage.callbackUrl,
            },
        });

        if (!this.role)
            throw new Error(`Subscription lambda is missing role`);
        props.subscriptionTable.grantReadData(this.role);
        props.onlineTable.grantReadData(this.role);
        allowGwMessagePublishing(props.gatewayEndpoint, this.role as IRole);

        this.addEventSource(new SqsEventSource(props.eventQueue, {
            enabled: true,
        }));
    }
}
