import path from 'path';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { OnlineTable, SubscriptionTable } from '../dynamodb';
import { EventQueue } from '../eventQueue.construct';

export type SubscriptionDisconnectLambdaProps = {
    subscriptionTable: SubscriptionTable;
    onlineTable: OnlineTable;
    notificationQueue: EventQueue;
}

export class SubscriptionDisconnectLambda extends NodejsFunction {
    constructor(scope: Construct, id: string, props: SubscriptionDisconnectLambdaProps) {
        super(scope, id, {
            entry: path.join(__dirname, '..', '..', '..', 'handlers', 'subscriptionDisconnectHandler.ts'),
            runtime: Runtime.NODEJS_16_X,
            handler: 'handler',
            logRetention: RetentionDays.FIVE_DAYS,
            environment: {
                DYNAMODB_TABLE_SUBSCRIPTIONS: props.subscriptionTable.tableName,
                DYNAMODB_TABLE_ONLINE: props.onlineTable.tableName,
                NOTIFICATION_QUEUE_URL: props.notificationQueue.queueUrl,
            },
        });

        if (!this.role)
            throw new Error(`Subscription lambda is missing role`);
        props.subscriptionTable.grantReadWriteData(this.role);
        props.onlineTable.grantReadWriteData(this.role);
        props.notificationQueue.grantSendMessages(this.role);
    }
}
