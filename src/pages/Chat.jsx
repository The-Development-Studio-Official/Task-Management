import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Chat() {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);
  const [usersError, setUsersError] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch all users for the sidebar
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersError(null);
        const res = await fetch('/api/chat/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch users: ${res.status}`);
        }
        const data = await res.json();
        const filteredUsers = Array.isArray(data) ? data.filter((u) => u.id !== user?.id) : [];
        setUsers(filteredUsers);
        if (filteredUsers.length > 0) {
          setSelectedUser(filteredUsers[0]);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setUsersError(err.message || 'Failed to load team members');
        setUsers([]);
      }
    };
    
    if (token && user?.id) {
      fetchUsers();
    }
  }, [token, user?.id]);

  // Fetch messages for selected user
  useEffect(() => {
    if (!selectedUser) return;
    
    const fetchMessages = async () => {
      setLoading(true);
      try {
        setError(null);
        const res = await fetch(`/api/chat/messages/${selectedUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch messages: ${res.status}`);
        }
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(err.message || 'Failed to load messages');
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Poll for new messages every 2 seconds
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [selectedUser, token]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedUser) return;

    setSending(true);
    try {
      setError(null);
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: selectedUser.id,
          message: inputValue
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to send message: ${res.status}`);
      }

      setInputValue('');
      // Fetch updated messages
      const messagesRes = await fetch(`/api/chat/messages/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (messagesRes.ok) {
        const data = await messagesRes.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8 h-full">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Organization Chat</h1>
          <p className="text-gray-500 text-sm">Chat with team members</p>
        </div>
      </div>

      {usersError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
          <AlertCircle size={18} />
          <span className="text-sm">{usersError}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-[0_8px_32px_rgba(100,110,140,0.05)] h-[calc(100vh-200px)] flex overflow-hidden">
        
        {/* Users Sidebar */}
        <div className="w-64 border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Team Members</h3>
            <p className="text-gray-500 text-xs mt-1">{users.length} members</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {users.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No team members available
              </div>
            ) : (
              users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${
                    selectedUser?.id === u.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                      selectedUser?.id === u.id ? 'bg-indigo-600' : 'bg-gray-400'
                    }`}>
                      {u.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm truncate">{u.username}</p>
                      <p className="text-gray-500 text-xs capitalize">{u.role}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                  {selectedUser.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedUser.username}</p>
                  <p className="text-gray-500 text-xs capitalize">{selectedUser.role}</p>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="px-4 pt-4">
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Loader className="animate-spin text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Loading messages...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.senderId === user?.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm break-words">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.senderId === user?.id ? 'text-indigo-100' : 'text-gray-500'
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type a message..."
                    disabled={sending}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || sending}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {sending ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <p>Select a user to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
