import { gql } from '@apollo/client';

gql`
    subscription UserStatusChanged {
        userStatusChanged {
            name
            identifier
            status
        }
    }
`;
