import path from 'path';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

// eslint-disable-next-line @typescript-eslint/ban-types
export type SubscriptionConnectLambdaProps = {}

export class SubscriptionConnectLambda extends NodejsFunction {
    constructor(scope: Construct, id: string, _props: SubscriptionConnectLambdaProps) {
        super(scope, id, {
            entry: path.join(__dirname, '..', '..', '..', 'handlers', 'subscriptionConnectHandler.ts'),
            runtime: Runtime.NODEJS_16_X,
            handler: 'handler',
            logRetention: RetentionDays.FIVE_DAYS,
        });
    }
}
