import { SQSEvent } from 'aws-lambda';
import { parse } from 'graphql/language';
import { subscribe } from 'graphql/execution';
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { createRepositories } from '@agora/be-data';
import { contextDeserializer, schema } from '@agora/be-graphql';
import { createPub, PublishSub, TypedSubImplementation } from '@agora/be-business-logic';

const GATEWAY_ENDPOINT = process.env.WEBSOCKET_GATEWAY_ENDPOINT;
if (!GATEWAY_ENDPOINT)
    throw new Error('WEBSOCKET_GATEWAY_ENDPOINT env variable is missing');
const repositories = createRepositories();
const client = new ApiGatewayManagementApiClient({
    endpoint: GATEWAY_ENDPOINT,
});

/**
 * Function that accepts events from SQS and sends them through API Gateway
 * as GraphQL Subscription events.
 * @param event
 */
export const handler = async (event: SQSEvent) => {
    // SQS can invoke lambda with multiple events at once. We process each event in parallel.
    await Promise.all(event.Records.map(async record => {
        const body = JSON.parse(record.body);
        // Routing key (also known as topic name in other systems) specifying type of event.
        const { routingKey } = body;
        // Fetches all the subscriptions from database with the specified routing key.
        const subscriptions = await repositories.subscriptions.getByRoutingKey(routingKey);

        // Again, process all the subscriptions (for example subscription from each user) in parallel.
        await Promise.all(subscriptions.map(async subscription => {
            // Parse the GraphQL body, to know which fields to resolve.
            const parsed = parse(subscription.subscription);
            // No need to validate the GraphQL body, because it is validated before insert.
            // Pseud-deserialize context. Services can be created again.
            const context = contextDeserializer(subscription.context, {
                repositories,
                sub: new PublishSub(body),
                typedSub: new TypedSubImplementation(),
                ...createPub(),
            });
            // Invoke the subscription again, so it is processed by GraphQL.
            // Result is async iterator, which we then iterate through. The event body is passed inside the PublishSub class above.
            // See libs/be-business-logic/src/pubsub/PublishSub.ts file to more understand how things work.
            const result = await subscribe({
                schema,
                document: parsed,
                variableValues: subscription.variables as Record<string, unknown>,
                contextValue: context,
            });
            // Now iterate through the async iterator and send resolved values back to the user.
            // In the implementation there is only one event fired, and then the async iterator returns done=true
            // This logic is hidden inside the `PublishSub` class.
            if ('next' in result) {
                let isDone = false;
                do {
                    // eslint-disable-next-line no-await-in-loop
                    const response = await result.next();
                    if (!response.done) {
                        // Answer is resolved value that should be sent to the user.
                        const answer = response.value;
                        // Send it to the client using API Gateway.
                        // We use connectionId to specify through which connection send the event.
                        // eslint-disable-next-line no-await-in-loop
                        await client.send(new PostToConnectionCommand({
                            ConnectionId: subscription.connectionId,
                            Data: Buffer.from(JSON.stringify({
                                type: 'next',
                                id: subscription.subscriptionId,
                                payload: answer,
                            })),
                        }));
                    } else {
                        isDone = true;
                    }
                } while (isDone);
            } else {
                // This is just fallback, when the returned value from subscribe is not async iterator.
                console.log('Problem with subscribe', result);
            }
        }));
    }));

    // Because we return done=true from the async iterator at the end, the above promises are resolved
    // and we just indicate invocation was successful.
    return {
        statusCode: 200,
    };
};

