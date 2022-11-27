import { gql } from '@apollo/client';

gql`
    subscription NewMessage {
        newMessage {
            ...Message
        }
    }
`;
