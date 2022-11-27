import { createContext, PropsWithChildren, useState } from 'react';

export type CurrentUserContextType = {
    userName?: string;
    userIdentifier?: string;
    fillUser(name: string, identifier: string): void;
}

export const CurrentUserContext = createContext<CurrentUserContextType>({
    fillUser: () => { /* method will be filled with provider */ },
});

// eslint-disable-next-line @typescript-eslint/ban-types
export type CurrentUserProviderProps = PropsWithChildren<{}>;

export const CurrentUserProvider = (props: CurrentUserProviderProps) => {
    // const userName = window.localStorage.getItem('userName') || undefined;
    // const userIdentifier = window.localStorage.getItem('userIdentifier') || undefined;

    const [currentUser, setCurrentUser] = useState<{
        userName?: string;
        userIdentifier?: string;
    }>({});

    return (
        <CurrentUserContext.Provider value={{
            ...currentUser,
            fillUser: (name: string, identifier: string) => {
                // window.localStorage.setItem('userName', name);
                // window.localStorage.setItem('userIdentifier', identifier);
                setCurrentUser({
                    userName: name,
                    userIdentifier: identifier,
                });
            },
        }}>
            {props.children}
        </CurrentUserContext.Provider>
    );
};
