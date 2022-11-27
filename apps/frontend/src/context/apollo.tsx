import { createContext, PropsWithChildren, useContext, useEffect } from 'react';
import { ApolloClient, ApolloProvider } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { createApollo } from '../apollo';
import { routing } from '../routes';
import { CurrentUserContext } from './currentUser';

export type ApolloContextType = {
    apollo: ApolloClient<unknown>;
}

const defaultContext: ApolloContextType = {
    apollo: undefined as unknown as ApolloClient<unknown>,
};

export const ApolloContext = createContext(defaultContext);


// eslint-disable-next-line @typescript-eslint/ban-types
export type ApolloContextProviderProps = PropsWithChildren<{}>;

export const ApolloContextProvider = (props: ApolloContextProviderProps) => {
    const navigate = useNavigate();
    const userContext = useContext(CurrentUserContext);

    useEffect(() => {
        if (!userContext.userName || !userContext.userIdentifier)
            navigate(routing.login);
    }, [navigate, userContext]);


    const queryEndpoint = process.env['NX_QUERY_ENDPOINT'];
    if (!queryEndpoint)
        throw new Error(`QUERY_ENDPOINT env variable is missing`);
    const subscriptionEndpoint = process.env['NX_SUBSCRIPTION_ENDPOINT'];
    if (!subscriptionEndpoint)
        throw new Error(`SUBSCRIPTION_ENDPOINT env variable is missing`);

    const apollo = createApollo({
        userName: userContext.userName as string,
        userIdentifier: userContext.userIdentifier as string,
        queryEndpoint,
        subscriptionEndpoint,
    });

    return (
        <ApolloProvider client={apollo}>
            {props.children}
        </ApolloProvider>
    );
};
