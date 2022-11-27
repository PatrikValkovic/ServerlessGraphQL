import { connectToDynamoDB } from './connection';
import { OnlineRepository, SubscriptionsRepository } from './repositories';
import config from './config';

export const createRepositories = () => {
    const [_client, docClient] = connectToDynamoDB();

    return {
        subscriptions: new SubscriptionsRepository(docClient, config.subscriptionsTable),
        online: new OnlineRepository(docClient, config.onlineTable),
    };
};

export type Repositories = ReturnType<typeof createRepositories>;
