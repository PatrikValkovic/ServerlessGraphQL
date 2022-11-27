import path from 'path';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { OnlineTable, SubscriptionTable } from '../dynamodb';
import { EventQueue } from '../eventQueue.construct';

export type QueryLambdaProps = {
    eventQueue: EventQueue;
    onlineTable: OnlineTable;
    subscriptionTable: SubscriptionTable;
}

export class QueryLambda extends NodejsFunction {
    constructor(scope: Construct, id: string, props: QueryLambdaProps) {
        super(scope, id, {
            entry: path.join(__dirname, '..', '..', '..', 'handlers', 'queryLambda.ts'),
            runtime: Runtime.NODEJS_16_X,
            handler: 'handler',
            logRetention: RetentionDays.FIVE_DAYS,
            environment: {
                NOTIFICATION_QUEUE_URL: props.eventQueue.queueUrl,
                DYNAMODB_TABLE_SUBSCRIPTIONS: props.onlineTable.tableName,
                DYNAMODB_TABLE_ONLINE: props.onlineTable.tableName,
            },
        });

        if (!this.role)
            throw new Error(`Query lambda role is missing`);
        props.eventQueue.grantSendMessages(this.role);
        props.onlineTable.grantReadData(this.role);
    }
}
