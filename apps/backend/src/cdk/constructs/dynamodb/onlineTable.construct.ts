import { AttributeType, BillingMode, ProjectionType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

// eslint-disable-next-line @typescript-eslint/ban-types
type OnlineTableProps = {}

export class OnlineTable extends Table {
    constructor(scope: Construct, id: string, _props: OnlineTableProps) {
        super(scope, id, {
            partitionKey: {
                type: AttributeType.STRING,
                name: 'hashKey',
            },
            timeToLiveAttribute: 'ttl',
            billingMode: BillingMode.PAY_PER_REQUEST,
        });


        this.addGlobalSecondaryIndex({
            indexName: 'byIdentifier',
            partitionKey: {
                type: AttributeType.STRING,
                name: 'identifier',
            },
            sortKey: {
                type: AttributeType.STRING,
                name: 'hashKey',
            },
            projectionType: ProjectionType.ALL,
        });
    }
}
