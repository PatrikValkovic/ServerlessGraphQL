import { APIGatewayEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { createRepositories } from '@agora/be-data';
import { createPub, UserStatus } from '@agora/be-business-logic';

type EventType = Pick<APIGatewayEvent, 'isBase64Encoded'|'requestContext'|'multiValueHeaders'|'headers'>

const repositories = createRepositories();
const pub = createPub();

/**
 * This function is called every time websocket is disconnected from API Gateway.
 * We delete user online status from the database and clear all the subscriptions for that connection.
 * Note that there is not 100% guarantee this function is called.
 * @param event
 */
export const handler = async (event: EventType): Promise<APIGatewayProxyStructuredResultV2> => {
    // Validate the connection ID is present.
    if (!event.requestContext.connectionId)
        throw new Error(`Connection ID is missing`);
    // Delete all subscriptions still existing for that connection.
    await repositories.subscriptions.deleteByConnection(event.requestContext.connectionId);

    // Mark user as offline and send offline status event to other users.
    const user = await repositories.online.getByConnectionId(event.requestContext.connectionId);
    await Promise.all([
        pub.typedPub.publishStatusChange({
            newStatus: UserStatus.offline,
            identifier: user.identifier,
            name: user.name,
        }),
        repositories.online.delete(event.requestContext.connectionId),
    ]);

    // Finally, just return with success.
    return {
        statusCode: 200,
    };
};

