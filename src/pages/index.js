import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function ShakespeareExplainer() {
  const [uploadedText, setUploadedText] = useState([]);
  const [selectedLines, setSelectedLines] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastClickedIndex, setLastClickedIndex] = useState(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showButtons, setShowButtons] = useState(false);

  // Download and load a play directly
  const loadPlay = async (url, title) => {
    try {
      setChatMessages([{ role: 'system', content: `Loading ${title}...` }]);
      
      const response = await fetch('/api/load-play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      const lines = data.text.split('\n').filter(line => line.trim() !== '');
      
      setUploadedText(lines);
      setChatMessages([{ role: 'system', content: `${title} loaded! Click or drag to select lines for explanation.` }]);
    } catch (error) {
      console.error('Error loading play:', error);
      setChatMessages([{ role: 'system', content: `Failed to load ${title}. Please try the manual upload option below.` }]);
    }
  };

  // Save chat as text file
  const saveChatToFile = () => {
    const chatText = chatMessages.map(msg => {
      const role = msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'Shakespeare Expert' : 'System';
      return `${role}:\n${msg.content}\n\n`;
    }).join('');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shakespeare-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Get chat summary
  const getChatSummary = async () => {
    if (chatMessages.length === 0) return;
    
    const chatText = chatMessages
      .filter(msg => msg.role !== 'system')
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n');
    
    setIsLoading(true);
    setChatMessages(prev => [...prev, { role: 'user', content: 'Please provide a summary of our conversation, including the main topics discussed and key things learned about Shakespeare.' }]);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [
            { role: 'system', content: 'You are a Shakespeare expert. Provide a concise summary of the conversation, highlighting main topics discussed and key insights about Shakespeare\'s works.' },
            { role: 'user', content: `Please summarize this conversation about Shakespeare:\n\n${chatText}` }
          ]
        }),
      });
      const data = await res.json();
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      console.error('Error:', err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not generate a summary.' }]);
    }
    setIsLoading(false);
  };

  // Handle scrollbar interaction (scroll or resize)
  const handleScrollbarStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const getClientX = (e) => e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX);
    const getClientY = (e) => e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY);
    
    const startX = getClientX(e);
    const startY = getClientY(e);
    const scrollbarElement = e.currentTarget;
    const startScrollbarRect = scrollbarElement.getBoundingClientRect();
    let isDragging = false;
    let dragThreshold = 5; // pixels to move before considering it a drag
    
    const handleMove = (e) => {
      e.preventDefault();
      const currentX = getClientX(e);
      const currentY = getClientY(e);
      const deltaX = Math.abs(currentX - startX);
      const deltaY = Math.abs(currentY - startY);
      
      if (!isDragging && (deltaX > dragThreshold || deltaY > dragThreshold)) {
        // Determine if this is horizontal (resize) or vertical (scroll) drag
        if (deltaX > deltaY) {
          isDragging = 'resize';
        } else {
          isDragging = 'scroll';
        }
      }
      
      if (isDragging === 'resize') {
        // Handle panel resizing
        const containerWidth = window.innerWidth;
        const newLeftWidth = (currentX / containerWidth) * 100;
        const constrainedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
        setLeftPanelWidth(constrainedWidth);
      } else if (isDragging === 'scroll') {
        // Handle scrolling
        const scrollContainer = document.querySelector('.left-panel');
        const scrollbarRect = scrollbarElement.getBoundingClientRect();
        const clickY = currentY - scrollbarRect.top;
        const scrollbarHeight = scrollbarRect.height;
        const scrollHeight = scrollContainer.scrollHeight;
        const viewHeight = scrollContainer.clientHeight;
        
        const scrollRatio = Math.max(0, Math.min(1, clickY / scrollbarHeight));
        const maxScrollTop = scrollHeight - viewHeight;
        const targetScrollTop = scrollRatio * maxScrollTop;
        
        scrollContainer.scrollTop = targetScrollTop;
        setScrollPosition(scrollRatio);
      }
    };
    
    const handleEnd = (e) => {
      if (!isDragging) {
        // This was a simple click, handle as scroll positioning
        const scrollContainer = document.querySelector('.left-panel');
        const clickY = startY - startScrollbarRect.top;
        const scrollbarHeight = startScrollbarRect.height;
        const scrollHeight = scrollContainer.scrollHeight;
        const viewHeight = scrollContainer.clientHeight;
        
        const scrollRatio = Math.max(0, Math.min(1, clickY / scrollbarHeight));
        const maxScrollTop = scrollHeight - viewHeight;
        const targetScrollTop = scrollRatio * maxScrollTop;
        
        scrollContainer.scrollTop = targetScrollTop;
        setScrollPosition(scrollRatio);
      }
      
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  // Update scroll position when scrolling
  const handleScroll = (e) => {
    const scrollContainer = e.target;
    const scrollTop = scrollContainer.scrollTop;
    const scrollHeight = scrollContainer.scrollHeight;
    const viewHeight = scrollContainer.clientHeight;
    const maxScrollTop = scrollHeight - viewHeight;
    
    if (maxScrollTop > 0) {
      const ratio = scrollTop / maxScrollTop;
      setScrollPosition(ratio);
    }
  };

  // Detect mobile device and register service worker
  useEffect(() => {
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(checkMobile);

    // Register service worker for PWA (only in production)
    if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);


  const handleMobileLineClick = (line, index) => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime;
    
    // Double tap detection (within 500ms)
    if (lastClickedIndex === index && timeDiff < 500) {
      // Double tap - explain this line immediately and clear selection
      setSelectedLines([]);  // Clear first to avoid showing buttons
      setShowButtons(false);
      setTimeout(() => {
        setSelectedLines([{ line, index }]);
        explainSelectedText();
        setSelectedLines([]);  // Clear after submitting
      }, 10);
      setLastClickTime(0);
      setLastClickedIndex(null);
    } else {
      // Single tap - toggle selection and show buttons
      setSelectedLines(prev => {
        const isSelected = prev.some(item => item.index === index);
        const newSelection = isSelected 
          ? prev.filter(item => item.index !== index)
          : [...prev, { line, index }].sort((a, b) => a.index - b.index);
        
        // Show buttons if we have selections
        setShowButtons(newSelection.length > 0);
        return newSelection;
      });
      setLastClickTime(currentTime);
      setLastClickedIndex(index);
    }
  };

  const explainMultipleLines = () => {
    if (selectedLines.length > 0) {
      explainSelectedText();
      setSelectedLines([]); // Clear selection after submitting
      setShowButtons(false); // Hide buttons after submitting
    }
  };

  const processFile = (file) => {
    if (file) {
      // Try to read any file that looks like text
      console.log('File type:', file.type, 'File name:', file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n').filter(line => line.trim() !== '');
          setUploadedText(lines);
          setChatMessages([{ role: 'system', content: 'File uploaded! Click or drag to select lines for explanation.' }]);
        } catch (err) {
          console.error('Error reading file:', err);
          alert('Error reading file. Please try the paste option instead.');
        }
      };
      reader.onerror = () => {
        alert('Error reading file. Please try the paste option instead.');
      };
      reader.readAsText(file);
    }
  };

  const handleFileUpload = (event) => {
    console.log('File upload triggered');
    console.log('Files:', event.target.files);
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file);
      processFile(file);
    } else {
      console.log('No file selected');
    }
  };


  const handleMouseDown = (line, index) => {
    setIsDragging(false); // Reset first
    setDragStart(index);
    setSelectedLines([{ line, index }]);
    setShowButtons(false); // Hide buttons during interaction
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
      // Was dragging - submit selection
      setIsDragging(false);
      setDragStart(null);
      explainSelectedText();
      setTimeout(() => setSelectedLines([]), 100);
    } else if (dragStart !== null) {
      // Was a click - submit single line
      setIsDragging(false);
      setDragStart(null);
      explainSelectedText();
      setTimeout(() => setSelectedLines([]), 100);
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
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes" />
      </Head>
      <div style={{ 
        display: 'flex', 
        height: '100vh', 
        fontFamily: 'monospace', 
        fontSize: '14px',
        minWidth: isMobile ? 'auto' : '1024px',
        overflow: 'hidden'
      }}>
      <div 
        className="left-panel" 
        onScroll={handleScroll}
        style={{ 
          width: `${leftPanelWidth}%`, 
          padding: '16px',
          paddingRight: '50px',
          overflowY: 'auto',
          backgroundColor: 'white',
          color: 'black',
          position: 'relative'
        }}
      >
        {/* Custom scrollbar overlay */}
        <div 
          onMouseDown={handleScrollbarStart}
          onTouchStart={handleScrollbarStart}
          style={{
            position: 'fixed',
            right: `${100 - leftPanelWidth}%`,
            top: '0',
            width: '20px',
            height: '100vh',
            backgroundColor: '#ddd',
            cursor: 'pointer',
            zIndex: 1000,
            pointerEvents: 'auto'
          }}
        >
          {/* Scroll position indicator */}
          <div 
            style={{
              position: 'absolute',
              left: '2px',
              right: '2px',
              top: `${scrollPosition * 100}%`,
              height: '3px',
              backgroundColor: '#666',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontWeight: 'bold', marginBottom: '12px', color: '#374151' }}>📚 Shakespeare Text</h2>
          <div style={{ marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>
              🎭 Quick Load Popular Plays
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
              <button
                onClick={() => loadPlay('https://folger-main-site-assets.s3.amazonaws.com/uploads/2022/11/romeo-and-juliet_TXT_FolgerShakespeare.txt', 'Romeo and Juliet')}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                Romeo & Juliet
              </button>
              <button
                onClick={() => loadPlay('https://folger-main-site-assets.s3.amazonaws.com/uploads/2022/11/macbeth_TXT_FolgerShakespeare.txt', 'Macbeth')}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                Macbeth
              </button>
              <button
                onClick={() => loadPlay('https://folger-main-site-assets.s3.amazonaws.com/uploads/2022/11/hamlet_TXT_FolgerShakespeare.txt', 'Hamlet')}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                Hamlet
              </button>
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
              Need more plays? Visit{' '}
              <a 
                href="https://www.folger.edu/explore/shakespeares-works/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#3b82f6', textDecoration: 'underline' }}
              >
                Folger Shakespeare Library
              </a>
              {' '}to find and download additional works.
            </div>
          </div>
          
          <label style={{ 
            display: 'block',
            marginBottom: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#374151'
          }}>
            📂 Or Upload Your Own File
          </label>
          <input
            type="file"
            accept="text/plain,.txt"
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
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
            Upload a .txt file with Shakespeare text
          </div>
          
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
            <div style={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}>
              Or paste text here
            </div>
            <textarea
              placeholder="Paste Shakespeare text here..."
              onChange={(e) => {
                const text = e.target.value;
                if (text.trim()) {
                  const lines = text.split('\n').filter(line => line.trim() !== '');
                  setUploadedText(lines);
                  setChatMessages([{ role: 'system', content: 'Text pasted! Click or drag to select lines for explanation.' }]);
                }
              }}
              style={{
                width: '100%',
                height: '100px',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '12px',
                backgroundColor: '#fefdf0',
                color: 'black'
              }}
            />
          </div>
        </div>
        <div 
          onMouseUp={!isMobile ? handleMouseUp : undefined} 
          onMouseLeave={!isMobile ? handleMouseUp : undefined}
          style={{ touchAction: 'manipulation' }}
        >
          {uploadedText.map((line, idx) => {
            const isSelected = selectedLines.some(item => item.index === idx);
            const isLastSelected = selectedLines.length > 0 && showButtons &&
              idx === Math.max(...selectedLines.map(item => item.index));
            
            return (
              <div key={idx}>
                <p
                  onMouseDown={!isMobile ? () => handleMouseDown(line, idx) : undefined}
                  onMouseEnter={!isMobile ? () => handleMouseEnter(line, idx) : undefined}
                  onMouseMove={!isMobile ? () => handleMouseMove(line, idx) : undefined}
                  onClick={isMobile ? (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleMobileLineClick(line, idx);
                  } : undefined}
                  style={{
                    cursor: 'pointer',
                    padding: '4px',
                    backgroundColor: isSelected ? '#3b82f6' : 'white',
                    color: isSelected ? 'white' : 'black',
                    borderRadius: '2px',
                    userSelect: 'none'
                  }}
                  onMouseOver={!isMobile ? (e) => {
                    if (!isSelected && !isDragging) e.target.style.backgroundColor = '#fde68a';
                  } : undefined}
                  onMouseOut={!isMobile ? (e) => {
                    if (!isSelected) {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.color = 'black';
                    }
                  } : undefined}
                >
                  {line}
                </p>
                
                {isLastSelected && (
                  <div style={{ marginTop: '8px', marginBottom: '8px', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={explainMultipleLines}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      Explain Selected Lines ({selectedLines.length})
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLines([]);
                        setShowButtons(false);
                      }}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      
      <div style={{ 
        width: `${100 - leftPanelWidth}%`, 
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        color: 'black'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ fontWeight: 'bold', margin: 0 }}>Shakespeare Chat</h2>
          {chatMessages.length > 0 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={saveChatToFile}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                💾 Save Chat
              </button>
              <button
                onClick={getChatSummary}
                disabled={isLoading}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  opacity: isLoading ? 0.5 : 1
                }}
              >
                📋 Summary
              </button>
            </div>
          )}
        </div>
        
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
    </>
  );
}
