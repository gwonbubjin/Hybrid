import React, { useState, useRef, useEffect } from 'react';
import { LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Home, MessageCircle, BookOpen, BarChart3, Award, Flame, Target, Clock, CheckCircle, XCircle, Zap, Send, Volume2, Play, Pause, RotateCcw, Settings, TrendingUp, Brain, Headphones, FileText, List, ChevronRight, Trophy, Star } from 'lucide-react';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [userLevel, setUserLevel] = useState('Bronze');
  const [streak, setStreak] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentScore, setCurrentScore] = useState(400);
  const [targetScore, setTargetScore] = useState(800);
  
  // Practice state
  const [selectedPart, setSelectedPart] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [practiceResults, setPracticeResults] = useState([]);
  
  // Mock test state
  const [mockTestMode, setMockTestMode] = useState(false);
  const [mockTestTime, setMockTestTime] = useState(7200); // 2 hours in seconds
  const [mockTestRunning, setMockTestRunning] = useState(false);
  
  // Listening state
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: '안녕하세요! 저는 ToeicMate AI 튜터입니다. TOEIC 학습에 대해 무엇이든 물어보세요! 😊' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // All TOEIC parts data
  // TOEIC parts data with dynamic accuracy
  const getToeicPartsWithAccuracy = () => {
    return toeicParts.map(part => {
      const partSessions = practiceHistory.filter(s => s.partId === part.id);
      
      if (partSessions.length === 0) {
        return { ...part, accuracy: 0, practiced: false };
      }
      
      const totalQuestions = partSessions.reduce((sum, s) => sum + s.questionsAnswered, 0);
      const totalCorrect = partSessions.reduce((sum, s) => sum + s.correctAnswers, 0);
      const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
      
      return { ...part, accuracy, practiced: true };
    });
  };

  const toeicParts = [
    { 
      id: 1, 
      name: 'Part 1', 
      title: '사진 묘사',
      type: 'listening',
      questions: 6,
      description: '사진을 보고 가장 적절한 묘사를 선택',
      icon: '📷',
      color: 'from-blue-400 to-blue-600'
    },
    { 
      id: 2, 
      name: 'Part 2', 
      title: '질의응답',
      type: 'listening',
      questions: 25,
      description: '질문에 대한 가장 적절한 응답 선택',
      icon: '💬',
      color: 'from-cyan-400 to-cyan-600'
    },
    { 
      id: 3, 
      name: 'Part 3', 
      title: '짧은 대화',
      type: 'listening',
      questions: 39,
      description: '2-3명의 대화를 듣고 문제 해결',
      icon: '👥',
      color: 'from-teal-400 to-teal-600'
    },
    { 
      id: 4, 
      name: 'Part 4', 
      title: '설명문',
      type: 'listening',
      questions: 30,
      description: '한 사람의 말을 듣고 문제 해결',
      icon: '📢',
      color: 'from-green-400 to-green-600'
    },
    { 
      id: 5, 
      name: 'Part 5', 
      title: '단문 공란 채우기',
      type: 'reading',
      questions: 30,
      description: '문법과 어휘 문제',
      icon: '✏️',
      color: 'from-yellow-400 to-yellow-600'
    },
    { 
      id: 6, 
      name: 'Part 6', 
      title: '장문 공란 채우기',
      type: 'reading',
      questions: 16,
      description: '문맥을 고려한 빈칸 채우기',
      icon: '📝',
      color: 'from-orange-400 to-orange-600'
    },
    { 
      id: 7, 
      name: 'Part 7', 
      title: '독해',
      type: 'reading',
      questions: 54,
      description: '지문을 읽고 문제 해결',
      icon: '📄',
      color: 'from-red-400 to-red-600'
    }
  ];

  // AI Question Generation state
  const [generatingQuestion, setGeneratingQuestion] = useState(false);
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState({});
  
  // Vocabulary state
  const [vocabulary, setVocabulary] = useState([]);
  const [showVocabulary, setShowVocabulary] = useState(false);
  
  // Weakness Analysis state
  const [weaknessAnalysis, setWeaknessAnalysis] = useState(null);
  const [analyzingWeakness, setAnalyzingWeakness] = useState(false);
  const [showWeaknessReport, setShowWeaknessReport] = useState(false);
  
  // User & Backend state
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  // Practice history for calculations
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [dailyGoal, setDailyGoal] = useState(50);
  const [todayQuestionCount, setTodayQuestionCount] = useState(0);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [tempTargetScore, setTempTargetScore] = useState(800);
  
  // Load user data on mount
  useEffect(() => {
    loadUserFromStorage();
  }, []);
  
  // Auto-sync when user data changes
  useEffect(() => {
    if (user) {
      const syncTimer = setInterval(() => {
        syncDataToBackend();
      }, 60000); // Sync every minute
      
      return () => clearInterval(syncTimer);
    }
  }, [user, vocabulary, practiceResults, currentScore, streak]);
  
  const loadUserFromStorage = async () => {
    try {
      const stored = await window.storage.get('toeicmate_user');
      if (stored && stored.value) {
        const userData = JSON.parse(stored.value);
        setUser(userData);
        await loadUserData(userData.id);
      }
    } catch (error) {
      console.log('No stored user found');
    }
  };
  
  const loadUserData = async (userId) => {
    try {
      // Load vocabulary
      const vocabData = await window.storage.get(`user_${userId}_vocabulary`);
      if (vocabData && vocabData.value) {
        setVocabulary(JSON.parse(vocabData.value));
      }
      
      // Load progress
      const progressData = await window.storage.get(`user_${userId}_progress`);
      if (progressData && progressData.value) {
        const progress = JSON.parse(progressData.value);
        setCurrentScore(progress.currentScore || 400);
        setStreak(progress.streak || 0);
        setTotalPoints(progress.totalPoints || 0);
        setTargetScore(progress.targetScore || 800);
        setDailyGoal(progress.dailyGoal || 50);
      }
      
      // Load AI generated questions
      const questionsData = await window.storage.get(`user_${userId}_ai_questions`);
      if (questionsData && questionsData.value) {
        setAiGeneratedQuestions(JSON.parse(questionsData.value));
      }
      
      // Load practice history
      const historyData = await window.storage.get(`user_${userId}_practice_history`);
      if (historyData && historyData.value) {
        setPracticeHistory(JSON.parse(historyData.value));
      }
      
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };
  
  const syncDataToBackend = async () => {
    if (!user || syncing) return;
    
    setSyncing(true);
    try {
      const userId = user.id;
      
      // Save vocabulary
      await window.storage.set(
        `user_${userId}_vocabulary`,
        JSON.stringify(vocabulary)
      );
      
      // Save progress
      await window.storage.set(
        `user_${userId}_progress`,
        JSON.stringify({
          currentScore,
          streak,
          totalPoints,
          targetScore,
          dailyGoal,
          lastUpdated: new Date().toISOString()
        })
      );
      
      // Save AI generated questions
      await window.storage.set(
        `user_${userId}_ai_questions`,
        JSON.stringify(aiGeneratedQuestions)
      );
      
      // Save practice history
      await window.storage.set(
        `user_${userId}_practice_history`,
        JSON.stringify(practiceHistory)
      );
      
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      // Simulate authentication - in production, this would call a real API
      const userId = `user_${authForm.email.split('@')[0]}`;
      const userData = {
        id: userId,
        email: authForm.email,
        name: authForm.name || authForm.email.split('@')[0],
        createdAt: new Date().toISOString()
      };
      
      // Save user to storage
      await window.storage.set('toeicmate_user', JSON.stringify(userData));
      
      setUser(userData);
      setShowAuth(false);
      
      // Load existing data or create new
      await loadUserData(userId);
      
      alert(`환영합니다, ${userData.name}님! 🎉`);
    } catch (error) {
      alert('로그인 중 오류가 발생했습니다.');
    }
  };
  
  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!authForm.name || !authForm.email || !authForm.password) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    
    try {
      const userId = `user_${authForm.email.split('@')[0]}`;
      const userData = {
        id: userId,
        email: authForm.email,
        name: authForm.name,
        createdAt: new Date().toISOString()
      };
      
      await window.storage.set('toeicmate_user', JSON.stringify(userData));
      
      setUser(userData);
      setShowAuth(false);
      
      // Initialize new user data
      await syncDataToBackend();
      
      alert(`회원가입 완료! 환영합니다, ${userData.name}님! 🎉`);
    } catch (error) {
      alert('회원가입 중 오류가 발생했습니다.');
    }
  };
  
  const handleLogout = async () => {
    if (!window.confirm('로그아웃 하시겠습니까?')) return;
    
    try {
      await syncDataToBackend(); // Final sync before logout
      await window.storage.delete('toeicmate_user');
      setUser(null);
      alert('로그아웃되었습니다.');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Sample questions for different parts
  const questionBank = {
    1: [ // Part 1 - Photo description
      {
        image: '🏢',
        audio: 'A woman is entering a building',
        options: [
          "A woman is entering a building",
          "A woman is leaving an office",
          "A woman is cleaning windows",
          "A woman is painting a wall"
        ],
        correct: 0,
        explanation: "사진 속 여성이 건물로 들어가는 모습이 명확하게 보입니다. 'entering a building'이 가장 정확한 묘사입니다."
      },
      {
        image: '💼',
        audio: 'Some briefcases are placed on a table',
        options: [
          "Some briefcases are placed on a table",
          "A man is opening a briefcase",
          "Papers are scattered on the floor",
          "Someone is carrying a bag"
        ],
        correct: 0,
        explanation: "테이블 위에 서류가방들이 놓여있는 상황을 정확하게 묘사한 문장입니다."
      },
      {
        image: '🚗',
        audio: 'A car is being parked',
        options: [
          "A car is being washed",
          "A car is being parked",
          "A car is being repaired",
          "A car is being towed"
        ],
        correct: 1,
        explanation: "차량이 주차되고 있는 동작을 나타내는 수동태 표현이 적절합니다."
      },
      {
        image: '📚',
        audio: 'Books are arranged on shelves',
        options: [
          "Someone is reading a book",
          "Books are being carried",
          "Books are arranged on shelves",
          "A bookstore is being opened"
        ],
        correct: 2,
        explanation: "책장에 책들이 정리되어 있는 상태를 묘사하는 표현입니다."
      },
      {
        image: '☕',
        audio: 'A woman is pouring coffee',
        options: [
          "A woman is drinking coffee",
          "A woman is pouring coffee",
          "Coffee is being served",
          "A cup is being washed"
        ],
        correct: 1,
        explanation: "여성이 커피를 따르고 있는 진행형 동작을 나타냅니다."
      }
    ],
    2: [ // Part 2 - Question-Response
      {
        text: "Q: When is the meeting scheduled?",
        audio: "When is the meeting scheduled?",
        options: [
          "At 3 o'clock",
          "In the conference room",
          "Yes, I'll attend"
        ],
        correct: 0,
        explanation: "'When'으로 시작하는 시간 질문에는 시간을 답해야 합니다. 'At 3 o'clock'이 적절한 응답입니다."
      },
      {
        text: "Q: Who's responsible for this project?",
        audio: "Who's responsible for this project?",
        options: [
          "Next Monday",
          "Sarah from marketing",
          "In the office"
        ],
        correct: 1,
        explanation: "'Who'로 시작하는 질문에는 사람 이름이나 직책으로 답해야 합니다."
      },
      {
        text: "Q: Where can I find the supplies?",
        audio: "Where can I find the supplies?",
        options: [
          "In the storage room",
          "Tomorrow morning",
          "Yes, we have some"
        ],
        correct: 0,
        explanation: "'Where' 질문에는 장소를 답해야 합니다."
      },
      {
        text: "Q: How long will the training take?",
        audio: "How long will the training take?",
        options: [
          "Very important",
          "About three hours",
          "In the main hall"
        ],
        correct: 1,
        explanation: "'How long'은 기간을 묻는 질문으로 시간 길이로 답해야 합니다."
      },
      {
        text: "Q: Why was the meeting postponed?",
        audio: "Why was the meeting postponed?",
        options: [
          "Last Friday",
          "The manager is sick",
          "In Conference Room B"
        ],
        correct: 1,
        explanation: "'Why' 질문에는 이유를 설명하는 답변이 적절합니다."
      }
    ],
    3: [ // Part 3 - Short conversations
      {
        text: "Listen to the conversation between two coworkers.",
        audio: "M: Did you finish the quarterly report?\nW: Almost done. I just need to add the charts.\nM: Great, the deadline is tomorrow.",
        question: "What does the woman need to do?",
        options: [
          "Submit the report",
          "Add charts to the report",
          "Check the deadline",
          "Review quarterly data"
        ],
        correct: 1,
        explanation: "여성이 'I just need to add the charts'라고 말했으므로 차트를 추가해야 합니다."
      },
      {
        text: "Listen to the conversation at an office.",
        audio: "W: I can't find the client files for the Anderson account.\nM: Did you check the shared drive?\nW: Yes, but they're not there.\nM: Let me ask IT to help us locate them.",
        question: "What will the man probably do next?",
        options: [
          "Check the shared drive",
          "Contact IT support",
          "Find the Anderson account",
          "Review the files"
        ],
        correct: 1,
        explanation: "남성이 'Let me ask IT to help us'라고 했으므로 IT 부서에 연락할 것입니다."
      },
      {
        text: "Listen to the conversation about a business trip.",
        audio: "M: When are you leaving for the Tokyo conference?\nW: My flight is on Wednesday morning.\nM: Don't forget to bring the presentation materials.\nW: They're already packed in my briefcase.",
        question: "When is the woman traveling?",
        options: [
          "Monday morning",
          "Tuesday afternoon",
          "Wednesday morning",
          "Thursday evening"
        ],
        correct: 2,
        explanation: "여성이 'My flight is on Wednesday morning'이라고 명확히 말했습니다."
      },
      {
        text: "Listen to the conversation about office equipment.",
        audio: "W: The printer on the third floor is broken again.\nM: I'll call the repair service right away.\nW: Thanks. In the meantime, can we use the one on the second floor?\nM: Sure, I'll send an email to everyone about it.",
        question: "What does the man offer to do?",
        options: [
          "Fix the printer himself",
          "Buy a new printer",
          "Notify staff about the alternate printer",
          "Move the printer to another floor"
        ],
        correct: 2,
        explanation: "남성이 'I'll send an email to everyone about it'라고 했으므로 직원들에게 알릴 것입니다."
      },
      {
        text: "Listen to the conversation about a schedule change.",
        audio: "M: The client just called and asked to reschedule our meeting.\nW: When do they want to meet instead?\nM: Next Tuesday at 2 PM.\nW: Let me check my calendar... Yes, that works for me.",
        question: "What is the woman doing?",
        options: [
          "Calling a client",
          "Rescheduling a meeting",
          "Checking her availability",
          "Canceling an appointment"
        ],
        correct: 2,
        explanation: "여성이 'Let me check my calendar'라고 하며 자신의 일정을 확인하고 있습니다."
      }
    ],
    4: [ // Part 4 - Short talks
      {
        text: "Listen to a phone message.",
        audio: "This is a reminder that the staff training session will be held this Friday at 10 AM in Conference Room B. Please bring your employee handbook.",
        question: "What should listeners bring?",
        options: [
          "Their schedules",
          "Training materials",
          "Employee handbooks",
          "Conference notes"
        ],
        correct: 2,
        explanation: "메시지 마지막에 'Please bring your employee handbook'라고 명확히 언급되었습니다."
      },
      {
        text: "Listen to an announcement.",
        audio: "Attention all staff. Due to maintenance work, the parking garage will be closed from 8 AM to noon tomorrow. Please use the street parking during this time. We apologize for any inconvenience.",
        question: "What is the announcement about?",
        options: [
          "A staff meeting",
          "Building maintenance",
          "Parking arrangements",
          "Work schedule changes"
        ],
        correct: 2,
        explanation: "주차장 폐쇄와 대체 주차에 관한 안내입니다."
      },
      {
        text: "Listen to a voice mail message.",
        audio: "Hi, this is Jennifer from ABC Suppliers. I'm calling about your order number 5421. We have everything in stock and ready to ship. Please call me back at extension 305 to confirm the delivery address.",
        question: "Why is the speaker calling?",
        options: [
          "To place an order",
          "To confirm order details",
          "To cancel a delivery",
          "To change an address"
        ],
        correct: 1,
        explanation: "주문 상품이 준비되었고 배송 주소 확인을 위해 전화했습니다."
      },
      {
        text: "Listen to a radio advertisement.",
        audio: "Looking for office supplies at great prices? Visit Office Depot this weekend for our annual clearance sale. Get up to 50% off on selected items. The sale runs from Saturday through Monday. Don't miss this opportunity!",
        question: "How long will the sale last?",
        options: [
          "One day",
          "Two days",
          "Three days",
          "One week"
        ],
        correct: 2,
        explanation: "토요일부터 월요일까지 3일간 진행됩니다."
      },
      {
        text: "Listen to instructions at a workshop.",
        audio: "Welcome everyone. Today's workshop will cover three main topics: customer service skills, conflict resolution, and team communication. We'll start with a 45-minute presentation, followed by group activities. Please turn off your mobile phones during the session.",
        question: "What are participants asked to do?",
        options: [
          "Prepare a presentation",
          "Form groups",
          "Turn off their phones",
          "Take notes"
        ],
        correct: 2,
        explanation: "워크숍 중 휴대폰을 끄라고 요청하고 있습니다."
      }
    ],
    5: [ // Part 5 - Incomplete sentences
      {
        text: "The marketing team _____ a comprehensive strategy for the new product launch.",
        options: ["develop", "develops", "developed", "developing"],
        correct: 2,
        explanation: "과거 시제 'developed'가 정답입니다. 문맥상 이미 완료된 행동을 나타냅니다."
      },
      {
        text: "All employees must _____ their time sheets by Friday afternoon.",
        options: ["submit", "submits", "submitted", "submitting"],
        correct: 0,
        explanation: "조동사 'must' 뒤에는 동사원형이 와야 하므로 'submit'이 정답입니다."
      },
      {
        text: "The conference room is available _____ 2 PM and 4 PM today.",
        options: ["among", "between", "during", "within"],
        correct: 1,
        explanation: "'between A and B' 구문으로 두 시간 사이를 나타낼 때 사용합니다."
      },
      {
        text: "Ms. Johnson is _____ responsible for managing the entire sales department.",
        options: ["direct", "directed", "directly", "direction"],
        correct: 2,
        explanation: "형용사 'responsible'을 수식하는 부사 'directly'가 필요합니다."
      },
      {
        text: "The company's profits have increased _____ over the past year.",
        options: ["significant", "significantly", "significance", "signify"],
        correct: 1,
        explanation: "동사 'increased'를 수식하는 부사 'significantly'가 적절합니다."
      },
      {
        text: "Please _____ me know if you need any additional information.",
        options: ["let", "lets", "letting", "to let"],
        correct: 0,
        explanation: "'let + 목적어 + 동사원형' 구문으로 'let me know'가 정답입니다."
      },
      {
        text: "The new policy will go into _____ next month.",
        options: ["effect", "affect", "effective", "effectively"],
        correct: 0,
        explanation: "'go into effect'는 '시행되다'라는 의미의 관용표현입니다."
      },
      {
        text: "_____ the weather was bad, we decided to proceed with the outdoor event.",
        options: ["Despite", "Although", "Because", "However"],
        correct: 1,
        explanation: "문장 뒤에 주어와 동사가 오므로 접속사 'Although'가 적절합니다."
      },
      {
        text: "The presentation was so _____ that everyone stayed focused.",
        options: ["interest", "interested", "interesting", "interestingly"],
        correct: 2,
        explanation: "발표가 흥미로운 것이므로 '-ing' 형태인 'interesting'이 맞습니다."
      },
      {
        text: "We need to complete this project _____ the end of the month.",
        options: ["by", "until", "at", "in"],
        correct: 0,
        explanation: "'by'는 특정 시점까지 완료를 의미하므로 'by the end of'가 적절합니다."
      }
    ],
    6: [ // Part 6 - Text completion
      {
        text: "Dear valued customers,\n\nWe are pleased to announce that our online store will be offering a special promotion next week. _____ who make a purchase will receive a 20% discount.",
        context: "Email announcement about a promotion",
        options: [
          "Anyone",
          "Customers",
          "Those",
          "People"
        ],
        correct: 2,
        explanation: "'Those who'는 관계대명사 구문으로 '~하는 사람들'이라는 의미로 문맥상 가장 적절합니다."
      },
      {
        text: "To: All Department Heads\nFrom: Human Resources\n\nPlease be reminded that annual performance reviews are due by Friday. _____, managers should schedule one-on-one meetings with their team members this week.",
        context: "Internal memo about performance reviews",
        options: [
          "However",
          "Therefore",
          "Nevertheless",
          "Meanwhile"
        ],
        correct: 1,
        explanation: "'Therefore'는 '그러므로'의 의미로 앞 문장의 결과를 나타냅니다."
      },
      {
        text: "We appreciate your interest in our company. Your application has been received and is currently under _____. We will contact you within two weeks regarding the next steps.",
        context: "Job application response email",
        options: [
          "review",
          "reviewing",
          "reviewed",
          "reviewer"
        ],
        correct: 0,
        explanation: "'under review'는 '검토 중'이라는 의미의 관용표현으로 명사 'review'가 필요합니다."
      },
      {
        text: "Dear Mr. Thompson,\n\nThank you for your inquiry about our services. _____ to your request, I have attached our latest product catalog and price list.",
        context: "Business response letter",
        options: [
          "In response",
          "For responding",
          "To respond",
          "Response"
        ],
        correct: 0,
        explanation: "'In response to'는 '~에 대한 응답으로'라는 의미의 관용표현입니다."
      },
      {
        text: "The workshop will cover various topics including project management, time management, and effective communication. _____ attending should bring a notebook and pen.",
        context: "Workshop invitation",
        options: [
          "Anyone",
          "Those",
          "Everyone",
          "People"
        ],
        correct: 1,
        explanation: "'Those attending'은 '참석하는 사람들'을 의미하며 현재분사와 함께 사용됩니다."
      }
    ],
    7: [ // Part 7 - Reading comprehension
      {
        text: `MEMO
To: All Staff
From: Human Resources
Date: November 15
Subject: Holiday Schedule

Please note that the office will be closed from December 24 to January 2. All employees are required to submit their project reports before the holiday break. If you have any urgent matters, please contact your supervisor before December 20.`,
        question: "When must project reports be submitted?",
        options: [
          "By December 20",
          "Before December 24",
          "By January 2",
          "Before November 15"
        ],
        correct: 1,
        explanation: "메모에서 '직원들은 휴가 전에 프로젝트 보고서를 제출해야 한다'고 명시되어 있으며, 휴가는 12월 24일부터입니다."
      },
      {
        text: `CUSTOMER FEEDBACK FORM

Thank you for choosing TechSupport Plus! Please take a moment to rate our service.

Technician: David Park
Response Time: 15 minutes
Problem Resolution: Complete
Overall Satisfaction: Excellent

Comments: David was very professional and fixed my computer issue quickly. Highly recommend!`,
        question: "What is mentioned about David Park?",
        options: [
          "He arrived late",
          "He solved the problem",
          "He needs more training",
          "He scheduled a follow-up"
        ],
        correct: 1,
        explanation: "Problem Resolution이 Complete로 표시되어 있고, 고객이 'fixed my computer issue quickly'라고 언급했습니다."
      },
      {
        text: `NOTICE

The library will undergo renovations from March 1 to March 31. During this period:
- The main reading room will be closed
- Books can be borrowed from the temporary desk on the first floor
- Online resources remain available 24/7
- Study rooms can be reserved via our website

We apologize for any inconvenience and appreciate your patience.`,
        question: "What will remain open during renovations?",
        options: [
          "The main reading room",
          "Access to online resources",
          "All study rooms",
          "The second floor"
        ],
        correct: 1,
        explanation: "공지에서 'Online resources remain available 24/7'이라고 명시되어 있습니다."
      },
      {
        text: `EMAIL

To: sales@globaltech.com
From: jennifer.wong@abc.com
Subject: Product Inquiry
Date: June 10

Dear Sales Team,

I am writing to inquire about your latest laptop model, the TechPro 2000. Could you please provide information about:

1. Available configurations
2. Bulk order discounts
3. Estimated delivery time for an order of 50 units

We are looking to upgrade our company's computers by the end of this month.

Best regards,
Jennifer Wong
IT Manager, ABC Corporation`,
        question: "What does Jennifer Wong want to know?",
        options: [
          "Repair procedures",
          "Pricing information",
          "Product specifications",
          "Warranty details"
        ],
        correct: 1,
        explanation: "Jennifer는 구성 옵션, 대량 주문 할인, 배송 시간 등 가격 관련 정보를 요청하고 있습니다."
      },
      {
        text: `JOB POSTING

Position: Marketing Coordinator
Location: New York, NY
Type: Full-time

Requirements:
- Bachelor's degree in Marketing or related field
- 2+ years of experience in digital marketing
- Proficiency in social media platforms
- Excellent communication skills

Responsibilities:
- Develop marketing campaigns
- Manage social media accounts
- Analyze market trends
- Coordinate with design team

To apply, send your resume to careers@company.com by July 15.`,
        question: "What is NOT mentioned as a requirement?",
        options: [
          "Educational background",
          "Work experience",
          "Language skills",
          "Technical knowledge"
        ],
        correct: 2,
        explanation: "학위, 경력, 소셜미디어 능력은 언급되었지만, 외국어 능력은 요구사항에 없습니다."
      },
      {
        text: `RECEIPT

Green Market Grocery
123 Main Street
Date: May 5, 2024
Time: 14:32

Items:
Organic Apples (2 lbs) .......... $5.98
Whole Wheat Bread ............... $3.50
Greek Yogurt (2) ................ $7.00
Fresh Salmon (1 lb) ............. $12.99

Subtotal: $29.47
Tax: $2.36
Total: $31.83

Payment Method: Credit Card
Thank you for shopping with us!`,
        question: "How much did the customer pay in total?",
        options: [
          "$29.47",
          "$31.83",
          "$2.36",
          "$12.99"
        ],
        correct: 1,
        explanation: "영수증 하단에 Total: $31.83으로 최종 지불 금액이 명시되어 있습니다."
      },
      {
        text: `ADVERTISEMENT

SUMMER LANGUAGE COURSE

Learn Spanish in just 8 weeks!

Classes: Monday - Thursday, 6:00 PM - 8:00 PM
Starting: June 1
Ending: July 25
Location: Community Center, Room 305

Course includes:
✓ Experienced native-speaking instructor
✓ Small class size (max 12 students)
✓ Free textbook and materials
✓ Certificate upon completion

Early bird discount: 15% off if you register by May 15

Contact: language@community.org
Phone: (555) 123-4567`,
        question: "What benefit is offered for early registration?",
        options: [
          "Free textbook",
          "Extra classes",
          "15% discount",
          "Private tutoring"
        ],
        correct: 2,
        explanation: "5월 15일까지 등록하면 15% 할인을 받을 수 있다고 명시되어 있습니다."
      }
    ]
  };

  const weeklyData = [
    { day: '월', time: 0 },
    { day: '화', time: 0 },
    { day: '수', time: 0 },
    { day: '목', time: 0 },
    { day: '금', time: 0 },
    { day: '토', time: 0 },
    { day: '일', time: 0 }
  ];

  // Calculate weekly data from practice history
  const getWeeklyData = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    
    const weekData = weeklyData.map((day, index) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + index);
      
      const dayPractices = practiceHistory.filter(practice => {
        const practiceDate = new Date(practice.date);
        return practiceDate.toDateString() === dayDate.toDateString();
      });
      
      const totalMinutes = dayPractices.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
      
      return {
        day: day.day,
        time: totalMinutes
      };
    });
    
    return weekData;
  };

  // Calculate user level based on current score
  const calculateUserLevel = (score) => {
    if (score >= 900) return 'Platinum';
    if (score >= 800) return 'Gold';
    if (score >= 600) return 'Silver';
    return 'Bronze';
  };

  // Update level when score changes
  useEffect(() => {
    setUserLevel(calculateUserLevel(currentScore));
  }, [currentScore]);

  // Calculate today's question count
  useEffect(() => {
    const today = new Date().toDateString();
    const todayPractices = practiceHistory.filter(practice => {
      const practiceDate = new Date(practice.date);
      return practiceDate.toDateString() === today;
    });
    
    const count = todayPractices.reduce((sum, p) => sum + (p.questionsAnswered || 0), 0);
    setTodayQuestionCount(count);
  }, [practiceHistory]);

  // Calculate streak
  useEffect(() => {
    if (practiceHistory.length === 0) {
      setStreak(0);
      return;
    }
    
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Sort practice history by date descending
    const sorted = [...practiceHistory].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    // Get unique dates
    const uniqueDates = [...new Set(sorted.map(p => new Date(p.date).toDateString()))];
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      if (uniqueDates.includes(checkDate.toDateString())) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    setStreak(currentStreak);
  }, [practiceHistory]);

  // Mock test timer
  useEffect(() => {
    let interval;
    if (mockTestRunning && mockTestTime > 0) {
      interval = setInterval(() => {
        setMockTestTime(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mockTestRunning, mockTestTime]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are a TOEIC expert tutor. Use the Socratic method to help students discover answers themselves. Always respond in Korean. Keep responses concise and encouraging. Focus on TOEIC grammar, vocabulary, listening, and reading strategies. Provide specific examples and tips.`,
          messages: [
            ...chatMessages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: userMessage }
          ]
        })
      });

      const data = await response.json();
      const aiResponse = data.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');

      setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIQuestion = async (partId) => {
    setGeneratingQuestion(true);
    
    const prompts = {
      1: `Generate a TOEIC Part 1 photo description question in JSON format:

{
  "image": "single emoji representing the scene (e.g., 🏢, 💼, 🚗, 📚, ☕, 👔, 📱, 🖥️, 📊, ✈️)",
  "audio": "The correct description in English",
  "options": ["correct option", "distractor 1", "distractor 2", "distractor 3"],
  "correct": 0,
  "explanation": "Korean explanation of why this is correct"
}

Make it realistic. Respond ONLY with valid JSON, no markdown.`,

      2: `Generate a TOEIC Part 2 question-response in JSON format:

{
  "text": "Q: [Question starting with When/Who/Where/How/Why/What]",
  "audio": "Same as text field",
  "options": ["appropriate response", "inappropriate response 1", "inappropriate response 2"],
  "correct": 0,
  "explanation": "Korean explanation"
}

Respond ONLY with valid JSON, no markdown.`,

      3: `Generate a TOEIC Part 3 short conversation in JSON format:

{
  "text": "Brief context about the conversation",
  "audio": "M: [first line]\nW: [second line]\nM: [third line]",
  "question": "Comprehension question about the dialogue",
  "options": ["option1", "option2", "option3", "option4"],
  "correct": 0-3,
  "explanation": "Korean explanation"
}

Respond ONLY with valid JSON, no markdown.`,

      4: `Generate a TOEIC Part 4 short talk in JSON format:

{
  "text": "Brief context (e.g., 'Listen to a phone message')",
  "audio": "The monologue text (announcement, message, advertisement, etc.)",
  "question": "Comprehension question",
  "options": ["option1", "option2", "option3", "option4"],
  "correct": 0-3,
  "explanation": "Korean explanation"
}

Respond ONLY with valid JSON, no markdown.`,
      
      5: `Generate a TOEIC Part 5 grammar question in the following JSON format. The question should test common TOEIC grammar points like verb tenses, prepositions, word forms, or conjunctions.

{
  "text": "Complete sentence with a blank (use _____ for the blank)",
  "options": ["option1", "option2", "option3", "option4"],
  "correct": 0-3 (index of correct answer),
  "explanation": "Detailed explanation in Korean of why this is the correct answer"
}

Make it realistic and at an intermediate level. Respond ONLY with valid JSON, no markdown formatting.`,
      
      6: `Generate a TOEIC Part 6 text completion question in the following JSON format:

{
  "text": "A business email or memo with one blank (use _____ for the blank)",
  "context": "Brief description of the text type",
  "options": ["option1", "option2", "option3", "option4"],
  "correct": 0-3,
  "explanation": "Detailed explanation in Korean"
}

The text should be 2-3 sentences. Respond ONLY with valid JSON, no markdown.`,

      7: `Generate a TOEIC Part 7 reading comprehension question in the following JSON format:

{
  "text": "A realistic business document (memo, email, notice, advertisement, or receipt)",
  "question": "A comprehension question about the text",
  "options": ["option1", "option2", "option3", "option4"],
  "correct": 0-3,
  "explanation": "Detailed explanation in Korean"
}

Make the document authentic with proper formatting. Respond ONLY with valid JSON, no markdown.`
    };

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: 'You are a TOEIC test question generator. Generate realistic, high-quality TOEIC questions that match the official test format. Always respond with valid JSON only, no markdown code blocks or additional text.',
          messages: [
            { role: 'user', content: prompts[partId] || prompts[5] }
          ]
        })
      });

      const data = await response.json();
      let responseText = data.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');

      // Clean up response - remove markdown formatting if present
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const newQuestion = JSON.parse(responseText);
      
      // Add the generated question to the question bank
      setAiGeneratedQuestions(prev => ({
        ...prev,
        [partId]: [...(prev[partId] || []), newQuestion]
      }));

      alert('✨ AI가 새로운 문제를 생성했습니다!');
      
    } catch (error) {
      console.error('Question generation error:', error);
      alert('문제 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setGeneratingQuestion(false);
    }
  };

  const extractVocabulary = async (question, partName, wasCorrect) => {
    if (wasCorrect) return; // Only extract from wrong answers
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          system: 'You are a vocabulary extraction assistant. Extract 2-3 important TOEIC-level words from the given question. Return ONLY valid JSON array, no markdown.',
          messages: [{
            role: 'user',
            content: `Extract 2-3 important vocabulary words from this TOEIC question and return as JSON array:

Question: ${question.text || question.question || ''}
Options: ${question.options?.join(', ') || ''}

Format:
[
  {
    "word": "vocabulary word",
    "meaning": "Korean meaning",
    "partOfSpeech": "noun/verb/adjective/adverb",
    "example": "example sentence from question"
  }
]

Respond ONLY with valid JSON array, no markdown.`
          }]
        })
      });

      const data = await response.json();
      let responseText = data.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');

      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const words = JSON.parse(responseText);
      
      const newVocab = words.map(w => ({
        ...w,
        fromQuestion: partName,
        saved: true,
        addedAt: Date.now()
      }));

      setVocabulary(prev => [...prev, ...newVocab]);
    } catch (error) {
      console.error('Vocabulary extraction error:', error);
    }
  };

  const analyzeWeakness = async () => {
    setAnalyzingWeakness(true);
    
    const wrongAnswers = practiceResults.filter(r => !r.correct);
    const analysisData = {
      totalQuestions: practiceResults.length,
      wrongCount: wrongAnswers.length,
      accuracy: ((practiceResults.length - wrongAnswers.length) / practiceResults.length * 100).toFixed(1),
      partId: selectedPart,
      partName: toeicParts.find(p => p.id === selectedPart)?.name
    };

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1200,
          system: 'You are a TOEIC expert analyzing student weaknesses. Provide actionable insights in Korean.',
          messages: [{
            role: 'user',
            content: `Analyze this TOEIC practice session:

Part: ${analysisData.partName}
Total Questions: ${analysisData.totalQuestions}
Wrong Answers: ${analysisData.wrongCount}
Accuracy: ${analysisData.accuracy}%

Provide analysis in the following JSON format:
{
  "overallAssessment": "2-3 sentences in Korean about overall performance",
  "weakPoints": ["약점 1", "약점 2", "약점 3"],
  "recommendations": ["추천 학습법 1", "추천 학습법 2", "추천 학습법 3"],
  "estimatedImprovementTime": "예상 향상 기간 (e.g., '2주', '1개월')",
  "motivationalMessage": "동기부여 메시지 (1-2 sentences)"
}

Respond ONLY with valid JSON, no markdown.`
          }]
        })
      });

      const data = await response.json();
      let responseText = data.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');

      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const analysis = JSON.parse(responseText);
      
      setWeaknessAnalysis({
        ...analysis,
        ...analysisData,
        analyzedAt: new Date().toLocaleString('ko-KR')
      });
      setShowWeaknessReport(true);
      
    } catch (error) {
      console.error('Weakness analysis error:', error);
      alert('분석 중 오류가 발생했습니다.');
    } finally {
      setAnalyzingWeakness(false);
    }
  };

  const getCurrentQuestions = (partId) => {
    const baseQuestions = questionBank[partId] || [];
    const aiQuestions = aiGeneratedQuestions[partId] || [];
    return [...baseQuestions, ...aiQuestions];
  };

  const handleAnswerSelect = async (index) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    const currentQuestions = getCurrentQuestions(selectedPart);
    const question = currentQuestions[questionIndex];
    const isCorrect = index === question?.correct;
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setTotalPoints(prev => prev + 10);
    } else {
      // Extract vocabulary from wrong answers
      const partName = toeicParts.find(p => p.id === selectedPart)?.name || 'Unknown';
      extractVocabulary(question, partName, false);
    }
    
    setPracticeResults(prev => [...prev, {
      question: questionIndex,
      correct: isCorrect,
      userAnswer: index,
      correctAnswer: question?.correct
    }]);
  };

  const handleNextQuestion = () => {
    const currentQuestions = getCurrentQuestions(selectedPart);
    if (questionIndex < currentQuestions.length - 1) {
      setQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Session completed - save practice session
      const sessionData = {
        date: new Date().toISOString(),
        partId: selectedPart,
        partName: toeicParts.find(p => p.id === selectedPart)?.name,
        questionsAnswered: currentQuestions.length,
        correctAnswers: correctAnswers,
        accuracy: (correctAnswers / currentQuestions.length * 100).toFixed(1),
        timeSpent: Math.floor(Math.random() * 20) + 10, // Estimate based on questions
        pointsEarned: correctAnswers * 10
      };
      
      setPracticeHistory(prev => [...prev, sessionData]);
      
      // Update scores based on performance
      const accuracyPercent = correctAnswers / currentQuestions.length;
      if (accuracyPercent >= 0.8) {
        setCurrentScore(prev => Math.min(990, prev + 5)); // Good performance
        setTotalPoints(prev => prev + correctAnswers * 10 + 50); // Bonus points
      } else if (accuracyPercent >= 0.6) {
        setCurrentScore(prev => Math.min(990, prev + 2)); // Decent performance
        setTotalPoints(prev => prev + correctAnswers * 10);
      } else {
        setTotalPoints(prev => prev + correctAnswers * 10); // Points only
      }
      
      // offer weakness analysis
      if (practiceResults.length >= 3) {
        const shouldAnalyze = window.confirm(
          `연습 완료! 정답률: ${Math.round((correctAnswers / currentQuestions.length) * 100)}%\n\nAI 약점 분석을 받으시겠습니까?`
        );
        if (shouldAnalyze) {
          analyzeWeakness();
        }
      } else {
        alert(`완료! 정답률: ${Math.round((correctAnswers / currentQuestions.length) * 100)}%\n\n+${correctAnswers * 10} 포인트 획득!`);
      }
      
      setSelectedPart(null);
      setQuestionIndex(0);
      setCorrectAnswers(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setPracticeResults([]);
      setCurrentScreen('home');
    }
  };

  const startPractice = (partId) => {
    setSelectedPart(partId);
    setQuestionIndex(0);
    setCorrectAnswers(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setPracticeResults([]);
    setCurrentScreen('practice');
  };

  const startMockTest = () => {
    setMockTestMode(true);
    setMockTestTime(7200);
    setMockTestRunning(true);
    setCurrentScreen('practice');
  };

  const simulateAudioPlay = () => {
    setAudioPlaying(true);
    setAudioProgress(0);
    
    const interval = setInterval(() => {
      setAudioProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setAudioPlaying(false);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const getLevelColor = (level) => {
    const colors = {
      'Bronze': 'text-orange-600',
      'Silver': 'text-gray-400',
      'Gold': 'text-yellow-500',
      'Platinum': 'text-purple-500'
    };
    return colors[level] || 'text-gray-400';
  };

  const renderVocabulary = () => (
    <div className="space-y-6 pb-24">
      {/* User Profile */}
      {renderUserProfile()}
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">나만의 단어장</h2>
            <p className="text-indigo-100 text-sm">오답에서 자동 추출된 어휘</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{vocabulary.length}</p>
            <p className="text-indigo-100 text-sm">개 단어</p>
          </div>
        </div>
      </div>

      {/* Vocabulary List */}
      {vocabulary.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-md">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">아직 저장된 단어가 없습니다</p>
          <p className="text-sm text-gray-400">문제를 틀리면 자동으로 단어가 추가됩니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vocabulary.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{item.word}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                      {item.partOfSpeech}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{item.meaning}</p>
                  <div className="bg-gray-50 rounded-lg p-3 mb-2">
                    <p className="text-sm text-gray-600 italic">"{item.example}"</p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Target className="w-3 h-3" />
                    <span>{item.fromQuestion}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setVocabulary(prev => prev.filter((_, i) => i !== idx))}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Study Tips */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 border-2 border-yellow-200">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-2">학습 팁</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 틀린 문제에서 자동으로 중요 단어가 추가됩니다</li>
              <li>• 예문과 함께 외우면 기억에 더 오래 남습니다</li>
              <li>• 하루 10개씩 복습하면 효과적입니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWeaknessReport = () => {
    if (!weaknessAnalysis) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white rounded-t-2xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold">AI 약점 분석 리포트</h2>
              <button 
                onClick={() => setShowWeaknessReport(false)}
                className="text-white hover:text-gray-200"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <p className="text-blue-100 text-sm">{weaknessAnalysis.analyzedAt}</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">파트</p>
                <p className="text-2xl font-bold text-blue-600">{weaknessAnalysis.partName}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">정답률</p>
                <p className="text-2xl font-bold text-green-600">{weaknessAnalysis.accuracy}%</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">문제 수</p>
                <p className="text-2xl font-bold text-purple-600">{weaknessAnalysis.totalQuestions}</p>
              </div>
            </div>

            {/* Overall Assessment */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
              <div className="flex items-start space-x-3">
                <Brain className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">종합 평가</h3>
                  <p className="text-gray-700 leading-relaxed">{weaknessAnalysis.overallAssessment}</p>
                </div>
              </div>
            </div>

            {/* Weak Points */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3 flex items-center space-x-2">
                <Target className="w-5 h-5 text-red-500" />
                <span>주요 약점</span>
              </h3>
              <div className="space-y-2">
                {weaknessAnalysis.weakPoints.map((point, idx) => (
                  <div key={idx} className="bg-red-50 rounded-lg p-4 border-l-4 border-red-400">
                    <p className="text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="font-bold text-gray-800 mb-3 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>맞춤 학습법</span>
              </h3>
              <div className="space-y-2">
                {weaknessAnalysis.recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
                    <p className="text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">예상 향상 기간</p>
                  <p className="text-xl font-bold text-green-700">{weaknessAnalysis.estimatedImprovementTime}</p>
                </div>
              </div>
            </div>

            {/* Motivational Message */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border-2 border-purple-200">
              <div className="flex items-start space-x-3">
                <Trophy className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">응원 메시지</h3>
                  <p className="text-gray-700 leading-relaxed">{weaknessAnalysis.motivationalMessage}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowWeaknessReport(false);
                  startPractice(selectedPart || 5);
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                다시 연습하기
              </button>
              <button
                onClick={() => setShowWeaknessReport(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTargetScoreModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white rounded-t-2xl">
          <h2 className="text-2xl font-bold">목표 점수 설정</h2>
          <p className="text-blue-100 text-sm mt-2">도전하고 싶은 TOEIC 목표 점수를 설정하세요</p>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">목표 점수</label>
            <input
              type="range"
              min="400"
              max="990"
              step="10"
              value={tempTargetScore}
              onChange={(e) => setTempTargetScore(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>400</span>
              <span className="text-2xl font-bold text-blue-600">{tempTargetScore}</span>
              <span>990</span>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-gray-800">레벨 안내</h4>
            </div>
            <div className="space-y-1 text-sm text-gray-700">
              <p>🥉 Bronze: 400-599점</p>
              <p>🥈 Silver: 600-799점</p>
              <p>🥇 Gold: 800-899점</p>
              <p>💎 Platinum: 900-990점</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowTargetModal(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
            >
              취소
            </button>
            <button
              onClick={() => {
                setTargetScore(tempTargetScore);
                setShowTargetModal(false);
                if (user) syncDataToBackend();
                alert(`목표 점수가 ${tempTargetScore}점으로 설정되었습니다! 🎯`);
              }}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              설정 완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAuthModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {authMode === 'login' ? '로그인' : '회원가입'}
            </h2>
            <button 
              onClick={() => setShowAuth(false)}
              className="text-white hover:text-gray-200"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          <p className="text-blue-100 text-sm mt-2">
            {authMode === 'login' 
              ? '계정에 로그인하여 학습 데이터를 동기화하세요' 
              : '새 계정을 만들어 학습을 시작하세요'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="p-6 space-y-4">
          {authMode === 'signup' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">이름</label>
              <input
                type="text"
                value={authForm.name}
                onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                placeholder="홍길동"
                required={authMode === 'signup'}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">이메일</label>
            <input
              type="email"
              value={authForm.email}
              onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              placeholder="example@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호</label>
            <input
              type="password"
              value={authForm.password}
              onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            {authMode === 'login' ? '로그인' : '회원가입'}
          </button>

          <div className="text-center pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'signup' : 'login');
                setAuthForm({ email: '', password: '', name: '' });
              }}
              className="text-blue-600 text-sm font-semibold hover:text-blue-700"
            >
              {authMode === 'login' 
                ? '계정이 없으신가요? 회원가입' 
                : '이미 계정이 있으신가요? 로그인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderUserProfile = () => {
    if (!user) {
      return (
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">로그인하여 데이터 저장</p>
              <p className="text-xs text-gray-500 mt-1">클라우드 동기화 및 백업</p>
            </div>
            <button
              onClick={() => setShowAuth(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              로그인
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4 border-2 border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-600">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors"
          >
            로그아웃
          </button>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-gray-600">
            {syncing ? (
              <>
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>동기화 중...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>
                  {lastSyncTime 
                    ? `마지막 동기화: ${lastSyncTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`
                    : '동기화됨'}
                </span>
              </>
            )}
          </div>
          <button
            onClick={syncDataToBackend}
            disabled={syncing}
            className="text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50"
          >
            수동 동기화
          </button>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6 pb-24">
      {/* User Profile */}
      {renderUserProfile()}
      
      {/* Learning Goals */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-bold text-gray-800">학습 목표 설정</h3>
        </div>
        
        <div className="p-4 space-y-3">
          <button
            onClick={() => {
              setTempTargetScore(targetScore);
              setShowTargetModal(true);
            }}
            className="w-full flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">목표 점수</p>
                <p className="text-xs text-gray-600">현재: {targetScore}점</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800">일일 목표</p>
                  <p className="text-xs text-gray-600">하루 {dailyGoal}문제 풀기</p>
                </div>
              </div>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="10"
              value={dailyGoal}
              onChange={(e) => {
                setDailyGoal(parseInt(e.target.value));
                if (user) syncDataToBackend();
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>10</span>
              <span className="font-bold text-green-600">{dailyGoal}문제</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Account Settings */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-bold text-gray-800">계정 설정</h3>
        </div>
        
        {user ? (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-gray-700">이름</p>
                <p className="text-gray-600">{user.name}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-gray-700">이메일</p>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-gray-700">가입일</p>
                <p className="text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500 mb-4">로그인하여 계정 정보를 확인하세요</p>
            <button
              onClick={() => setShowAuth(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              로그인
            </button>
          </div>
        )}
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-bold text-gray-800">데이터 관리</h3>
        </div>
        
        <div className="p-4 space-y-3">
          <button
            onClick={syncDataToBackend}
            disabled={!user || syncing}
            className="w-full flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">데이터 동기화</p>
                <p className="text-xs text-gray-600">클라우드에 데이터 저장</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={async () => {
              if (window.confirm('모든 학습 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                setVocabulary([]);
                setPracticeResults([]);
                setAiGeneratedQuestions({});
                setCurrentScore(400);
                setStreak(0);
                setTotalPoints(0);
                if (user) await syncDataToBackend();
                alert('데이터가 초기화되었습니다.');
              }
            }}
            className="w-full flex items-center justify-between p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">데이터 초기화</p>
                <p className="text-xs text-gray-600">모든 학습 기록 삭제</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-bold text-gray-800">앱 정보</h3>
        </div>
        
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-700">버전</p>
            <p className="text-gray-600">1.0.0</p>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-700">총 단어 수</p>
            <p className="text-gray-600">{vocabulary.length}개</p>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-700">AI 생성 문제</p>
            <p className="text-gray-600">
              {Object.values(aiGeneratedQuestions).reduce((sum, arr) => sum + arr.length, 0)}개
            </p>
          </div>
        </div>
      </div>

      {/* Storage Info */}
      {user && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-gray-800 mb-2">클라우드 백업 활성화</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                모든 학습 데이터가 안전하게 클라우드에 저장됩니다. 
                다른 기기에서도 동일한 계정으로 로그인하여 학습을 이어갈 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderHome = () => (
    <div className="space-y-6 pb-24">
      {/* User Profile Section */}
      {renderUserProfile()}
      
      {/* Daily Progress Card */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-200 text-sm">오늘의 학습 목표</p>
            <p className="text-3xl font-bold mt-1">{dailyGoal}문제</p>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-sm">진행률</p>
            <p className="text-3xl font-bold mt-1">{Math.min(100, Math.round((todayQuestionCount / dailyGoal) * 100))}%</p>
          </div>
        </div>
        <div className="w-full bg-blue-700 rounded-full h-3">
          <div 
            className="bg-green-400 h-3 rounded-full transition-all duration-500" 
            style={{width: `${Math.min(100, (todayQuestionCount / dailyGoal) * 100)}%`}}
          ></div>
        </div>
        <p className="text-blue-200 text-sm mt-3">
          {todayQuestionCount >= dailyGoal 
            ? '🎉 오늘 목표 달성!' 
            : `${dailyGoal - todayQuestionCount}문제 남음 • 화이팅!`}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={startMockTest}
          className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex flex-col items-start space-y-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg">모의고사</h3>
              <p className="text-purple-200 text-sm">실전 2시간 테스트</p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => setCurrentScreen('chat')}
          className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex flex-col items-start space-y-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-lg">AI 튜터</h3>
              <p className="text-green-200 text-sm">실시간 학습 도움</p>
            </div>
          </div>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center space-x-2 mb-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-xs text-gray-500">연속 학습</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{streak}일</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center space-x-2 mb-2">
            <Award className={`w-5 h-5 ${getLevelColor(userLevel)}`} />
            <span className="text-xs text-gray-500">레벨</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{userLevel}</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-gray-500">예상 점수</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{currentScore}</p>
        </div>
      </div>

      {/* TOEIC Parts Selection */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">파트별 학습</h3>
          <button className="text-blue-600 text-sm font-semibold">전체 보기</button>
        </div>
        
        {/* Listening Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Headphones className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-gray-700">Listening (듣기)</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {toeicParts.filter(p => p.type === 'listening').map(part => {
              // Calculate actual accuracy from practice history
              const partSessions = practiceHistory.filter(s => s.partId === part.id);
              let accuracy = 0;
              
              if (partSessions.length > 0) {
                const totalQuestions = partSessions.reduce((sum, s) => sum + s.questionsAnswered, 0);
                const totalCorrect = partSessions.reduce((sum, s) => sum + s.correctAnswers, 0);
                accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
              }
              
              return (
                <button
                  key={part.id}
                  onClick={() => startPractice(part.id)}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-100 hover:border-blue-300 transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{part.icon}</span>
                    <span className={`text-xs font-bold ${
                      accuracy >= 80 ? 'text-green-600' : 
                      accuracy >= 60 ? 'text-blue-600' : 
                      accuracy > 0 ? 'text-orange-600' : 'text-gray-400'
                    }`}>
                      {accuracy > 0 ? `${accuracy}%` : '-'}
                    </span>
                  </div>
                  <h5 className="font-bold text-gray-800 text-sm mb-1">{part.name}</h5>
                  <p className="text-xs text-gray-600">
                    {partSessions.length > 0 
                      ? `${partSessions.reduce((sum, s) => sum + s.questionsAnswered, 0)}문제 풀이` 
                      : '학습 시작하기'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reading Section */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="w-5 h-5 text-green-600" />
            <h4 className="font-bold text-gray-700">Reading (읽기)</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {toeicParts.filter(p => p.type === 'reading').map(part => {
              // Calculate actual accuracy from practice history
              const partSessions = practiceHistory.filter(s => s.partId === part.id);
              let accuracy = 0;
              
              if (partSessions.length > 0) {
                const totalQuestions = partSessions.reduce((sum, s) => sum + s.questionsAnswered, 0);
                const totalCorrect = partSessions.reduce((sum, s) => sum + s.correctAnswers, 0);
                accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
              }
              
              return (
                <button
                  key={part.id}
                  onClick={() => startPractice(part.id)}
                  className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-xl p-4 border-2 border-green-100 hover:border-green-300 transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{part.icon}</span>
                    <span className={`text-xs font-bold ${
                      accuracy >= 80 ? 'text-green-600' : 
                      accuracy >= 60 ? 'text-blue-600' : 
                      accuracy > 0 ? 'text-orange-600' : 'text-gray-400'
                    }`}>
                      {accuracy > 0 ? `${accuracy}%` : '-'}
                    </span>
                  </div>
                  <h5 className="font-bold text-gray-800 text-sm mb-1">{part.name}</h5>
                  <p className="text-xs text-gray-600">
                    {partSessions.length > 0 
                      ? `${partSessions.reduce((sum, s) => sum + s.questionsAnswered, 0)}문제 풀이` 
                      : '학습 시작하기'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weak Points Alert */}
      {practiceHistory.length > 0 && (() => {
        // Calculate weakest part
        const partStats = {};
        practiceHistory.forEach(session => {
          if (!partStats[session.partId]) {
            partStats[session.partId] = { total: 0, correct: 0, count: 0 };
          }
          partStats[session.partId].total += session.questionsAnswered;
          partStats[session.partId].correct += session.correctAnswers;
          partStats[session.partId].count++;
        });
        
        let weakestPart = null;
        let lowestAccuracy = 100;
        
        Object.keys(partStats).forEach(partId => {
          const accuracy = (partStats[partId].correct / partStats[partId].total) * 100;
          if (accuracy < lowestAccuracy && partStats[partId].count >= 2) {
            lowestAccuracy = accuracy;
            weakestPart = parseInt(partId);
          }
        });
        
        if (weakestPart && lowestAccuracy < 75) {
          const part = toeicParts.find(p => p.id === weakestPart);
          return (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-5 border-2 border-orange-200">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 mb-1">AI 추천 학습</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    {part?.name} {part?.title}의 정답률이 {lowestAccuracy.toFixed(1)}%로 낮습니다. 집중 학습을 추천드려요!
                  </p>
                  <button 
                    onClick={() => startPractice(weakestPart)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
                  >
                    {part?.name} 집중 연습 시작
                  </button>
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}
    </div>
  );

  const renderPractice = () => {
    if (!selectedPart && !mockTestMode) {
      return (
        <div className="text-center py-20 pb-32">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">학습할 파트를 선택해주세요</p>
          <button 
            onClick={() => setCurrentScreen('home')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          >
            홈으로 돌아가기
          </button>
        </div>
      );
    }

    const currentQuestions = getCurrentQuestions(selectedPart);
    
    if (currentQuestions.length === 0) {
      return (
        <div className="text-center py-20 pb-32">
          <Zap className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-700 font-semibold mb-2">이 파트의 문제가 아직 없습니다</p>
          <p className="text-gray-500 mb-6">AI가 문제를 생성해드릴까요?</p>
          <button
            onClick={() => generateAIQuestion(selectedPart)}
            disabled={generatingQuestion}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
          >
            {generatingQuestion ? '생성 중...' : 'AI 문제 생성하기'}
          </button>
        </div>
      );
    }
    
    const question = currentQuestions[questionIndex];
    const currentPart = toeicParts.find(p => p.id === selectedPart);

    if (!question) {
      return (
        <div className="text-center py-20 pb-32">
          <p className="text-gray-600">문제를 불러오는 중...</p>
        </div>
      );
    }

    const isListeningPart = currentPart?.type === 'listening';

    return (
      <div className="space-y-6 pb-32">
        {/* Header with Timer and AI Generate Button */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => {
                  setSelectedPart(null);
                  setMockTestMode(false);
                  setQuestionIndex(0);
                  setSelectedAnswer(null);
                  setShowExplanation(false);
                  setCurrentScreen('home');
                }}
                className="text-gray-600 hover:text-gray-800 font-semibold"
              >
                ← 나가기
              </button>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {mockTestMode ? '모의고사' : currentPart?.name}
                </p>
                <p className="text-xs text-gray-500">{currentPart?.title}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* AI Generate Button - now for ALL parts */}
              <button
                onClick={() => generateAIQuestion(selectedPart)}
                disabled={generatingQuestion}
                className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>{generatingQuestion ? '생성중...' : 'AI 문제'}</span>
              </button>
              {mockTestMode && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-red-500" />
                  <span className="text-lg font-bold text-red-600">{formatTime(mockTestTime)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">
              문제 {questionIndex + 1} / {currentQuestions.length}
            </span>
            <span className="font-semibold text-blue-600">
              정답률: {questionIndex > 0 ? Math.round((correctAnswers / questionIndex) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{width: `${((questionIndex + 1) / currentQuestions.length) * 100}%`}}
            ></div>
          </div>
        </div>

        {/* Audio Player for Listening Parts */}
        {isListeningPart && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 shadow-md border-2 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Headphones className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">오디오 재생</p>
                  <p className="text-xs text-gray-600">한 번만 재생됩니다</p>
                </div>
              </div>
              <button
                onClick={simulateAudioPlay}
                disabled={audioPlaying}
                className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {audioPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
              </button>
            </div>
            {audioPlaying && (
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{width: `${audioProgress}%`}}
                ></div>
              </div>
            )}
            {question.audio && (
              <div className="mt-3 p-3 bg-white bg-opacity-50 rounded-lg">
                <p className="text-xs text-gray-600 italic">"{question.audio}"</p>
              </div>
            )}
          </div>
        )}

        {/* Image for Part 1 */}
        {selectedPart === 1 && question.image && (
          <div className="bg-white rounded-xl p-6 shadow-md flex items-center justify-center">
            <div className="text-9xl">{question.image}</div>
          </div>
        )}

        {/* Question Card */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          {/* AI Generated Badge */}
          {questionIndex >= (questionBank[selectedPart]?.length || 0) && (
            <div className="mb-4 inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 rounded-full">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-700">AI 생성 문제</span>
            </div>
          )}
          
          {question.text && (
            <div className="mb-6">
              {selectedPart === 7 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">{question.text}</pre>
                </div>
              )}
              {selectedPart !== 7 && selectedPart !== 1 && !question.question && (
                <p className="text-lg text-gray-800 leading-relaxed mb-4">{question.text}</p>
              )}
              {question.question && (
                <p className="text-base font-semibold text-gray-800 mb-4">{question.question}</p>
              )}
            </div>
          )}
          
          {question.options && question.options.length > 0 && (
            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === question.correct;
                const showResult = showExplanation;
                
                let buttonClass = "w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ";
                
                if (showResult) {
                  if (isCorrect) {
                    buttonClass += "border-green-500 bg-green-50 text-green-800";
                  } else if (isSelected && !isCorrect) {
                    buttonClass += "border-red-500 bg-red-50 text-red-800";
                  } else {
                    buttonClass += "border-gray-200 bg-gray-50 text-gray-500";
                  }
                } else {
                  buttonClass += isSelected 
                    ? "border-blue-500 bg-blue-50 text-blue-800" 
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-800";
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={buttonClass}
                    disabled={showExplanation}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{String.fromCharCode(65 + index)}. {option}</span>
                      {showResult && isCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Explanation Modal */}
        {showExplanation && question.explanation && (
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 shadow-lg border-2 border-blue-200">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 mb-2">AI 튜터 해설</h4>
                <p className="text-gray-700 leading-relaxed">{question.explanation}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setCurrentScreen('chat');
                  setInputMessage(`이 문제에 대해 더 자세히 설명해주세요: ${question.text || question.question}`);
                }}
                className="bg-white border-2 border-blue-300 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>AI에게 질문</span>
              </button>
              <button
                onClick={handleNextQuestion}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center space-x-2"
              >
                <span>{questionIndex < currentQuestions.length - 1 ? '다음 문제' : '완료'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Vocabulary Hint */}
        {!showExplanation && selectedAnswer !== null && (
          <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <BookOpen className="w-4 h-4" />
              <span>
                {selectedAnswer === question.correct 
                  ? '정답입니다! 잘하셨어요 👏' 
                  : '이 문제의 중요 단어가 자동으로 단어장에 추가됩니다'}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderChat = () => (
    <div className="flex flex-col h-[calc(100vh-180px)] pb-20">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-4 mb-4 text-white shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold">AI 튜터 Claude</h3>
            <p className="text-sm text-purple-100">TOEIC 전문가가 도와드립니다</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-1">
        {chatMessages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white shadow-md text-gray-800'
            }`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                    <Brain className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500">AI 튜터</span>
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white shadow-md rounded-2xl px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
        {[
          '문법 팁 알려줘',
          'Part 7 공략법',
          '빈출 단어 추천',
          '듣기 향상 방법'
        ].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setInputMessage(suggestion)}
            className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium whitespace-nowrap hover:from-blue-200 hover:to-purple-200 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-2xl shadow-lg p-3 flex items-center space-x-3">
        <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
          <Volume2 className="w-5 h-5 text-gray-600" />
        </button>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="TOEIC에 대해 무엇이든 물어보세요..."
          className="flex-1 outline-none text-gray-800 placeholder-gray-400"
          disabled={isLoading}
        />
        <button 
          onClick={handleSendMessage}
          disabled={isLoading || !inputMessage.trim()}
          className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6 pb-24">
      {/* User Profile */}
      {renderUserProfile()}
      
      {/* Score Progress */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-200 text-sm mb-2">현재 예상 점수</p>
            <p className="text-5xl font-bold">{currentScore}</p>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-sm mb-2">목표 점수</p>
            <p className="text-3xl font-bold">{targetScore}</p>
          </div>
        </div>
        <div className="w-full bg-blue-700 rounded-full h-3 mb-3">
          <div 
            className="bg-green-400 h-3 rounded-full transition-all duration-500"
            style={{width: `${(currentScore / targetScore) * 100}%`}}
          ></div>
        </div>
        <div className="bg-blue-700 bg-opacity-50 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-800 mb-2">종합 평가</h3>
              <p className="text-sm text-blue-100 leading-relaxed">
                {practiceHistory.length === 0 
                  ? '학습을 시작하여 점수를 쌓아보세요! 문제를 풀수록 예상 점수가 정확해집니다.' 
                  : currentScore >= targetScore 
                    ? `🎉 목표 점수 달성! ${currentScore - targetScore}점 초과 달성했습니다. 다음 목표를 설정해보세요!`
                    : practiceHistory.length >= 10
                      ? `현재 페이스를 유지하면 약 ${Math.ceil((targetScore - currentScore) / 2)}주 후 목표 달성 예상됩니다. 꾸준히 하고 계시네요! 👏`
                      : `${practiceHistory.length}회 학습 완료! ${10 - practiceHistory.length}회 더 학습하면 더 정확한 예상 점수를 알 수 있습니다.`
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Study Time */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">주간 학습 시간</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={getWeeklyData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: 'white'}}
            />
            <Line 
              type="monotone" 
              dataKey="time" 
              stroke="#48BB78" 
              strokeWidth={3}
              dot={{fill: '#48BB78', r: 5}}
              activeDot={{r: 7}}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">총 학습 시간</p>
            <p className="text-xl font-bold text-gray-800">
              {Math.floor(getWeeklyData().reduce((sum, d) => sum + d.time, 0) / 60)}시간 {getWeeklyData().reduce((sum, d) => sum + d.time, 0) % 60}분
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">일평균 학습</p>
            <p className="text-xl font-bold text-gray-800">
              {Math.round(getWeeklyData().reduce((sum, d) => sum + d.time, 0) / 7)}분
            </p>
          </div>
        </div>
      </div>

      {/* Part Accuracy Radar */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">파트별 정확도</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={getToeicPartsWithAccuracy()}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="name" tick={{fill: '#6b7280', fontSize: 12}} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{fill: '#6b7280'}} />
            <Radar 
              name="정확도" 
              dataKey="accuracy" 
              stroke="#1A365D" 
              fill="#48BB78" 
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
        
        {/* Weakest Part Alert */}
        {(() => {
          const partsWithData = getToeicPartsWithAccuracy().filter(p => p.practiced);
          
          if (partsWithData.length === 0) {
            return (
              <div className="mt-4 bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">문제를 풀면 파트별 정확도가 표시됩니다</p>
              </div>
            );
          }
          
          const weakest = partsWithData
            .filter(p => practiceHistory.filter(s => s.partId === p.id).length >= 2)
            .sort((a, b) => a.accuracy - b.accuracy)[0];
          
          if (weakest && weakest.accuracy < 75) {
            return (
              <div className="mt-4 bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-5 h-5 text-orange-600" />
                  <h4 className="font-bold text-gray-800">집중 학습 추천</h4>
                </div>
                <p className="text-sm text-gray-700">
                  {weakest.name} ({weakest.title}) 정확도가 {weakest.accuracy}%로 가장 낮습니다. 
                  집중 연습으로 20%p 향상 가능해요!
                </p>
              </div>
            );
          }
          
          return null;
        })()}
      </div>

      {/* Achievement Badges */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">획득한 배지</h3>
          <span className="text-sm text-gray-500">
            {[
              {name: 'Bronze', score: 400, unlocked: currentScore >= 400},
              {name: 'Silver', score: 600, unlocked: currentScore >= 600},
              {name: 'Gold', score: 800, unlocked: currentScore >= 800},
              {name: 'Platinum', score: 900, unlocked: currentScore >= 900}
            ].filter(b => b.unlocked).length}개 중 4개 획득
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            {name: 'Bronze', score: 400, unlocked: currentScore >= 400, color: 'from-orange-400 to-orange-600'},
            {name: 'Silver', score: 600, unlocked: currentScore >= 600, color: 'from-gray-300 to-gray-500'},
            {name: 'Gold', score: 800, unlocked: currentScore >= 800, color: 'from-yellow-400 to-yellow-600'},
            {name: 'Platinum', score: 900, unlocked: currentScore >= 900, color: 'from-purple-400 to-purple-600'}
          ].map((badge) => (
            <div key={badge.name} className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 transition-all ${
                badge.unlocked 
                  ? `bg-gradient-to-br ${badge.color} shadow-lg` 
                  : 'bg-gray-200'
              }`}>
                <Award className={`w-8 h-8 ${badge.unlocked ? 'text-white' : 'text-gray-400'}`} />
              </div>
              <p className={`text-xs font-semibold ${badge.unlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                {badge.name}
              </p>
              <p className="text-xs text-gray-500">{badge.score}+</p>
              {!badge.unlocked && currentScore < badge.score && (
                <p className="text-xs text-orange-500 mt-1">{badge.score - currentScore}점 남음</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Learning Statistics */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">학습 통계</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">총 풀이 문제</span>
            </div>
            <span className="text-lg font-bold text-gray-800">
              {practiceHistory.reduce((sum, s) => sum + s.questionsAnswered, 0)}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">전체 정답률</span>
            </div>
            <span className="text-lg font-bold text-gray-800">
              {practiceHistory.length > 0 
                ? Math.round(
                    (practiceHistory.reduce((sum, s) => sum + s.correctAnswers, 0) / 
                    practiceHistory.reduce((sum, s) => sum + s.questionsAnswered, 0)) * 100
                  ) 
                : 0}%
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">학습 세션</span>
            </div>
            <span className="text-lg font-bold text-gray-800">{practiceHistory.length}회</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-6 py-4 shadow-lg sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">ToeicMate</h1>
            <p className="text-blue-200 text-sm">AI 토익 개인 과외</p>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <button 
                onClick={() => {
                  setTempTargetScore(targetScore);
                  setShowTargetModal(true);
                }}
                className="text-right hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"
              >
                <p className="text-sm text-blue-200">목표</p>
                <p className="text-xl font-bold">{targetScore}</p>
              </button>
            )}
            <button 
              onClick={() => setCurrentScreen('settings')}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                currentScreen === 'settings' ? 'bg-blue-600' : 'bg-blue-700 hover:bg-blue-600'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {currentScreen === 'home' && renderHome()}
        {currentScreen === 'practice' && renderPractice()}
        {currentScreen === 'chat' && renderChat()}
        {currentScreen === 'dashboard' && renderDashboard()}
        {currentScreen === 'vocabulary' && renderVocabulary()}
        {currentScreen === 'settings' && renderSettings()}
      </div>

      {/* Weakness Report Modal */}
      {showWeaknessReport && renderWeaknessReport()}
      
      {/* Auth Modal */}
      {showAuth && renderAuthModal()}
      
      {/* Target Score Modal */}
      {showTargetModal && renderTargetScoreModal()}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
        <div className="flex justify-around py-3">
          {[
            {
              id: 'home', 
              icon: Home, 
              label: '홈',
              action: () => {
                setCurrentScreen('home');
                setSelectedPart(null);
              }
            },
            {
              id: 'practice', 
              icon: BookOpen, 
              label: '연습',
              action: () => {
                // 현재 연습 화면이면 홈으로, 아니면 그대로 유지
                if (currentScreen === 'practice' && selectedPart) {
                  // 이미 연습 중이면 아무것도 안 함
                  return;
                } else {
                  // 다른 화면에서 누르면 홈으로 (파트 선택하도록)
                  setCurrentScreen('home');
                  setSelectedPart(null);
                }
              }
            },
            {
              id: 'vocabulary', 
              icon: BookOpen, 
              label: '단어장',
              action: () => setCurrentScreen('vocabulary')
            },
            {
              id: 'chat', 
              icon: MessageCircle, 
              label: 'AI 튜터',
              action: () => setCurrentScreen('chat')
            },
            {
              id: 'dashboard', 
              icon: BarChart3, 
              label: '성과',
              action: () => setCurrentScreen('dashboard')
            }
          ].map((nav) => (
            <button
              key={nav.id}
              onClick={nav.action}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all relative ${
                (currentScreen === nav.id || (nav.id === 'practice' && currentScreen === 'home' && !selectedPart)) 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <nav.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{nav.label}</span>
              {nav.id === 'vocabulary' && vocabulary.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {vocabulary.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;