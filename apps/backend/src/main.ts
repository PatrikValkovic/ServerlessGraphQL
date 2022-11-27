import { App, CfnOutput } from 'aws-cdk-lib';
import { BackendStack } from './cdk/backend.stack';

const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();
const stack = new BackendStack(app, 'backend-stack', {
    env,
});

new CfnOutput(stack, 'graphql-endpoint', {
    value: stack.graphqlEndpoint,
});
new CfnOutput(stack, 'subscription-endpoint', {
    value: stack.subscriptionEndpoint,
});

// https://www.yonomi.com/blog/graphql-subscriptions-over-aws-api-gateway-web-sockets
