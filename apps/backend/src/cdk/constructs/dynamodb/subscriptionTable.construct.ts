import { AttributeType, BillingMode, ProjectionType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

// eslint-disable-next-line @typescript-eslint/ban-types
type SubscriptionTableProps = {}

export class SubscriptionTable extends Table {
    constructor(scope: Construct, id: string, _props: SubscriptionTableProps) {
        super(scope, id, {
            partitionKey: {
                type: AttributeType.STRING,
                name: 'hashKey',
            },
            timeToLiveAttribute: 'ttl',
            billingMode: BillingMode.PAY_PER_REQUEST,
        });

        this.addGlobalSecondaryIndex({
            indexName: 'byConnectionId',
            partitionKey: {
                type: AttributeType.STRING,
                name: 'connectionId',
            },
            sortKey: {
                type: AttributeType.STRING,
                name: 'hashKey',
            },
            projectionType: ProjectionType.KEYS_ONLY,
        });

        this.addGlobalSecondaryIndex({
            indexName: 'byRoutingKey',
            partitionKey: {
                type: AttributeType.STRING,
                name: 'routingKey',
            },
            sortKey: {
                type: AttributeType.STRING,
                name: 'hashKey',
            },
            projectionType: ProjectionType.ALL,
        });
    }
}
