import {
    Cors,
    EndpointType,
    LambdaIntegration,
    Method,
    Resource,
    RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';
import { PlaygroundMethod } from './playgroundMethod.construct';

export type QueryGatewayProps = {
    graphqlLambda: LambdaFunction;
};

export class QueryGateway extends RestApi {
    private queryResource: Resource;
    private queryPost: Method;
    private playground: PlaygroundMethod;

    constructor(scope: Construct, id: string, props: QueryGatewayProps) {
        super(scope, id, {
            restApiName: 'query-gateway',
            deploy: true,
            endpointTypes: [EndpointType.EDGE],
            defaultCorsPreflightOptions: {
                allowOrigins: ['*'],
                statusCode: 200,
                allowHeaders: [
                    ...Cors.DEFAULT_HEADERS,
                    'x-user-id',
                    'x-user-name',
                ],
            },
        });

        this.queryResource = new Resource(this, 'query-resource', {
            parent: this.root,
            pathPart: 'graphql',
        });
        this.queryPost = new Method(this, 'query-post', {
            httpMethod: 'POST',
            resource: this.queryResource,
            integration: new LambdaIntegration(props.graphqlLambda, {
                proxy: true,
            }),
        });
        this.playground = new PlaygroundMethod(this, 'playground-method', {
            resource: this.queryResource,
        });
    }
}
