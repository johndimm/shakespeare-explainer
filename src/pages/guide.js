import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function UserGuide() {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const guideStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    lineHeight: '1.6',
    color: '#374151'
  };

  const headerStyle = {
    borderBottom: '3px solid #3b82f6',
    paddingBottom: '20px',
    marginBottom: '30px',
    textAlign: 'center'
  };

  const sectionStyle = {
    marginBottom: '25px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden'
  };

  const sectionHeaderStyle = {
    backgroundColor: '#f9fafb',
    padding: '15px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e5e7eb'
  };

  const sectionContentStyle = {
    padding: '20px',
    backgroundColor: 'white'
  };

  const stepStyle = {
    marginBottom: '15px',
    paddingLeft: '20px'
  };

  const featureBoxStyle = {
    backgroundColor: '#f0f9ff',
    border: '1px solid #0ea5e9',
    borderRadius: '6px',
    padding: '15px',
    marginBottom: '15px'
  };

  const tipBoxStyle = {
    backgroundColor: '#f0fdf4',
    border: '1px solid #10b981',
    borderRadius: '6px',
    padding: '15px',
    marginBottom: '15px'
  };

  // Diagram and visual component styles
  const diagramStyle = {
    backgroundColor: '#f8fafc',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0',
    textAlign: 'center'
  };

  const interfaceBoxStyle = {
    border: '2px solid #3b82f6',
    borderRadius: '6px',
    padding: '10px',
    margin: '5px',
    backgroundColor: '#f0f9ff',
    display: 'inline-block',
    fontSize: '12px'
  };

  const flowStepStyle = {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '20px',
    padding: '8px 16px',
    margin: '5px',
    display: 'inline-block',
    fontSize: '14px',
    fontWeight: 'bold'
  };

  const arrowStyle = {
    fontSize: '20px',
    margin: '0 10px',
    color: '#6b7280'
  };

  return (
    <>
      <Head>
        <title>User Guide - Classic Literature Explainer</title>
        <meta name="description" content="Complete guide to using the Classic Literature Explainer for Shakespeare, Molière, and other classic authors" />
      </Head>
      
      <div style={{ border: '4px dashed orange', ...guideStyle }}>
        <header style={headerStyle}>
          <h1 style={{ fontSize: '36px', marginBottom: '10px', color: '#1f2937' }}>
            📚 Classic Literature Explainer
          </h1>
          <h2 style={{ fontSize: '20px', color: '#6b7280', margin: 0 }}>
            User Guide
          </h2>
          <Link href="/" style={{ 
            display: 'inline-block', 
            marginTop: '15px', 
            color: '#3b82f6', 
            textDecoration: 'none',
            fontSize: '16px'
          }}>
            ← Back to App
          </Link>
        </header>

        {/* Overview Section - Always Visible */}
        <section style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e5e7eb',
          borderRadius: '8px'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#1f2937' }}>
            📖 Welcome to the Classic Literature Explainer
          </h2>
          
          <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '16px', color: '#374151' }}>
            This powerful tool helps you understand classic literature from Shakespeare, Molière, Racine, Goethe, and other great authors. 
            The AI automatically detects the author and language, adapting its expertise and interface accordingly.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{
              padding: '12px',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>🎭</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>Universal Author Support</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Shakespeare, Molière, Racine, Goethe & more</div>
            </div>
            
            <div style={{
              padding: '12px',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>🌍</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>Multilingual Analysis</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>English, French, German, Spanish & more</div>
            </div>
            
            <div style={{
              padding: '12px',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>⚡</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>Smart Interface</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Auto-adapts to detected author & language</div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#dbeafe',
            border: '1px solid #3b82f6',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '16px', margin: '0 0 8px 0', color: '#1e40af' }}>🚀 Getting Started in 3 Steps:</h3>
            <ol style={{ margin: 0, paddingLeft: '20px', color: '#374151' }}>
              <li><strong>Load Text:</strong> Use quick-load buttons, upload a file, or paste text</li>
              <li><strong>Select Lines:</strong> Click and drag to highlight the passage you want explained</li>
              <li><strong>Get Expert Analysis:</strong> Receive detailed explanations with historical context and literary insights</li>
            </ol>
          </div>

          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #10b981',
            borderRadius: '6px',
            padding: '12px'
          }}>
            <h3 style={{ fontSize: '16px', margin: '0 0 8px 0', color: '#059669' }}>🎯 Key Features:</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151', fontSize: '14px' }}>
              <li><strong>Language Control:</strong> Choose responses in the original language or English</li>
              <li><strong>Jump Navigation:</strong> Click chat messages to return to original text passages</li>
              <li><strong>Outline View:</strong> Navigate large works by acts and scenes</li>
              <li><strong>Save & Share:</strong> Download conversations and get AI summaries</li>
            </ul>
          </div>
        </section>

        {/* Collapsible Sections */}
        <div style={{ marginBottom: '20px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
          Click any section below for detailed instructions:
        </div>

        {/* Quick Start */}
        <section style={sectionStyle}>
          <div 
            style={sectionHeaderStyle}
            onClick={() => toggleSection('quickstart')}
          >
            <span>🚀 Quick Start</span>
            <span>{expandedSection === 'quickstart' ? '−' : '+'}</span>
          </div>
          {expandedSection === 'quickstart' && (
            <div style={sectionContentStyle}>
              <p><strong>Get started in 3 easy steps:</strong></p>
              
              {/* Visual Flow Diagram */}
              <div style={diagramStyle}>
                <div style={flowStepStyle}>1. Load Text</div>
                <span style={arrowStyle}>→</span>
                <div style={flowStepStyle}>2. Select Lines</div>
                <span style={arrowStyle}>→</span>
                <div style={flowStepStyle}>3. Get Explanation</div>
                
                <div style={{ marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
                  <strong>Quick Start Flow</strong>
                </div>
              </div>

              {/* Step 1 Visual */}
              <div style={stepStyle}>
                <strong>1. Load Text:</strong> Click a quick-load button (Romeo & Juliet, Macbeth, Hamlet) or upload your own file
                <div style={diagramStyle}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#3b82f6', color: 'white'}}>Romeo & Juliet</div>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#3b82f6', color: 'white'}}>Macbeth</div>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#3b82f6', color: 'white'}}>Hamlet</div>
                  </div>
                  <div style={{ margin: '10px 0', fontSize: '14px' }}>or</div>
                  <div style={{...interfaceBoxStyle, backgroundColor: '#059669', color: 'white'}}>📂 Upload File</div>
                  <div style={{...interfaceBoxStyle, backgroundColor: '#059669', color: 'white'}}>🌐 Load from URL</div>
                </div>
              </div>

              {/* Step 2 Visual */}
              <div style={stepStyle}>
                <strong>2. Select Text:</strong> Click and drag to select lines you want explained
                <div style={diagramStyle}>
                  <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
                    <div style={{ padding: '4px', backgroundColor: '#f3f4f6', borderRadius: '4px', marginBottom: '2px' }}>
                      To be, or not to be, that is the question:
                    </div>
                    <div style={{ padding: '4px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '4px', marginBottom: '2px' }}>
                      Whether 'tis nobler in the mind to suffer ← Selected
                    </div>
                    <div style={{ padding: '4px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '4px', marginBottom: '2px' }}>
                      The slings and arrows of outrageous fortune ← Selected
                    </div>
                    <div style={{ padding: '4px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                      Or to take arms against a sea of troubles
                    </div>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#6b7280' }}>
                    Blue = Selected lines for explanation
                  </div>
                </div>
              </div>

              {/* Step 3 Visual */}
              <div style={stepStyle}>
                <strong>3. Get Explanation:</strong> The AI expert will explain the meaning, context, and literary devices
                <div style={diagramStyle}>
                  <div style={{ 
                    backgroundColor: '#e3f2fd', 
                    border: '1px solid #1976d2', 
                    borderRadius: '6px', 
                    padding: '10px', 
                    margin: '10px auto',
                    maxWidth: '500px',
                    textAlign: 'left'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#1976d2', marginBottom: '5px' }}>You</div>
                    <div>Explain: "Whether 'tis nobler in the mind to suffer..."</div>
                  </div>
                  <span style={arrowStyle}>↓</span>
                  <div style={{ 
                    backgroundColor: '#f5f5f5', 
                    border: '1px solid #666', 
                    borderRadius: '6px', 
                    padding: '10px', 
                    margin: '10px auto',
                    maxWidth: '500px',
                    textAlign: 'left'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>Shakespeare Expert</div>
                    <div style={{ fontSize: '12px' }}>This famous soliloquy explores the central question of existence versus non-existence...</div>
                  </div>
                </div>
              </div>

              <div style={tipBoxStyle}>
                <strong>💡 Tip:</strong> The app automatically detects the author (Shakespeare, Molière, Racine, etc.) and adapts the interface accordingly!
                <div style={diagramStyle}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{...interfaceBoxStyle, backgroundColor: '#dc2626', color: 'white'}}>📚 Shakespeare Text</div>
                      <div style={{ fontSize: '12px', marginTop: '5px' }}>English Text</div>
                    </div>
                    <span style={{ fontSize: '24px', margin: '10px 0' }}>→</span>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{...interfaceBoxStyle, backgroundColor: '#dc2626', color: 'white'}}>📚 Molière Text</div>
                      <div style={{ fontSize: '12px', marginTop: '5px' }}>French Text</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Loading Text */}
        <section style={sectionStyle}>
          <div 
            style={sectionHeaderStyle}
            onClick={() => toggleSection('loading')}
          >
            <span>📂 Loading Text</span>
            <span>{expandedSection === 'loading' ? '−' : '+'}</span>
          </div>
          {expandedSection === 'loading' && (
            <div style={sectionContentStyle}>
              <h3>Quick Load Popular Plays</h3>
              <p>Click any of the pre-loaded buttons for instant access to classic works:</p>
              
              {/* Quick Load Visual */}
              <div style={diagramStyle}>
                <div style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}>🎭 Quick Load Options</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#3b82f6', color: 'white', fontSize: '14px'}}>Romeo & Juliet</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Tragic love story</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#3b82f6', color: 'white', fontSize: '14px'}}>Macbeth</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Scottish play</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#3b82f6', color: 'white', fontSize: '14px'}}>Hamlet</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Melancholy prince</div>
                  </div>
                </div>
              </div>

              <h3>Upload Your Own File</h3>
              <p>Upload any .txt file containing classic literature:</p>
              
              {/* Upload Visual */}
              <div style={diagramStyle}>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{...interfaceBoxStyle, backgroundColor: '#f3f4f6', color: '#374151', fontSize: '14px', width: '250px'}}>
                    📂 Choose file... <span style={{ fontSize: '12px', color: '#6b7280' }}>(moliere-tartuffe.txt)</span>
                  </div>
                </div>
                <span style={arrowStyle}>↓</span>
                <div style={{ marginTop: '15px' }}>
                  <div style={{...interfaceBoxStyle, backgroundColor: '#10b981', color: 'white'}}>✓ Author Detected: Molière</div>
                  <div style={{...interfaceBoxStyle, backgroundColor: '#10b981', color: 'white'}}>✓ Interface Updated</div>
                </div>
              </div>

              <ul>
                <li><strong>Supports:</strong> Plain text files (.txt)</li>
                <li><strong>Auto-detection:</strong> Works with any classic author's works</li>
                <li><strong>Dynamic UI:</strong> Automatically adapts the interface</li>
              </ul>

              <h3>Load from URL</h3>
              <p>Load text directly from any public URL:</p>
              
              {/* URL Loading Visual */}
              <div style={diagramStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <div style={{...interfaceBoxStyle, backgroundColor: '#f3f4f6', color: '#374151', width: '300px'}}>
                    🌐 https://www.gutenberg.org/files/1524/...
                  </div>
                  <div style={{...interfaceBoxStyle, backgroundColor: '#059669', color: 'white'}}>Load from URL</div>
                </div>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#6b7280' }}>
                  Enter any public URL → Click load button → Text appears instantly
                </div>
              </div>

              <ul>
                <li><strong>Project Gutenberg:</strong> Free classic literature</li>
                <li><strong>GitHub:</strong> Raw file URLs</li>
                <li><strong>Any URL:</strong> Publicly accessible text files</li>
              </ul>
              
              <div style={stepStyle}>
                <strong>📋 Example URLs:</strong>
                <div style={diagramStyle}>
                  <div style={{ textAlign: 'left', fontSize: '12px', fontFamily: 'monospace' }}>
                    • https://shakespeare-explainer.vercel.app/le-misanthrope-moliere.txt<br />
                    <span style={{ color: '#6b7280', marginLeft: '10px' }}>(Molière's Le Misanthrope in French)</span><br /><br />
                    • https://www.gutenberg.org/files/1524/1524-0.txt<br />
                    <span style={{ color: '#6b7280', marginLeft: '10px' }}>(Hamlet in French)</span><br /><br />
                    • https://raw.githubusercontent.com/user/repo/main/play.txt<br />
                    <span style={{ color: '#6b7280', marginLeft: '10px' }}>(GitHub raw files)</span>
                  </div>
                </div>
              </div>

              <h3>Paste Text</h3>
              <p>Copy and paste text directly into the text area for instant analysis.</p>
              
              {/* Paste Visual */}
              <div style={diagramStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>📋</div>
                    <div style={{ fontSize: '12px' }}>Copy text</div>
                  </div>
                  <span style={arrowStyle}>→</span>
                  <div style={{...interfaceBoxStyle, backgroundColor: '#f3f4f6', width: '150px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    Paste text here...
                  </div>
                  <span style={arrowStyle}>→</span>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>✨</div>
                    <div style={{ fontSize: '12px' }}>Instant analysis</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Text Selection */}
        <section style={sectionStyle}>
          <div 
            style={sectionHeaderStyle}
            onClick={() => toggleSection('selection')}
          >
            <span>🎯 Selecting Text</span>
            <span>{expandedSection === 'selection' ? '−' : '+'}</span>
          </div>
          {expandedSection === 'selection' && (
            <div style={sectionContentStyle}>
              <h3>Desktop Selection</h3>
              
              {/* Desktop Selection Visual */}
              <div style={diagramStyle}>
                <div style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>🖱️ Desktop Interaction</div>
                
                {/* Single Line */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>Single Line Selection:</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', marginBottom: '5px' }}>👆</div>
                      <div style={{ fontSize: '12px' }}>Click line</div>
                    </div>
                    <span style={arrowStyle}>→</span>
                    <div style={{ 
                      padding: '6px 12px', 
                      backgroundColor: '#3b82f6', 
                      color: 'white', 
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      Line selected & explained
                    </div>
                  </div>
                </div>

                {/* Multiple Lines */}
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>Multiple Lines Selection:</div>
                  <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
                    <div style={{ padding: '4px', backgroundColor: '#f3f4f6', borderRadius: '4px', marginBottom: '2px', position: 'relative' }}>
                      To be, or not to be, that is the question:
                      <span style={{ position: 'absolute', right: '5px', fontSize: '18px' }}>👆 Start</span>
                    </div>
                    <div style={{ padding: '4px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '4px', marginBottom: '2px' }}>
                      Whether 'tis nobler in the mind to suffer
                    </div>
                    <div style={{ padding: '4px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '4px', marginBottom: '2px', position: 'relative' }}>
                      The slings and arrows of outrageous fortune
                      <span style={{ position: 'absolute', right: '5px', fontSize: '18px' }}>👆 End</span>
                    </div>
                    <div style={{ padding: '4px', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                      Or to take arms against a sea of troubles
                    </div>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#6b7280' }}>
                    Click and drag from start line to end line
                  </div>
                </div>
              </div>

              <div style={stepStyle}>
                <strong>Single Line:</strong> Click on any line to select and explain it immediately
              </div>
              <div style={stepStyle}>
                <strong>Multiple Lines:</strong> Click and drag from the first line to the last line you want to analyze
              </div>
              <div style={stepStyle}>
                <strong>Visual Feedback:</strong> Selected lines turn blue to show your selection
              </div>

              <h3>Mobile Selection</h3>
              
              {/* Mobile Selection Visual */}
              <div style={diagramStyle}>
                <div style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>📱 Mobile Interaction</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
                  {/* Single Tap */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>👆</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Single Tap</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Select + Show Buttons</div>
                    <div style={{ marginTop: '10px' }}>
                      <div style={{...interfaceBoxStyle, backgroundColor: '#16a34a', color: 'white', fontSize: '10px'}}>Explain (1)</div>
                      <div style={{...interfaceBoxStyle, backgroundColor: '#dc2626', color: 'white', fontSize: '10px'}}>Clear</div>
                    </div>
                  </div>

                  {/* Double Tap */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>👆👆</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Double Tap</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Instant Explanation</div>
                    <div style={{ marginTop: '10px' }}>
                      <div style={{...interfaceBoxStyle, backgroundColor: '#3b82f6', color: 'white', fontSize: '10px'}}>⚡ Immediate Analysis</div>
                    </div>
                  </div>

                  {/* Multiple Selection */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>👆👆👆</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Multiple Taps</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>Select Multiple Lines</div>
                    <div style={{ marginTop: '10px' }}>
                      <div style={{...interfaceBoxStyle, backgroundColor: '#16a34a', color: 'white', fontSize: '10px'}}>Explain (3)</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={stepStyle}>
                <strong>Single Tap:</strong> Tap a line to select it (shows action buttons)
              </div>
              <div style={stepStyle}>
                <strong>Double Tap:</strong> Double-tap to instantly explain a single line
              </div>
              <div style={stepStyle}>
                <strong>Multiple Selection:</strong> Tap multiple lines, then use "Explain Selected Lines" button
              </div>

              <div style={featureBoxStyle}>
                <strong>🎪 Smart Selection:</strong> The app highlights your selection in real-time and shows the number of lines selected.
                
                {/* Smart Selection Visual */}
                <div style={diagramStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#3b82f6', color: 'white'}}>Line 1 Selected</div>
                    <span style={{ fontSize: '16px' }}>+</span>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#3b82f6', color: 'white'}}>Line 2 Selected</div>
                    <span style={arrowStyle}>→</span>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#16a34a', color: 'white'}}>Explain Selected Lines (2)</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Navigation */}
        <section style={sectionStyle}>
          <div 
            style={sectionHeaderStyle}
            onClick={() => toggleSection('navigation')}
          >
            <span>🧭 Navigation Features</span>
            <span>{expandedSection === 'navigation' ? '−' : '+'}</span>
          </div>
          {expandedSection === 'navigation' && (
            <div style={sectionContentStyle}>
              <h3>Text Outline</h3>
              <p>Click "Show Outline" to see the structure of the play:</p>
              
              {/* Outline Visual */}
              <div style={diagramStyle}>
                <div style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>📋 Outline Structure</div>
                <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
                  <div style={{...interfaceBoxStyle, backgroundColor: '#dc2626', color: 'white', margin: '2px 0', width: '100%'}}>🎭 Act I</div>
                  <div style={{...interfaceBoxStyle, backgroundColor: '#f3f4f6', color: '#374151', margin: '2px 0 2px 20px', width: 'calc(100% - 20px)'}}>🎪 Scene I - Elsinore Castle</div>
                  <div style={{...interfaceBoxStyle, backgroundColor: '#f3f4f6', color: '#374151', margin: '2px 0 2px 20px', width: 'calc(100% - 20px)'}}>🎪 Scene II - A room of state</div>
                  <div style={{...interfaceBoxStyle, backgroundColor: '#dc2626', color: 'white', margin: '2px 0', width: '100%'}}>🎭 Act II</div>
                  <div style={{...interfaceBoxStyle, backgroundColor: '#f3f4f6', color: '#374151', margin: '2px 0 2px 20px', width: 'calc(100% - 20px)'}}>🎪 Scene I - Polonius's house</div>
                </div>
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#6b7280' }}>
                  Click any item → Jump to that section instantly
                </div>
              </div>
              
              <ul>
                <li><strong>🎭 Acts:</strong> Major divisions of the play</li>
                <li><strong>🎪 Scenes:</strong> Subdivisions with location descriptions</li>
                <li><strong>📍 Locations:</strong> Scene settings and descriptions</li>
              </ul>
              <div style={stepStyle}>
                <strong>Navigation:</strong> Click any outline item to jump directly to that section in the text
              </div>

              <h3>Jump-to-Text Links</h3>
              <p>Chat messages with quoted text are clickable:</p>
              
              {/* Jump-to-Text Visual */}
              <div style={diagramStyle}>
                <div style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>🔗 Jump-to-Text Feature</div>
                
                {/* Chat Message Example */}
                <div style={{ 
                  backgroundColor: '#e3f2fd', 
                  border: '1px solid #1976d2', 
                  borderRadius: '6px', 
                  padding: '10px', 
                  margin: '10px auto',
                  maxWidth: '400px',
                  textAlign: 'left'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#1976d2', marginBottom: '5px' }}>You</div>
                  <div style={{ fontSize: '12px', marginBottom: '5px' }}>"To be, or not to be, that is the question"</div>
                  <div style={{...interfaceBoxStyle, backgroundColor: '#1976d2', color: 'white', fontSize: '10px', cursor: 'pointer'}}>📍 Click to jump to text</div>
                </div>
                
                <span style={arrowStyle}>↓</span>
                
                {/* Text Highlighting */}
                <div style={{ 
                  backgroundColor: '#fff9c4', 
                  border: '2px solid #f59e0b', 
                  borderRadius: '6px', 
                  padding: '10px', 
                  margin: '10px auto',
                  maxWidth: '400px',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#92400e' }}>Original Text (Highlighted)</div>
                  <div style={{ fontSize: '12px' }}>To be, or not to be, that is the question</div>
                  <div style={{ fontSize: '10px', color: '#92400e', marginTop: '5px' }}>⏱️ Highlights for 3 seconds</div>
                </div>
              </div>
              
              <div style={stepStyle}>
                <strong>Click the "📍 Click to jump to text" link</strong> in any user message to return to the original passage
              </div>
              <div style={stepStyle}>
                <strong>Highlighting:</strong> The original text will be highlighted in yellow for 3 seconds
              </div>

              <h3>Custom Scrollbar</h3>
              <p>The text panel has a custom scrollbar that doubles as a resizer:</p>
              
              {/* Scrollbar Visual */}
              <div style={diagramStyle}>
                <div style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>📏 Interactive Scrollbar</div>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
                  {/* Vertical Scrolling */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      width: '120px', 
                      height: '100px', 
                      border: '2px solid #3b82f6', 
                      borderRadius: '6px',
                      position: 'relative',
                      backgroundColor: '#f8fafc'
                    }}>
                      <div style={{ fontSize: '10px', padding: '5px' }}>Text Panel</div>
                      <div style={{ 
                        position: 'absolute',
                        right: '2px',
                        top: '20px',
                        width: '8px',
                        height: '60px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '4px'
                      }}>
                        <div style={{ 
                          width: '6px',
                          height: '20px',
                          backgroundColor: '#3b82f6',
                          borderRadius: '3px',
                          margin: '1px',
                          marginTop: '10px'
                        }}></div>
                      </div>
                      <div style={{ position: 'absolute', bottom: '5px', right: '15px', fontSize: '12px' }}>↕️</div>
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '5px', fontWeight: 'bold' }}>Vertical Scroll</div>
                    <div style={{ fontSize: '10px', color: '#6b7280' }}>Navigate through text</div>
                  </div>
                  
                  {/* Horizontal Resizing */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', height: '100px' }}>
                      <div style={{ 
                        width: '60px', 
                        height: '100px', 
                        border: '2px solid #3b82f6', 
                        borderRight: 'none',
                        borderRadius: '6px 0 0 6px',
                        backgroundColor: '#f8fafc',
                        fontSize: '10px',
                        padding: '5px'
                      }}>Text</div>
                      <div style={{ 
                        width: '8px',
                        height: '100px',
                        backgroundColor: '#e5e7eb',
                        cursor: 'ew-resize',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}>↔️</div>
                      <div style={{ 
                        width: '60px', 
                        height: '100px', 
                        border: '2px solid #10b981', 
                        borderLeft: 'none',
                        borderRadius: '0 6px 6px 0',
                        backgroundColor: '#f0fdf4',
                        fontSize: '10px',
                        padding: '5px'
                      }}>Chat</div>
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '5px', fontWeight: 'bold' }}>Horizontal Resize</div>
                    <div style={{ fontSize: '10px', color: '#6b7280' }}>Adjust panel widths</div>
                  </div>
                </div>
              </div>
              
              <ul>
                <li>Drag vertically to scroll through the text</li>
                <li>Drag horizontally to resize the panels</li>
              </ul>
            </div>
          )}
        </section>

        {/* Chat Features */}
        <section style={sectionStyle}>
          <div 
            style={sectionHeaderStyle}
            onClick={() => toggleSection('chat')}
          >
            <span>💬 Chat & Analysis</span>
            <span>{expandedSection === 'chat' ? '−' : '+'}</span>
          </div>
          {expandedSection === 'chat' && (
            <div style={sectionContentStyle}>
              <h3>AI Expert Analysis</h3>
              <p>The AI adapts its expertise based on the detected author:</p>
              
              {/* AI Expert Visual */}
              <div style={diagramStyle}>
                <div style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>🤖 Dynamic AI Expertise</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#dc2626', color: 'white'}}>🇬🇧 Shakespeare Expert</div>
                    <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '5px' }}>English • Elizabethan Era</div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#3b82f6', color: 'white'}}>🇫🇷 Molière Expert</div>
                    <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '5px' }}>French • Classical Comedy</div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#7c3aed', color: 'white'}}>🇫🇷 Racine Expert</div>
                    <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '5px' }}>French • Classical Tragedy</div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#059669', color: 'white'}}>🇩🇪 Goethe Expert</div>
                    <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '5px' }}>German • Romanticism</div>
                  </div>
                </div>
                
                <div style={{ marginTop: '15px', fontSize: '12px', color: '#6b7280' }}>
                  ⚡ Automatic detection → Instant expertise adaptation
                </div>
              </div>
              
              <ul>
                <li><strong>Shakespeare Expert:</strong> For English texts</li>
                <li><strong>Molière Expert:</strong> For French classical comedies</li>
                <li><strong>Racine Expert:</strong> For French classical tragedies</li>
                <li><strong>Goethe Expert:</strong> For German literary works</li>
              </ul>

              <h3>Follow-up Questions</h3>
              <p>Ask additional questions about:</p>
              <ul>
                <li>Historical context and background</li>
                <li>Literary devices and techniques</li>
                <li>Character motivations and themes</li>
                <li>Connections to other works</li>
              </ul>

              <h3>Language Support & Preferences</h3>
              <div style={featureBoxStyle}>
                <strong>🌍 Response Language Control:</strong> Choose how the AI responds to your questions with the language preference dropdown in the chat header.
                
                {/* Language Preference Visual */}
                <div style={diagramStyle}>
                  <div style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>⚙️ Language Preference Options</div>
                  
                  {/* Option 1: Match Text Language */}
                  <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '6px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>📚 Match Text Language (Default)</div>
                    <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', marginBottom: '5px' }}>🇫🇷 French Text</div>
                        <span style={arrowStyle}>↓</span>
                        <div style={{ fontSize: '12px' }}>Réponse en Français</div>
                      </div>
                      
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', marginBottom: '5px' }}>🇩🇪 German Text</div>
                        <span style={arrowStyle}>↓</span>
                        <div style={{ fontSize: '12px' }}>Deutsche Antwort</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Option 2: English (My Language) */}
                  <div style={{ padding: '15px', backgroundColor: '#f0fdf4', border: '1px solid #10b981', borderRadius: '6px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>🇬🇧 English (My Language)</div>
                    <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', marginBottom: '5px' }}>🇫🇷 French Text</div>
                        <span style={arrowStyle}>↓</span>
                        <div style={{ fontSize: '12px' }}>Response in English</div>
                      </div>
                      
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '16px', marginBottom: '5px' }}>🇩🇪 German Text</div>
                        <span style={arrowStyle}>↓</span>
                        <div style={{ fontSize: '12px' }}>Response in English</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3>Instant Language Switching</h3>
              <div style={featureBoxStyle}>
                <strong>🔄 Automatic Resubmission:</strong> When you change the language preference, the app automatically resubmits your last question with the new language setting.
                
                {/* Resubmission Flow Visual */}
                <div style={diagramStyle}>
                  <div style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 'bold' }}>⚡ Instant Language Switch</div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{...interfaceBoxStyle, backgroundColor: '#3b82f6', color: 'white'}}>Ask in French Text</div>
                      <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '3px' }}>Gets French response</div>
                    </div>
                    
                    <span style={arrowStyle}>→</span>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{...interfaceBoxStyle, backgroundColor: '#f59e0b', color: 'white'}}>Switch to English</div>
                      <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '3px' }}>Change dropdown</div>
                    </div>
                    
                    <span style={arrowStyle}>→</span>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{...interfaceBoxStyle, backgroundColor: '#10b981', color: 'white'}}>Auto Resubmit</div>
                      <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '3px' }}>Same question, English answer</div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '15px', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
                    📝 Plus a manual "🔄 Resubmit" button for on-demand language switching
                  </div>
                </div>
              </div>

              <h3>Chat Management</h3>
              
              {/* Chat Management Visual */}
              <div style={diagramStyle}>
                <div style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>💼 Chat Tools</div>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#3b82f6', color: 'white'}}>💾 Save Chat</div>
                    <span style={arrowStyle}>→</span>
                    <div style={{ 
                      border: '2px dashed #6b7280', 
                      borderRadius: '6px', 
                      padding: '10px',
                      backgroundColor: '#f9fafb',
                      fontSize: '12px'
                    }}>
                      📄 conversation.txt
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#10b981', color: 'white'}}>📋 Get Summary</div>
                    <span style={arrowStyle}>→</span>
                    <div style={{ 
                      backgroundColor: '#f0fdf4', 
                      border: '1px solid #10b981',
                      borderRadius: '6px', 
                      padding: '10px',
                      fontSize: '12px',
                      maxWidth: '150px'
                    }}>
                      "Today you learned about Hamlet's soliloquy..."
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={stepStyle}>
                <strong>💾 Save Chat:</strong> Download your conversation as a text file
              </div>
              <div style={stepStyle}>
                <strong>📋 Summary:</strong> Get an AI-generated summary of your learning session
              </div>
            </div>
          )}
        </section>

        {/* Advanced Features */}
        <section style={sectionStyle}>
          <div 
            style={sectionHeaderStyle}
            onClick={() => toggleSection('advanced')}
          >
            <span>⚡ Advanced Features</span>
            <span>{expandedSection === 'advanced' ? '−' : '+'}</span>
          </div>
          {expandedSection === 'advanced' && (
            <div style={sectionContentStyle}>
              <h3>Author Detection</h3>
              <p>The app automatically identifies the author from text content:</p>
              
              {/* Author Detection Visual */}
              <div style={diagramStyle}>
                <div style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>🔍 AI Author Detection</div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                  <div style={{ 
                    backgroundColor: '#f3f4f6', 
                    border: '2px solid #6b7280',
                    borderRadius: '6px', 
                    padding: '10px',
                    fontSize: '12px',
                    maxWidth: '150px'
                  }}>
                    "Être ou ne pas être, telle est la question..."
                  </div>
                  
                  <span style={arrowStyle}>→</span>
                  
                  <div style={{...interfaceBoxStyle, backgroundColor: '#f59e0b', color: 'white', fontSize: '12px'}}>🤖 Analyzing...</div>
                  
                  <span style={arrowStyle}>→</span>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#10b981', color: 'white'}}>✓ Detected: Molière</div>
                    <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '5px' }}>Interface Updated</div>
                  </div>
                </div>
                
                {/* Before/After UI */}
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>Before</div>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#dc2626', color: 'white'}}>📚 Shakespeare Text</div>
                  </div>
                  <span style={{ fontSize: '20px', margin: '20px 0' }}>→</span>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>After</div>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#3b82f6', color: 'white'}}>📚 Molière Text</div>
                  </div>
                </div>
              </div>
              
              <ul>
                <li>Supports major classical authors across languages</li>
                <li>Updates the entire interface to match the detected author</li>
                <li>Provides author-specific expertise and context</li>
              </ul>

              <h3>Dynamic Interface</h3>
              <div style={featureBoxStyle}>
                <strong>🎭 Smart Adaptation:</strong> Upload Molière's "Tartuffe" and watch the interface change from "Shakespeare Text" to "Molière Text" automatically!
              </div>

              <h3>Responsive Design</h3>
              <ul>
                <li><strong>Desktop:</strong> Full dual-pane interface with drag selection</li>
                <li><strong>Mobile:</strong> Touch-optimized with tap selection</li>
                <li><strong>Tablet:</strong> Hybrid interface supporting both interaction methods</li>
              </ul>

              <h3>Performance Features</h3>
              
              {/* Performance Visual */}
              <div style={diagramStyle}>
                <div style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>⚡ Performance Optimizations</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>🚀</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Smooth Scrolling</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Thousands of lines</div>
                    <div style={{ marginTop: '5px' }}>
                      <div style={{ width: '100%', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px' }}>
                        <div style={{ width: '90%', height: '4px', backgroundColor: '#10b981', borderRadius: '2px' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚡</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Real-time Highlighting</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Instant feedback</div>
                    <div style={{ marginTop: '5px' }}>
                      <div style={{ width: '100%', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px' }}>
                        <div style={{ width: '95%', height: '4px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>📈</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Progressive Loading</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Efficient processing</div>
                    <div style={{ marginTop: '5px' }}>
                      <div style={{ width: '100%', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px' }}>
                        <div style={{ width: '85%', height: '4px', backgroundColor: '#f59e0b', borderRadius: '2px' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={stepStyle}>
                <strong>Smooth Scrolling:</strong> Optimized for large texts with thousands of lines
              </div>
              <div style={stepStyle}>
                <strong>Real-time Highlighting:</strong> Instant visual feedback during selection
              </div>
              <div style={stepStyle}>
                <strong>Progressive Loading:</strong> Large texts load efficiently
              </div>
            </div>
          )}
        </section>

        {/* Troubleshooting */}
        <section style={sectionStyle}>
          <div 
            style={sectionHeaderStyle}
            onClick={() => toggleSection('troubleshooting')}
          >
            <span>🔧 Troubleshooting</span>
            <span>{expandedSection === 'troubleshooting' ? '−' : '+'}</span>
          </div>
          {expandedSection === 'troubleshooting' && (
            <div style={sectionContentStyle}>
              <h3>Common Issues</h3>
              
              {/* Troubleshooting Visual */}
              <div style={diagramStyle}>
                <div style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>🔧 Quick Fixes</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  {/* File Upload Issue */}
                  <div style={{ 
                    backgroundColor: '#fef2f2', 
                    border: '1px solid #fca5a5',
                    borderRadius: '6px',
                    padding: '10px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#dc2626', marginBottom: '5px' }}>❌ Upload Fails</div>
                    <div style={{ fontSize: '12px', marginBottom: '5px' }}>Problem: File won't upload</div>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#10b981', color: 'white', fontSize: '10px'}}>✓ Use .txt files</div>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#10b981', color: 'white', fontSize: '10px'}}>✓ Try paste instead</div>
                  </div>
                  
                  {/* URL Issue */}
                  <div style={{ 
                    backgroundColor: '#fffbeb', 
                    border: '1px solid #fcd34d',
                    borderRadius: '6px',
                    padding: '10px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '5px' }}>🌐 URL Fails</div>
                    <div style={{ fontSize: '12px', marginBottom: '5px' }}>Problem: Can't load from URL</div>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#3b82f6', color: 'white', fontSize: '10px'}}>✓ Check URL access</div>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#3b82f6', color: 'white', fontSize: '10px'}}>✓ Copy & paste</div>
                  </div>
                  
                  {/* Selection Issue */}
                  <div style={{ 
                    backgroundColor: '#f0f9ff', 
                    border: '1px solid #7dd3fc',
                    borderRadius: '6px',
                    padding: '10px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0284c7', marginBottom: '5px' }}>🎯 Selection Issues</div>
                    <div style={{ fontSize: '12px', marginBottom: '5px' }}>Problem: Can't select text</div>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#dc2626', color: 'white', fontSize: '10px'}}>�� Try tapping</div>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#dc2626', color: 'white', fontSize: '10px'}}>🔄 Refresh page</div>
                  </div>
                </div>
              </div>
              
              <div style={stepStyle}>
                <strong>File won't upload:</strong>
                <ul>
                  <li>Ensure it's a .txt file</li>
                  <li>Try the paste text option instead</li>
                  <li>Check file size (should be under 10MB)</li>
                </ul>
              </div>

              <div style={stepStyle}>
                <strong>URL loading fails:</strong>
                <ul>
                  <li>Verify the URL is publicly accessible</li>
                  <li>Try copying the text and using paste instead</li>
                  <li>Some sites block direct access (CORS policy)</li>
                </ul>
              </div>

              <div style={stepStyle}>
                <strong>Selection not working:</strong>
                <ul>
                  <li>On mobile: Try tapping instead of dragging</li>
                  <li>On desktop: Click and hold, then drag</li>
                  <li>Refresh the page if selection seems stuck</li>
                </ul>
              </div>

              <h3>Best Practices</h3>
              <div style={tipBoxStyle}>
                <strong>📝 Text Quality:</strong> For best results, use clean, well-formatted text files from reliable sources like Project Gutenberg.
              </div>

              <div style={tipBoxStyle}>
                <strong>🎯 Selection Size:</strong> Select 1-10 lines for focused analysis. Larger selections may get general summaries.
              </div>
            </div>
          )}
        </section>

        {/* Tips */}
        <section style={sectionStyle}>
          <div 
            style={sectionHeaderStyle}
            onClick={() => toggleSection('tips')}
          >
            <span>💡 Pro Tips</span>
            <span>{expandedSection === 'tips' ? '−' : '+'}</span>
          </div>
          {expandedSection === 'tips' && (
            <div style={sectionContentStyle}>
              <h3>Getting the Most from the App</h3>
              
              {/* Pro Tips Visual */}
              <div style={diagramStyle}>
                <div style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>💡 Pro Learning Strategies</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                  <div style={{ 
                    backgroundColor: '#f0fdf4', 
                    border: '2px solid #10b981',
                    borderRadius: '8px',
                    padding: '15px'
                  }}>
                    <div style={{ fontSize: '20px', marginBottom: '8px' }}>🔄</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Progressive Learning</div>
                    <div style={{ fontSize: '12px', color: '#059669' }}>Simple → Complex passages</div>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '5px' }}>
                      <div style={{...interfaceBoxStyle, backgroundColor: '#dcfce7', color: '#15803d', fontSize: '9px'}}>Easy</div>
                      <span style={{ fontSize: '12px' }}>→</span>
                      <div style={{...interfaceBoxStyle, backgroundColor: '#bbf7d0', color: '#15803d', fontSize: '9px'}}>Medium</div>
                      <span style={{ fontSize: '12px' }}>→</span>
                      <div style={{...interfaceBoxStyle, backgroundColor: '#10b981', color: 'white', fontSize: '9px'}}>Complex</div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    backgroundColor: '#fef3c7', 
                    border: '2px solid #f59e0b',
                    borderRadius: '8px',
                    padding: '15px'
                  }}>
                    <div style={{ fontSize: '20px', marginBottom: '8px' }}>🎭</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Compare Authors</div>
                    <div style={{ fontSize: '12px', color: '#92400e' }}>See AI adaptation in action</div>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                      <div style={{...interfaceBoxStyle, backgroundColor: '#dc2626', color: 'white', fontSize: '8px'}}>🇬🇧</div>
                      <div style={{...interfaceBoxStyle, backgroundColor: '#3b82f6', color: 'white', fontSize: '8px'}}>🇫🇷</div>
                      <div style={{...interfaceBoxStyle, backgroundColor: '#059669', color: 'white', fontSize: '8px'}}>🇩🇪</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={tipBoxStyle}>
                <strong>🔄 Progressive Learning:</strong> Start with simple passages, then move to complex soliloquies as you build understanding.
              </div>

              <div style={tipBoxStyle}>
                <strong>🎭 Compare Authors:</strong> Load different authors' works to see how the AI expertise adapts to different literary styles.
              </div>

              <div style={tipBoxStyle}>
                <strong>📚 Use the Outline:</strong> Navigate large works efficiently by using the outline to jump between acts and scenes.
              </div>

              <div style={tipBoxStyle}>
                <strong>💬 Ask Follow-ups:</strong> Don't stop at the first explanation - ask about themes, historical context, or connections to other works.
              </div>

              <div style={tipBoxStyle}>
                <strong>🌍 Explore Languages:</strong> Try French Molière or German Goethe to experience the multilingual capabilities. Use the language preference toggle to switch between immersive learning (same language) and comfortable learning (English explanations).
              </div>

              <h3>Study Strategies</h3>
              
              {/* Study Strategies Visual */}
              <div style={diagramStyle}>
                <div style={{ marginBottom: '20px', fontSize: '16px', fontWeight: 'bold' }}>📖 Effective Study Methods</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎪</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Scene Analysis</div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>Focus on one scene</div>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#3b82f6', color: 'white', fontSize: '9px'}}>Outline → Scene → Analyze</div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>👤</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Character Study</div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>Follow one character</div>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#10b981', color: 'white', fontSize: '9px'}}>Select → Speeches → Track</div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎨</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Theme Tracking</div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>Cross-reference themes</div>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#7c3aed', color: 'white', fontSize: '9px'}}>Compare → Themes → Connect</div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Evolution Study</div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>Compare periods</div>
                    <div style={{...interfaceBoxStyle, backgroundColor: '#f59e0b', color: 'white', fontSize: '9px'}}>Early → Late → Changes</div>
                  </div>
                </div>
              </div>
              
              <ul>
                <li><strong>Scene Analysis:</strong> Use the outline to study one scene at a time</li>
                <li><strong>Character Study:</strong> Select speeches by specific characters for focused analysis</li>
                <li><strong>Theme Tracking:</strong> Ask about recurring themes across different passages</li>
                <li><strong>Language Evolution:</strong> Compare early and late works by the same author</li>
              </ul>
            </div>
          )}
        </section>

        {/* FAQ Section - Always Visible */}
        <section style={{
          marginTop: '30px',
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#fffbeb',
          border: '1px solid #f59e0b',
          borderRadius: '8px'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#92400e' }}>
            ❓ Frequently Asked Questions
          </h2>
          
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#92400e' }}>Q: Does this work with authors other than Shakespeare?</strong>
            <p style={{ margin: '4px 0 0 0', color: '#374151' }}>A: Yes! The app automatically detects and adapts to Molière, Racine, Goethe, Cervantes, and other classic authors.</p>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#92400e' }}>Q: Can I get explanations in English for foreign texts?</strong>
            <p style={{ margin: '4px 0 0 0', color: '#374151' }}>A: Absolutely! Use the "🇬🇧 English (My Language)" option in the chat header to get English explanations for any text.</p>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#92400e' }}>Q: How do I load my own text files?</strong>
            <p style={{ margin: '4px 0 0 0', color: '#374151' }}>A: Use the file upload button, paste text directly, or load from a URL. The app supports .txt files and most web-accessible text.</p>
          </div>
          
          <div>
            <strong style={{ color: '#92400e' }}>Q: What if I can't select text properly?</strong>
            <p style={{ margin: '4px 0 0 0', color: '#374151' }}>A: On mobile, try tapping instead of dragging. On desktop, click and hold then drag. Check the Troubleshooting section below for more help.</p>
          </div>
        </section>

        <footer style={{ 
          textAlign: 'center', 
          marginTop: '40px', 
          padding: '20px',
          borderTop: '1px solid #e5e7eb',
          color: '#6b7280'
        }}>
          <p>
            <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              ← Return to Classic Literature Explainer
            </Link>
          </p>
          <p style={{ fontSize: '14px', marginTop: '10px' }}>
            Experience the power of AI-driven literary analysis with automatic author detection and multilingual support.
          </p>
        </footer>
      </div>
    </>
  );
}