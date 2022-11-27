import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { CurrentUserContext } from '../../context';
import { routing } from '../../routes';
import {
    useNewMessageSubscription,
    useOnlineUsersQuery,
    useSendMessageMutation,
} from '@agora/fe-graphql';

const ChatWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 2em 2em;
  height: calc(100% - 1em);

  & > div {
    flex-grow: 1;
  }

  textarea {
    box-sizing: border-box;
    width: 100%;
  }

  
  div.own {
    background-color: #74c8ee;
    text-align: right;
  }
  div.their {
    background-color: #f69797;
    text-align: left;
  } 
  div.messages div {
    padding: 0.5em;
    border-radius: 5px;
    margin-bottom: 0.6em;
  }
  h5 {
    margin: 0;
  }
  p {
    margin: 0
  }
`;

export const ChatPage = () => {
    const currentUser = useContext(CurrentUserContext);
    const navigate = useNavigate();
    const { id: userId } = useParams();
    const { data: onlineUsers, loading } = useOnlineUsersQuery();

    useEffect(() => {
        if (!loading && onlineUsers?.onlineUsers?.every(user => user.id !== userId))
            navigate(routing.users);
    }, [onlineUsers, navigate, loading, userId]);

    const targetUser = useMemo(
        () => onlineUsers?.onlineUsers?.find(user => user.id === userId),
        [onlineUsers, userId],
    );

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [messages, setMessages] = useState<Array<{ content: string; from: string; id: string }>>([]);
    const [sendMessageMutation] = useSendMessageMutation({});

    useNewMessageSubscription({
        onData: opt => {
            const message = opt?.data?.data?.newMessage;
            if (!message)
                return;
            setMessages(messages => [
                ...messages,
                {
                    content: message.content,
                    from: message.sender.id,
                    id: uuid(),
                },
            ]);
        },
    });

    return (
        <ChatWrapper>
            <h1>Chat {targetUser && `with ${targetUser.name}`}</h1>
            <div className='messages'>
                {messages.map(message => (
                    <div className={message.from === currentUser.userIdentifier ? 'own' : 'their'}>
                        <h5>{message.from === currentUser.userIdentifier ? currentUser.userName : targetUser?.name}</h5>
                        <p>{message.content}</p>
                    </div>
                ))}
            </div>
            <textarea ref={textareaRef} onKeyDown={async event => {
                if (event.key === 'Enter') {
                    if (!textareaRef?.current?.value || !targetUser?.id)
                        return;
                    const content = textareaRef.current.value;
                    textareaRef.current.value = '';
                    await sendMessageMutation({
                        variables: {
                            message: {
                                content,
                                receiverId: targetUser.id,
                            },
                        },
                    });
                    setMessages(messages => [
                        ...messages,
                        {
                            content,
                            id: uuid(),
                            from: currentUser.userIdentifier || '',
                        },
                    ]);
                }
            }}></textarea>
        </ChatWrapper>
    );
};
