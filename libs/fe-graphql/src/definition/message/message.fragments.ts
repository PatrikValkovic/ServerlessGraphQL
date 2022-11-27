import { gql } from '@apollo/client';

gql`
    fragment Message on Message {
        content
        receiver {
            ...User
        }
        sender {
            ...User
        }
    }
`;
