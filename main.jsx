import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const conversations = [
  { id: 1, name: 'Alice Johnson', lastMessage: "Hey! How's it going today? I've been...", time: '09:15 AM', unread: 4, online: true, type: 'contact', avatar: 'AJ', bio: 'Designing, building, and learning every day.' },
  { id: 2, name: 'Brian Carter', lastMessage: "Can you help me figure this out? I've bee...", time: '09:22 AM', unread: 0, online: false, type: 'contact', avatar: 'BC', bio: 'Engineering student and problem solver.' },
  { id: 3, name: 'Clara Smith', lastMessage: '📷 Photo', time: '09:30 AM', unread: 0, online: true, type: 'contact', avatar: 'CS', bio: 'Always somewhere between ideas and execution.' },
  { id: 4, name: 'David Brown', lastMessage: "Do you have a minute to talk? I've be...", time: '09:45 AM', unread: 1, online: false, type: 'contact', avatar: 'DB', bio: 'Making useful things with good people.' },
  { id: 5, name: 'Henry Moore', lastMessage: "Just checking in—how's everything...", time: '10:35 AM', unread: 5, online: true, type: 'contact', avatar: 'HM', bio: 'Curious about technology, design, and systems.' },
  { id: 6, name: 'Isabella Taylor', lastMessage: "Hey! How's it going today? I've been thin...", time: '12:30 PM', unread: 0, online: false, type: 'contact', avatar: 'IT', bio: 'Building products and collecting good ideas.' },
  { id: 7, name: 'Rachel Carter', lastMessage: 'Can you double-check this for me? I wan...', time: '01:00 PM', unread: 0, online: true, type: 'contact', avatar: 'RC', bio: 'Creative thinker with a technical side.' },
  { id: 8, name: 'Steve Evans', lastMessage: "I've been meaning to ask—how's the...", time: '01:15 PM', unread: 8, online: false, type: 'contact', avatar: 'SE', bio: 'Interested in open source and new technology.' }
];

const communities = [
  { id: 101, name: 'Engineering', lastMessage: 'Alex: Meeting starts at 4 PM', time: '10:20 AM', unread: 3, type: 'community', avatar: 'EN' },
  { id: 102, name: 'Gaming', lastMessage: '📷 Photo', time: '11:10 AM', unread: 7, type: 'community', avatar: 'GM' },
  { id: 103, name: 'Project Team', lastMessage: 'Maya: I uploaded the latest files', time: '12:05 PM', unread: 0, type: 'community', avatar: 'PT' }
];

const archived = [
  { id: 201, name: 'Old Project', lastMessage: 'The project has been completed.', time: 'Yesterday', unread: 0, type: 'community', avatar: 'OP' },
  { id: 202, name: 'Daniel Wilson', lastMessage: 'Talk to you later.', time: 'Monday', unread: 0, type: 'contact', avatar: 'DW' }
];

const workspaces = [
  { id: 'college', name: 'College', avatar: 'CL', members: 128, online: 24, description: 'A shared space for college communication, communities, and everyday conversations.' },
  { id: 'campusconnect', name: 'CampusConnect', avatar: 'CC', members: 86, online: 17, description: 'Project workspace for building the CampusConnect platform.' },
  { id: 'internship', name: 'Internship', avatar: 'IN', members: 42, online: 9, description: 'A focused workspace for internship discussions and collaboration.' },
  { id: 'personal', name: 'Personal', avatar: 'PE', members: 14, online: 3, description: 'A private workspace for personal conversations and projects.' }
];

function Avatar({ label, online = false, large = false, workspace = false }) {
  return (
    <div className={`avatar-wrap ${large ? 'large' : ''}`}>
      <div className={`avatar ${workspace ? 'workspace-avatar' : ''}`}>{label}</div>
      {online && <span className="online-dot" />}
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('contacts');
  const [selected, setSelected] = useState(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState(workspaces[0]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [workspaceProfileOpen, setWorkspaceProfileOpen] = useState(false);

  const getList = () => {
    if (activeTab === 'communities') return communities;
    if (activeTab === 'archive') return archived;
    if (activeTab === 'unread') return [...conversations, ...communities].filter(item => item.unread > 0);
    return conversations;
  };

  const filteredList = useMemo(
    () => getList().filter(item => item.name.toLowerCase().includes(search.toLowerCase())),
    [activeTab, search]
  );

  const filteredWorkspaces = useMemo(
    () => workspaces.filter(item => item.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  function sendMessage() {
    if (!message.trim()) return;
    setMessage('');
  }

  function selectTab(tab) {
    setActiveTab(tab);
    setSearch('');
    setSelected(null);
    if (tab !== 'workspace') setWorkspaceProfileOpen(false);
  }

  function selectWorkspace(workspace) {
    setSelectedWorkspace(workspace);
    setSelected(null);
    setWorkspaceProfileOpen(false);
  }

  return (
    <div className={`app ${theme} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <span>ChatSpace</span>
        </div>
        <div className="top-actions">
          <div className="global-search">
            <span className="icon">⌕</span>
            <input placeholder="Search..." />
          </div>
          <button className="icon-button" aria-label="Notifications">♧</button>
          <button className="icon-button" aria-label="Messages">▱</button>
          <button className="top-avatar" aria-label="Profile">NS</button>
        </div>
      </header>

      <main className="workspace">
        <aside className="sidebar">
          <div className="sidebar-header">
            <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">☰</button>
            <h1>{activeTab === 'workspace' ? 'Workspaces' : 'Messages'}</h1>
            <button className="search-button" aria-label="Search conversations">⌕</button>
          </div>

          {!sidebarCollapsed && (
            <>
              <div className="tabs">
                {[
                  ['contacts', 'Contacts'],
                  ['communities', 'Communities'],
                  ['unread', 'Unread'],
                  ['archive', 'Archive'],
                  ['workspace', 'Workspace']
                ].map(([id, label]) => (
                  <button key={id} className={activeTab === id ? 'tab active' : 'tab'} onClick={() => selectTab(id)}>
                    {label}
                  </button>
                ))}
              </div>

              <div className="conversation-search">
                <span>⌕</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={activeTab === 'workspace' ? 'Search workspaces' : 'Search conversations'}
                />
              </div>

              {activeTab === 'workspace' ? (
                <div className="conversation-list workspace-list">
                  {filteredWorkspaces.map(item => (
                    <button
                      key={item.id}
                      className={selectedWorkspace.id === item.id ? 'conversation selected' : 'conversation'}
                      onClick={() => selectWorkspace(item)}
                    >
                      <Avatar label={item.avatar} workspace />
                      <div className="conversation-main">
                        <div className="conversation-top">
                          <strong>{item.name}</strong>
                        </div>
                        <div className="conversation-bottom">
                          <span>{item.members} members · {item.online} online</span>
                        </div>
                      </div>
                    </button>
                  ))}
                  {filteredWorkspaces.length === 0 && <div className="empty-list">No workspaces found.</div>}
                </div>
              ) : (
                <div className="conversation-list">
                  {filteredList.map(item => (
                    <button
                      key={item.id}
                      className={selected?.id === item.id ? 'conversation selected' : 'conversation'}
                      onClick={() => setSelected(item)}
                    >
                      <Avatar label={item.avatar} online={item.online} />
                      <div className="conversation-main">
                        <div className="conversation-top">
                          <strong>{item.name}</strong>
                          <span>{item.time}</span>
                        </div>
                        <div className="conversation-bottom">
                          <span>{item.lastMessage}</span>
                          {item.unread > 0 && <b className="unread-badge">{item.unread}</b>}
                        </div>
                      </div>
                    </button>
                  ))}
                  {filteredList.length === 0 && <div className="empty-list">No conversations found.</div>}
                </div>
              )}
            </>
          )}

          <button
            className="collapse-button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Minimize sidebar'}
          >
            {sidebarCollapsed ? '›' : '‹'}
          </button>

          {sidebarCollapsed && (
            <div className="compact-nav">
              {[
                ['contacts', '●'],
                ['communities', '◆'],
                ['unread', '●'],
                ['archive', '□'],
                ['workspace', '▦']
              ].map(([id, icon]) => (
                <button key={id} className={activeTab === id ? 'compact-item active' : 'compact-item'} onClick={() => { setSidebarCollapsed(false); selectTab(id); }} aria-label={id}>
                  {icon}
                </button>
              ))}
            </div>
          )}

          {menuOpen && (
            <>
              <button className="drawer-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close menu" />
              <div className="side-drawer">
                <div className="drawer-title">
                  <span>Menu</span>
                  <button onClick={() => setMenuOpen(false)}>×</button>
                </div>
                <button className="drawer-item">◉ <span>Profile</span></button>
                <button className="drawer-item">⚙ <span>Settings</span></button>
                <button className="drawer-item" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                  {theme === 'light' ? '☾' : '☀'} <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
                </button>
              </div>
            </>
          )}
        </aside>

        <section className="chat-panel">
          {activeTab === 'workspace' && selectedWorkspace ? (
            <>
              <header className="chat-header workspace-header">
                <button className="chat-person" onClick={() => setWorkspaceProfileOpen(true)}>
                  <Avatar label={selectedWorkspace.avatar} large workspace />
                  <div>
                    <strong>{selectedWorkspace.name}</strong>
                    <span>{selectedWorkspace.members} members · {selectedWorkspace.online} online</span>
                  </div>
                </button>
                <button className="icon-button">⋮</button>
              </header>

              <div className="workspace-content">
                <div className="workspace-welcome">
                  <div className="workspace-big-avatar avatar workspace-avatar">{selectedWorkspace.avatar}</div>
                  <span className="eyebrow">WORKSPACE</span>
                  <h2>{selectedWorkspace.name}</h2>
                  <p>{selectedWorkspace.description}</p>
                  <div className="workspace-stats">
                    <div><strong>{selectedWorkspace.members}</strong><span>Members</span></div>
                    <div><strong>{selectedWorkspace.online}</strong><span>Online</span></div>
                  </div>
                </div>
              </div>

              {workspaceProfileOpen && (
                <div className="profile-overlay" onClick={() => setWorkspaceProfileOpen(false)}>
                  <aside className="profile-card workspace-profile-card" onClick={e => e.stopPropagation()}>
                    <button className="profile-close" onClick={() => setWorkspaceProfileOpen(false)}>×</button>
                    <div className="profile-avatar avatar workspace-avatar">{selectedWorkspace.avatar}</div>
                    <h2>{selectedWorkspace.name}</h2>
                    <span className="profile-status">{selectedWorkspace.members} members · {selectedWorkspace.online} online</span>
                    <p className="bio">{selectedWorkspace.description}</p>
                    <div className="workspace-stat-row">
                      <div><strong>{selectedWorkspace.members}</strong><span>Total members</span></div>
                      <div><strong>{selectedWorkspace.online}</strong><span>Online now</span></div>
                    </div>
                    <div className="profile-section">
                      <div className="section-heading"><h3>Members</h3><span>{selectedWorkspace.members}</span></div>
                      <div className="member-list">
                        {['Alice Johnson', 'Brian Carter', 'Clara Smith', 'David Brown', 'Henry Moore', 'Isabella Taylor'].map((name, index) => (
                          <div className="member-row" key={name}>
                            <Avatar label={name.split(' ').map(n => n[0]).join('')} online={index % 2 === 0} />
                            <div><strong>{name}</strong><span>{index % 2 === 0 ? 'Online' : 'Offline'}</span></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </aside>
                </div>
              )}
            </>
          ) : selected ? (
            <>
              <header className="chat-header">
                <button className="chat-person" onClick={() => setProfileOpen(true)}>
                  <Avatar label={selected.avatar} online={selected.online} large />
                  <div>
                    <strong>{selected.name}</strong>
                    <span>{selected.online ? 'Online' : 'Last seen recently'}</span>
                  </div>
                </button>
                <button className="icon-button">⋮</button>
              </header>

              <div className="messages-area">
                <div className="empty-chat-note">Conversation UI will be added here.</div>
              </div>

              <div className="composer">
                <button className="composer-icon" aria-label="Attach">📎</button>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  rows="1"
                />
                <button className="composer-icon" aria-label="Emoji">☺</button>
                <button className="send-button" onClick={sendMessage} aria-label="Send">➤</button>
              </div>

              {profileOpen && (
                <div className="profile-overlay" onClick={() => setProfileOpen(false)}>
                  <aside className="profile-card" onClick={e => e.stopPropagation()}>
                    <button className="profile-close" onClick={() => setProfileOpen(false)}>×</button>
                    <div className="profile-avatar avatar">{selected.avatar}</div>
                    <h2>{selected.name}</h2>
                    <span className="profile-status">{selected.online ? 'Online' : 'Last seen recently'}</span>
                    <p className="bio">{selected.bio}</p>
                    <div className="profile-info"><span>Contact</span><strong>+91 XXXXX XXXXX</strong></div>
                    <div className="profile-section">
                      <h3>Shared media</h3>
                      <div className="media-grid"><div /><div /><div /></div>
                    </div>
                    <div className="profile-section">
                      <h3>Shared files</h3>
                      <div className="file-row">📄 Project.pdf</div>
                      <div className="file-row">📄 Notes.docx</div>
                    </div>
                  </aside>
                </div>
              )}
            </>
          ) : (
            <div className="no-chat">
              <div className="chat-symbol">•••</div>
              <h2>{activeTab === 'workspace' ? 'Select a workspace' : 'No conversation selected'}</h2>
              <p>Select an item from the sidebar to view its content.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
