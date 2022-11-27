import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { IRole } from 'aws-cdk-lib/aws-iam';
import { QueryGateway } from './constructs/queryGateway.construct';
import { SubscriptionGateway } from './constructs/subscriptionGateway.construct';
import { EventQueue } from './constructs/eventQueue.construct';
import { allowGwMessagePublishing } from './utils';
import { PublishLambda, QueryLambda, SubscriptionConnectLambda, SubscriptionDisconnectLambda, SubscriptionLambda } from './constructs/lambda';
import { OnlineTable, SubscriptionTable } from './constructs/dynamodb';

export class BackendStack extends Stack {
    private queryGateway: QueryGateway;
    private subscriptionGateway: SubscriptionGateway;
    private notificationQueue: EventQueue;

    private subscriptionTable: SubscriptionTable;
    private onlineTable: OnlineTable;

    private queryLambda: QueryLambda;
    private subscriptionConnectLambda: SubscriptionConnectLambda;
    private subscriptionDisconnectLambda: SubscriptionDisconnectLambda;
    private publishLambda: PublishLambda;
    private subscriptionLambda: SubscriptionLambda;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        this.subscriptionTable = new SubscriptionTable(this, 'subscription-table', {});
        this.onlineTable = new OnlineTable(this, 'online-table', {});
        this.notificationQueue = new EventQueue(this, 'subscription-event-queue', {});

        this.queryLambda = new QueryLambda(this, 'query-lambda', {
            eventQueue: this.notificationQueue,
            onlineTable: this.onlineTable,
            subscriptionTable: this.subscriptionTable,
        });
        this.queryGateway = new QueryGateway(this, 'query-gateway', {
            graphqlLambda: this.queryLambda,
        });

        this.subscriptionConnectLambda = new SubscriptionConnectLambda(this, 'subscription-connect-lambda', {
            subscriptionTable: this.subscriptionTable,
            onlineTable: this.onlineTable,
        });
        this.subscriptionDisconnectLambda = new SubscriptionDisconnectLambda(this, 'subscription-disconnect-lambda', {
            subscriptionTable: this.subscriptionTable,
            onlineTable: this.onlineTable,
            notificationQueue: this.notificationQueue,
        });
        this.subscriptionLambda = new SubscriptionLambda(this, 'subscription-lambda', {
            subscriptionTable: this.subscriptionTable,
            onlineTable: this.onlineTable,
            notificationQueue: this.notificationQueue,
        });
        this.subscriptionGateway = new SubscriptionGateway(this, 'subscription-gateway', {
            connectLambda: this.subscriptionConnectLambda,
            disconnectLambda: this.subscriptionDisconnectLambda,
            subscriptionLambda: this.subscriptionLambda,
        });

        allowGwMessagePublishing(this.subscriptionGateway, this.subscriptionLambda.role as IRole);

        this.publishLambda = new PublishLambda(this, 'publish-lambda', {
            subscriptionTable: this.subscriptionTable,
            eventQueue: this.notificationQueue,
            onlineTable: this.onlineTable,
            gatewayEndpoint: this.subscriptionGateway,
        });
    }

    public get graphqlEndpoint() {
        return this.queryGateway.deploymentStage.urlForPath('/graphql');
    }

    public get subscriptionEndpoint() {
        return this.subscriptionGateway.stage.url;
    }
}
