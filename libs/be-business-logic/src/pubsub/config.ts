import * as process from 'process';
import { z } from 'zod';

export const getConfig = () => ({
    notificationQueueUrl: z.string({
        required_error: 'NOTIFICATION_QUEUE_URL env variable is missing',
    }).parse(process.env.NOTIFICATION_QUEUE_URL),
});
