import { App } from 'aws-cdk-lib';
import { FrontendStack } from './stack';

const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();
new FrontendStack(app, 'frontend-stack', {
    env,
});

