import * as fs from 'fs';
import path from 'path';
import { Construct } from 'constructs';
import { Code, Function as LambdaFunction, HttpMethod, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LambdaIntegration, Method, Resource } from 'aws-cdk-lib/aws-apigateway';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

export type PlaygroundMethodProps = {
    resource: Resource;
}

export class PlaygroundMethod extends Construct {
    private lambdaFn: LambdaFunction;
    private resourceMethod: Method;

    constructor(scope: Construct, id: string, props: PlaygroundMethodProps) {
        super(scope, id);

        const htmlContent = fs.readFileSync(path.join(__dirname, 'playgroundIndex.html')).toString();

        this.lambdaFn = new LambdaFunction(this, 'playground-lambda', {
            code: Code.fromInline(`exports.handler = (event, context, callback) => callback(null, { 
                statusCode: 200, 
                body: ${JSON.stringify(htmlContent)},
                headers: {
                    'Content-Type': 'text/html',
                }
            })`),
            runtime: Runtime.NODEJS_16_X,
            handler: 'index.handler',
            logRetention: RetentionDays.ONE_DAY,
        });

        this.resourceMethod = new Method(this, 'playground-method-instance', {
            httpMethod: HttpMethod.GET,
            resource: props.resource,
            integration: new LambdaIntegration(this.lambdaFn, {
                proxy: true,
            }),
        });
    }
}
