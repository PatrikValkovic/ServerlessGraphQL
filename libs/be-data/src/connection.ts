import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

export const connectToDynamoDB = () => {
    const client = new DynamoDB({});

    const docClient = DynamoDBDocument.from(client);

    return [client, docClient] as const;
};
