
import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  Search,
  Send,
  MessageCircle,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import "./Chat.css";

const API_URL = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

const getInitials = (name) => {
  if (!name?.trim()) return "CC";

  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const formatTime = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
};

export default function Chat() {
  const token = localStorage.getItem("cc_token");

  const [currentUserId, setCurrentUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  const [search, setSearch] = useState("");
  const [messageText, setMessageText] = useState("");

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [socketStatus, setSocketStatus] = useState("connecting");

  const socketRef = useRef(null);
  const activeConversationRef = useRef(null);
  const messageEndRef = useRef(null);
  const textareaRef = useRef(null);
  const joinedRoomsRef = useRef(new Set());

  const request = useCallback(
    async (path, options = {}) => {
      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(options.body
            ? { "Content-Type": "application/json" }
            : {}),
          ...options.headers
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      return data;
    },
    [token]
  );

  // Fetch the authenticated user's profile.
  useEffect(() => {
    if (!token) {
      setError("Please log in to use CampusConnect chat.");
      return;
    }

    let cancelled = false;

    request("/profile")
      .then((data) => {
        if (!cancelled) {
          setCurrentUserId(Number(data.profile.user_id));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, request]);

  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);

      const data = await request("/chats/users");
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingUsers(false);
    }
  }, [request]);

  const loadConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);

      const data = await request("/chats/conversations");
      setConversations(data.conversations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingConversations(false);
    }
  }, [request]);

  // Load users and conversations.
  useEffect(() => {
    if (!token) {
      setLoadingUsers(false);
      setLoadingConversations(false);
      return;
    }

    loadUsers();
    loadConversations();
  }, [token, loadUsers, loadConversations]);

  // Establish an authenticated Socket.IO connection.
  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    const joinConversation = (conversationId) => {
      if (!socket.connected || !conversationId) return;

      socket.emit(
        "join_conversation",
        { conversationId },
        (result) => {
          if (result?.success) {
            joinedRoomsRef.current.add(Number(conversationId));
          } else {
            setError(
              result?.message || "Unable to join conversation"
            );
          }
        }
      );
    };

    const onConnect = () => {
      setSocketStatus("connected");

      const conversationId =
        activeConversationRef.current?.conversation_id;

      if (conversationId) {
        joinConversation(conversationId);
      }
    };

    const onDisconnect = () => {
      setSocketStatus("disconnected");
      joinedRoomsRef.current.clear();
    };

    const onConnectError = (err) => {
      setSocketStatus("disconnected");
      console.error("Chat socket error:", err.message);
    };

    const onNewMessage = (message) => {
      const activeId =
        activeConversationRef.current?.conversation_id;

      if (
        Number(message.conversation_id) !== Number(activeId)
      ) {
        return;
      }

      setMessages((current) => {
        if (
          current.some(
            (item) => item.message_id === message.message_id
          )
        ) {
          return current;
        }

        return [...current, message];
      });

      loadConversations();
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("new_message", onNewMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("new_message", onNewMessage);
      socket.disconnect();

      socketRef.current = null;
      joinedRoomsRef.current.clear();
    };
  }, [token, loadConversations]);

  // Load message history and join the selected room.
  useEffect(() => {
    if (!activeConversation || !token) return;

    let cancelled = false;
    const conversationId = activeConversation.conversation_id;

    activeConversationRef.current = activeConversation;

    const openConversation = async () => {
      try {
        setLoadingMessages(true);
        setError("");
        setMessages([]);

        const data = await request(
          `/chats/conversations/${conversationId}/messages`
        );

        if (cancelled) return;

        setMessages(data.messages || []);

        const socket = socketRef.current;

        if (socket?.connected) {
          socket.emit(
            "join_conversation",
            { conversationId },
            (result) => {
              if (cancelled) return;

              if (result?.success) {
                joinedRoomsRef.current.add(
                  Number(conversationId)
                );
              } else {
                setError(
                  result?.message ||
                    "Unable to join live conversation"
                );
              }
            }
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoadingMessages(false);
        }
      }
    };

    openConversation();

    return () => {
      cancelled = true;
    };
  }, [activeConversation?.conversation_id, request, token]);

  // Scroll to the latest message.
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  }, [messages]);

  const openConversation = (conversation) => {
    activeConversationRef.current = conversation;
    setActiveConversation(conversation);
    setMessages([]);
    setError("");
  };

  const startConversation = async (user) => {
    try {
      setError("");

      const data = await request("/chats/conversations", {
        method: "POST",
        body: JSON.stringify({
          recipientId: user.user_id
        })
      });

      const conversation = {
        ...data.conversation,
        other_user_id: user.user_id,
        other_user_name: user.full_name,
        other_college_id: user.college_id,
        other_department: user.department
      };

      await loadConversations();
      openConversation(conversation);
    } catch (err) {
      setError(err.message);
    }
  };

  const sendMessage = (event) => {
    event?.preventDefault();

    const text = messageText.trim();
    const conversationId =
      activeConversation?.conversation_id;
    const socket = socketRef.current;

    if (!text || !conversationId || sending) return;

    if (!socket?.connected) {
      setError(
        "Live connection is unavailable. Please wait and try again."
      );
      return;
    }

    if (
      !joinedRoomsRef.current.has(Number(conversationId))
    ) {
      setError(
        "Conversation is still connecting. Please try again."
      );
      return;
    }

    setSending(true);
    setError("");

    socket.emit(
      "send_message",
      {
        conversationId,
        messageText: text
      },
      (result) => {
        if (!result?.success) {
          setError(result?.message || "Unable to send message");
          setSending(false);
          return;
        }

        setMessageText("");
        setSending(false);
        loadConversations();
        textareaRef.current?.focus();
      }
    );
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(event);
    }
  };

  const filteredConversations = conversations.filter(
    (conversation) =>
      (conversation.other_user_name || "Unknown user")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const filteredUsers = users.filter(
    (user) =>
      (user.full_name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      String(user.college_id).includes(search)
  );

  const existingConversationUserIds = new Set(
    conversations.map((conversation) =>
      Number(conversation.other_user_id)
    )
  );

  const newUsers = filteredUsers.filter(
    (user) =>
      !existingConversationUserIds.has(Number(user.user_id))
  );

  return (
    <section className="page chat-page">
      <div className="chat-heading">
        <div>
          <p className="eyebrow">CAMPUSCONNECT</p>
          <h1>Messages</h1>
          <p className="desc">
            Connect privately with other CampusConnect members.
          </p>
        </div>

        <div className={`chat-connection ${socketStatus}`}>
          <span />
          {socketStatus === "connected"
            ? "Live"
            : socketStatus === "connecting"
            ? "Connecting"
            : "Offline"}
        </div>
      </div>

      {error && (
        <div className="chat-error" role="alert">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            type="button"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="chat-shell">
        <aside
          className={`chat-sidebar ${
            activeConversation ? "mobile-hidden" : ""
          }`}
        >
          <div className="chat-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search people..."
              aria-label="Search conversations and people"
            />
          </div>

          <div className="chat-list-heading">
            <span>CONVERSATIONS</span>
            <button
              type="button"
              aria-label="Refresh conversations"
              onClick={() => {
                loadConversations();
                loadUsers();
              }}
            >
              <RefreshCw size={15} />
            </button>
          </div>

          <div className="chat-conversation-list">
            {loadingConversations ? (
              <p className="chat-muted">
                Loading conversations...
              </p>
            ) : filteredConversations.length === 0 ? (
              <p className="chat-muted">
                No conversations yet.
              </p>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  type="button"
                  key={conversation.conversation_id}
                  className={`chat-person ${
                    activeConversation?.conversation_id ===
                    conversation.conversation_id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    openConversation(conversation)
                  }
                >
                  <span className="chat-avatar">
                    {getInitials(
                      conversation.other_user_name
                    )}
                  </span>

                  <span className="chat-person-info">
                    <strong>
                      {conversation.other_user_name ||
                        "Unknown user"}
                    </strong>
                    <small>
                      {conversation.last_message ||
                        "Start a conversation"}
                    </small>
                  </span>

                  <span className="chat-person-time">
                    {formatTime(
                      conversation.last_message_sent_at ||
                        conversation.last_message_at
                    )}
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="chat-list-heading">
            <span>START A CHAT</span>
          </div>

          <div className="chat-user-list">
            {loadingUsers ? (
              <p className="chat-muted">
                Loading people...
              </p>
            ) : newUsers.length === 0 ? (
              <p className="chat-muted">
                No new people found.
              </p>
            ) : (
              newUsers.map((user) => (
                <button
                  type="button"
                  className="chat-person"
                  key={user.user_id}
                  onClick={() => startConversation(user)}
                >
                  <span className="chat-avatar">
                    {getInitials(user.full_name)}
                  </span>

                  <span className="chat-person-info">
                    <strong>
                      {user.full_name || "CampusConnect User"}
                    </strong>
                    <small>
                      {user.department ||
                        "CampusConnect member"}
                      {user.section
                        ? ` · Section ${user.section}`
                        : ""}
                    </small>
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        <main
          className={`chat-main ${
            !activeConversation ? "mobile-hidden" : ""
          }`}
        >
          {!activeConversation ? (
            <div className="chat-welcome">
              <div className="chat-welcome-icon">
                <MessageCircle size={34} />
              </div>
              <h2>Your conversations, in one place</h2>
              <p>
                Choose a conversation or select a member
                to start chatting.
              </p>
            </div>
          ) : (
            <>
              <header className="chat-header">
                <button
                  type="button"
                  className="chat-back"
                  onClick={() =>
                    setActiveConversation(null)
                  }
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={20} />
                </button>

                <span className="chat-avatar large">
                  {getInitials(
                    activeConversation.other_user_name
                  )}
                </span>

                <div>
                  <h2>
                    {activeConversation.other_user_name ||
                      "CampusConnect User"}
                  </h2>
                  <p>
                    {activeConversation.other_department ||
                      "CampusConnect member"}
                    {activeConversation.other_college_id
                      ? ` · ${activeConversation.other_college_id}`
                      : ""}
                  </p>
                </div>
              </header>

              <div className="chat-messages">
                {loadingMessages ? (
                  <p className="chat-muted centered">
                    Loading messages...
                  </p>
                ) : messages.length === 0 ? (
                  <div className="chat-empty-messages">
                    <MessageCircle size={27} />
                    <p>No messages yet. Say hello!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const ownMessage =
                      Number(message.sender_id) ===
                      currentUserId;

                    return (
                      <div
                        key={message.message_id}
                        className={`chat-message-row ${
                          ownMessage ? "mine" : "theirs"
                        }`}
                      >
                        <div className="chat-bubble">
                          {!ownMessage && (
                            <small className="chat-sender">
                              {message.sender_name}
                            </small>
                          )}

                          <p>{message.message_text}</p>
                          <time>
                            {formatTime(message.sent_at)}
                          </time>
                        </div>
                      </div>
                    );
                  })
                )}

                <div ref={messageEndRef} />
              </div>

              <form
                className="chat-composer"
                onSubmit={sendMessage}
              >
                <textarea
                  ref={textareaRef}
                  value={messageText}
                  onChange={(event) =>
                    setMessageText(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Write a message..."
                  rows={1}
                  maxLength={4000}
                  aria-label="Write a message"
                />

                <button
                  type="submit"
                  disabled={
                    !messageText.trim() ||
                    sending ||
                    socketStatus !== "connected"
                  }
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </form>

              <p className="chat-composer-hint">
                Enter to send · Shift + Enter for a new line
              </p>
            </>
          )}
        </main>
      </div>
    </section>
  );
}
