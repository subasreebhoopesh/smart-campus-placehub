import { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Sparkles, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE = 'http://localhost:3001/api';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  time: string;
}

interface StudentProfile {
  name: string;
  branch: string;
  cgpa: number;
  skills: string[];
  rollNumber: string;
  applications: any[];
  drives: any[];
}

// ── Smart AI Engine ──────────────────────────────────────────────────────────

function generateResponse(input: string, profile: StudentProfile): string {
  const q = input.toLowerCase().trim();

  // Greeting
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|hai|helo)/.test(q)) {
    return `Hello ${profile.name}! 👋 I'm your AI Career Assistant. I know your profile — ${profile.branch} branch, CGPA ${profile.cgpa}, and ${profile.skills.length} skills. Ask me anything about your placement journey!`;
  }

  // Who are you
  if (/who are you|what are you|introduce yourself/.test(q)) {
    return `I'm PlaceHub AI 🤖 — your personal career assistant built into this placement portal. I know your profile, your applications, and the available drives. I can help you with career advice, interview tips, skill gaps, and placement strategy!`;
  }

  // CGPA related
  if (/cgpa|gpa|grade|marks|percentage/.test(q)) {
    const cgpa = profile.cgpa;
    if (cgpa >= 8.5) {
      return `Your CGPA is ${cgpa} — that's excellent! 🌟 You're eligible for almost all companies including top-tier ones like Google, Microsoft, and Amazon. Focus on DSA and system design to crack their interviews.`;
    } else if (cgpa >= 7.5) {
      return `Your CGPA is ${cgpa} — that's good! ✅ You're eligible for most companies. To improve your chances, strengthen your technical skills and build 2-3 strong projects. Companies like TCS, Infosys, Wipro, and many mid-tier companies will consider you.`;
    } else if (cgpa >= 6.0) {
      return `Your CGPA is ${cgpa}. Don't worry — many companies have a 6.0 cutoff. Focus on your skills and projects. Companies like TCS, Wipro, and several startups hire based on skills more than CGPA. Build a strong portfolio!`;
    } else {
      return `Your CGPA is ${cgpa}. While some companies have higher cutoffs, don't be discouraged. Focus on building strong technical skills, projects, and certifications. Many startups and service companies value skills over CGPA.`;
    }
  }

  // Skills related
  if (/skill|learn|technology|tech stack|what to learn/.test(q)) {
    const skills = profile.skills;
    const branch = profile.branch.toUpperCase();

    if (skills.length === 0) {
      return `You haven't added any skills yet! Please update your profile with your technical skills. For ${branch} students, I recommend: JavaScript, Python, React, Node.js, SQL, and Data Structures & Algorithms.`;
    }

    const suggestions: Record<string, string[]> = {
      CSE: ['System Design', 'Cloud (AWS/GCP)', 'Docker', 'Kubernetes', 'Machine Learning'],
      IT: ['Full Stack Development', 'DevOps', 'Cloud Computing', 'Cybersecurity', 'API Development'],
      ECE: ['Embedded Systems', 'IoT', 'VLSI', 'Signal Processing', 'Python for Hardware'],
      EEE: ['Power Systems', 'PLC Programming', 'MATLAB', 'Embedded C', 'Automation'],
      MECH: ['CAD/CAM', 'ANSYS', 'SolidWorks', 'Manufacturing Processes', 'Six Sigma'],
      CIVIL: ['AutoCAD', 'STAAD Pro', 'Revit', 'Project Management', 'GIS'],
    };

    const branchKey = Object.keys(suggestions).find(k => branch.includes(k)) || 'CSE';
    const missing = suggestions[branchKey].filter(s => !skills.some(sk => sk.toLowerCase().includes(s.toLowerCase())));

    return `You currently have ${skills.length} skills: ${skills.slice(0, 4).join(', ')}${skills.length > 4 ? '...' : ''}. 

For ${branch} students, I recommend adding: **${missing.slice(0, 3).join(', ')}**. 

These are in high demand by recruiters visiting your campus. Would you like tips on how to learn any of these?`;
  }

  // Which companies / eligible
  if (/which compan|eligible|apply|suitable company|best company/.test(q)) {
    const cgpa = profile.cgpa;
    const skills = profile.skills.map(s => s.toLowerCase());

    let companies = [];
    if (cgpa >= 8.0) companies = ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Zoho'];
    else if (cgpa >= 7.0) companies = ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Capgemini', 'HCL'];
    else companies = ['TCS', 'Wipro', 'Infosys', 'Tech Mahindra', 'Mphasis'];

    const hasWeb = skills.some(s => ['react', 'javascript', 'html', 'css', 'node'].includes(s));
    const hasData = skills.some(s => ['python', 'ml', 'data science', 'tensorflow'].includes(s));

    let extra = '';
    if (hasWeb) extra += '\n\n🌐 Your web skills make you a strong candidate for product companies and startups.';
    if (hasData) extra += '\n\n🤖 Your data/ML skills open doors to analytics and AI-focused companies.';

    return `Based on your CGPA of ${cgpa} and ${profile.skills.length} skills, you're well-suited for: **${companies.join(', ')}**.${extra}

Check the Opportunities page for active drives from these companies!`;
  }

  // Interview tips
  if (/interview|prepare|preparation|tips|how to crack/.test(q)) {
    return `Here are my top interview preparation tips for you, ${profile.name}:

**Technical Round:**
• Practice DSA on LeetCode/HackerRank daily (30 min)
• Review your ${profile.branch} core subjects
• Be ready to explain your projects in detail

**HR Round:**
• Prepare "Tell me about yourself" (2 min version)
• Know your strengths, weaknesses, and career goals
• Research the company before the interview

**Communication:**
• Speak clearly and confidently
• Ask clarifying questions if unsure
• Show enthusiasm for the role

Your CGPA of ${profile.cgpa} is a good foundation. Focus on your skills and projects to stand out! 💪`;
  }

  // Resume tips
  if (/resume|cv|curriculum vitae/.test(q)) {
    return `Resume tips for ${profile.name}:

**Structure:**
• Keep it to 1 page (fresher)
• Start with a strong objective/summary
• List skills prominently — you have ${profile.skills.length} skills, make sure they're all listed!

**Projects Section:**
• Include 2-3 strong projects with tech stack
• Add GitHub links if available
• Quantify impact where possible

**Key Tips:**
• Use action verbs (Built, Developed, Implemented)
• Tailor your resume for each company
• Use the Resume Builder in this portal for a professional template!

Would you like specific advice for a particular company?`;
  }

  // Application status
  if (/application|applied|status|my application/.test(q)) {
    const apps = profile.applications;
    if (apps.length === 0) {
      return `You haven't applied to any drives yet, ${profile.name}! Head to the Job Opportunities page to browse active placement drives. Based on your profile, there are companies that match your skills and CGPA.`;
    }

    const selected = apps.filter((a: any) => a.status === 'selected').length;
    const shortlisted = apps.filter((a: any) => a.status === 'shortlisted').length;
    const rejected = apps.filter((a: any) => a.status === 'rejected').length;
    const pending = apps.filter((a: any) => a.status === 'applied').length;

    return `Here's your application summary, ${profile.name}:

📊 Total Applied: ${apps.length}
✅ Selected: ${selected}
🔶 Shortlisted: ${shortlisted}  
⏳ Pending: ${pending}
❌ Rejected: ${rejected}

${selected > 0 ? '🎉 Congratulations on your selection(s)!' : shortlisted > 0 ? '🌟 You\'re shortlisted! Prepare well for the next round.' : 'Keep applying! Consistency is key to placement success.'}`;
  }

  // Placement prediction / chances
  if (/chance|probability|will i get|placement prediction|predict/.test(q)) {
    const cgpa = profile.cgpa;
    const skillCount = profile.skills.length;
    let score = 0;

    if (cgpa >= 8.5) score += 40;
    else if (cgpa >= 7.5) score += 30;
    else if (cgpa >= 6.5) score += 20;
    else score += 10;

    if (skillCount >= 8) score += 35;
    else if (skillCount >= 5) score += 25;
    else if (skillCount >= 3) score += 15;
    else score += 5;

    score += Math.min(profile.applications.length * 5, 25);

    const probability = Math.min(score, 95);
    const emoji = probability >= 75 ? '🌟' : probability >= 50 ? '✅' : '💪';

    return `${emoji} Based on your profile analysis:

**Placement Probability: ${probability}%**

Factors considered:
• CGPA ${cgpa} → ${cgpa >= 7.5 ? 'Strong' : 'Moderate'} academic score
• ${skillCount} skills → ${skillCount >= 5 ? 'Good' : 'Needs improvement'} skill set
• ${profile.applications.length} applications → ${profile.applications.length >= 3 ? 'Active' : 'Apply to more drives'}

${probability >= 75 ? 'You\'re on a great track! Keep preparing and applying.' : probability >= 50 ? 'Good foundation! Add more skills and apply to more drives to improve your chances.' : 'Focus on building skills and applying to more drives. Every application is a learning opportunity!'}`;
  }

  // Salary / package
  if (/salary|package|ctc|lpa|pay|compensation/.test(q)) {
    const cgpa = profile.cgpa;
    let range = '';
    if (cgpa >= 8.5) range = '8-25 LPA (top companies)';
    else if (cgpa >= 7.5) range = '4-12 LPA (mid-tier companies)';
    else range = '3-6 LPA (service companies)';

    return `Based on your CGPA of ${cgpa} and ${profile.branch} background, typical salary ranges are:

💰 Expected range: **${range}**

Factors that increase your package:
• Strong DSA skills → +2-5 LPA
• Full-stack/Cloud skills → +2-4 LPA
• Good communication → Better negotiation
• Internship experience → +1-3 LPA

Focus on building in-demand skills to maximize your package!`;
  }

  // Motivation / stress
  if (/stress|worried|anxious|nervous|scared|fear|demotivated|sad|depressed/.test(q)) {
    return `I understand placement season can be stressful, ${profile.name}. Here's some perspective:

💙 **You're not alone** — every student feels this way.

🎯 **Focus on what you can control:**
• Your preparation quality
• Number of applications
• Skill development

📈 **Your strengths:**
• CGPA: ${profile.cgpa}
• Skills: ${profile.skills.length > 0 ? profile.skills.slice(0, 3).join(', ') : 'Add skills to your profile'}

Remember: Placement is a process, not a single event. Keep going, stay consistent, and your efforts will pay off! 💪

Would you like a study plan or preparation tips?`;
  }

  // Study plan
  if (/study plan|schedule|routine|how to study|preparation plan/.test(q)) {
    return `Here's a 4-week placement preparation plan for you, ${profile.name}:

**Week 1 — Foundation**
• DSA: Arrays, Strings, Linked Lists
• Solve 2 LeetCode problems/day
• Review ${profile.branch} core subjects

**Week 2 — Intermediate**
• DSA: Trees, Graphs, Dynamic Programming
• Build/update 1 project
• Practice aptitude (30 min/day)

**Week 3 — Advanced**
• System Design basics
• Mock interviews with friends
• Company-specific preparation

**Week 4 — Final Prep**
• Revise all topics
• Practice HR questions
• Apply to all eligible drives

Daily routine: 2 hrs DSA + 1 hr core subjects + 30 min aptitude 📚`;
  }

  // Generate interview questions
  if (/generate|give me|list|create|show|questions for|interview questions/.test(q)) {
    // Detect topic/company from the question
    const topics: Record<string, string[]> = {
      java: [
        '1. What is the difference between JDK, JRE, and JVM?',
        '2. Explain OOP concepts: Encapsulation, Inheritance, Polymorphism, Abstraction.',
        '3. What is the difference between ArrayList and LinkedList?',
        '4. Explain the concept of multithreading in Java.',
        '5. What is the difference between checked and unchecked exceptions?',
        '6. What is the use of the `final` keyword in Java?',
        '7. Explain the Java Collections Framework.',
        '8. What is a lambda expression? Give an example.',
        '9. What is the difference between `==` and `.equals()` in Java?',
        '10. Explain garbage collection in Java.',
      ],
      python: [
        '1. What are Python decorators? Give an example.',
        '2. Explain the difference between a list and a tuple.',
        '3. What is a generator in Python?',
        '4. Explain GIL (Global Interpreter Lock) in Python.',
        '5. What is the difference between `deepcopy` and `shallowcopy`?',
        '6. How does Python manage memory?',
        '7. What are *args and **kwargs?',
        '8. Explain list comprehension with an example.',
        '9. What is the difference between `is` and `==`?',
        '10. What are Python\'s built-in data types?',
      ],
      javascript: [
        '1. What is the difference between `var`, `let`, and `const`?',
        '2. Explain closures in JavaScript.',
        '3. What is the event loop in JavaScript?',
        '4. What is the difference between `==` and `===`?',
        '5. Explain Promises and async/await.',
        '6. What is hoisting in JavaScript?',
        '7. What is the difference between `null` and `undefined`?',
        '8. Explain prototypal inheritance.',
        '9. What are arrow functions and how do they differ from regular functions?',
        '10. What is the DOM and how do you manipulate it?',
      ],
      react: [
        '1. What is the Virtual DOM and how does React use it?',
        '2. Explain the difference between state and props.',
        '3. What are React hooks? Name 5 commonly used hooks.',
        '4. What is the useEffect hook and when do you use it?',
        '5. Explain the concept of lifting state up.',
        '6. What is React Context API?',
        '7. What is the difference between controlled and uncontrolled components?',
        '8. How does React handle forms?',
        '9. What is React.memo and when should you use it?',
        '10. Explain the React component lifecycle.',
      ],
      sql: [
        '1. What is the difference between INNER JOIN and LEFT JOIN?',
        '2. Explain normalization and its forms (1NF, 2NF, 3NF).',
        '3. What is the difference between WHERE and HAVING?',
        '4. What are indexes and why are they used?',
        '5. Explain ACID properties in databases.',
        '6. What is the difference between DELETE, TRUNCATE, and DROP?',
        '7. What is a stored procedure?',
        '8. Explain GROUP BY with an example.',
        '9. What is a subquery? Give an example.',
        '10. What is the difference between UNION and UNION ALL?',
      ],
      dsa: [
        '1. What is the time complexity of binary search?',
        '2. Explain the difference between BFS and DFS.',
        '3. What is dynamic programming? Give an example.',
        '4. Explain quicksort and its average time complexity.',
        '5. What is a hash table and how does it handle collisions?',
        '6. What is the difference between a stack and a queue?',
        '7. Explain the concept of recursion with an example.',
        '8. What is a balanced binary search tree?',
        '9. What is the time complexity of merge sort?',
        '10. Explain the sliding window technique.',
      ],
      hr: [
        '1. Tell me about yourself.',
        '2. What are your strengths and weaknesses?',
        '3. Where do you see yourself in 5 years?',
        '4. Why do you want to join our company?',
        '5. Describe a challenging situation and how you handled it.',
        '6. What motivates you?',
        '7. How do you handle pressure and tight deadlines?',
        '8. Are you a team player or do you prefer working alone?',
        '9. What do you know about our company?',
        '10. Do you have any questions for us?',
      ],
      ibm: [
        '1. Explain the concept of cloud computing and IBM Cloud services.',
        '2. What is DevOps and how does it relate to IBM\'s practices?',
        '3. Describe a project where you used data analysis.',
        '4. What is AI/ML and how is it applied in enterprise solutions?',
        '5. Explain microservices architecture.',
        '6. What is containerization? Explain Docker and Kubernetes.',
        '7. How would you approach a large-scale system design problem?',
        '8. What is Agile methodology?',
        '9. Explain REST API and its principles.',
        '10. Tell me about a time you solved a complex technical problem.',
      ],
      google: [
        '1. Design a URL shortening service like bit.ly.',
        '2. What is the time complexity of your solution to [problem]?',
        '3. Explain how Google Search works at a high level.',
        '4. Design a distributed cache system.',
        '5. What is the difference between process and thread?',
        '6. Implement LRU Cache.',
        '7. How would you design Google Maps?',
        '8. Explain consistent hashing.',
        '9. What is CAP theorem?',
        '10. How do you handle millions of concurrent users in a system?',
      ],
    };

    // Find matching topic
    let matchedTopic = '';
    let matchedQuestions: string[] = [];

    for (const [key, questions] of Object.entries(topics)) {
      if (q.includes(key)) {
        matchedTopic = key.charAt(0).toUpperCase() + key.slice(1);
        matchedQuestions = questions;
        break;
      }
    }

    // Check student's skills for context
    if (!matchedTopic && profile.skills.length > 0) {
      for (const skill of profile.skills) {
        const skillLower = skill.toLowerCase();
        for (const [key, questions] of Object.entries(topics)) {
          if (skillLower.includes(key) || key.includes(skillLower)) {
            matchedTopic = skill;
            matchedQuestions = questions;
            break;
          }
        }
        if (matchedTopic) break;
      }
    }

    if (matchedQuestions.length > 0) {
      return `Here are 10 **${matchedTopic} Interview Questions** for you, ${profile.name}:

${matchedQuestions.join('\n')}

💡 Tip: Practice explaining each answer out loud — interviewers value clear communication as much as correct answers!

Want questions for another topic? Just ask: "Generate Python questions" or "Generate HR questions"`;
    }

    // Generic question generation based on branch
    const branchQuestions: Record<string, string[]> = {
      CSE: ['Data Structures', 'Algorithms', 'DBMS', 'OS', 'Computer Networks'],
      IT: ['Web Development', 'Networking', 'Database', 'Cloud Computing', 'Security'],
      ECE: ['Digital Electronics', 'Microprocessors', 'Signal Processing', 'VLSI', 'Communication'],
      EEE: ['Power Systems', 'Control Systems', 'Electrical Machines', 'Circuit Theory', 'Power Electronics'],
    };

    const branchKey = Object.keys(branchQuestions).find(k => profile.branch.toUpperCase().includes(k)) || 'CSE';
    const topics_list = branchQuestions[branchKey];

    return `I can generate interview questions for these topics:

**Technical:** Java, Python, JavaScript, React, SQL, DSA
**Companies:** IBM, Google
**HR:** HR round questions

For your ${profile.branch} branch, focus on: ${topics_list.join(', ')}

Try: *"Generate Java questions"* or *"Generate HR questions"* or *"Generate IBM questions"*`;
  }
  const topics = [
    'your CGPA and eligibility',
    'which companies suit you',
    'interview preparation tips',
    'skills you should learn',
    'your application status',
    'placement probability',
    'salary expectations',
    'resume tips',
    'study plan',
  ];

  // General knowledge answers
  const generalKnowledge: Record<string, string> = {
    'oop': 'OOP (Object-Oriented Programming) is based on 4 concepts:\n\n• **Encapsulation** — Hiding data inside a class\n• **Inheritance** — Child class inherits from parent\n• **Polymorphism** — Same method, different behavior\n• **Abstraction** — Hiding complex implementation\n\nLanguages: Java, Python, C++, C#',
    'api': '**API (Application Programming Interface)** is a way for two applications to communicate.\n\nTypes:\n• REST API (most common)\n• GraphQL\n• SOAP\n\nThis project uses REST APIs between frontend and backend!',
    'cloud': '**Cloud Computing** means storing/accessing data over the internet.\n\nMajor providers:\n• **AWS** (Amazon)\n• **Google Cloud (GCP)**\n• **Microsoft Azure**\n\nCloud skills are highly valued by IBM, TCS, Infosys! 💰',
    'machine learning': '**Machine Learning** is AI where computers learn from data.\n\nTypes:\n• **Supervised** — Learns from labeled data\n• **Unsupervised** — Finds patterns in unlabeled data\n• **Reinforcement** — Learns by trial and error\n\nTools: Python, TensorFlow, scikit-learn, PyTorch',
    'dbms': '**DBMS** manages databases.\n\nTypes:\n• **Relational (SQL)**: MySQL, PostgreSQL\n• **NoSQL**: MongoDB, Redis\n\nKey concepts: Tables, Joins, Normalization, ACID\n\nThis project uses **MongoDB**!',
    'os': '**Operating System** manages hardware and software.\n\nInterview topics:\n• Process vs Thread\n• Deadlock prevention\n• Memory Management\n• Scheduling (FCFS, SJF, Round Robin)\n• Virtual Memory',
    'networking': '**Computer Networking** connects computers to share resources.\n\nKey concepts:\n• OSI Model (7 layers)\n• TCP/IP protocol\n• HTTP/HTTPS\n• DNS\n• IP addresses (IPv4, IPv6)',
    'agile': '**Agile** is an iterative software development methodology.\n\nKey concepts:\n• **Sprint** — Short dev cycle (1-4 weeks)\n• **Scrum** — Most popular Agile framework\n• **Kanban** — Visual workflow\n• **Daily Standup** — Brief team meeting\n\nMost companies use Agile today!',
    'git': '**Git** is a version control system.\n\nEssential commands:\n• `git clone` — Copy repository\n• `git add` — Stage changes\n• `git commit` — Save changes\n• `git push` — Upload to remote\n• `git pull` — Download updates\n• `git branch` — Manage branches',
    'docker': '**Docker** containerizes applications.\n\nKey concepts:\n• **Container** — Portable package of code + dependencies\n• **Image** — Blueprint for a container\n• **Dockerfile** — Build instructions\n\nBenefit: Solves "works on my machine" problem! 🐳',
    'recursion': '**Recursion** is when a function calls itself.\n\nExample: Factorial\n```\nfunction factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n-1);\n}\n```\n\nKey parts:\n• **Base case** — Stops the recursion\n• **Recursive case** — Calls itself with smaller input',
    'sorting': 'Common sorting algorithms:\n\n• **Bubble Sort** — O(n²) — Simple but slow\n• **Selection Sort** — O(n²)\n• **Insertion Sort** — O(n²) — Good for small data\n• **Merge Sort** — O(n log n) — Stable, divide & conquer\n• **Quick Sort** — O(n log n) avg — Most used in practice\n• **Heap Sort** — O(n log n)\n\nFor interviews, know Merge Sort and Quick Sort well!',
    'linked list': '**Linked List** is a linear data structure where elements are linked using pointers.\n\nTypes:\n• **Singly** — Each node points to next\n• **Doubly** — Each node points to next and previous\n• **Circular** — Last node points to first\n\nOperations: Insert O(1), Delete O(1), Search O(n)',
    'binary search': '**Binary Search** finds an element in a sorted array.\n\nTime Complexity: **O(log n)**\n\nAlgorithm:\n1. Find middle element\n2. If target == mid, return\n3. If target < mid, search left half\n4. If target > mid, search right half\n\nMust know for coding interviews!',
    'polymorphism': '**Polymorphism** means "many forms" — same method behaves differently.\n\nTypes:\n• **Compile-time** (Method Overloading) — Same name, different parameters\n• **Runtime** (Method Overriding) — Child class overrides parent method\n\nExample in Java:\n```java\nAnimal a = new Dog();\na.speak(); // calls Dog\'s speak()\n```',
    'inheritance': '**Inheritance** allows a class to inherit properties from another class.\n\nTypes:\n• Single, Multiple, Multilevel, Hierarchical, Hybrid\n\nBenefits:\n• Code reusability\n• Method overriding\n• Polymorphism\n\nKeyword: `extends` (Java), `:` (Python)',
  };

  // Check for general knowledge matches
  for (const [key, answer] of Object.entries(generalKnowledge)) {
    if (q.includes(key)) {
      return answer;
    }
  }

  // Technical "what is X" questions
  if (/what is|explain|define|tell me about|describe/.test(q)) {
    const topic = q.replace(/what is|explain|define|tell me about|describe|the |a |an /g, '').trim();
    if (topic.length > 2) {
      return `Great question about **${topic}**! 🤔\n\nThis is a common topic in technical interviews. For a detailed answer:\n\n• Check **Explore Resources** in this portal\n• Search on GeeksforGeeks or W3Schools\n• Practice explaining it in your own words\n\nWant me to generate interview questions about **${topic}**? Just say:\n*"Generate ${topic} questions"*`;
    }
  }

  // Math questions
  if (/\d+\s*[+\-*/]\s*\d+/.test(q)) {
    try {
      const expr = q.match(/[\d\s+\-*/().]+/)?.[0]?.trim();
      if (expr) {
        // eslint-disable-next-line no-eval
        const result = Function(`"use strict"; return (${expr})`)();
        return `🧮 **${expr} = ${result}**\n\nI can do basic math! But I'm best at career and technical questions. 😊`;
      }
    } catch { /* ignore */ }
  }

  // Greetings in other languages
  if (/vanakkam|namaste|namaskar|salam|bonjour|hola|ciao/.test(q)) {
    return `Hello ${profile.name}! 👋 I understand multiple greetings! I'm your AI Career Assistant — ask me anything about placements, technical concepts, or career advice!`;
  }

  // Thank you
  if (/thank|thanks|thank you|thx|ty/.test(q)) {
    return `You're welcome, ${profile.name}! 😊 Feel free to ask me anything anytime. Good luck with your placement journey! 🌟`;
  }

  // Bye / goodbye
  if (/bye|goodbye|see you|cya|take care/.test(q)) {
    return `Goodbye ${profile.name}! 👋 Best of luck with your placements. Remember — consistency and preparation are the keys to success! Come back anytime. 🌟`;
  }

  // Jokes
  if (/joke|funny|laugh|humor/.test(q)) {
    const jokes = [
      "Why do programmers prefer dark mode? Because light attracts bugs! 🐛😄",
      "Why did the developer go broke? Because he used up all his cache! 💸😄",
      "A SQL query walks into a bar, walks up to two tables and asks... 'Can I join you?' 😄",
      "Why do Java developers wear glasses? Because they don't C#! 😄",
      "How many programmers does it take to change a light bulb? None — that's a hardware problem! 😄",
    ];
    return jokes[Math.floor(Math.random() * jokes.length)] + "\n\nNow back to serious stuff — ask me about your placement preparation! 😊";
  }

  // Time / date
  if (/what time|what date|today|current time/.test(q)) {
    const now = new Date();
    return `🕐 Current time: **${now.toLocaleTimeString()}**\n📅 Today's date: **${now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**`;
  }

  // Motivational quotes
  if (/motivat|quote|inspire|inspiration/.test(q)) {
    const quotes = [
      '"The only way to do great work is to love what you do." — Steve Jobs',
      '"Success is not final, failure is not fatal: it is the courage to continue that counts." — Winston Churchill',
      '"The future belongs to those who believe in the beauty of their dreams." — Eleanor Roosevelt',
      '"It does not matter how slowly you go as long as you do not stop." — Confucius',
      '"Believe you can and you\'re halfway there." — Theodore Roosevelt',
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    return `✨ **Motivational Quote for you, ${profile.name}:**\n\n*${quote}*\n\nKeep going! Your placement success is just around the corner! 💪`;
  }

  // Completely random/unknown — give a smart general response
  const words = q.split(' ').filter(w => w.length > 3);
  const mainTopic = words[words.length - 1] || q;

  return `I received your question about **"${input}"**. 

As your AI Career Assistant, I'm specialized in:
• 🎓 Placement & career guidance
• 💻 Technical concepts (OOP, DSA, DBMS, etc.)
• 📝 Interview preparation
• 🏢 Company-specific advice
• 📊 Your profile analysis

For **"${mainTopic}"** specifically, I'd suggest:
• Search on Google or GeeksforGeeks for detailed info
• Ask me to generate interview questions: *"Generate ${mainTopic} questions"*

Or try asking me: *"What is ${mainTopic}?"* and I'll do my best to explain it! 😊`;
}

// ── Suggested Questions ──────────────────────────────────────────────────────

const SUGGESTIONS = [
  'Which companies am I eligible for?',
  'Generate Java questions',
  'Generate HR questions',
  'What skills should I learn?',
  'What is my placement probability?',
  'Give me a study plan',
];

// ── Component ────────────────────────────────────────────────────────────────

export default function AICareerBot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [profile, setProfile] = useState<StudentProfile>({
    name: user?.name || 'Student',
    branch: '',
    cgpa: 0,
    skills: [],
    rollNumber: '',
    applications: [],
    drives: [],
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [profileRes, appsRes] = await Promise.all([
        fetch(`${API_BASE}/students/profile`, { headers }),
        fetch(`${API_BASE}/applications/student`, { headers }),
      ]);

      const profileData = await profileRes.json();
      const appsData = await appsRes.json();

      const p: StudentProfile = {
        name: user?.name || profileData.name || 'Student',
        branch: profileData.branch || '',
        cgpa: profileData.cgpa || 0,
        skills: profileData.skills || [],
        rollNumber: profileData.rollNumber || '',
        applications: Array.isArray(appsData) ? appsData : [],
        drives: [],
      };

      setProfile(p);

      // Welcome message
      const welcome: Message = {
        id: '0',
        role: 'bot',
        text: `Hi ${p.name}! 👋 I'm your AI Career Assistant. I've loaded your profile:

🎓 Branch: ${p.branch || 'Not set'}
📊 CGPA: ${p.cgpa || 'Not set'}
💡 Skills: ${p.skills.length > 0 ? p.skills.slice(0, 3).join(', ') + (p.skills.length > 3 ? '...' : '') : 'None added yet'}
📋 Applications: ${p.applications.length}

Ask me anything about your placement journey! Try one of the suggestions below.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([welcome]);
    } catch (err) {
      const welcome: Message = {
        id: '0',
        role: 'bot',
        text: `Hi ${user?.name || 'there'}! 👋 I'm your AI Career Assistant. Ask me anything about placement preparation, interview tips, skills, or career guidance!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([welcome]);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    // Simulate AI thinking delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    const response = generateResponse(text, profile);

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'bot',
      text: response,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTyping(false);
    setMessages(prev => [...prev, botMsg]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    loadProfile();
  };

  // Render markdown-like bold text
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <DashboardLayout userRole="student">
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Career Assistant</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                Online · Knows your profile
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={clearChat}>
            <RefreshCw className="h-4 w-4 mr-1" /> Reset
          </Button>
        </div>

        {/* Messages */}
        <Card className="flex-1 overflow-hidden flex flex-col">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${
                  msg.role === 'bot'
                    ? 'bg-gradient-to-br from-purple-500 to-blue-600'
                    : 'bg-gradient-to-br from-green-500 to-teal-600'
                }`}>
                  {msg.role === 'bot' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-line leading-relaxed ${
                    msg.role === 'bot'
                      ? 'bg-muted text-foreground rounded-tl-sm'
                      : 'bg-primary text-primary-foreground rounded-tr-sm'
                  }`}>
                    {renderText(msg.text)}
                  </div>
                  <span className="text-xs text-muted-foreground px-1">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </CardContent>

          {/* Suggestions */}
          <div className="px-4 pb-2 flex flex-wrap gap-2 border-t pt-3">
            {SUGGESTIONS.map(s => (
              <Badge
                key={s}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                onClick={() => sendMessage(s)}
              >
                {s}
              </Badge>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me about your placement journey..."
              className="flex-1"
              disabled={typing}
            />
            <Button type="submit" disabled={!input.trim() || typing} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
