import { useState, useEffect } from 'react';
import Head from 'next/head';
import AuthModal from '../components/AuthModal';
import UpgradeModal from '../components/UpgradeModal';
import Header from '../components/Header';
import jwt from 'jsonwebtoken';
import { UsageService } from '../lib/usage';
import prisma from '../lib/db';
import React from 'react';
import { FixedSizeList as List } from 'react-window';

const SINGLE_WORK = process.env.NEXT_PUBLIC_SINGLE_WORK;
const FREEMIUM_LIMIT = 100; // TEMP: Increase for testing, revert to 3 for production

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

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [usage, setUsage] = useState(0);
  const [nextReset, setNextReset] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showTextInputForms, setShowTextInputForms] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const [listHeight, setListHeight] = useState(600); // Default for SSR

  const [isPortrait, setIsPortrait] = React.useState(false);

  // Google Docs–style drag selection
  const leftPanelRef = React.useRef();
  const autoScrollInterval = React.useRef(null);
  const dragStartRef = React.useRef(null);
  const isDraggingRef = React.useRef(false);
  const lineHeightRef = React.useRef(24);
  const firstLineRef = React.useRef();
  const secondLineRef = React.useRef();
  const prevSelectionRef = React.useRef([]);
  const lastMousePosRef = React.useRef({ x: 0, y: 0 });
  const selectedLinesRef = React.useRef([]);
  const clickedIndexRef = React.useRef(null);

  // Add refs to track mobile selection start
  const mobileSelectionStartRef = React.useRef(null);

  // Add a ref for the header
  const headerRef = React.useRef();

  // Add refs to track touch timing and position
  const touchStartTimeRef = React.useRef(0);
  const touchStartYRef = React.useRef(0);
  const touchStartXRef = React.useRef(0);

  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i].index !== b[i].index) return false;
    }
    return true;
  };

  const handleMouseDown = (line, index) => {
    window.getSelection()?.removeAllRanges();
    setIsDragging(true);
    isDraggingRef.current = true;
    setDragStart(index);
    dragStartRef.current = index;
    setShowButtons(false);
    clickedIndexRef.current = index;
    // For single click, immediately set selection
    setSelectedLines([{ line, index }]);
    selectedLinesRef.current = [{ line, index }];
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
  };

  const updateSelectionAtMouse = (clientX, clientY) => {
    if (!isDraggingRef.current || dragStartRef.current === null) return;
    let hoverIdx = null;
    const elements = document.elementsFromPoint(clientX, clientY);
    for (const el of elements) {
      if (el.hasAttribute && el.hasAttribute('data-line-index')) {
        hoverIdx = parseInt(el.getAttribute('data-line-index'), 10);
        break;
      }
    }
    if (hoverIdx === null) {
      const panel = leftPanelRef.current;
      if (!panel) return;
      const rect = panel.getBoundingClientRect();
      if (clientY < rect.top) hoverIdx = 0;
      else if (clientY > rect.bottom) hoverIdx = uploadedText.length - 1;
      else return;
    }
    const start = Math.min(dragStartRef.current, hoverIdx);
    const end = Math.max(dragStartRef.current, hoverIdx);
    const selection = [];
    for (let i = start; i <= end; i++) {
      selection.push({ line: uploadedText[i], index: i });
    }
    if (!arraysEqual(selection, prevSelectionRef.current)) {
      setSelectedLines(selection);
      selectedLinesRef.current = selection;
      prevSelectionRef.current = selection;
    }
  };

  const handleGlobalMouseMove = (e) => {
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    updateSelectionAtMouse(e.clientX, e.clientY);
    // Auto-scroll if near top/bottom
    const panel = leftPanelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    const edgeThreshold = 40;
    if (e.clientY < rect.top + edgeThreshold) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = setInterval(() => {
        panel.scrollTop = Math.max(0, panel.scrollTop - 16);
        // Simulate selection update during auto-scroll
        updateSelectionAtMouse(lastMousePosRef.current.x, lastMousePosRef.current.y);
      }, 16);
    } else if (e.clientY > rect.bottom - edgeThreshold) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = setInterval(() => {
        panel.scrollTop = Math.min(panel.scrollHeight - panel.clientHeight, panel.scrollTop + 16);
        // Simulate selection update during auto-scroll
        updateSelectionAtMouse(lastMousePosRef.current.x, lastMousePosRef.current.y);
      }, 16);
    } else {
      clearInterval(autoScrollInterval.current);
    }
  };

  const handleGlobalMouseUp = (e) => {
    clearInterval(autoScrollInterval.current);
    window.removeEventListener('mousemove', handleGlobalMouseMove);
    window.removeEventListener('mouseup', handleGlobalMouseUp);
    setIsDragging(false);
    isDraggingRef.current = false;
    setDragStart(null);
    dragStartRef.current = null;

    // Detect if this was a single click (no drag)
    let singleClickIndex = null;
    if (clickedIndexRef.current !== null) {
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      for (const el of elements) {
        if (el.hasAttribute && el.hasAttribute('data-line-index')) {
          singleClickIndex = parseInt(el.getAttribute('data-line-index'), 10);
          break;
        }
      }
    }
    if (
      clickedIndexRef.current !== null &&
      singleClickIndex === clickedIndexRef.current &&
      selectedLinesRef.current.length === 1 &&
      selectedLinesRef.current[0].index === clickedIndexRef.current
    ) {
      explainSelectedText(selectedLinesRef.current);
      setTimeout(() => setSelectedLines([]), 100);
      selectedLinesRef.current = [];
      clickedIndexRef.current = null;
      return;
    }

    if (selectedLinesRef.current.length > 0) {
      explainSelectedText(selectedLinesRef.current);
      setTimeout(() => setSelectedLines([]), 100);
      selectedLinesRef.current = [];
    }
    clickedIndexRef.current = null;
  };

  // When text is loaded (paste, upload, URL, quick load), set showTextInputForms to false
  const handleTextLoaded = (lines) => {
    setUploadedText(lines);
    setShowTextInputForms(false);
    console.log(`[DEBUG] handleTextLoaded called. lines: ${lines.length}, showTextInputForms set to false`);
  };

  // Download and load a play directly
  const loadPlay = async (url, title) => {
    try {
      setIsLoading(true);
      // Fetch via our own API to avoid CORS
      const res = await fetch(`/api/fetch-text?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error('Failed to load text');
      const text = await res.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      console.log(`[DEBUG] Loaded play: ${title}, lines: ${lines.length}`); // Debug log
      handleTextLoaded(lines);
      setOutline(generateOutline(lines));
      setDetectedAuthor('Shakespeare');
      // Preserve chat history and just add a system message about the new text
      setChatMessages(prev => [...prev, { role: 'system', content: 'New text loaded! Click or drag to select lines for explanation.' }]);
    } catch (error) {
      setChatMessages([{ role: 'system', content: 'Failed to load text.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load text from URL
  const loadTextFromURL = async (providedUrl = null) => {
    const urlToLoad = providedUrl || urlInput.trim();
    if (!urlToLoad) return;
    
    try {
      setIsLoading(true);
      console.log('🌐 Loading text from URL:', urlToLoad);
      
      // Fetch via our own API to avoid CORS
      const res = await fetch(`/api/fetch-text?url=${encodeURIComponent(urlToLoad)}`);
      if (!res.ok) throw new Error('Failed to load text');
      const text = await res.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      
      console.log('✅ Text loaded successfully, lines:', lines.length);
      handleTextLoaded(lines);
      setOutline(generateOutline(lines));
      setDetectedAuthor('Shakespeare');
      setChatMessages(prev => [...prev, { role: 'system', content: 'Text loaded! Click or drag to select lines for explanation.' }]);
    } catch (error) {
      console.error('❌ Failed to load text from URL:', error);
      setChatMessages([{ role: 'system', content: 'Failed to load text.' }]);
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
      setUsage(u => u + 1);
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

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Handle Google OAuth token in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const token = url.searchParams.get('token');
      const error = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');
      
      // Handle OAuth errors
      if (error) {
        console.error('OAuth error:', error, errorDescription);
        setChatMessages(prev => [...prev, { 
          role: 'system', 
          content: `Authentication failed: ${errorDescription || error}. Please try again.` 
        }]);
        // Clean up URL
        url.searchParams.delete('error');
        url.searchParams.delete('error_description');
        window.history.replaceState({}, document.title, url.pathname + url.search);
        setUserLoading(false);
        return;
      }
      
      if (token) {
        console.log('🎉 Google OAuth token received! Processing sign in...');
        localStorage.setItem('authToken', token);
        // Remove token from URL
        url.searchParams.delete('token');
        window.history.replaceState({}, document.title, url.pathname + url.search);
        // Optionally, fetch user info
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.json();
          })
          .then(data => {
            if (data.user) {
              console.log('✅ Google sign in successful!', { user: data.user });
              setUser(data.user);
            } else {
              console.log('❌ Failed to fetch user data after Google sign in:', data);
            }
            setUserLoading(false);
          })
          .catch(error => {
            console.error('❌ Error fetching user data after Google sign in:', error);
            // On mobile, sometimes the token might be corrupted, clear it
            if (isMobile) {
              localStorage.removeItem('authToken');
            }
            setUserLoading(false);
          });
      } else {
        // If already logged in, fetch user info
        const storedToken = localStorage.getItem('authToken');
        if (storedToken && !user) {
          console.log('🔄 Found existing token, fetching user data...');
          console.log('Current URL:', window.location.href);
          console.log('Token exists:', !!storedToken);
          fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          })
            .then(res => res.json())
            .then(data => {
              if (data.user) {
                console.log('✅ User session restored!', { user: data.user });
                setUser(data.user);
              } else {
                console.log('❌ Failed to restore user session');
              }
              setUserLoading(false);
            })
            .catch(() => setUserLoading(false));
        } else {
          setUserLoading(false);
        }
      }
    }
  }, []);

  // Fetch usage info on mount and after each explanation
  useEffect(() => {
    async function fetchUsage() {
      if (!user) return;
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/usage', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsage(data.usage);
        setNextReset(data.nextReset);
        setIsPremium(data.isPremium);
      }
    }
    fetchUsage();
  }, [user, chatMessages.length]);

  // Update listHeight based on header height
  useEffect(() => {
    function updateListHeight() {
      const headerHeight = headerRef.current ? headerRef.current.offsetHeight : 0;
      setListHeight(window.innerHeight - headerHeight);
    }
    updateListHeight();
    window.addEventListener('resize', updateListHeight);
    window.addEventListener('orientationchange', updateListHeight);
    return () => {
      window.removeEventListener('resize', updateListHeight);
      window.removeEventListener('orientationchange', updateListHeight);
    };
  }, []);

  useEffect(() => {
    function checkOrientation() {
      setIsPortrait(window.innerHeight > window.innerWidth);
    }
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const handleMobileLineClick = (line, index) => {
    console.log('📱 Mobile line click:', line, 'index:', index);
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime;
    
    // Double tap detection (within 500ms)
    if (lastClickedIndex === index && timeDiff < 500) {
      // Double tap - explain this line immediately and clear selection
      setSelectedLines([]);  // Clear first to avoid showing buttons
      selectedLinesRef.current = [];  // Keep ref in sync
      setShowButtons(false);
      setTimeout(() => {
        const lineToExplain = [{ line, index }];
        setSelectedLines(lineToExplain);
        selectedLinesRef.current = lineToExplain;  // Keep ref in sync
        explainSelectedText(lineToExplain);
        setSelectedLines([]);  // Clear after submitting
        selectedLinesRef.current = [];  // Keep ref in sync
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
        
        // Update ref to stay in sync with state
        selectedLinesRef.current = newSelection;
        
        // Show buttons if we have selections
        setShowButtons(newSelection.length > 0);
        return newSelection;
      });
      setLastClickTime(currentTime);
      setLastClickedIndex(index);
    }
  };

  const explainMultipleLines = () => {
    console.log('🔘 explainMultipleLines called, selected lines:', selectedLines.length);
    
    if (selectedLines.length > 0) {
      console.log('✅ Calling explainSelectedText with selected lines');
      explainSelectedText(selectedLines);
      setSelectedLines([]); // Clear selection after submitting
      setShowButtons(false); // Hide buttons after submitting
      selectedLinesRef.current = [];
    } else {
      console.log('❌ No selected lines to explain');
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
          handleTextLoaded(lines);
          
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

  const explainSelectedText = async (lines) => {
    console.log('🔍 explainSelectedText called with', lines.length, 'lines');
    if (!lines || lines.length === 0) {
      console.log('❌ No lines provided to explain');
      return;
    }
    // Check authentication only for desktop, free access on mobile
    if (!isMobile && !user) {
      console.log('❌ Desktop user not signed in');
      setChatMessages(prev => [...prev, { role: 'system', content: 'Please sign in to use this feature.' }]);
      return;
    }
    if (isMobile) {
      console.log('📱 Mobile free access mode - no authentication required');
    } else {
      console.log('💻 Desktop authenticated access');
    }
    const textToExplain = lines.map(item => item.line).join('\n');
    const userMessage = `Explain the meaning and context of the following lines from Shakespeare. Do not mention the act, scene, or line number.\n\n"""
${textToExplain}
"""`;
    const lineIndices = lines.map(item => item.index);
    console.log('📝 Adding user message to chat');
    // Only show the quote in the chat, not the full prompt
    setChatMessages(prev => [...prev, { role: 'user', content: textToExplain, lineIndices }]);
    setTimeout(() => {
      const chatContainer = document.getElementById('chat-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
      const userMessages = document.querySelectorAll('[data-role="user"]');
      const lastUserMessage = userMessages[userMessages.length - 1];
      if (lastUserMessage) {
        lastUserMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
    setIsLoading(true);
    try {
      console.log('📱 Is mobile:', isMobile);
      
      const requestPayload = { 
        messages: [...chatMessages, { role: 'user', content: userMessage }], 
        responseLanguage: responseLanguage, 
        myLanguage: myLanguage,
        freeAccess: isMobile  // Flag for API to bypass auth on mobile only
      };
      
      // Include auth header only for desktop
      const headers = { 'Content-Type': 'application/json' };
      if (!isMobile) {
        const token = localStorage.getItem('authToken');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        console.log('💻 Desktop: Using auth token');
      } else {
        console.log('📱 Mobile: Free access mode');
      }
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestPayload),
      });
      
      console.log('📡 API response status:', res.status, res.statusText);
      
      // Show API response status on mobile for debugging
      if (isMobile) {
        setChatMessages(prev => [...prev, { 
          role: 'system', 
          content: `🔧 Debug: API Response ${res.status} ${res.statusText}` 
        }]);
      }
      
      let data;
      try {
        data = await res.json();
        console.log('📊 API response data:', data);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        setChatMessages(prev => [...prev, { role: 'system', content: `Mobile Parse Error: ${parseError.message}. Server may have returned HTML instead of JSON.` }]);
        return;
      }
      
      if (res.status === 401) {
        const authMessage = isMobile 
          ? 'Authentication failed on mobile. Please sign out and sign in again to refresh your session.'
          : 'Authentication failed. Please sign in again.';
        setChatMessages(prev => [...prev, { role: 'system', content: authMessage }]);
        // Clear invalid token
        localStorage.removeItem('authToken');
        setUser(null);
        return;
      }
      
      if (res.status === 429) {
        setUpgradeMessage(data.message || 'You\'ve reached your daily limit. Upgrade to Premium for unlimited access!');
        setShowUpgradeModal(true);
        setChatMessages(prev => [...prev, { role: 'system', content: data.message || 'Daily limit reached. Please upgrade to continue.' }]);
        setUsage(data.usage !== undefined ? data.usage : FREEMIUM_LIMIT);
        return;
      }
      
      if (!res.ok) {
        console.error('❌ API error:', res.status, data);
        setChatMessages(prev => [...prev, { role: 'system', content: `API Error (${res.status}): ${data.error || 'Failed to get response'}` }]);
        return;
      }
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      setUsage(u => u + 1);
      if (data.response) {
        const detectedLang = detectUILanguage(data.response);
        if (detectedLang !== uiLanguage) {
          setUiLanguage(detectedLang);
        }
      }
      
      // Auto-scroll to show the assistant response
      setTimeout(() => {
        const assistantMessages = document.querySelectorAll('[data-role="assistant"]');
        const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
        if (lastAssistantMessage) {
          lastAssistantMessage.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
          });
        }
      }, 100);
    } catch (err) {
      console.error('❌ Chat API error:', err);
      const errorMessage = isMobile 
        ? `Mobile Network Error: ${err.message}. Common causes: CORS, network timeout, or browser restrictions. Try refreshing the page.`
        : `Network Error: ${err.message || 'Failed to connect to server. Please check your connection and try again.'}`;
      setChatMessages(prev => [...prev, { role: 'system', content: errorMessage }]);
      
      // Auto-scroll even for error responses
      setTimeout(() => {
        const assistantMessages = document.querySelectorAll('[data-role="assistant"]');
        const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
        if (lastAssistantMessage) {
          lastAssistantMessage.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
          });
        }
      }, 100);
    }
    setIsLoading(false);
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    
    // Check authentication only for desktop, free access on mobile
    if (!isMobile && !user) {
      setChatMessages(prev => [...prev, { role: 'system', content: 'Please sign in to use this feature.' }]);
      return;
    }
    
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
      console.log('sendChatMessage - Mobile:', isMobile, 'ResponseLanguage:', responseLanguage);
      
      // Include auth header only for desktop
      const headers = { 'Content-Type': 'application/json' };
      if (!isMobile) {
        const token = localStorage.getItem('authToken');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ 
          messages: [...chatMessages, { role: 'user', content: userMessage }],
          responseLanguage: responseLanguage,
          myLanguage: myLanguage,
          freeAccess: isMobile  // Flag for API to bypass auth on mobile
        }),
      });
      const data = await res.json();
      
      // Handle rate limiting and upgrade prompts
      if (res.status === 429) {
        setUpgradeMessage(data.message || 'You\'ve reached your daily limit. Upgrade to Premium for unlimited access!');
        setShowUpgradeModal(true);
        setChatMessages(prev => [...prev, { role: 'system', content: data.message || 'Daily limit reached. Please upgrade to continue.' }]);
        setUsage(u => u + 1);
        return;
      }
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }
      
      // Add assistant response to chat and detect language
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      setUsage(u => u + 1);
      
      // Update UI language based on assistant response
      if (data.response) {
        const detectedLang = detectUILanguage(data.response);
        if (detectedLang !== uiLanguage) {
          setUiLanguage(detectedLang);
        }
      }
      
      // Auto-scroll to show the assistant response
      setTimeout(() => {
        const assistantMessages = document.querySelectorAll('[data-role="assistant"]');
        const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
        if (lastAssistantMessage) {
          lastAssistantMessage.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
          });
        }
      }, 100);
    } catch (err) {
      console.error('Error:', err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
      
      // Auto-scroll even for error responses
      setTimeout(() => {
        const assistantMessages = document.querySelectorAll('[data-role="assistant"]');
        const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
        if (lastAssistantMessage) {
          lastAssistantMessage.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
          });
        }
      }, 100);
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
    if (!text || typeof text !== 'string') {
      return 'en'; // Default to English if no text or invalid text
    }
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
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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

  // Add logout handler
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    window.location.reload();
  };

  // Single-work mode: load play on mount
  useEffect(() => {
    if (SINGLE_WORK) {
      // Map slug to display name
      const playMap = {
        'romeo-and-juliet': 'Romeo and Juliet',
        'macbeth': 'Macbeth',
        'hamlet': 'Hamlet',
        'king-lear': 'King Lear',
        'the-tempest': 'The Tempest',
        // Add more as needed
      };
      const playTitle = playMap[SINGLE_WORK] || 'Selected Play';
      fetch(`/${SINGLE_WORK}.txt`)
        .then(res => res.text())
        .then(text => {
          const lines = text.split('\n').filter(line => line.trim() !== '');
          handleTextLoaded(lines);
          setOutline(generateOutline(lines));
          setDetectedAuthor('Shakespeare');
          setChatMessages([{ role: 'system', content: `${playTitle} loaded! Click or drag to select lines for explanation.` }]);
        });
    }
  }, []);

  // Sign in/out handlers
  const handleSignIn = () => setShowAuthModal(true);
  const handleSignOut = () => {
    console.log('🚪 Signing out user');
    try {
      // Clear all auth-related data
      localStorage.removeItem('authToken');
      
      // Double-check token is cleared
      const tokenCheck = localStorage.getItem('authToken');
      console.log('🔍 Token after removal:', tokenCheck ? 'still present!' : 'cleared');
      
      // Clear any other potential auth data
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      
      // Clear all state immediately
      setUser(null);
      setUserLoading(false);
      setChatMessages([]);
      setSelectedLines([]);
      setShowButtons(false);
      setUploadedText([]);
      setDetectedAuthor('Shakespeare');
      selectedLinesRef.current = [];
      
      console.log('✅ Sign out successful, redirecting to clean page');
      // Try redirect instead of reload - sometimes reload can be blocked
      window.location.href = window.location.origin + window.location.pathname;
    } catch (error) {
      console.error('❌ Sign out error:', error);
      // Multiple fallback attempts
      try {
        window.location.reload(true); // Force reload from server
      } catch (reloadError) {
        console.error('❌ Reload failed, trying href redirect');
        window.location.href = '/';
      }
    }
  };

  useEffect(() => {
    if (firstLineRef.current && secondLineRef.current) {
      const top1 = firstLineRef.current.getBoundingClientRect().top;
      const top2 = secondLineRef.current.getBoundingClientRect().top;
      lineHeightRef.current = Math.max(8, top2 - top1);
    } else if (firstLineRef.current) {
      lineHeightRef.current = firstLineRef.current.offsetHeight || 24;
    }
  }, [uploadedText.length]);

  // Handle divider resizing only
  const handleDividerStart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const getClientX = (e) => e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX);
    const startX = getClientX(e);

    const handleMove = (e) => {
      e.preventDefault();
      const currentX = getClientX(e);
      // Handle panel resizing
      const containerWidth = window.innerWidth;
      const newLeftWidth = (currentX / containerWidth) * 100;
      const constrainedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
      const leftPanel = document.querySelector('.left-panel');
      const rightPanel = leftPanel.nextElementSibling;
      // Only set widths, do not set divider.style.right
      if (leftPanel && rightPanel) {
        leftPanel.style.width = `${constrainedWidth}%`;
        rightPanel.style.width = `${100 - constrainedWidth}%`;
      }
    };

    const handleEnd = () => {
      const leftPanel = document.querySelector('.left-panel');
      if (leftPanel) {
        const currentWidth = parseFloat(leftPanel.style.width);
        setLeftPanelWidth(currentWidth);
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

  // Dynamic viewport height for mobile
  useEffect(() => {
    function setRealVh() {
      document.documentElement.style.setProperty('--real-vh', `${window.innerHeight}px`);
    }
    setRealVh();
    window.addEventListener('resize', setRealVh);
    window.addEventListener('orientationchange', setRealVh);
    return () => {
      window.removeEventListener('resize', setRealVh);
      window.removeEventListener('orientationchange', setRealVh);
    };
  }, []);

  // Add a function to handle jumping and highlighting
  const jumpToTextAndHighlight = (lineIndices) => {
    if (!lineIndices || lineIndices.length === 0) return;
    // Highlight the lines
    setHighlightedLines(new Set(lineIndices));
    // Scroll to the first line
    const firstIndex = Math.min(...lineIndices);
    setTimeout(() => {
      const lineElement = document.querySelector(`[data-line-index="${firstIndex}"]`);
      if (lineElement) {
        lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
    // Remove highlight after 2 seconds
    setTimeout(() => {
      setHighlightedLines(new Set());
    }, 2000);
  };

  // After defining showTextInputForms state:
  useEffect(() => {
    if (typeof SINGLE_WORK !== 'undefined' && SINGLE_WORK) {
      setShowTextInputForms(false);
    }
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return (
    <>
      <Head>
        <title>Shakespeare Explainer</title>
      </Head>

      <div
        style={{
          display: 'flex',
          flexDirection: isMobile && isPortrait ? 'column' : 'row',
          height: isMobile ? '100vh' : 'calc(var(--real-vh, 100vh))',
          fontFamily: 'monospace',
          fontSize: '12px',
          minWidth: isMobile ? 'auto' : '1024px',
          overflow: 'hidden',
        }}
      >
        <div
          className="left-panel"
          ref={leftPanelRef}
          style={{
            width: isMobile && isPortrait ? '100%' : `${leftPanelWidth}%`,
            height: isMobile && isPortrait ? '50%' : 'calc(var(--real-vh, 100vh))',
            padding: '16px',
            paddingRight: 0,
            backgroundColor: 'white',
            color: 'black',
            position: 'relative',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            overflow: showTextInputForms ? 'auto' : (isMobile ? 'visible' : 'hidden'),
          }}
        >
          {/* Input Forms always rendered above the text panel when showTextInputForms is true */}
          {showTextInputForms && (
            <div style={{ marginBottom: isMobile ? 12 : 16 }}>
              {/* Quick Load Section */}
              <div style={{ marginBottom: isMobile ? '12px' : '16px', flexShrink: 0 }}>
                <h3 style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '600', marginBottom: isMobile ? '8px' : '12px', color: '#1f2937' }}>Popular Works</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? '6px' : '8px', marginBottom: isMobile ? '8px' : '12px' }}>
                  <button onClick={() => loadPlay('https://folger-main-site-assets.s3.amazonaws.com/uploads/2022/11/romeo-and-juliet_TXT_FolgerShakespeare.txt', 'Romeo and Juliet')} style={{ padding: isMobile ? '6px 8px' : '8px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: isMobile ? '11px' : '13px', fontWeight: '500' }}>Romeo & Juliet</button>
                  <button onClick={() => loadPlay('https://folger-main-site-assets.s3.amazonaws.com/uploads/2022/11/macbeth_TXT_FolgerShakespeare.txt', 'Macbeth')} style={{ padding: isMobile ? '6px 8px' : '8px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: isMobile ? '11px' : '13px', fontWeight: '500' }}>Macbeth</button>
                  <button onClick={() => loadPlay('https://folger-main-site-assets.s3.amazonaws.com/uploads/2022/11/hamlet_TXT_FolgerShakespeare.txt', 'Hamlet')} style={{ padding: isMobile ? '6px 8px' : '8px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: isMobile ? '11px' : '13px', fontWeight: '500' }}>Hamlet</button>
                  <button onClick={() => loadPlay('https://folger-main-site-assets.s3.amazonaws.com/uploads/2022/11/king-lear_TXT_FolgerShakespeare.txt', 'King Lear')} style={{ padding: isMobile ? '6px 8px' : '8px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: isMobile ? '11px' : '13px', fontWeight: '500' }}>King Lear</button>
                  <button onClick={() => loadPlay('https://folger-main-site-assets.s3.amazonaws.com/uploads/2022/11/the-tempest_TXT_FolgerShakespeare.txt', 'The Tempest')} style={{ padding: isMobile ? '6px 8px' : '8px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: isMobile ? '11px' : '13px', fontWeight: '500' }}>The Tempest</button>
                </div>
              </div>
              {/* Upload Section */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: isMobile ? '12px' : '16px', marginBottom: isMobile ? '12px' : '20px', flexShrink: 0 }}>
                <h3 style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '600', marginBottom: isMobile ? '8px' : '12px', color: '#1f2937' }}>Upload Your Text</h3>
                <input type="file" accept="text/plain,.txt" onChange={handleFileUpload} style={{ display: 'block', width: '100%', marginBottom: isMobile ? '6px' : '8px', padding: isMobile ? '8px' : '12px', border: '2px dashed #d1d5db', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer', fontSize: isMobile ? '12px' : '14px', color: '#374151' }} />
                <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', fontStyle: 'italic' }}>Supports .txt files • Auto-detects author & language</div>
              </div>
              {/* URL Loading Section */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: isMobile ? '12px' : '16px', marginBottom: isMobile ? '12px' : '20px', flexShrink: 0 }}>
                <h3 style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '600', marginBottom: isMobile ? '8px' : '12px', color: '#1f2937' }}>Load from URL</h3>
                <div style={{ display: 'flex', gap: isMobile ? '6px' : '8px', marginBottom: isMobile ? '8px' : '12px' }}>
                  <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="Enter URL to text file..." disabled={isLoading} style={{ flex: 1, padding: isMobile ? '8px' : '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '16px', backgroundColor: 'white', color: '#374151', WebkitAppearance: 'none', WebkitTapHighlightColor: 'transparent', outline: 'none', transform: 'translateZ(0)' }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); loadTextFromURL(); } }} />
                  <button onClick={loadTextFromURL} disabled={isLoading || !urlInput.trim()} style={{ padding: isMobile ? '8px 12px' : '12px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: isMobile ? '12px' : '14px', fontWeight: '500', opacity: (isLoading || !urlInput.trim()) ? 0.5 : 1 }}>Load</button>
                </div>
                <div style={{ padding: '10px 12px', backgroundColor: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: '4px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#065f46', marginBottom: '4px' }}>Try this example:</div>
                  <button onClick={() => { 
                    const exampleUrl = 'https://shakespeare-explainer.vercel.app/le-misanthrope-moliere.txt';
                    setUrlInput(exampleUrl); 
                    loadTextFromURL(exampleUrl); 
                  }} style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', padding: 0, fontWeight: '500' }}>Le Misanthrope by Molière</button>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', fontStyle: 'italic' }}>Project Gutenberg, GitHub, or any public text URL</div>
              </div>
              {/* Paste Text Section */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: isMobile ? '12px' : '16px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <h3 style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '600', marginBottom: isMobile ? '8px' : '12px', color: '#1f2937' }}>Paste Text</h3>
                <textarea placeholder="Paste classic literature text here..." onInput={(e) => { const text = e.target.value; if (text.trim()) { const lines = text.split('\n').filter(line => line.trim() !== ''); setUploadedText(lines); setOutline(generateOutline(lines)); detectAuthorWithLLM(text).then(author => { setDetectedAuthor(author); }); setChatMessages(prev => [...prev, { role: 'system', content: 'Text pasted! Click or drag to select lines for explanation.' }]); setTimeout(() => { const leftPanel = document.querySelector('.left-panel'); const firstTextLine = leftPanel?.querySelector('[data-line-index=\"0\"]'); if (firstTextLine) { firstTextLine.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, 300); } }} onChange={(e) => { const text = e.target.value; if (text.trim()) { const lines = text.split('\n').filter(line => line.trim() !== ''); setUploadedText(lines); setOutline(generateOutline(lines)); detectAuthorWithLLM(text).then(author => { setDetectedAuthor(author); }); setChatMessages(prev => [...prev, { role: 'system', content: 'Text pasted! Click or drag to select lines for explanation.' }]); setTimeout(() => { const leftPanel = document.querySelector('.left-panel'); const firstTextLine = leftPanel?.querySelector('[data-line-index=\"0\"]'); if (firstTextLine) { firstTextLine.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, 300); } }} style={{ flex: 1, width: '100%', minHeight: isMobile ? '80px' : '120px', padding: isMobile ? '8px' : '12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '16px', backgroundColor: 'white', color: '#374151', resize: 'none', fontFamily: 'inherit', WebkitAppearance: 'none', WebkitTapHighlightColor: 'transparent', outline: 'none', lineHeight: '1.5', transform: 'translateZ(0)' }} />
                <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', fontStyle: 'italic', marginTop: '8px' }}>Copy and paste from any source</div>
              </div>
            </div>
          )}
          {/* Always show the text panel and chat if there is loaded text */}
          {(() => { console.log('Text panel condition check - uploadedText.length:', uploadedText.length); return uploadedText.length > 0; })() && (
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              {isMobile ? (
                <div style={{ flex: 1, minHeight: 0, height: '100%', overflowY: 'scroll', background: 'white', WebkitOverflowScrolling: 'touch' }}>
                  {uploadedText.map((line, index) => {
                    const isSelected = selectedLines.some(item => item.index === index);
                    const isHighlighted = highlightedLines.has(index);
                    const isLastSelected = selectedLines.length > 0 && showButtons && index === Math.max(...selectedLines.map(item => item.index));
                    return (
                      <div key={index}>
                        <p
                          ref={index <= 1 ? el => { if (index === 0) firstLineRef.current = el; if (index === 1) secondLineRef.current = el; } : undefined}
                          data-line-index={index}
                          onTouchStart={isMobile ? (e) => {
                            const touch = e.touches ? e.touches[0] : e;
                            touchStartTimeRef.current = Date.now();
                            touchStartYRef.current = touch.clientY;
                            touchStartXRef.current = touch.clientX;
                          } : undefined}
                          onTouchEnd={isMobile ? (e) => {
                            const touch = e.changedTouches ? e.changedTouches[0] : e;
                            const dt = Date.now() - touchStartTimeRef.current;
                            const dy = Math.abs(touch.clientY - touchStartYRef.current);
                            const dx = Math.abs(touch.clientX - touchStartXRef.current);
                            // Only treat as selection if short tap or slow, short drag
                            if (dt < 200 && dx < 10 && dy < 10) {
                              // Simulate the old selection logic
                              if (mobileSelectionStartRef.current === null) {
                                mobileSelectionStartRef.current = index;
                                setSelectedLines([{ line, index }]);
                                selectedLinesRef.current = [{ line, index }];
                              } else {
                                const start = Math.min(mobileSelectionStartRef.current, index);
                                const end = Math.max(mobileSelectionStartRef.current, index);
                                const linesToExplain = [];
                                for (let i = start; i <= end; i++) {
                                  linesToExplain.push({ line: uploadedText[i], index: i });
                                }
                                setSelectedLines(linesToExplain);
                                selectedLinesRef.current = linesToExplain;
                                setShowButtons(true);
                                mobileSelectionStartRef.current = null;
                              }
                            }
                          } : undefined}
                          style={{
                            cursor: 'pointer',
                            padding: isMobile ? '2px 6px' : '4px',
                            backgroundColor: isSelected ? '#3b82f6' : highlightedLines.has(index) ? '#fef08a' : isHighlighted ? '#fbbf24' : (mobileSelectionStartRef.current === index) ? '#fde68a' : 'white',
                            color: isSelected || isHighlighted ? 'white' : 'black',
                            borderRadius: '2px',
                            fontSize: isMobile ? '12px' : '14px',
                            lineHeight: isMobile ? '1.3' : '1.5',
                            userSelect: 'text',
                            transition: 'background-color 0.2s ease',
                            minHeight: 24
                          }}
                        >
                          {line}
                          {mobileSelectionStartRef.current === index && (
                            <span style={{ marginLeft: 8, background: '#fde68a', color: '#b45309', borderRadius: 4, fontSize: 12, padding: '2px 6px', fontWeight: 600 }}>
                              Start
                            </span>
                          )}
                        </p>
                        {isLastSelected && (
                          <div style={{ marginTop: '8px', marginBottom: '8px', display: 'flex', gap: '8px' }}>
                            <button onClick={explainMultipleLines} style={{ padding: isMobile ? '6px 8px' : '8px 12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: isMobile ? '12px' : '14px', fontWeight: 'bold' }}>{getUIText('explainSelected')} ({selectedLines.length})</button>
                            <button onClick={() => { setSelectedLines([]); setShowButtons(false); }} style={{ padding: isMobile ? '6px 8px' : '8px 12px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: isMobile ? '12px' : '14px', fontWeight: 'bold' }}>{getUIText('clear')}</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <List
                  height={listHeight}
                  itemCount={uploadedText.length}
                  itemSize={lineHeightRef.current}
                  width={'100%'}
                  outerRef={leftPanelRef}
                  style={{ height: '100%', overflowX: 'hidden', background: 'white', flex: 1, touchAction: 'pan-y' }}
                >
                  {({ index, style }) => {
                    const line = uploadedText[index];
                    const isSelected = selectedLines.some(item => item.index === index);
                    const isHighlighted = highlightedLines.has(index);
                    const isLastSelected = selectedLines.length > 0 && showButtons && index === Math.max(...selectedLines.map(item => item.index));
                    return (
                      <div key={index} style={style}>
                        <p
                          ref={index <= 1 ? el => { if (index === 0) firstLineRef.current = el; if (index === 1) secondLineRef.current = el; } : undefined}
                          data-line-index={index}
                          onMouseDown={!isMobile ? () => handleMouseDown(line, index) : undefined}
                          onTouchStart={isMobile ? (e) => {
                            const touch = e.touches ? e.touches[0] : e;
                            touchStartTimeRef.current = Date.now();
                            touchStartYRef.current = touch.clientY;
                            touchStartXRef.current = touch.clientX;
                          } : undefined}
                          onTouchEnd={isMobile ? (e) => {
                            const touch = e.changedTouches ? e.changedTouches[0] : e;
                            const dt = Date.now() - touchStartTimeRef.current;
                            const dy = Math.abs(touch.clientY - touchStartYRef.current);
                            const dx = Math.abs(touch.clientX - touchStartXRef.current);
                            // Only treat as selection if short tap or slow, short drag
                            if (dt < 200 && dx < 10 && dy < 10) {
                              // Simulate the old selection logic
                              if (mobileSelectionStartRef.current === null) {
                                mobileSelectionStartRef.current = index;
                                setSelectedLines([{ line, index }]);
                                selectedLinesRef.current = [{ line, index }];
                              } else {
                                const start = Math.min(mobileSelectionStartRef.current, index);
                                const end = Math.max(mobileSelectionStartRef.current, index);
                                const linesToExplain = [];
                                for (let i = start; i <= end; i++) {
                                  linesToExplain.push({ line: uploadedText[i], index: i });
                                }
                                setSelectedLines(linesToExplain);
                                selectedLinesRef.current = linesToExplain;
                                setShowButtons(true);
                                mobileSelectionStartRef.current = null;
                              }
                            }
                          } : undefined}
                          style={{
                            cursor: 'pointer',
                            padding: '4px',
                            backgroundColor: isSelected ? '#3b82f6' : highlightedLines.has(index) ? '#fef08a' : isHighlighted ? '#fbbf24' : (isMobile && mobileSelectionStartRef.current === index) ? '#fde68a' : 'white',
                            color: isSelected || isHighlighted ? 'white' : 'black',
                            borderRadius: '2px',
                            userSelect: 'text',
                            transition: 'background-color 0.2s ease',
                            minHeight: 24
                          }}
                        >
                          {line}
                          {isMobile && mobileSelectionStartRef.current === index && (
                            <span style={{ marginLeft: 8, background: '#fde68a', color: '#b45309', borderRadius: 4, fontSize: 12, padding: '2px 6px', fontWeight: 600 }}>
                              Start
                            </span>
                          )}
                        </p>
                        {isLastSelected && (
                          <div style={{ marginTop: '8px', marginBottom: '8px', display: 'flex', gap: '8px' }}>
                            <button onClick={explainMultipleLines} style={{ padding: isMobile ? '6px 8px' : '8px 12px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: isMobile ? '12px' : '14px', fontWeight: 'bold' }}>{getUIText('explainSelected')} ({selectedLines.length})</button>
                            <button onClick={() => { setSelectedLines([]); setShowButtons(false); }} style={{ padding: isMobile ? '6px 8px' : '8px 12px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: isMobile ? '12px' : '14px', fontWeight: 'bold' }}>{getUIText('clear')}</button>
                          </div>
                        )}
                      </div>
                    );
                  }}
                </List>
              )}
            </div>
          )}
        </div>
        <div className="panel-divider" onMouseDown={handleDividerStart} onTouchStart={handleDividerStart} style={{ display: isMobile && isPortrait ? 'none' : 'block', width: '8px', minWidth: '8px', maxWidth: '8px', flex: 'none', height: '100vh', backgroundColor: '#e5e7eb', cursor: 'col-resize', zIndex: 1000, pointerEvents: 'auto', borderLeft: '1px solid #d1d5db', borderRight: '1px solid #d1d5db', position: 'relative', right: 0, top: 0 }} onMouseOver={(e) => { e.target.style.backgroundColor = '#d1d5db'; }} onMouseOut={(e) => { e.target.style.backgroundColor = '#e5e7eb'; }}>
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '2px', height: '40px', backgroundImage: `linear-gradient(to bottom, transparent 0px, #9ca3af 2px, #9ca3af 4px, transparent 6px, transparent 8px, #9ca3af 10px, #9ca3af 12px, transparent 14px, transparent 16px, #9ca3af 18px, #9ca3af 20px, transparent 22px, transparent 24px, #9ca3af 26px, #9ca3af 28px, transparent 30px, transparent 32px, #9ca3af 34px, #9ca3af 36px, transparent 38px)`, backgroundSize: '2px 4px', pointerEvents: 'none' }} />
        </div>
        <div className="right-panel" style={{ flex: 1, height: isMobile && isPortrait ? '50%' : 'calc(var(--real-vh, 100vh))', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
          <div
            ref={headerRef}
            style={{ width: '100%', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', padding: isMobile ? '6px 12px' : '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: isMobile ? 8 : 16 }}
          >
            {!showTextInputForms && (
              <button style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, padding: isMobile ? '6px 12px' : '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: isMobile ? '12px' : 14 }} onClick={() => { console.log('Change Text clicked, current uploadedText length:', uploadedText.length); setShowTextInputForms(true); }}>Change Text</button>
            )}
            <a href="/guide" style={{ color: '#3b82f6', textDecoration: 'underline', fontWeight: 500, fontSize: isMobile ? '12px' : 15 }}>User Guide</a>
            {user && !userLoading && !isPremium && (
              usage >= FREEMIUM_LIMIT ? (
                <span style={{
                  background: '#fee2e2',
                  color: '#b91c1c',
                  borderRadius: 12,
                  padding: '4px 12px',
                  fontWeight: 500,
                  fontSize: 13,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 220,
                  display: 'inline-block'
                }}>
                  You've reached your limit. 3 more explanations at {nextReset ? new Date(nextReset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'the next hour'}.
                </span>
              ) : (
                <span style={{ color: '#2563eb', fontWeight: 500, fontSize: 13 }}>
                  {Math.max(0, FREEMIUM_LIMIT - usage)} explanations left
                </span>
              )
            )}
            {user && !userLoading && (
              <span style={{ color: '#6b7280', fontWeight: 400, fontSize: 14, marginRight: 4, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email || user.name || 'Signed In'}
              </span>
            )}
            {console.log('🔍 Render check - User:', user ? 'present' : 'null', 'UserLoading:', userLoading)}
            {user && !userLoading && (
              <button 
                onClick={() => {
                  console.log('🔘 Sign Out button clicked');
                  handleSignOut();
                }} 
                style={{ 
                  background: 'none', 
                  color: '#6b7280', 
                  border: '1px solid #d1d5db', 
                  borderRadius: 6, 
                  padding: '6px 14px', 
                  fontWeight: 400, 
                  fontSize: 14, 
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseDown={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseUp={(e) => e.target.style.backgroundColor = 'transparent'}
                onTouchStart={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onTouchEnd={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Sign Out
              </button>
            )}
          </div>
          {!isMobile && !user && !userLoading && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <button onClick={handleSignIn} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Sign In to Chat</button>
            </div>
          )}
          <div id="chat-container" style={{ flex: 1, overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px', padding: isMobile ? '6px' : '8px', marginBottom: isMobile ? '6px' : '8px', background: 'white' }}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} data-role={msg.role} style={{ marginBottom: isMobile ? '6px' : '12px', padding: isMobile ? '6px' : '8px', backgroundColor: msg.role === 'user' ? '#e3f2fd' : msg.role === 'assistant' ? '#f5f5f5' : '#fff3cd', borderRadius: '4px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', color: msg.role === 'user' ? '#1976d2' : msg.role === 'assistant' ? '#666' : '#856404' }}>
                  {msg.role === 'user' ? getUIText('you') : msg.role === 'assistant' ? getUIText('shakespeareExpert') : getUIText('system')}
                </div>
                <div style={{ fontSize: isMobile ? '12px' : '14px', whiteSpace: 'pre-wrap', color: '#000000' }}>
                  {msg.lineIndices ? (
                    <span
                      onClick={() => jumpToTextAndHighlight(msg.lineIndices)}
                      style={{ cursor: 'pointer', background: '#fef08a', color: '#000000', borderRadius: 4, padding: '2px 4px', transition: 'background 0.2s' }}
                      title="Jump to text"
                    >
                      {msg.content}
                    </span>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ fontStyle: 'italic', color: '#6b7280', fontSize: 14, marginTop: 8 }}>
                {detectedAuthor ? `${detectedAuthor} Expert is typing...` : 'Expert is typing...'}
              </div>
            )}
          </div>
          <form onSubmit={sendChatMessage} style={{ display: 'flex', gap: isMobile ? '6px' : '8px', alignItems: 'center', padding: isMobile ? '6px' : '8px', background: '#f8fafc', borderTop: '1px solid #e5e7eb' }}>
            <input type="text" value={inputMessage} onChange={e => setInputMessage(e.target.value)} placeholder="Ask follow-up questions..." style={{ flex: 1, padding: isMobile ? '6px' : '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '16px', backgroundColor: 'white', color: '#374151', WebkitAppearance: 'none', WebkitTapHighlightColor: 'transparent', outline: 'none', transform: 'translateZ(0)' }} disabled={isLoading} />
            <button type="submit" disabled={isLoading || !inputMessage.trim()} style={{ padding: isMobile ? '8px 12px' : '10px 18px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: isMobile ? '12px' : '15px', cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer', opacity: isLoading || !inputMessage.trim() ? 0.5 : 1 }}>Send</button>
          </form>
        </div>
      </div>
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          console.log('Auth modal closed');
          setShowAuthModal(false);
        }}
        onAuthSuccess={(data) => {
          console.log('Auth success callback called with:', data);
          setUser(data.user);
          setShowAuthModal(false);
        }}
      />
      
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        message={upgradeMessage}
      />
      {/* Mobile Scroll Indicator with Jump Navigation */}
      {isMobile && uploadedText.length > 0 && (
        <MobileScrollIndicator uploadedText={uploadedText} />
      )}
    </>
  );
}

function MobileScrollIndicator({ uploadedText }) {
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);

  React.useEffect(() => {
    const textContainer = document.querySelector('.left-panel');
    if (!textContainer) return;

    const updateScrollProgress = () => {
      const scrollTop = textContainer.scrollTop;
      const scrollHeight = textContainer.scrollHeight - textContainer.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    textContainer.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress(); // Initial update
    
    return () => textContainer.removeEventListener('scroll', updateScrollProgress);
  }, [uploadedText.length]);

  const handleScrollbarClick = (e) => {
    const textContainer = document.querySelector('.left-panel');
    if (!textContainer) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const percentage = (clickY / rect.height) * 100;
    const scrollHeight = textContainer.scrollHeight - textContainer.clientHeight;
    const targetScroll = (percentage / 100) * scrollHeight;
    
    textContainer.scrollTo({ top: targetScroll, behavior: 'smooth' });
  };

  const jumpToSection = (percentage) => {
    const textContainer = document.querySelector('.left-panel');
    if (!textContainer) return;
    
    const scrollHeight = textContainer.scrollHeight - textContainer.clientHeight;
    const targetScroll = (percentage / 100) * scrollHeight;
    textContainer.scrollTo({ top: targetScroll, behavior: 'smooth' });
  };

  if (uploadedText.length === 0) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      right: '8px', 
      top: '20%', 
      bottom: '20%', 
      width: '24px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }}>
      {/* Quick Jump Buttons */}
      <button
        onClick={() => jumpToSection(0)}
        style={{
          background: 'rgba(59,130,246,0.9)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '6px',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        ↑
      </button>
      
      {/* Scrollbar Track */}
      <div
        onClick={handleScrollbarClick}
        style={{
          flex: 1,
          width: '6px',
          background: 'rgba(0,0,0,0.1)',
          borderRadius: '3px',
          position: 'relative',
          cursor: 'pointer',
          alignSelf: 'center'
        }}
      >
        {/* Scrollbar Thumb */}
        <div
          style={{
            position: 'absolute',
            top: `${scrollProgress}%`,
            left: 0,
            width: '6px',
            height: '20px',
            background: 'rgba(59,130,246,0.8)',
            borderRadius: '3px',
            transform: 'translateY(-50%)',
            transition: isDragging ? 'none' : 'top 0.1s ease'
          }}
        />
      </div>

      <button
        onClick={() => jumpToSection(100)}
        style={{
          background: 'rgba(59,130,246,0.9)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '6px',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        ↓
      </button>
    </div>
  );
}
