
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { v4 as uuidv4 } from 'uuid'
import './App.css'

const API_BASE = '/api'

function App() {
  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE}/conversations`)
      if (!res.ok) throw new Error('Unable to fetch conversations')
      const data = await res.json()
      setConversations(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  const loadConversation = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/conversations/${id}`)
      if (!res.ok) throw new Error('Failed to load conversation')
      const data = await res.json()
      setActiveId(data.id)
      setMessages(data.messages || [])
    } catch (err) {
      console.error(err)
    }
  }

  const createConversation = async () => {
    try {
      const res = await fetch(`${API_BASE}/conversations`, {
        method: 'POST'
      })
      if (!res.ok) throw new Error('Failed to create chat')

      const data = await res.json()
      setConversations(prev => [
        { id: data.id, title: data.title, updatedAt: data.updatedAt },
        ...prev
      ])
      setActiveId(data.id)
      setMessages([])
      setInput('')
    } catch (err) {
      console.error(err)
    }
  }

  const deleteConversation = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/conversations/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete chat')

      setConversations(prev => prev.filter(c => c.id !== id))

      if (activeId === id) {
        setActiveId(null)
        setMessages([])
      }
    } catch (err) {
      console.error(err)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()

    if (!input.trim() || loading) return

    const messageText = input.trim()
    setInput('')
    setLoading(true)

    let convoId = activeId

    try {
      if (!convoId) {
        const createRes = await fetch(`${API_BASE}/conversations`, {
          method: 'POST'
        })

        if (!createRes.ok) throw new Error('Failed to create conversation')

        const newConversation = await createRes.json()
        convoId = newConversation.id

        setActiveId(convoId)
        setConversations(prev => [
          {
            id: newConversation.id,
            title: newConversation.title,
            updatedAt: newConversation.updatedAt
          },
          ...prev
        ])
      }

      const userMessage = {
        id: uuidv4(),
        role: 'user',
        content: messageText,
        createdAt: new Date().toISOString()
      }

      setMessages(prev => [...prev, userMessage])

      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId: convoId,
          message: messageText
        })
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.error || 'Unable to get response')
      }

      setMessages(data.conversation.messages || [])
      fetchConversations()

    } catch (err) {
      console.error(err)

      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: `Error: ${err.message}`,
          createdAt: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">

      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>

        <div className="sidebar-header">

          <button className="new-chat" onClick={createConversation}>
            <span>+ New Chat</span>
          </button>

          <button
            className="toggle"
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? '«' : '»'}
          </button>

        </div>

        <div className="conversation-list">

          {conversations.map(c => (
            <div
              key={c.id}
              className={`conversation-item ${activeId === c.id ? 'active' : ''}`}
              onClick={() => loadConversation(c.id)}
            >

              <div className="conversation-title">
                {c.title || 'New Chat'}
              </div>

              <button
                className="delete"
                onClick={e => {
                  e.stopPropagation()
                  deleteConversation(c.id)
                }}
                aria-label="Delete conversation"
              >
                ×
              </button>

            </div>
          ))}

        </div>

        <div className="sidebar-footer">
          <div className="brand">
            <span className="brand-logo">✦</span>
            <span>AI Assistant</span>
          </div>
        </div>

      </aside>

      <main className="main">

        <header className="main-header">

          <button
            className="mobile-toggle"
            onClick={() => setSidebarOpen(v => !v)}
          >
            ☰
          </button>

          <div className="header-title">
            {conversations.find(c => c.id === activeId)?.title || 'AI Assistant'}
          </div>

        </header>

        <div className="messages">

          {messages.length === 0 && !loading && (
            <div className="empty-state">

              <div className="empty-hero">
                How can I help you today?
              </div>

              <div className="empty-sub">
                Ask me anything. I'm here to help.
              </div>

            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`message-row ${msg.role}`}>

              <div className="avatar">
                {msg.role === 'user' ? 'U' : '✦'}
              </div>

              <div className="message-bubble">

                <div className="message-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>

              </div>

            </div>
          ))}

          {loading && (
            <div className="message-row assistant">

              <div className="avatar">✦</div>

              <div className="message-bubble typing">

                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

              </div>

            </div>
          )}

          <div ref={messagesEndRef} />

        </div>

        <form className="input-area" onSubmit={sendMessage}>

          <div className="input-wrapper">

            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(e)
                }
              }}
              placeholder="Message AI Assistant..."
              rows={1}
            />

            <button
              className="send"
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              ↑
            </button>

          </div>

          <div className="input-hint">
            Press Enter to send, Shift+Enter for new line
          </div>

        </form>

      </main>

    </div>
  )
}

export default App
