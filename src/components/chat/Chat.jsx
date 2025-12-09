import { useContext, useEffect, useState } from 'react';
import './chat.scss';
import { AuthContext } from '../../context/AuthContext';
import apiRequest from './../../lib/apiRequest';
import { format } from 'timeago.js';
import { useLocation } from 'react-router-dom';

function Chat({ chats = [] }) {
  const [chat, setChat] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();

  // Auto-open chat from navigation
  useEffect(() => {
    if (location.state?.openChatId && chats.length > 0) {
      const chatToOpen = chats.find((c) => c.id === location.state.openChatId);
      if (chatToOpen) {
        handleOpenChat(chatToOpen.id, chatToOpen.receiver);
      }
    }
  }, [location.state, chats]);

  const handleOpenChat = async (id, receiver) => {
    try {
      const res = await apiRequest('/chats/' + id);
      setChat({ ...res.data, receiver });
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const text = formData.get('text');

    if (!text) return;

    try {
      const res = await apiRequest.post('/messages/' + chat.id, { text });
      setChat((prev) => ({
        ...prev,
        messages: [...(prev.messages || []), res.data],
      }));
      e.target.reset();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="chat">
      <div className="messages">
        <h1>Messages</h1>

        {/* Show message when no chats exist */}
        {!chats || chats.length === 0 ? (
          <div className="noChats">
            <p>
              No messages yet. Start a conversation by contacting a property
              owner!
            </p>
          </div>
        ) : (
          chats.map((c) => (
            <div
              className="message"
              key={c.id}
              style={{
                backgroundColor:
                  c.seenBy?.includes(currentUser.id) || chat?.id === c.id
                    ? 'white'
                    : '#fecd514e',
              }}
              onClick={() => handleOpenChat(c.id, c.receiver)}
            >
              <img src={c.receiver?.avatar || '/noavatar.jpg'} alt="" />
              <span>{c.receiver?.username || 'Unknown User'}</span>
              <p>{c.lastMessage || 'No messages yet'}</p>
            </div>
          ))
        )}
      </div>

      {chat && (
        <div className="chatBox">
          <div className="top">
            <div className="user">
              <img src={chat.receiver?.avatar || '/noavatar.png'} alt="" />
              {chat.receiver?.username || 'Unknown User'}
            </div>
            <span className="close" onClick={() => setChat(null)}>
              X
            </span>
          </div>

          <div className="center">
            {!chat.messages || chat.messages.length === 0 ? (
              <div className="noMessages">
                <p>
                  No messages in this conversation yet. Send the first message!
                </p>
              </div>
            ) : (
              chat.messages.map((message) => (
                <div
                  className="chatMessage"
                  style={{
                    alignSelf:
                      message.userId === currentUser.id
                        ? 'flex-end'
                        : 'flex-start',
                    textAlign:
                      message.userId === currentUser.id ? 'right' : 'left',
                  }}
                  key={message.id}
                >
                  <p>{message.text}</p>
                  <span>{format(message.createdAt)}</span>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmit} className="bottom">
            <textarea name="text" placeholder="Type a message..." required />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chat;
