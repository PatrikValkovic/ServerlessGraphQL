import { Effect, IRole, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { SubscriptionGateway } from './constructs/subscriptionGateway.construct';

export const allowGwMessagePublishing = (gateway: SubscriptionGateway, role: IRole) => {
    role.addToPrincipalPolicy(new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
            'execute-api:ManageConnections',
            'execute-api:Invoke',
        ],
        resources: [
            `arn:aws:execute-api:${gateway.stack.region}:${gateway.stack.account}:${gateway.apiId}/${gateway.stage.stageName}/POST/@connections/*`,
        ],
    }));
};
