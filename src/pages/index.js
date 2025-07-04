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
  const [highlightedLines, setHighlightedLines] = useState(new Set());
  const [showOutline, setShowOutline] = useState(false);
  const [outline, setOutline] = useState([]);
  const [uiLanguage, setUiLanguage] = useState('en');
  const [urlInput, setUrlInput] = useState('');
  const [detectedAuthor, setDetectedAuthor] = useState('Shakespeare');
  const [responseLanguage, setResponseLanguage] = useState('match'); // 'match' or 'native'
  const [myLanguage, setMyLanguage] = useState('en'); // User's preferred mother tongue
  const [lastUserMessage, setLastUserMessage] = useState(null); // Track last message for resubmission
  const [previousResponseLanguage, setPreviousResponseLanguage] = useState('match'); // Track previous setting

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
      setOutline(generateOutline(lines));
      
      // Detect author and update UI
      const author = await detectAuthorWithLLM(lines.join(' '));
      setDetectedAuthor(author);
      
      setChatMessages([{ role: 'system', content: `${title} loaded! Click or drag to select lines for explanation.` }]);
      
      // Auto-scroll to the beginning of the loaded text
      setTimeout(() => {
        const leftPanel = document.querySelector('.left-panel');
        const firstTextLine = leftPanel?.querySelector('[data-line-index="0"]');
        if (firstTextLine) {
          firstTextLine.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 300);
    } catch (error) {
      console.error('Error loading play:', error);
      setChatMessages([{ role: 'system', content: `Failed to load ${title}. Please try the manual upload option below.` }]);
    }
  };

  // Load text from URL
  const loadTextFromURL = async () => {
    if (!urlInput.trim()) return;
    
    try {
      setChatMessages([{ role: 'system', content: `Loading text from URL...` }]);
      setIsLoading(true);
      
      const response = await fetch('/api/load-play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() })
      });
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      const lines = data.text.split('\n').filter(line => line.trim() !== '');
      
      setUploadedText(lines);
      setOutline(generateOutline(lines));
      
      // Detect author and update UI
      const author = await detectAuthorWithLLM(lines.join(' '));
      setDetectedAuthor(author);
      
      // Extract title from URL or use a generic name
      const urlParts = urlInput.split('/');
      const fileName = urlParts[urlParts.length - 1] || 'Text from URL';
      const title = fileName.replace(/\.(txt|html|md)$/i, '');
      
      setChatMessages([{ role: 'system', content: `${title} loaded! Click or drag to select lines for explanation.` }]);
      setUrlInput(''); // Clear the input after successful load
      
      // Auto-scroll to the beginning of the loaded text
      setTimeout(() => {
        const leftPanel = document.querySelector('.left-panel');
        const firstTextLine = leftPanel?.querySelector('[data-line-index="0"]');
        if (firstTextLine) {
          firstTextLine.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 300);
    } catch (error) {
      console.error('Error loading text from URL:', error);
      setChatMessages([{ role: 'system', content: `Failed to load text from URL. Please check the URL and try again.` }]);
    } finally {
      setIsLoading(false);
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
        // On mobile, prioritize resizing. On desktop, check direction
        if (isMobile) {
          isDragging = 'resize';
        } else {
          // Determine if this is horizontal (resize) or vertical (scroll) drag
          if (deltaX > deltaY) {
            isDragging = 'resize';
          } else {
            isDragging = 'scroll';
          }
        }
      }
      
      if (isDragging === 'resize') {
        // Handle panel resizing with direct DOM manipulation for smoothness
        const containerWidth = window.innerWidth;
        const newLeftWidth = (currentX / containerWidth) * 100;
        const constrainedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
        
        // Update DOM directly for smooth performance
        const leftPanel = document.querySelector('.left-panel');
        const rightPanel = leftPanel.nextElementSibling;
        const scrollbar = scrollbarElement;
        
        if (leftPanel && rightPanel && scrollbar) {
          leftPanel.style.width = `${constrainedWidth}%`;
          rightPanel.style.width = `${100 - constrainedWidth}%`;
          scrollbar.style.right = `${100 - constrainedWidth}%`;
        }
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
      } else if (isDragging === 'resize') {
        // Sync React state with final DOM state after resize
        const leftPanel = document.querySelector('.left-panel');
        if (leftPanel) {
          const currentWidth = parseFloat(leftPanel.style.width);
          setLeftPanelWidth(currentWidth);
        }
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
          setOutline(generateOutline(lines));
          
          // Detect author and update UI
          detectAuthorWithLLM(text).then(author => {
            setDetectedAuthor(author);
          });
          
          setChatMessages([{ role: 'system', content: 'File uploaded! Click or drag to select lines for explanation.' }]);
          
          // Auto-scroll to the beginning of the loaded text
          setTimeout(() => {
            const leftPanel = document.querySelector('.left-panel');
            const firstTextLine = leftPanel?.querySelector('[data-line-index="0"]');
            if (firstTextLine) {
              firstTextLine.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }
          }, 300);
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
    const lineIndices = selectedLines.map(item => item.index);
    
    // Add user message to chat with line indices for linking
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage, lineIndices }]);
    setLastUserMessage({ content: userMessage, lineIndices }); // Store for potential resubmission
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
      console.log('explainSelectedText - Sending request with responseLanguage:', responseLanguage);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...chatMessages, { role: 'user', content: userMessage }],
          responseLanguage: responseLanguage,
          myLanguage: myLanguage
        }),
      });
      const data = await res.json();
      
      // Add assistant response to chat and detect language
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      
      // Update UI language based on assistant response
      const detectedLang = detectUILanguage(data.response);
      if (detectedLang !== uiLanguage) {
        setUiLanguage(detectedLang);
      }
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
    setLastUserMessage({ content: userMessage }); // Store for potential resubmission
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
      console.log('sendChatMessage - Sending request with responseLanguage:', responseLanguage);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...chatMessages, { role: 'user', content: userMessage }],
          responseLanguage: responseLanguage,
          myLanguage: myLanguage
        }),
      });
      const data = await res.json();
      
      // Add assistant response to chat and detect language
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      
      // Update UI language based on assistant response
      const detectedLang = detectUILanguage(data.response);
      if (detectedLang !== uiLanguage) {
        setUiLanguage(detectedLang);
      }
    } catch (err) {
      console.error('Error:', err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
    }
    setIsLoading(false);
  };

  // Generate outline from text
  const generateOutline = (lines) => {
    const outlineItems = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Shakespeare play patterns - more specific matching
      if (trimmed.match(/^ACT\s+[IVX]+/i)) {
        outlineItems.push({
          type: 'act',
          title: trimmed,
          index: index,
          level: 1
        });
      } else if (trimmed.match(/^SCENE\s+[IVX]+/i)) {
        // Look for scene direction on next line
        const sceneDirection = getSceneDirection(lines, index + 1);
        outlineItems.push({
          type: 'scene',
          title: trimmed,
          direction: sceneDirection,
          index: index,
          level: 2
        });
      } else if (trimmed.match(/^(PROLOGUE|EPILOGUE|CHORUS)/i)) {
        outlineItems.push({
          type: 'special',
          title: trimmed,
          index: index,
          level: 1
        });
      } else if (trimmed.match(/^Act\s+[IVX0-9]+/i)) {
        // Handle "Act I", "Act 1" format
        outlineItems.push({
          type: 'act',
          title: trimmed,
          index: index,
          level: 1
        });
      } else if (trimmed.match(/^Scene\s+[IVX0-9]+/i)) {
        // Handle "Scene I", "Scene 1" format
        const sceneDirection = getSceneDirection(lines, index + 1);
        outlineItems.push({
          type: 'scene',
          title: trimmed,
          direction: sceneDirection,
          index: index,
          level: 2
        });
      } else if (trimmed.match(/^(Act\s+[IVX0-9]+,?\s*Scene\s+[IVX0-9]+)/i)) {
        // Handle "Act I, Scene I" format
        const sceneDirection = getSceneDirection(lines, index + 1);
        outlineItems.push({
          type: 'scene',
          title: trimmed,
          direction: sceneDirection,
          index: index,
          level: 2
        });
      }
    });
    
    return outlineItems;
  };

  // Helper function to get scene direction from the next line(s)
  const getSceneDirection = (lines, startIndex) => {
    // Check the next few lines for scene directions
    for (let i = startIndex; i < Math.min(startIndex + 5, lines.length); i++) {
      const line = lines[i]?.trim();
      if (!line) continue;
      
      // Skip character names and stage directions
      if (line.match(/^[A-Z][A-Z\s]+$/)) {
        // Check if this looks like a character name (common character patterns)
        const characterPatterns = /^(LADY|LORD|FIRST|SECOND|THIRD|OLD|YOUNG|DUKE|KING|QUEEN|PRINCE|PRINCESS|SIR|CAPTAIN|SERVANT|MESSENGER|SOLDIER|GUARD|DOCTOR|NURSE|MURDERER|WITCH|SPIRIT|GHOST|CHORUS)\b/;
        const singleName = /^[A-Z]+$/;
        
        // Skip if it's likely a character name
        if (characterPatterns.test(line) || singleName.test(line) || line.split(/\s+/).length <= 3) {
          continue;
        }
      }
      
      // Look for actual location descriptions
      const hasLocationWords = /\b(CASTLE|PALACE|ROOM|CHAMBER|HALL|COURT|GARDEN|ORCHARD|STREET|SQUARE|FIELD|FOREST|BATTLEFIELD|HEATH|PLAIN|TOWER|WALL|GATE|BRIDGE|RIVER|HILL|MOUNTAIN|CAVE|TOMB|CHURCH|MONASTERY|TENT|CAMP|HOUSE|MANOR|VILLA|BALCONY|TERRACE|YARD|KITCHEN|DUNGEON|PRISON|THRONE|BANQUET|FEAST|MARKET|FAIR|TAVERN|INN|SHIP|DECK|SHORE|BEACH|ISLAND|WOOD|GLADE|CLEARING|PATH|ROAD|CROSSROADS|VERONA|MANTUA|VENICE|ROME|ATHENS|SCOTLAND|ENGLAND|FRANCE|DENMARK|ITALY|SICILY|BOHEMIA|ILLYRIA)\b/i;
      const hasLocationIndicators = /\b(IN|AT|NEAR|OUTSIDE|INSIDE|BEFORE|WITHIN|THE SAME|ANOTHER|A ROOM|A STREET|A FIELD|THE COURT|THE PALACE)\b/i;
      const endsWithPeriod = line.endsWith('.');
      const hasParentheses = line.includes('(') && line.includes(')');
      const hasArticles = /\b(THE|A|AN)\b/i.test(line);
      
      // Check if it looks like a location description
      if ((hasLocationWords || hasLocationIndicators || endsWithPeriod || hasParentheses || hasArticles) && 
          line.length > 8 && line.length < 120 && 
          !line.match(/^[A-Z]+:/) && // Not a character name with colon
          !line.match(/^(Enter|Exit|Exeunt|Re-enter)/i) && // Not stage directions
          !line.match(/^(ACT|SCENE)/i)) { // Not act/scene headers
        
        const words = line.split(/\s+/);
        if (words.length >= 3 && words.length <= 20) {
          return line;
        }
      }
    }
    
    return null;
  };

  // Jump to text location in left panel
  const jumpToText = (lineIndices) => {
    if (!lineIndices || lineIndices.length === 0) return;
    
    // Clear existing highlights
    setHighlightedLines(new Set());
    
    // Highlight the lines
    const highlightSet = new Set(lineIndices);
    setHighlightedLines(highlightSet);
    
    // Scroll to the first line
    const firstIndex = Math.min(...lineIndices);
    const lineElement = document.querySelector(`[data-line-index="${firstIndex}"]`);
    if (lineElement) {
      lineElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center'
      });
    }
    
    // Clear highlight after a delay
    setTimeout(() => {
      setHighlightedLines(new Set());
    }, 3000);
  };

  // Jump to specific line index
  const jumpToLine = (lineIndex) => {
    jumpToText([lineIndex]);
  };

  // Simple language detection for UI
  const detectUILanguage = (text) => {
    const sample = text.toLowerCase().slice(0, 500);
    
    // French indicators
    if (sample.includes('être') || sample.includes('que') || sample.includes('dans') || 
        sample.includes('avec') || sample.includes('pour') || sample.includes('cette') ||
        sample.includes('très') || sample.includes('bien') || sample.includes('tout') ||
        sample.includes('mais') || sample.includes('comme') || sample.includes('vous')) {
      return 'fr';
    }
    
    // Spanish indicators  
    if (sample.includes('ser') || sample.includes('estar') || sample.includes('que') ||
        sample.includes('con') || sample.includes('para') || sample.includes('esta') ||
        sample.includes('muy') || sample.includes('bien') || sample.includes('todo') ||
        sample.includes('pero') || sample.includes('como') || sample.includes('usted')) {
      return 'es';
    }
    
    // German indicators
    if (sample.includes('sein') || sample.includes('haben') || sample.includes('das') ||
        sample.includes('mit') || sample.includes('für') || sample.includes('diese') ||
        sample.includes('sehr') || sample.includes('gut') || sample.includes('alle') ||
        sample.includes('aber') || sample.includes('wie') || sample.includes('sie')) {
      return 'de';
    }
    
    return 'en';
  };

  // Detect author using LLM
  const detectAuthorWithLLM = async (text) => {
    try {
      const sample = text.slice(0, 1500); // Take a sample of the text
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [
            {
              role: 'system',
              content: 'You are a literary expert. Analyze the text and identify the author. Respond with ONLY the author\'s name (e.g., "Shakespeare", "Molière", "Racine", "Goethe", etc.). If you cannot determine the author, respond with "Unknown Author".'
            },
            {
              role: 'user',
              content: `Who is the author of this text? Here is a sample:\n\n${sample}`
            }
          ]
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const authorName = data.response.trim();
        // Clean up the response to just get the author name
        const cleanAuthor = authorName.replace(/[""'']/g, '').replace(/^(The author is|This is by|Author:|This appears to be)\s*/i, '');
        return cleanAuthor || 'Shakespeare';
      }
    } catch (error) {
      console.error('Error detecting author:', error);
    }
    
    return 'Shakespeare'; // Default fallback
  };

  // Resubmit last message with current language preference
  const resubmitLastMessage = async () => {
    if (!lastUserMessage || isLoading) return;
    
    setIsLoading(true);
    
    try {
      console.log('Resubmitting last message with responseLanguage:', responseLanguage);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...chatMessages.slice(0, -1), { role: 'user', content: lastUserMessage.content }],
          responseLanguage: responseLanguage,
          myLanguage: myLanguage
        }),
      });
      const data = await res.json();
      
      // Replace the last assistant response
      setChatMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: data.response }]);
      
      // Update UI language based on assistant response
      const detectedLang = detectUILanguage(data.response);
      if (detectedLang !== uiLanguage) {
        setUiLanguage(detectedLang);
      }
    } catch (err) {
      console.error('Error:', err);
      setChatMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: 'Sorry, I encountered an error resubmitting the request.' }]);
    }
    setIsLoading(false);
  };

  // Auto-resubmit when language preference changes
  useEffect(() => {
    // Only auto-resubmit if:
    // 1. Language preference actually changed
    // 2. There's a last message to resubmit
    // 3. There are chat messages
    // 4. Not currently loading
    // 5. Previous response language was set (not initial load)
    if (responseLanguage !== previousResponseLanguage && 
        lastUserMessage && 
        chatMessages.length > 0 && 
        !isLoading &&
        previousResponseLanguage !== 'match' // Don't auto-resubmit on initial load
    ) {
      console.log('Auto-resubmitting due to language preference change from', previousResponseLanguage, 'to', responseLanguage);
      resubmitLastMessage();
    }
    setPreviousResponseLanguage(responseLanguage);
  }, [responseLanguage]);

  // UI text translations
  const getUIText = (key) => {
    const translations = {
      en: {
        shakespeareText: `📚 ${detectedAuthor} Text`,
        showOutline: '📋 Show Outline',
        hideOutline: '📖 Hide Outline',
        textOutline: '📑 Text Outline',
        quickLoad: '🎭 Quick Load Popular Plays',
        uploadFile: '📂 Or Upload Your Own File',
        pasteText: 'Or paste text here',
        pasteHere: `Paste ${detectedAuthor} text here...`,
        uploadDesc: `Upload a .txt file with ${detectedAuthor} text`,
        shakespeareChat: `${detectedAuthor} Chat`,
        saveChat: '💾 Save Chat',
        summary: '📋 Summary',
        you: 'You',
        shakespeareExpert: `${detectedAuthor} Expert`,
        system: 'System',
        typing: `${detectedAuthor} Expert is typing...`,
        askFollowUp: 'Ask follow-up questions...',
        send: 'Send',
        explainSelected: 'Explain Selected Lines',
        clear: 'Clear',
        clickToJump: '📍 Click to jump to text',
        loaded: 'loaded! Click or drag to select lines for explanation.',
        uploaded: 'File uploaded! Click or drag to select lines for explanation.',
        pasted: 'Text pasted! Click or drag to select lines for explanation.',
        loadFromURL: '🌐 Or Load from URL',
        urlPlaceholder: `Enter URL to ${detectedAuthor} text...`,
        loadButton: 'Load from URL',
        urlDesc: 'Load text from any publicly accessible URL (txt, html, or other text files)'
      },
      fr: {
        shakespeareText: `📚 Texte de ${detectedAuthor}`,
        showOutline: '📋 Afficher le Plan',
        hideOutline: '📖 Masquer le Plan',
        textOutline: '📑 Plan du Texte',
        quickLoad: '🎭 Chargement Rapide des Pièces Populaires',
        uploadFile: '📂 Ou Téléchargez Votre Propre Fichier',
        pasteText: 'Ou collez le texte ici',
        pasteHere: `Collez le texte de ${detectedAuthor} ici...`,
        uploadDesc: `Téléchargez un fichier .txt avec le texte de ${detectedAuthor}`,
        shakespeareChat: `Chat ${detectedAuthor}`,
        saveChat: '💾 Sauvegarder Chat',
        summary: '📋 Résumé',
        you: 'Vous',
        shakespeareExpert: `Expert ${detectedAuthor}`,
        system: 'Système',
        typing: `Expert ${detectedAuthor} écrit...`,
        askFollowUp: 'Posez des questions de suivi...',
        send: 'Envoyer',
        explainSelected: 'Expliquer les Lignes Sélectionnées',
        clear: 'Effacer',
        clickToJump: '📍 Cliquez pour aller au texte',
        loaded: 'chargé ! Cliquez ou faites glisser pour sélectionner les lignes à expliquer.',
        uploaded: 'Fichier téléchargé ! Cliquez ou faites glisser pour sélectionner les lignes à expliquer.',
        pasted: 'Texte collé ! Cliquez ou faites glisser pour sélectionner les lignes à expliquer.',
        loadFromURL: '🌐 Ou Charger depuis une URL',
        urlPlaceholder: `Entrez l'URL du texte de ${detectedAuthor}...`,
        loadButton: 'Charger depuis URL',
        urlDesc: 'Charger le texte depuis n\'importe quelle URL publique (txt, html, ou autres fichiers texte)'
      }
    };
    
    return translations[uiLanguage]?.[key] || translations.en[key] || key;
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
        flexDirection: 'row',
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
        {/* Custom scrollbar overlay - positioned relative to left panel */}
        <div 
          onMouseDown={handleScrollbarStart}
          onTouchStart={handleScrollbarStart}
          style={{
            position: 'fixed',
            right: `${100 - leftPanelWidth}%`,
            top: '0',
            width: '32px',
            height: '100vh',
            backgroundColor: '#e5e7eb',
            cursor: 'col-resize',
            zIndex: 1000,
            pointerEvents: 'auto',
            borderLeft: '1px solid #d1d5db',
            borderRight: '1px solid #d1d5db'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#d1d5db';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#e5e7eb';
          }}
        >
          {/* Resize grip lines */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '4px',
            height: '40px',
            backgroundImage: `
              linear-gradient(to bottom, transparent 0px, #9ca3af 2px, #9ca3af 4px, transparent 6px, transparent 8px, #9ca3af 10px, #9ca3af 12px, transparent 14px, transparent 16px, #9ca3af 18px, #9ca3af 20px, transparent 22px, transparent 24px, #9ca3af 26px, #9ca3af 28px, transparent 30px, transparent 32px, #9ca3af 34px, #9ca3af 36px, transparent 38px)
            `,
            backgroundSize: '4px 4px',
            pointerEvents: 'none'
          }} />
          
          {/* Scroll position indicator */}
          <div 
            style={{
              position: 'absolute',
              left: '4px',
              right: '4px',
              top: `${scrollPosition * 100}%`,
              height: '6px',
              backgroundColor: '#3b82f6',
              borderRadius: '3px',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontWeight: 'bold', margin: 0, color: '#374151' }}>{getUIText('shakespeareText')}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <a 
                href="/guide" 
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  color: '#3b82f6', 
                  textDecoration: 'none',
                  padding: '3px 6px',
                  borderRadius: '4px',
                  border: '1px solid #3b82f6',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#3b82f6';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#3b82f6';
                }}
              >
                📖 User Guide
              </a>
              {outline.length > 0 && (
                <button
                  onClick={() => setShowOutline(!showOutline)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: showOutline ? '#dc2626' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {showOutline ? getUIText('hideOutline') : getUIText('showOutline')}
                </button>
              )}
            </div>
          </div>
          
          {/* Outline Panel */}
          {showOutline && outline.length > 0 && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '16px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
                {getUIText('textOutline')}
              </h3>
              {outline.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => jumpToLine(item.index)}
                  style={{
                    padding: '4px 8px',
                    marginLeft: `${(item.level - 1) * 16}px`,
                    marginBottom: '2px',
                    backgroundColor: 'white',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    border: '1px solid #e5e7eb',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#e0e7ff';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'white';
                  }}
                >
                  <span style={{ 
                    color: item.type === 'act' ? '#dc2626' : 
                           item.type === 'scene' ? '#7c3aed' : 
                           item.type === 'special' ? '#059669' : '#6b7280',
                    fontWeight: item.level <= 2 ? 'bold' : 'normal'
                  }}>
                    {item.type === 'act' ? '🎭' : 
                     item.type === 'scene' ? '🎪' : 
                     item.type === 'special' ? '⭐' : '📍'} {item.title}
                    {item.direction && (
                      <span style={{ 
                        fontSize: '10px', 
                        fontWeight: 'normal',
                        color: '#6b7280',
                        marginLeft: '6px',
                        fontStyle: 'italic'
                      }}>
                        {item.direction}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
          {/* Quick Load Section */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '12px', 
              color: '#1f2937',
              margin: '0 0 12px 0'
            }}>
              Popular Works
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              <button
                onClick={() => loadPlay('https://folger-main-site-assets.s3.amazonaws.com/uploads/2022/11/romeo-and-juliet_TXT_FolgerShakespeare.txt', 'Romeo and Juliet')}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                Romeo & Juliet
              </button>
              <button
                onClick={() => loadPlay('https://folger-main-site-assets.s3.amazonaws.com/uploads/2022/11/macbeth_TXT_FolgerShakespeare.txt', 'Macbeth')}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                Macbeth
              </button>
              <button
                onClick={() => loadPlay('https://folger-main-site-assets.s3.amazonaws.com/uploads/2022/11/hamlet_TXT_FolgerShakespeare.txt', 'Hamlet')}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                Hamlet
              </button>
              <button
                onClick={() => loadPlay('https://folger-main-site-assets.s3.amazonaws.com/uploads/2022/11/king-lear_TXT_FolgerShakespeare.txt', 'King Lear')}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                King Lear
              </button>
              <button
                onClick={() => loadPlay('https://folger-main-site-assets.s3.amazonaws.com/uploads/2022/11/the-tempest_TXT_FolgerShakespeare.txt', 'The Tempest')}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                The Tempest
              </button>
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#6b7280',
              padding: '8px 12px',
              backgroundColor: '#f9fafb',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              More works available at{' '}
              <a 
                href="https://www.folger.edu/explore/shakespeares-works/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}
              >
                Folger Library
              </a>
            </div>
          </div>
          
          {/* Upload Section */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '12px', 
              color: '#1f2937',
              margin: '0 0 12px 0'
            }}>
              Upload Your Text
            </h3>
            <input
              type="file"
              accept="text/plain,.txt"
              onChange={handleFileUpload}
              style={{ 
                display: 'block',
                width: '100%',
                marginBottom: '8px',
                padding: '12px',
                border: '2px dashed #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151'
              }}
            />
            <div style={{ 
              fontSize: '12px', 
              color: '#6b7280',
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              Supports .txt files • Auto-detects author & language
            </div>
          </div>
          
          {/* URL Loading Section */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '12px', 
              color: '#1f2937',
              margin: '0 0 12px 0'
            }}>
              Load from URL
            </h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter URL to text file..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    loadTextFromURL();
                  }
                }}
              />
              <button
                onClick={loadTextFromURL}
                disabled={isLoading || !urlInput.trim()}
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  opacity: (isLoading || !urlInput.trim()) ? 0.5 : 1
                }}
              >
                Load
              </button>
            </div>
            <div style={{
              padding: '10px 12px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #d1fae5',
              borderRadius: '4px',
              marginBottom: '8px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#065f46', marginBottom: '4px' }}>
                Try this example:
              </div>
              <button
                onClick={() => {
                  setUrlInput('https://shakespeare-explainer.vercel.app/le-misanthrope-moliere.txt');
                  setTimeout(() => loadTextFromURL(), 100);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#059669',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textDecoration: 'underline',
                  padding: 0,
                  fontWeight: '500'
                }}
              >
                Le Misanthrope by Molière
              </button>
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#6b7280',
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              Project Gutenberg, GitHub, or any public text URL
            </div>
          </div>
          
          {/* Paste Text Section */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '12px', 
              color: '#1f2937',
              margin: '0 0 12px 0'
            }}>
              Paste Text
            </h3>
            <textarea
              placeholder="Paste classic literature text here..."
              onChange={(e) => {
                const text = e.target.value;
                if (text.trim()) {
                  const lines = text.split('\n').filter(line => line.trim() !== '');
                  setUploadedText(lines);
                  setOutline(generateOutline(lines));
                  
                  // Detect author and update UI
                  detectAuthorWithLLM(text).then(author => {
                    setDetectedAuthor(author);
                  });
                  
                  setChatMessages([{ role: 'system', content: 'Text pasted! Click or drag to select lines for explanation.' }]);
                  
                  // Auto-scroll to the beginning of the loaded text
                  setTimeout(() => {
                    const leftPanel = document.querySelector('.left-panel');
                    const firstTextLine = leftPanel?.querySelector('[data-line-index="0"]');
                    if (firstTextLine) {
                      firstTextLine.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }
                  }, 300);
                }
              }}
              style={{
                width: '100%',
                height: '120px',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                color: '#374151',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            <div style={{ 
              fontSize: '12px', 
              color: '#6b7280',
              textAlign: 'center',
              fontStyle: 'italic',
              marginTop: '8px'
            }}>
              Copy and paste from any source
            </div>
          </div>
        </div>
        <div 
          onMouseUp={!isMobile ? handleMouseUp : undefined} 
          onMouseLeave={!isMobile ? handleMouseUp : undefined}
          style={{ touchAction: 'manipulation' }}
        >
          {uploadedText.map((line, idx) => {
            const isSelected = selectedLines.some(item => item.index === idx);
            const isHighlighted = highlightedLines.has(idx);
            const isLastSelected = selectedLines.length > 0 && showButtons &&
              idx === Math.max(...selectedLines.map(item => item.index));
            
            return (
              <div key={idx}>
                <p
                  data-line-index={idx}
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
                    backgroundColor: isSelected ? '#3b82f6' : isHighlighted ? '#fbbf24' : 'white',
                    color: isSelected || isHighlighted ? 'white' : 'black',
                    borderRadius: '2px',
                    userSelect: 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={!isMobile ? (e) => {
                    if (!isSelected && !isHighlighted && !isDragging) e.target.style.backgroundColor = '#fde68a';
                  } : undefined}
                  onMouseOut={!isMobile ? (e) => {
                    if (!isSelected && !isHighlighted) {
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
{getUIText('explainSelected')} ({selectedLines.length})
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
{getUIText('clear')}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ fontWeight: 'bold', margin: 0 }}>{getUIText('shakespeareChat')}</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Language preference controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {/* My Language Setting */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <span style={{ fontSize: '10px', color: '#6b7280' }}>My Language:</span>
                <select
                  value={myLanguage}
                  onChange={(e) => setMyLanguage(e.target.value)}
                  style={{
                    padding: '1px 4px',
                    fontSize: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '3px',
                    backgroundColor: 'white',
                    color: '#374151'
                  }}
                >
                  <option value="en">🇬🇧 English</option>
                  <option value="fr">🇫🇷 French</option>
                  <option value="de">🇩🇪 German</option>
                  <option value="es">🇪🇸 Spanish</option>
                  <option value="it">🇮🇹 Italian</option>
                </select>
              </div>
              
              {/* Response Language Setting */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <span style={{ fontSize: '10px', color: '#6b7280' }}>Respond in:</span>
                <select
                  value={responseLanguage}
                  onChange={(e) => setResponseLanguage(e.target.value)}
                  style={{
                    padding: '1px 4px',
                    fontSize: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '3px',
                    backgroundColor: 'white',
                    color: '#374151'
                  }}
                >
                  <option value="match">📚 Text Language</option>
                  <option value="native">🏠 My Language</option>
                </select>
              </div>
              
              {/* Language reset button */}
              {uiLanguage !== 'en' && (
                <button
                  onClick={() => {
                    setUiLanguage('en');
                    setResponseLanguage('match');
                    setMyLanguage('en');
                  }}
                  style={{
                    padding: '1px 4px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '9px'
                  }}
                  title="Reset all language settings to English"
                >
                  Reset
                </button>
              )}
              
              {/* Resubmit button - show when there's a last message and not loading */}
              {lastUserMessage && chatMessages.length > 0 && (
                <button
                  onClick={resubmitLastMessage}
                  disabled={isLoading}
                  style={{
                    padding: '2px 6px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    opacity: isLoading ? 0.5 : 1
                  }}
                  title="Resubmit last question with current language preference"
                >
                  🔄 Resubmit
                </button>
              )}
            </div>
            
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
{getUIText('saveChat')}
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
{getUIText('summary')}
                </button>
              </div>
            )}
          </div>
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
{msg.role === 'user' ? getUIText('you') : msg.role === 'assistant' ? getUIText('shakespeareExpert') : getUIText('system')}
              </div>
              <div 
                style={{ 
                  whiteSpace: 'pre-wrap',
                  cursor: msg.role === 'user' && msg.lineIndices ? 'pointer' : 'default'
                }}
                onClick={msg.role === 'user' && msg.lineIndices ? () => jumpToText(msg.lineIndices) : undefined}
                title={msg.role === 'user' && msg.lineIndices ? 'Click to jump to original text' : undefined}
              >
                {msg.content}
                {msg.role === 'user' && msg.lineIndices && (
                  <span style={{ 
                    fontSize: '10px', 
                    color: '#666', 
                    marginLeft: '8px',
                    fontStyle: 'italic'
                  }}>
{getUIText('clickToJump')}
                  </span>
                )}
              </div>
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
{getUIText('typing')}
            </div>
          )}
        </div>
        
        {/* Chat input */}
        <form onSubmit={sendChatMessage} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={getUIText('askFollowUp')}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: 'black'
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
{getUIText('send')}
          </button>
        </form>
      </div>
      
    </div>
    </>
  );
}
