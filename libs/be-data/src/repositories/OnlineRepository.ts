import { DynamoDBDocument, QueryCommandOutput } from '@aws-sdk/lib-dynamodb';
import dayjs from 'dayjs';
import { ComparisonOperator, ReturnValue } from '@aws-sdk/client-dynamodb';
import { OnlineRecord } from '../entities';

export class OnlineRepository {
    constructor(
        private readonly client: DynamoDBDocument,
        private readonly tableName: string,
    ) {}

    async recordOnline(record: OnlineRecord) {
        const Item = {
            'hashKey': record.connectionId,
            'name': record.name,
            'identifier': record.identifier,
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

    async delete(connectionId: string) {
        console.log('Deleting from database');
        try {
            const result = await this.client.delete({
                TableName: this.tableName,
                ReturnValues: ReturnValue.ALL_OLD,
                Key: {
                    hashKey: connectionId,
                },
            });
            console.log('Record deleted', result);
        } catch (error) {
            console.log('Ended up with error', error);
        }
    }

    async getOnlineUsers(): Promise<OnlineRecord[]> {
        console.log('Getting online users');
        const finalRecords = [];
        try {
            let lastEvaluatedKey;
            do {
                // eslint-disable-next-line no-await-in-loop
                const records: QueryCommandOutput = await this.client.scan({
                    TableName: this.tableName,
                    ExclusiveStartKey: lastEvaluatedKey,
                    Limit: 50,
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
            connectionId: hashKey,
        }));
    }

    async getById(identifier: string): Promise<OnlineRecord> {
        console.log('Getting user by id', identifier);
        try {
            const result = await this.client.query({
                TableName: this.tableName,
                IndexName: 'byIdentifier',
                KeyConditions: {
                    identifier: {
                        ComparisonOperator: ComparisonOperator.EQ,
                        AttributeValueList: [identifier],
                    },
                },
            });
            console.log('Record returned', result);
            if ((result.Items ?? []).length === 0) {
                console.log('No record returned from DynamoDB');
                throw new Error('No record');
            }
            const { hashKey, ttl: _, ...rest } = (result.Items || [])[0];
            // @ts-expect-error
            return {
                ...rest,
                connectionId: hashKey,
            };
        } catch (error) {
            console.log('Ended up with error', error);
            throw error;
        }
    }

    async getByConnectionId(connectionId: string): Promise<OnlineRecord> {
        console.log('Getting online user by connection ID');
        try {
            const result = await this.client.query({
                TableName: this.tableName,
                KeyConditions: {
                    hashKey: {
                        ComparisonOperator: ComparisonOperator.EQ,
                        AttributeValueList: [connectionId],
                    },
                },
            });
            console.log('Record returned', result);
            if ((result.Items ?? []).length === 0) {
                console.log('No record returned from DynamoDB');
                throw new Error('No record');
            }
            const { hashKey, ttl: _, ...rest } = (result.Items || [])[0];
            // @ts-expect-error
            return {
                ...rest,
                connectionId: hashKey,
            };
        } catch (error) {
            console.log('Ended up with error', error);
            throw error;
        }
    }
}
