import React, { useState, useEffect, useRef } from 'react'
import './App.css'

// Простые боты для имитации ИИ
const botResponses = {
  alice: [
    "Привет! Как дела?",
    "Интересная мысль! А что ты думаешь об этом?",
    "Хм, давайте разберем это подробнее...",
    "Согласна с тобой! Это действительно важно.",
    "А ты слышал последние новости?",
    "Мне кажется, мы можем найти лучшее решение.",
    "Отличная идея! Давайте развивать её дальше.",
    "Знаешь, я думала об этом же самом!",
    "Это очень интересная тема для обсуждения.",
    "Спасибо за твои мысли!"
  ],
  bob: [
    "Привет! Все хорошо, спасибо!",
    "Да, это действительно интересно. А ты как считаешь?",
    "Хороший вопрос! Давайте подумаем вместе.",
    "Согласен! Это очень важный момент.",
    "Да, я тоже об этом думал!",
    "Мне кажется, у нас есть отличные возможности.",
    "Интересная перспектива! Что дальше?",
    "Да, это действительно стоит обсудить.",
    "Отличная мысль! Как мы можем это реализовать?",
    "Спасибо за интересную беседу!"
  ]
}

function App() {
  const [messages, setMessages] = useState({
    alice: [],
    bob: []
  })
  const [inputMessages, setInputMessages] = useState({
    alice: '',
    bob: ''
  })
  const [isAutoChat, setIsAutoChat] = useState(true)
  const [chatSpeed, setChatSpeed] = useState(3000) // 3 секунды между сообщениями
  const autoChatRef = useRef(null)

  // Автоматический обмен сообщениями
  useEffect(() => {
    if (isAutoChat) {
      autoChatRef.current = setInterval(() => {
        const lastMessage = messages.alice.length > 0 ? messages.alice[messages.alice.length - 1] : null
        
        // Alice отвечает на сообщение Bob
        if (lastMessage && lastMessage.sender === 'bob') {
          const response = botResponses.alice[Math.floor(Math.random() * botResponses.alice.length)]
          addMessage('alice', response, 'alice')
        } else {
          // Alice начинает разговор
          const response = botResponses.alice[Math.floor(Math.random() * botResponses.alice.length)]
          addMessage('alice', response, 'alice')
        }
      }, chatSpeed)
    } else {
      if (autoChatRef.current) {
        clearInterval(autoChatRef.current)
      }
    }

    return () => {
      if (autoChatRef.current) {
        clearInterval(autoChatRef.current)
      }
    }
  }, [isAutoChat, chatSpeed, messages])

  // Bob отвечает на сообщения Alice
  useEffect(() => {
    const lastMessage = messages.alice.length > 0 ? messages.alice[messages.alice.length - 1] : null
    
    if (lastMessage && lastMessage.sender === 'alice' && isAutoChat) {
      const timeout = setTimeout(() => {
        const response = botResponses.bob[Math.floor(Math.random() * botResponses.bob.length)]
        addMessage('bob', response, 'bob')
      }, chatSpeed / 2) // Bob отвечает быстрее

      return () => clearTimeout(timeout)
    }
  }, [messages.alice, isAutoChat, chatSpeed])

  const addMessage = (chatId, text, sender) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender,
      timestamp: new Date().toLocaleTimeString()
    }
    
    setMessages(prev => ({
      ...prev,
      [chatId]: [...prev[chatId], newMessage]
    }))
  }

  const handleSendMessage = (chatId) => {
    const message = inputMessages[chatId].trim()
    if (message) {
      addMessage(chatId, message, 'user')
      setInputMessages(prev => ({
        ...prev,
        [chatId]: ''
      }))
    }
  }

  const handleKeyPress = (e, chatId) => {
    if (e.key === 'Enter') {
      handleSendMessage(chatId)
    }
  }

  const clearChat = (chatId) => {
    setMessages(prev => ({
      ...prev,
      [chatId]: []
    }))
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🤖 AI Chat Demo</h1>
        <div className="controls">
          <button 
            className={`control-btn ${isAutoChat ? 'active' : ''}`}
            onClick={() => setIsAutoChat(!isAutoChat)}
          >
            {isAutoChat ? '⏸️ Остановить' : '▶️ Запустить'} авточат
          </button>
          <select 
            value={chatSpeed} 
            onChange={(e) => setChatSpeed(Number(e.target.value))}
            className="speed-select"
          >
            <option value={1000}>Быстро (1с)</option>
            <option value={3000}>Средне (3с)</option>
            <option value={5000}>Медленно (5с)</option>
          </select>
        </div>
      </header>

      <div className="chat-container">
        {/* Alice Chat */}
        <div className="chat-window">
          <div className="chat-header">
            <h2>👩 Alice</h2>
            <button 
              className="clear-btn"
              onClick={() => clearChat('alice')}
            >
              🗑️ Очистить
            </button>
          </div>
          
          <div className="messages">
            {messages.alice.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-text">{message.text}</div>
                <div className="message-time">{message.timestamp}</div>
              </div>
            ))}
          </div>
          
          <div className="input-area">
            <input
              type="text"
              value={inputMessages.alice}
              onChange={(e) => setInputMessages(prev => ({...prev, alice: e.target.value}))}
              onKeyPress={(e) => handleKeyPress(e, 'alice')}
              placeholder="Напишите сообщение для Alice..."
              className="message-input"
            />
            <button 
              onClick={() => handleSendMessage('alice')}
              className="send-btn"
            >
              📤
            </button>
          </div>
        </div>

        {/* Bob Chat */}
        <div className="chat-window">
          <div className="chat-header">
            <h2>👨 Bob</h2>
            <button 
              className="clear-btn"
              onClick={() => clearChat('bob')}
            >
              🗑️ Очистить
            </button>
          </div>
          
          <div className="messages">
            {messages.bob.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
              >
                <div className="message-text">{message.text}</div>
                <div className="message-time">{message.timestamp}</div>
              </div>
            ))}
          </div>
          
          <div className="input-area">
            <input
              type="text"
              value={inputMessages.bob}
              onChange={(e) => setInputMessages(prev => ({...prev, bob: e.target.value}))}
              onKeyPress={(e) => handleKeyPress(e, 'bob')}
              placeholder="Напишите сообщение для Bob..."
              className="message-input"
            />
            <button 
              onClick={() => handleSendMessage('bob')}
              className="send-btn"
            >
              📤
            </button>
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>💡 Наблюдайте за диалогом или вмешивайтесь, отправляя сообщения!</p>
      </footer>
    </div>
  )
}

export default App