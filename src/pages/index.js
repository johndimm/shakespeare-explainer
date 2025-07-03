import { useState, useEffect } from 'react';

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

  // Handle scrollbar click to jump to position
  const handleScrollbarClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const scrollContainer = document.querySelector('.left-panel');
    const scrollbarRect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - scrollbarRect.top;
    const scrollbarHeight = scrollbarRect.height;
    const scrollHeight = scrollContainer.scrollHeight;
    const viewHeight = scrollContainer.clientHeight;
    
    // Calculate target scroll position based on click position
    const scrollRatio = clickY / scrollbarHeight;
    const maxScrollTop = scrollHeight - viewHeight;
    const targetScrollTop = scrollRatio * maxScrollTop;
    
    scrollContainer.scrollTop = targetScrollTop;
    setScrollPosition(scrollRatio);
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

  // Detect mobile device
  useEffect(() => {
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
  }, []);

  // Handle resizer drag (mouse and touch)
  useEffect(() => {
    const getClientX = (e) => {
      return e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX);
    };

    const handleMove = (e) => {
      if (isResizing) {
        e.preventDefault();
        const clientX = getClientX(e);
        if (clientX) {
          const containerWidth = window.innerWidth;
          const newLeftWidth = (clientX / containerWidth) * 100;
          // Constrain between 20% and 80%
          const constrainedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
          setLeftPanelWidth(constrainedWidth);
        }
      }
    };

    const handleEnd = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      // Mouse events
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      // Touch events
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
      
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isResizing]);

  const handleMobileLineClick = (line, index) => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime;
    
    // Double tap detection (within 500ms)
    if (lastClickedIndex === index && timeDiff < 500) {
      // Double tap - explain this line immediately and clear selection
      setSelectedLines([]);  // Clear first to avoid showing buttons
      setTimeout(() => {
        setSelectedLines([{ line, index }]);
        explainSelectedText();
        setSelectedLines([]);  // Clear after submitting
      }, 10);
      setLastClickTime(0);
      setLastClickedIndex(null);
    } else {
      // Single tap - toggle selection
      setSelectedLines(prev => {
        const isSelected = prev.some(item => item.index === index);
        if (isSelected) {
          return prev.filter(item => item.index !== index);
        } else {
          return [...prev, { line, index }].sort((a, b) => a.index - b.index);
        }
      });
      setLastClickTime(currentTime);
      setLastClickedIndex(index);
    }
  };

  const explainMultipleLines = () => {
    if (selectedLines.length > 0) {
      explainSelectedText();
      setSelectedLines([]); // Clear selection after submitting
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
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      fontFamily: 'monospace', 
      fontSize: '14px',
      minWidth: '1024px',
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
          onClick={handleScrollbarClick}
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
          
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
            <details open>
              <summary style={{ cursor: 'pointer', color: '#3b82f6', fontWeight: 'bold' }}>
                Mobile users: Paste text here (recommended)
              </summary>
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
                  marginTop: '8px',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '12px',
                  backgroundColor: '#fefdf0',
                  color: 'black'
                }}
              />
            </details>
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
        <div 
          onMouseUp={!isMobile ? handleMouseUp : undefined} 
          onMouseLeave={!isMobile ? handleMouseUp : undefined}
          style={{ touchAction: 'auto' }}
        >
          {uploadedText.map((line, idx) => {
            const isSelected = selectedLines.some(item => item.index === idx);
            const isLastSelected = isMobile && selectedLines.length > 0 && 
              idx === Math.max(...selectedLines.map(item => item.index));
            
            return (
              <div key={idx}>
                <p
                  onMouseDown={!isMobile ? () => handleMouseDown(line, idx) : undefined}
                  onMouseEnter={!isMobile ? () => handleMouseEnter(line, idx) : undefined}
                  onMouseMove={!isMobile ? () => handleMouseMove(line, idx) : undefined}
                  onClick={isMobile ? () => handleMobileLineClick(line, idx) : () => {
                    setSelectedLines([{ line, index: idx }]);
                    setTimeout(() => explainSelectedText(), 100);
                  }}
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
                      onClick={() => setSelectedLines([])}
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
      
      {/* Resizable separator */}
      <div 
        style={{
          width: isMobile ? '12px' : '4px',
          backgroundColor: '#ccc',
          cursor: 'col-resize',
          borderLeft: '1px solid #999',
          borderRight: '1px solid #999',
          touchAction: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseDown={() => setIsResizing(true)}
        onTouchStart={() => setIsResizing(true)}
      >
        {isMobile && (
          <div style={{
            width: '2px',
            height: '20px',
            backgroundColor: '#666',
            borderRadius: '1px'
          }} />
        )}
      </div>
      
      <div style={{ 
        width: `${100 - leftPanelWidth}%`, 
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        color: 'black'
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
