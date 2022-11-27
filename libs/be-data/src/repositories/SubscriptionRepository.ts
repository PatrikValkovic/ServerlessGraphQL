import { DynamoDBDocument, QueryCommandOutput } from '@aws-sdk/lib-dynamodb';
import dayjs from 'dayjs';
import { ComparisonOperator, ReturnValue } from '@aws-sdk/client-dynamodb';
import { SubscriptionRecord } from '../entities';

export class SubscriptionsRepository {
    constructor(
        private readonly client: DynamoDBDocument,
        private readonly tableName: string,
    ) {}

    async recordSubscription(subscription: SubscriptionRecord) {
        const Item = {
            'hashKey': subscription.subscriptionId,
            'connectionId': subscription.connectionId,
            'variables': subscription.variables ?? {},
            'routingKey': subscription.routingKey,
            'subscription': subscription.subscription.trim(),
            'context': subscription.context,
            'ttl': dayjs().add(2, 'hours').unix(),
        };
        console.log('Inserting into database', Item);
        try {
            const result = await this.client.put({
                TableName: this.tableName,
                ReturnValues: ReturnValue.ALL_OLD,
                Item,
            });
            console.log('Record inserted', result);
        } catch (error) {
            console.log('Ended up with error', error);
        }
    }

    async deleteSubscription(subscriptionId: string) {
        console.log('Deleting from database');
        try {
            const result = await this.client.delete({
                TableName: this.tableName,
                ReturnValues: ReturnValue.ALL_OLD,
                Key: {
                    hashKey: subscriptionId,
                },
            });
            console.log('Record deleted', result);
        } catch (error) {
            console.log('Ended up with error', error);
        }
    }

    async deleteByConnection(connectionId: string) {
        console.log('Deleting from database');
        try {
            let lastEvaluatedKey;
            do {
                // eslint-disable-next-line no-await-in-loop
                const records: QueryCommandOutput = await this.client.query({
                    TableName: this.tableName,
                    IndexName: 'byConnectionId',
                    ExclusiveStartKey: lastEvaluatedKey,
                    Limit: 25,
                    KeyConditions: {
                        'connectionId': {
                            ComparisonOperator: ComparisonOperator.EQ,
                            AttributeValueList: [connectionId],
                        },
                    },
                });
                console.log('Records to delete', records);
                lastEvaluatedKey = records.LastEvaluatedKey;
                if ((records.Items ?? []).length > 0) {
                    // eslint-disable-next-line no-await-in-loop
                    const result = await this.client.batchWrite({
                        RequestItems: {
                            [this.tableName]: (records.Items ?? []).map(item => ({
                                DeleteRequest: {
                                    Key: {
                                        hashKey: item.hashKey,
                                    },
                                },
                            })),
                        },
                    });
                    console.log('batch write', result);
                }
            } while (lastEvaluatedKey);
        } catch (error) {
            console.log('Ended up with error', error);
        }
    }

    async getByRoutingKey(routingKey: string): Promise<Array<
        Pick<SubscriptionRecord, 'routingKey'|'subscriptionId'|'subscription'|'variables'|'connectionId'|'context'>
    >> {
        console.log('Getting by routing key', routingKey);
        const finalRecords = [];
        try {
            let lastEvaluatedKey;
            do {
                // eslint-disable-next-line no-await-in-loop
                const records: QueryCommandOutput = await this.client.query({
                    TableName: this.tableName,
                    IndexName: 'byRoutingKey',
                    ExclusiveStartKey: lastEvaluatedKey,
                    Limit: 50,
                    KeyConditions: {
                        'routingKey': {
                            ComparisonOperator: ComparisonOperator.EQ,
                            AttributeValueList: [routingKey],
                        },
                    },
                });
                console.log('Records returned', records);
                lastEvaluatedKey = records.LastEvaluatedKey;
                finalRecords.push(...(records.Items ?? []));
            } while (lastEvaluatedKey);
        } catch (error) {
            console.log('Ended up with error', error);
        }
        // @ts-expect-error
        return finalRecords.map(({ hashKey, ...rest }) => ({
            ...rest,
            subscriptionId: hashKey,
        }));
    }
}
