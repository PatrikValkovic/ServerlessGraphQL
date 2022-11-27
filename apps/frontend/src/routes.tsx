import { BrowserRouter, Route, Routes as ReactRoutes } from 'react-router-dom';
import { LoginPage, UsersPage } from './pages';
import { ApolloContextProvider, CurrentUserProvider } from './context';
import { ChatPage } from './pages/ChatPage';

export const routing = {
    login: '/login',
    users: '/users',
    chat: '/chat/:id',
};

export function Routes() {
    return (
        <CurrentUserProvider>
            <BrowserRouter>
                <ReactRoutes>
                    <Route
                        path={routing.login}
                        element={<LoginPage />}
                    />
                    <Route
                        path="*"
                        element={
                            <ApolloContextProvider>
                                <ReactRoutes>
                                    <Route
                                        path={routing.users}
                                        element={<UsersPage />}
                                    />
                                    <Route
                                        path={routing.chat}
                                        element={<ChatPage />}
                                    />
                                </ReactRoutes>
                            </ApolloContextProvider>
                        }>
                    </Route>
                </ReactRoutes>
            </BrowserRouter>
        </CurrentUserProvider>

    );
}
