import { APIGatewayEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { parse } from 'graphql/language';
import { execute } from 'graphql/execution';
import { validate } from 'graphql/validation';
import { GraphQLError } from 'graphql/error';
import { GqlContext, schema } from '@agora/be-graphql';
import { createRepositories } from '@agora/be-data';
import { createPub } from '@agora/be-business-logic';

const headers = {
    'Access-Control-Allow-Origin': '*',
};
const repositories = createRepositories();

/**
 * Functions that handles GraphQL queries and mutation.
 * @param event
 */
export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyStructuredResultV2> => {
    try {
        const graphqlSchema = schema;
        // Content of the request is in event.body as string, we need to deserialzie it first.
        const body = JSON.parse(event.body || '');
        // Parse the request body as GraphQL. If the function fails, it throws GraphQLError, which is handled in the catch block.
        const parsed = parse(body.query);

        // Now validate the parsed query. Parse handles only syntactic part of the GraphQL, whereas validation
        // makes sure the request comfort with the schema.
        const validated = validate(graphqlSchema, parsed);
        if (validated.length > 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ errors: validated }),
                headers,
            };
        }

        // Get user identification from the request headers.
        const identifier = event.headers['x-user-id'];
        if (!identifier) {
            return {
                statusCode: 400,
                body: JSON.stringify({ errors: 'x-user-id header is missing' }),
                headers,
            };
        }
        const name = event.headers['x-user-name'];
        if (!name) {
            return {
                statusCode: 400,
                body: JSON.stringify({ errors: 'x-user-name header is missing' }),
                headers,
            };
        }

        // Create GraphQL context.
        const context: GqlContext = {
            repositories,
            identifier,
            name,
            ...createPub(),
        };
        // Execute the user request. This will perform the query or mutation.
        // The result is object that can be send directly back to the user.
        const executed = await execute({
            schema: graphqlSchema,
            document: parsed,
            ...(body.variables ? { variableValues: body.variables } : {}),
            contextValue: context,
        });
        // Send the response back to the user. Note that body must be again JSON in string.
        // Content type of `application/json` is add implicitly.
        return ({
            statusCode: 200,
            body: JSON.stringify(executed),
            headers,
        });
    } catch (err) {
        // It is GraphQL parse (or other) error. We send BAD_USER_INPUT.
        if (err instanceof GraphQLError) {
            return {
                statusCode: 400,
                body: err.message,
                headers: {
                    ...headers,
                    'Content-Type': 'text/plain',
                },
            };
        }
        // Otherwise it is probably server error.
        return {
            statusCode: 500,
            body: `${err}`,
            headers: {
                ...headers,
                'Content-Type': 'text/plain',
            },
        };
    }
};
