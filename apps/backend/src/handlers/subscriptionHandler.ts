import { randomUUID } from 'crypto';
import { APIGatewayEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { parse } from 'graphql/language';
import { validate } from 'graphql/validation';
import { subscribe } from 'graphql/execution';
import { contextSerializer, schema, SubscriptionGqlContext } from '@agora/be-graphql';
import { createRepositories, OnlineRecord } from '@agora/be-data';
import { createPub, RegisterSub, TypedSubImplementation, UserStatus } from '@agora/be-business-logic';

type EventType = Pick<APIGatewayEvent, 'isBase64Encoded'|'requestContext'|'multiValueHeaders'|'headers'|'body'>
const repositories = createRepositories();
const pub = createPub();

/**
 * Function that is called for every message the WebSocket API Gateway receives.
 * All the messages can be handled by single function (like in this example), or there can be separate function for each type of message.
 * @param event
 */
export const handler = async (event: EventType): Promise<APIGatewayProxyStructuredResultV2> => {
    // Get message content (we assuming it is JSON) and create client that is used to send messages back to the user.
    const body = JSON.parse(event.body as string);
    const client = new ApiGatewayManagementApiClient({
        endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
    });

    // Connection init is first message that the user sends. It contains connection params.
    // We use it to mark user as online.
    if (body.type === 'connection_init') {
        // Get user name and identifier from the connection params (equivalent of HTTP headers).
        const userName = body.payload?.['x-user-name'];
        const userIdentifier = body.payload?.['x-user-id'];
        if (!userName)
            throw new Error('User name is missing in x-user-name header');
        if (!userIdentifier)
            throw new Error('User identifier is missing in x-user-id header');
        // Mark user as online in database
        const userRecord: OnlineRecord = {
            connectionId: event.requestContext.connectionId as string,
            identifier: userIdentifier,
            name: userName,
        };
        await repositories.online.recordOnline(userRecord);
        // Send online status event to other users.
        await pub.typedPub.publishStatusChange({
            name: userName,
            identifier: userIdentifier,
            newStatus: UserStatus.online,
        });
        // Send back connection_ack message.
        await client.send(new PostToConnectionCommand({
            ConnectionId: event.requestContext.connectionId,
            Data: Buffer.from(JSON.stringify({
                id: randomUUID(),
                type: 'connection_ack',
                payload: {},
            })),
        }));
        // Exit the function with success.
        return { statusCode: 200 };
    }

    // Ping-pong messages are there to make sure the other side is still listening.
    // It can be initialized by client or by server. Here we handle only client ping requests.
    if (body.type === 'ping') {
        // Send back pong message
        await client.send(new PostToConnectionCommand({
            ConnectionId: event.requestContext.connectionId,
            Data: Buffer.from(JSON.stringify({
                type: 'pong',
            })),
        }));
        // and exit with success.
        return { statusCode: 200 };
    }

    // The subscribe message sends client when it subscribes to some subscription (so may subscriptions in one sentence :D)
    // See libs/be-business-logic/src/pubsub/RegisterSub.ts file to more understand how things work.
    if (body.type === 'subscribe') {
        const { payload } = body;
        // First parse the query into document node, so we know it is syntactically correct.
        const parsed = parse(payload.query);
        // Validate the document. It must match the schema we provided.
        const validated = validate(schema, parsed);
        if (validated.length > 0) {
            await client.send(new PostToConnectionCommand({
                ConnectionId: event.requestContext.connectionId,
                Data: Buffer.from(JSON.stringify({ errors: validated })),
            }));
            return { statusCode: 200 };
        }
        // Create the context. For context we need to know user ID and name (in this example),
        // but that information was send before in conection_init message and is not current event.
        // Therefore, we need to fetch it from the database.
        const record = await repositories.online.getByConnectionId(event.requestContext.connectionId as string);
        const { identifier } = record;
        // Create subscription service, that hides the logic behind writing the subscription record into the database.
        const sub = new RegisterSub<SubscriptionGqlContext>(
            repositories.subscriptions,
            event.requestContext.connectionId as string,
            body.id,
            payload.variables,
            payload.query,
            contextSerializer,
        );
        // And finally create the context.
        const context: SubscriptionGqlContext = {
            repositories,
            connectionId: event.requestContext.connectionId as string,
            subscriptionId: body.id,
            sub,
            name: record.name,
            typedSub: new TypedSubImplementation(),
            identifier,
            ...createPub(),
        };
        // Now we invoke the GraphQL subscribe operation. Because we don't resolve it immediatelly, marely store
        // subscription record into the database, we don't need the return value.
        await subscribe({
            schema,
            document: parsed,
            ...(payload.variables ? { variableValues: payload.variables } : {}),
            contextValue: context,
        });
        // Finally, exit with success.
        return { statusCode: 200 };
    }

    // This is message the client sends to cancel the subscription.
    if (body.type === 'complete') {
        // We get the subscription ID
        const subscriptionId = body.id;
        // delete the subscription record from database
        await repositories.subscriptions.deleteSubscription(subscriptionId);
        // and exit with error.
        return { statusCode: 200 };
    }

    // It is message server doesn't understand, so it returns 500.
    return {
        statusCode: 500,
        body: '',
    };
};

