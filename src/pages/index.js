import { useState, useEffect } from 'react';

export default function ShakespeareExplainer() {
  const [uploadedText, setUploadedText] = useState([]);
  const [selectedLines, setSelectedLines] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = (file) => {
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        setUploadedText(lines);
        setChatMessages([{ role: 'system', content: 'File uploaded! Click or drag to select lines for explanation.' }]);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a .txt file');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleMouseDown = (line, index) => {
    setIsDragging(false); // Reset first
    setDragStart(index);
    setSelectedLines([{ line, index }]);
  };

  const handleMouseEnter = (line, index) => {
    if (isDragging && dragStart !== null) {
      const start = Math.min(dragStart, index);
      const end = Math.max(dragStart, index);
      const selection = [];
      for (let i = start; i <= end; i++) {
        selection.push({ line: uploadedText[i], index: i });
      }
      setSelectedLines(selection);
    }
  };

  const handleMouseMove = (line, index) => {
    if (dragStart !== null && !isDragging) {
      // Start dragging if mouse moved while down
      setIsDragging(true);
      handleMouseEnter(line, index);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      // Was dragging - submit the selection
      setIsDragging(false);
      setDragStart(null);
      setTimeout(() => explainSelectedText(), 100);
    } else if (dragStart !== null) {
      // Was a click - submit single line
      setIsDragging(false);
      setDragStart(null);
      setTimeout(() => explainSelectedText(), 100);
    }
  };

  const explainSelectedText = async () => {
    if (selectedLines.length === 0) return;
    
    const textToExplain = selectedLines.map(item => item.line).join('\n');
    const userMessage = `Explain: "${textToExplain}"`;
    
    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    // Scroll to show user input immediately
    setTimeout(() => {
      const userMessages = document.querySelectorAll('[data-role="user"]');
      const lastUserMessage = userMessages[userMessages.length - 1];
      if (lastUserMessage) {
        lastUserMessage.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start'
        });
      }
    }, 100);
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...chatMessages, { role: 'user', content: userMessage }]
        }),
      });
      const data = await res.json();
      
      // Add assistant response to chat
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      setTimeout(() => scrollToOptimalPosition(), 500);
    } catch (err) {
      console.error('Error:', err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Failed to get explanation.' }]);
    }
    setIsLoading(false);
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    
    const userMessage = inputMessage;
    setInputMessage('');
    
    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    // Scroll to show user input immediately
    setTimeout(() => {
      const userMessages = document.querySelectorAll('[data-role="user"]');
      const lastUserMessage = userMessages[userMessages.length - 1];
      if (lastUserMessage) {
        lastUserMessage.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start'
        });
      }
    }, 100);
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...chatMessages, { role: 'user', content: userMessage }]
        }),
      });
      const data = await res.json();
      
      // Add assistant response to chat
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      setTimeout(() => scrollToOptimalPosition(), 500);
    } catch (err) {
      console.error('Error:', err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
    }
    setIsLoading(false);
  };

  // Just scroll down a little to reveal some response
  const scrollToOptimalPosition = () => {
    setTimeout(() => {
      const chatContainer = document.getElementById('chat-container');
      if (chatContainer) {
        chatContainer.scrollBy({
          top: 150,
          behavior: 'smooth'
        });
      }
    }, 200);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'monospace', fontSize: '14px' }}>
      <div style={{ 
        width: '50%', 
        borderRight: '1px solid #ccc', 
        padding: '16px',
        overflowY: 'auto'
      }}>
        <div 
          style={{ marginBottom: '16px' }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div style={{
            border: isDragOver ? '2px dashed #3b82f6' : '2px dashed #ccc',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: isDragOver ? '#f0f9ff' : '#f9f9f9',
            textAlign: 'center',
            marginBottom: '8px'
          }}>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              style={{ 
                display: 'block',
                width: '100%',
                marginBottom: '8px',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            <div style={{ fontSize: '14px', color: '#666' }}>
              Or drag and drop a .txt file here
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
            Sample texts: 
            <a 
              href="https://folger-main-site-assets.s3.amazonaws.com/uploads/2022/11/romeo-and-juliet_TXT_FolgerShakespeare.txt"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#3b82f6', textDecoration: 'underline' }}
            >
              Romeo and Juliet
            </a>
            {' | '}
            <a 
              href="https://folger-main-site-assets.s3.amazonaws.com/uploads/2022/11/macbeth_TXT_FolgerShakespeare.txt"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#3b82f6', textDecoration: 'underline' }}
            >
              Macbeth
            </a>
            {' | '}
            <a 
              href="https://www.folger.edu/explore/shakespeares-works/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#3b82f6', textDecoration: 'underline' }}
            >
              More plays
            </a>
            <div style={{ marginTop: '4px' }}>
              Click to open up a new tab with the Shakespeare text, thanks to the Folger Shakespeare Library. 
              Use Chrome's menu File/Save Page As... and select a location on your computer. 
              Then upload the text file to this app.
            </div>
          </div>
        </div>
        <div onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          {uploadedText.map((line, idx) => {
            const isSelected = selectedLines.some(item => item.index === idx);
            return (
              <p
                key={idx}
                onMouseDown={() => handleMouseDown(line, idx)}
                onMouseEnter={() => handleMouseEnter(line, idx)}
                onMouseMove={() => handleMouseMove(line, idx)}
                style={{
                  cursor: 'pointer',
                  padding: '4px',
                  backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                  color: isSelected ? 'white' : 'black',
                  borderRadius: '2px',
                  userSelect: 'none'
                }}
                onMouseOver={(e) => {
                  if (!isSelected && !isDragging) e.target.style.backgroundColor = '#fde68a';
                }}
                onMouseOut={(e) => {
                  if (!isSelected) e.target.style.backgroundColor = 'transparent';
                }}
              >
                {line}
              </p>
            );
          })}
        </div>
      </div>
      <div style={{ 
        width: '50%', 
        padding: '16px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h2 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Shakespeare Chat</h2>
        
        {/* Chat messages */}
        <div 
          id="chat-container"
          style={{ 
            flex: 1,
            overflowY: 'auto',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            marginBottom: '8px'
          }}
        >
          {chatMessages.map((msg, idx) => (
            <div 
              key={idx} 
              data-role={msg.role}
              style={{ 
                marginBottom: '12px',
                padding: '8px',
                backgroundColor: msg.role === 'user' ? '#e3f2fd' : msg.role === 'assistant' ? '#f5f5f5' : '#fff3cd',
                borderRadius: '4px'
              }}
            >
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: '12px', 
                marginBottom: '4px',
                color: msg.role === 'user' ? '#1976d2' : msg.role === 'assistant' ? '#666' : '#856404'
              }}>
                {msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'Shakespeare Expert' : 'System'}
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
            </div>
          ))}
          {isLoading && (
            <div style={{ 
              padding: '8px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              fontStyle: 'italic',
              marginBottom: '12px'
            }}>
              Shakespeare Expert is typing...
            </div>
          )}
        </div>
        
        {/* Chat input */}
        <form onSubmit={sendChatMessage} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask follow-up questions..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
