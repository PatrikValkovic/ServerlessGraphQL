import { createHash } from 'crypto';
import { APIGatewayEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

type EventType = Pick<APIGatewayEvent, 'isBase64Encoded'|'requestContext'|'multiValueHeaders'|'headers'>

/**
 * Function that is called when user connects to WebSocket API Gateway.
 * @param event
 */
export const handler = async (event: EventType): Promise<APIGatewayProxyStructuredResultV2> => {
    // Return error when the request is missing connectionId. This in general shouldn't happen.
    if (!event.requestContext.connectionId) {
        return {
            statusCode: 500,
            body: 'Connection ID is missing',
        };
    }

    // Log connectionId
    const { connectionId } = event.requestContext;
    console.log(`Connected user ${connectionId}`, event);
    // Generate header for WebSocket handshake
    const key = event.headers['Sec-WebSocket-Key'] as string;
    const acceptHeader = createHash('sha1')
        .update(key)
        .update(Buffer.from('258EAFA5-E914-47DA-95CA-C5AB0DC85B11'))
        .digest()
        .toString('base64');
    // Send back necessary headers
    return {
        statusCode: 200,
        headers: {
            'Connection': 'upgrade',
            'Upgrade': 'websocket',
            'Sec-WebSocket-Protocol': 'graphql-transport-ws',
            'Sec-WebSocket-Accept': acceptHeader,
        },
        body: '',
    };
};

