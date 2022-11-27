import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { CurrentUserContext } from '../../context';
import { GqlUserFragment, GqlUserStatus, useOnlineUsersQuery, useUserStatusChangedSubscription } from '@agora/fe-graphql';

const UsersPageWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  padding: 0 2em;
`;

export const UsersPage = () => {
    const currentUser = useContext(CurrentUserContext);
    const [onlineUsers, setOnlineUsers] = useState<GqlUserFragment[]>([]);

    useOnlineUsersQuery({
        onCompleted: data => setOnlineUsers(data.onlineUsers.filter(users => users.id !== currentUser.userIdentifier)),
    });
    useUserStatusChangedSubscription({
        onData: opts => {
            console.log('subscription', opts.data.data);
            const changedUser = opts?.data?.data?.userStatusChanged;
            if (!changedUser)
                return;
            if (changedUser.identifier === currentUser.userIdentifier)
                return;
            if (changedUser.status === GqlUserStatus.Offline)
                setOnlineUsers(existingUsers => existingUsers.filter(user => user.id !== changedUser.identifier));
            if (changedUser.status === GqlUserStatus.Online) {
                setOnlineUsers(existingUsers => [
                    ...existingUsers.filter(user => user.id !== changedUser.identifier),
                    {
                        name: changedUser.name,
                        id: changedUser.identifier,
                        __typename: 'User',
                    },
                ]);
            }
        },
    });

    return (
        <UsersPageWrapper>
            <h1>Online users</h1>
            {onlineUsers.map(user => (
                <div key={user.id}>
                    <Link to={`/chat/${user.id}`}>{user.name}</Link>
                </div>
            ))}
        </UsersPageWrapper>
    );
};
