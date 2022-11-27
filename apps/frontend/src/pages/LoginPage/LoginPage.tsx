import styled from 'styled-components';
import { FormEventHandler, useContext, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { CurrentUserContext } from '../../context';
import { routing } from '../../routes';

const LoginPageContainer = styled.div`
  width: 600px;
  margin: auto;
  h1 {
    text-align: center;
    margin-top: 100px;
  }
  label {
    width: 100%;
    display: block;
    text-align: center;
    font-size: 20px;
  }
  #name {
    width: 50%;
    display: block;
    margin: auto;
    font-size: 24px;
  }
  #submit {
    display: block;
    margin: auto;
    font-size: 20px;
  }
`;

export const LoginPage = () => {
    const userContext = useContext(CurrentUserContext);
    const navigate = useNavigate();
    const [name, setName] = useState('');

    const formSubmit: FormEventHandler = event => {
        event.preventDefault();
        userContext.fillUser(name, uuid());
        navigate(routing.users);
    };

    return (
        <LoginPageContainer>
            <h1>Login</h1>
            <form onSubmit={formSubmit}>
                <label htmlFor="name">Your name&nbsp;</label>&nbsp;
                <input type="text" id="name" onChange={e => setName(e.target.value)} value={name}/>
                <br/>
                <input type="submit" value="Enter" id="submit"/>
            </form>
        </LoginPageContainer>
    );
};
