import React, { useState, useEffect } from 'react';

const AIJobCoach = () => {
  const [currentStep, setCurrentStep] = useState('feeling');
  const [selectedFeeling, setSelectedFeeling] = useState('');
  const [selectedPath, setSelectedPath] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState(null);
  const [copyButtonText, setCopyButtonText] = useState('Copy Resume to Clipboard');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const feelings = [
    { emoji: '😰', label: 'Anxious', value: 'anxious' },
    { emoji: '😤', label: 'Frustrated', value: 'frustrated' },
    { emoji: '😔', label: 'Discouraged', value: 'discouraged' },
    { emoji: '🤔', label: 'Uncertain', value: 'uncertain' },
    { emoji: '😊', label: 'Optimistic', value: 'optimistic' },
    { emoji: '😌', label: 'Confident', value: 'confident' }
  ];

  const pathOptions = [
    {
      id: 'chat',
      icon: '💬',
      title: 'Talk About It',
      description: 'Process what you\'re feeling and get objective guidance',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      id: 'resume',
      icon: '📄',
      title: 'Tweak Your Resume',
      description: 'Match your resume to a specific job while adding personality',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      id: 'connections',
      icon: '🤝',
      title: 'Networking Updates',
      description: 'Coming soon! Strategy for conversations and connections',
      color: 'bg-gray-400',
      hoverColor: 'hover:bg-gray-400',
      disabled: true
    }
  ];

  const openEndedQuestions = [
    "What's really behind that feeling for you?",
    "When did you first notice this pattern in your job search?",
    "What would need to change for you to feel differently about this?",
    "If you had to guess, what's the fear underneath this feeling?",
    "What story are you telling yourself about your job search right now?",
    "What would you tell a friend who was feeling the same way?",
    "What's the one thing you're avoiding that might actually help?",
    "What assumptions are you making that might not be true?",
    "If this feeling had a message for you, what would it be?",
    "What's worked for you in the past when you've felt this way?"
  ];

  const handleFeelingSelect = (feeling) => {
    setSelectedFeeling(feeling.value);
    setCurrentStep('choosePath');
  };

  const handlePathSelect = (path) => {
    if (path.disabled) return;
    setSelectedPath(path.id);
    
    // Initialize chat if selecting chat option
    if (path.id === 'chat') {
      const randomQuestion = openEndedQuestions[Math.floor(Math.random() * openEndedQuestions.length)];
      const initialMessage = randomQuestion;
      setChatMessages([{ type: 'coach', content: initialMessage }]);
    }
    
    setCurrentStep('tool');
  };

  const resetFlow = () => {
    setCurrentStep('feeling');
    setSelectedFeeling('');
    setSelectedPath('');
    setJobDescription('');
    setResume('');
    setGeneratedResume(null);
    setChatMessages([]);
    setChatInput('');
    setCopyButtonText('Copy Resume to Clipboard');
  };

  const getFeelingContext = () => {
    const contexts = {
      anxious: "I can sense you're feeling anxious about your job search.",
      frustrated: "I hear that frustration in your job search journey.",
      discouraged: "I understand you're feeling discouraged right now.",
      uncertain: "I get that uncertainty is weighing on you.",
      optimistic: "I love that optimistic energy you're bringing!",
      confident: "That confidence is going to serve you well."
    };
    return contexts[selectedFeeling] || "Thanks for sharing how you're feeling.";
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    
    const userMessage = { type: 'user', content: chatInput };
    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setChatInput('');
    setIsChatLoading(true);
    
    // Auto-scroll to bottom
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
          feeling: selectedFeeling
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        const coachResponse = { type: 'coach', content: data.content };
        setChatMessages(prev => [...prev, coachResponse]);
      } else {
        throw new Error(data.error || 'API request failed');
      }
      
      // Auto-scroll after response
      setTimeout(() => {
        const chatContainer = document.querySelector('.chat-messages');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
      
    } catch (error) {
      console.error('Chat error:', error);
      
      // More helpful fallback responses based on common issues
      const fallbackResponses = [
        "Let me ask this differently - what's one specific thing about your job search that's been on your mind lately?",
        "I'm having a connection issue. While we wait, what would you say is your biggest job search challenge right now?",
        "Technical hiccup on my end. In the meantime - if you could change one thing about your job search process, what would it be?",
        "Connection trouble here. Let's try this - what's the hardest part of job searching for you personally?",
        "I'm having connectivity issues. Quick question while we reconnect - what job search advice have you gotten that just doesn't feel right to you?"
      ];
      
      const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      const errorResponse = { 
        type: 'coach', 
        content: randomFallback
      };
      setChatMessages(prev => [...prev, errorResponse]);
    }
    
    setIsChatLoading(false);
  };

  const handleGenerateResume = async () => {
  if (!jobDescription.trim() || !resume.trim()) {
    alert('Please fill in both the job description and your resume');
    return;
  }
  
  setIsGenerating(true);
  
  try {
    const response = await fetch("/api/resume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobDescription: jobDescription,
        resume: resume,
        feeling: selectedFeeling
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      setGeneratedResume(data);
    } else {
      throw new Error(data.error || 'Resume optimization failed');
    }
    
  } catch (error) {
    console.error('Resume generation error:', error);
    alert('Sorry, there was an error optimizing your resume. Please try again.');
  }
  
  setIsGenerating(false);
};


  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedResume.optimizedResume);
      setCopyButtonText('✅ Copied!');
      setTimeout(() => {
        setCopyButtonText('Copy Resume to Clipboard');
      }, 2000);
    } catch (error) {
      setCopyButtonText('❌ Copy Failed');
      setTimeout(() => {
        setCopyButtonText('Copy Resume to Clipboard');
      }, 2000);
    }
  };

  // Feeling Selection Screen
  if (currentStep === 'feeling') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">AI Job Coach</h1>
            <p className="text-gray-600">Start with how you're feeling, then choose your tool</p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              How are you feeling about your job search today?
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              {feelings.map((feeling) => (
                <button
                  key={feeling.value}
                  onClick={() => handleFeelingSelect(feeling)}
                  className="p-4 rounded-lg border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 text-center transform hover:scale-105"
                >
                  <div className="text-2xl mb-1">{feeling.emoji}</div>
                  <div className="text-sm font-medium text-gray-700">{feeling.label}</div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Built by Earl Balisi-Smith • Powered by Claude AI
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Path Selection Screen
  if (currentStep === 'choosePath') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
          <div className="text-center mb-6">
            <button 
              onClick={resetFlow}
              className="text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              ← Change feeling
            </button>
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              {getFeelingContext()}
            </h1>
            <p className="text-gray-600">What would be most helpful right now?</p>
          </div>
          
          <div className="space-y-4">
            {pathOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handlePathSelect(option)}
                disabled={option.disabled}
                className={`w-full p-4 rounded-lg ${option.color} ${option.hoverColor} text-white transition-all duration-200 transform ${
                  option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                } text-left relative`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{option.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{option.title}</h3>
                    <p className="text-sm opacity-90">{option.description}</p>
                  </div>
                </div>
                {option.disabled && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded">
                    Soon!
                  </div>
                )}
              </button>
            ))}
          </div>
          
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              Your feeling: {feelings.find(f => f.value === selectedFeeling)?.emoji} {feelings.find(f => f.value === selectedFeeling)?.label}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Tool Screen
  if (currentStep === 'tool') {
    const selectedOption = pathOptions.find(p => p.id === selectedPath);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <button 
              onClick={() => setCurrentStep('choosePath')}
              className="text-sm text-gray-500 hover:text-gray-700 mb-4"
            >
              ← Choose different tool
            </button>
            <div className="flex items-center justify-center space-x-3 mb-4">
              <span className="text-2xl">{selectedOption?.icon}</span>
              <h1 className="text-xl font-bold text-gray-800">{selectedOption?.title}</h1>
            </div>
            <p className="text-gray-600">{selectedOption?.description}</p>
          </div>
          
          {selectedPath === 'chat' && (
  <div className="space-y-4">
    {/* Disclaimer */}
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="font-semibold text-blue-800 mb-2">💬 AI Coaching Support</h3>
      <p className="text-sm text-blue-700">
        This tool provides exploratory questions and reflection prompts, not professional career counseling. 
        Always consider multiple perspectives and consult with career professionals for major decisions.
      </p>
    </div>
    
    {/* Chat Messages */}
    <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto space-y-3 chat-messages">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-800 border'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Tell me what's on your mind..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isChatLoading}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isChatLoading ? '...' : 'Send'}
                </button>
              </div>
            </div>
          )}
          
          {selectedPath === 'resume' && (
            <div className="space-y-6">
              {!generatedResume ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paste the job description you're applying to:
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Paste the full job description here..."
                    />
                  </div>
                  
                 <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Upload or paste your current resume:
    <span className="text-xs text-gray-500 block mt-1">
      *Note: This is a prototype - resume optimization currently uses mock responses to demonstrate the concept
    </span>
  </label>
  <textarea
    value={resume}
    onChange={(e) => setResume(e.target.value)}
    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
    placeholder="Paste your resume text here (file upload coming soon)..."
  />
</div>
                  
                  <button 
                    onClick={handleGenerateResume}
                    disabled={isGenerating || !jobDescription.trim() || !resume.trim()}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    {isGenerating ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 bg-white rounded-full animate-bounce"></div>
                        <div className="w-4 h-4 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-4 h-4 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <span className="ml-2">Generating...</span>
                      </div>
                    ) : (
                      'Generate Tailored Resume'
                    )}
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  {/* Key Improvements Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">🎯 Key Improvements Made:</h3>
                    <div className="text-sm text-blue-700">
                      <pre className="whitespace-pre-wrap">{generatedResume.improvements}</pre>
                    </div>
                  </div>

                  {/* Optimized Resume Box */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">✅ Your Optimized Resume:</h3>
                    <div className="bg-white p-4 rounded border max-h-64 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">{generatedResume.optimizedResume}</pre>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setGeneratedResume(null)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Generate New Version
                    </button>
                    <button 
                      onClick={copyToClipboard}
                      className={`flex-1 text-white py-2 px-4 rounded-lg font-medium transition-colors ${
                        copyButtonText === '✅ Copied!' 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : copyButtonText === '❌ Copy Failed'
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-gray-500 hover:bg-gray-600'
                      }`}
                    >
                      {copyButtonText}
                    </button>
                  </div>

                  {/* Additional Options */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-3 text-center">
                      Feeling: {feelings.find(f => f.value === selectedFeeling)?.emoji} {feelings.find(f => f.value === selectedFeeling)?.label}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <h4 className="font-medium text-yellow-800 text-sm mb-1">💡 Cover Letter Tips</h4>
                        <p className="text-xs text-yellow-700">{generatedResume.coverLetter}</p>
                      </div>
                      
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <h4 className="font-medium text-purple-800 text-sm mb-1">🎯 Application Recommendations</h4>
                        <p className="text-xs text-purple-700">{generatedResume.applicationTips}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {selectedPath === 'connections' && (
            <div className="text-center py-8">
              <div className="bg-gray-100 p-8 rounded-lg">
                <div className="text-4xl mb-4">🚧</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Coming Soon!</h3>
                <p className="text-sm text-gray-600">Networking strategy tool is in development.</p>
                <p className="text-xs text-gray-500 mt-2">Get ready for AI-powered networking guidance!</p>
              </div>
            </div>
          )}
          
          {selectedPath !== 'resume' && selectedPath !== 'connections' && (
            <div className="text-center mt-6">
              <p className="text-xs text-gray-500">
                Feeling: {feelings.find(f => f.value === selectedFeeling)?.emoji} {feelings.find(f => f.value === selectedFeeling)?.label}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default AIJobCoach;
