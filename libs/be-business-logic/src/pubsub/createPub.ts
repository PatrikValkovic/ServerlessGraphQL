import { SqsPub } from './SqsPub';
import { TypedPub } from './TypedPub';
import { getConfig } from './config';

export const createPub = () => {
    const pub = new SqsPub(getConfig().notificationQueueUrl);
    const typedPub = new TypedPub(pub);

    return {
        pub,
        typedPub,
    };
};
