import { WebSocketApi, WebSocketStage } from '@aws-cdk/aws-apigatewayv2-alpha';
import { Construct } from 'constructs';
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { SubscriptionConnectLambda, SubscriptionDisconnectLambda, SubscriptionLambda } from './lambda';

type WebSocketApiProps = {
    connectLambda: SubscriptionConnectLambda;
    disconnectLambda: SubscriptionDisconnectLambda;
    subscriptionLambda: SubscriptionLambda;
}

export class SubscriptionGateway extends WebSocketApi {
    public stage: WebSocketStage;

    constructor(scope: Construct, id: string, props: WebSocketApiProps) {
        super(scope, id, {
            apiName: 'subscription-gateway',
            connectRouteOptions: {
                integration: new WebSocketLambdaIntegration('subscription-connect-integration', props.connectLambda),
            },
            disconnectRouteOptions: {
                integration: new WebSocketLambdaIntegration('subscription-disconnect-integration', props.disconnectLambda),
            },
            defaultRouteOptions: {
                integration: new WebSocketLambdaIntegration('subscription-integration', props.subscriptionLambda),
            },
        });

        this.stage = new WebSocketStage(this, 'subscription-stage', {
            autoDeploy: true,
            stageName: 'prod',
            webSocketApi: this,
        });
    }

}
