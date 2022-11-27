import { z } from 'zod';

export default {
    subscriptionsTable: z.string({
        required_error: 'DYNAMODB_TABLE_SUBSCRIPTIONS env variable is missing',
    }).parse(process.env.DYNAMODB_TABLE_SUBSCRIPTIONS),
    onlineTable: z.string({
        required_error: 'DYNAMODB_TABLE_ONLINE env variable is missing',
    }).parse(process.env.DYNAMODB_TABLE_ONLINE),
};
