import { gql } from '@apollo/client';

gql`
    query OnlineUsers {
        onlineUsers {
            ...User
        }
    }
`;
