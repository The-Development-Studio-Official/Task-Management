import React, { useEffect, useRef, useState } from 'react';
import { Send, Loader, AlertCircle, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { apiCall } from '../utils/api.js';

export default function Messenger() {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);
  const [usersError, setUsersError] = useState(null);
  const [showUsersOnMobile, setShowUsersOnMobile] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersError(null);
        const data = await apiCall('/chat/users');
        const filteredUsers = Array.isArray(data) ? data.filter((u) => u.id !== user?.id) : [];
        setMembers(filteredUsers);
        if (filteredUsers.length > 0) {
          setSelectedUser(filteredUsers[0]);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setUsersError(err.message || 'Failed to load team members');
        setMembers([]);
      }
    };

    if (token && user?.id) {
      fetchUsers();
    }
  }, [token, user?.id]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        setError(null);
        const data = await apiCall(`/chat/messages/${selectedUser.id}`);
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
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [selectedUser, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedUser) return;

    setSending(true);
    try {
      setError(null);
      await apiCall('/chat/send', {
        method: 'POST',
        body: JSON.stringify({ recipientId: selectedUser.id, message: inputValue }),
      });
      setInputValue('');
      const data = await apiCall(`/chat/messages/${selectedUser.id}`);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const onSelectUser = (selected) => {
    setSelectedUser(selected);
    setShowUsersOnMobile(false);
  };

  return (
    <div className="page-shell">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Messenger</h1>
          <p className="section-subtitle">Direct messaging with team members.</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary md:hidden"
          onClick={() => setShowUsersOnMobile((prev) => !prev)}
        >
          <Users size={16} />
          {showUsersOnMobile ? 'Hide People' : 'Show People'}
        </button>
      </div>

      {usersError && (
        <div className="alert-error mb-4">
          <AlertCircle size={16} />
          <span>{usersError}</span>
        </div>
      )}

      <div className="surface-card h-[calc(100vh-210px)] min-h-[420px] overflow-hidden">
        <div className="grid h-full md:grid-cols-[260px_1fr]">
          <aside className={`${showUsersOnMobile ? 'block' : 'hidden'} border-b border-slate-100 md:block md:border-b-0 md:border-r`}>
            <div className="border-b border-slate-100 p-4">
              <p className="text-sm font-semibold text-slate-900">Team Members</p>
              <p className="text-xs text-slate-500">{members.length} available</p>
            </div>
            <div className="max-h-[230px] overflow-y-auto md:max-h-none md:h-[calc(100%-64px)]">
              {members.length === 0 ? (
                <div className="empty-state">No team members available</div>
              ) : (
                members.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => onSelectUser(member)}
                    className={`w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                      selectedUser?.id === member.id ? 'bg-blue-50' : ''
                    }`}
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white ${
                        selectedUser?.id === member.id ? 'bg-blue-600' : 'bg-slate-400'
                      }`}>
                        {member.username?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{member.username}</p>
                        <p className="text-xs capitalize text-slate-500">{member.role}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className={`${showUsersOnMobile ? 'hidden md:flex' : 'flex'} h-full flex-col`}>
            {selectedUser ? (
              <>
                <div className="border-b border-slate-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {selectedUser.username?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{selectedUser.username}</p>
                      <p className="text-xs capitalize text-slate-500">{selectedUser.role}</p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3">
                    <div className="alert-error">
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto bg-slate-50/70 p-4">
                  {loading ? (
                    <div className="empty-state">
                      <Loader className="loader-inline mx-auto mb-2 text-slate-400" />
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="empty-state">No messages yet. Start the conversation.</div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                            msg.senderId === user?.id
                              ? 'bg-blue-600 text-white'
                              : 'border border-slate-200 bg-white text-slate-900'
                          }`}>
                            <p className="text-sm break-words">{msg.message}</p>
                            <p className={`mt-1 text-[11px] ${msg.senderId === user?.id ? 'text-blue-100' : 'text-slate-500'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="border-t border-slate-100 p-3 sm:p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type a message..."
                      disabled={sending}
                      className="control-input"
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || sending}
                      className="btn btn-primary"
                    >
                      {sending ? <Loader size={17} className="loader-inline" /> : <Send size={17} />}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="empty-state">Select a user to start chatting.</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
