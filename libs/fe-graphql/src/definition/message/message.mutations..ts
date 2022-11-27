import { gql } from '@apollo/client';

gql`
    mutation SendMessage($message: MessageInput!) {
        sendMessage(message: $message) {
            ...Message
        }
    }
`;
