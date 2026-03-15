import {
  Briefcase,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Calendar,
  Award,
  BookOpen,
  Target,
  Users,
  Upload,
  Camera,
  Loader2,
  FileText,
  ClipboardList,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { placementDrives } from '@/lib/data';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { assessmentAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const studentProfile = {
  name: 'Rahul Sharma',
  rollNumber: 'CSE2021001',
  branch: 'CSE',
  cgpa: 8.5,
  placementStatus: 'unplaced',
  skills: ['React', 'Node.js', 'Python', 'Machine Learning'],
  appliedJobs: [
    { company: 'Google', role: 'Software Engineer', status: 'applied', date: '2024-02-10' },
    { company: 'Microsoft', role: 'Software Developer', status: 'interview', date: '2024-02-05' },
    { company: 'Amazon', role: 'SDE-1', status: 'rejected', date: '2024-01-20' },
  ],
  profileCompletion: 85,
};

// Interview Questions Database
const interviewQuestions = {
  'Technical - Programming': [
    { q: 'What is the difference between let, const, and var in JavaScript?', a: 'let and const are block-scoped, while var is function-scoped. const cannot be reassigned after declaration.' },
    { q: 'Explain the concept of closures in JavaScript.', a: 'A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned.' },
    { q: 'What is the difference between == and === in JavaScript?', a: '== performs type coercion before comparison, while === checks both value and type without coercion.' },
    { q: 'Explain Object-Oriented Programming principles.', a: 'The four main principles are: Encapsulation, Abstraction, Inheritance, and Polymorphism.' },
    { q: 'What is a REST API?', a: 'REST (Representational State Transfer) is an architectural style for designing networked applications using HTTP methods like GET, POST, PUT, DELETE.' },
  ],
  'Technical - Data Structures': [
    { q: 'What is the difference between Array and Linked List?', a: 'Arrays have contiguous memory and O(1) access time. Linked Lists have non-contiguous memory and O(n) access time but O(1) insertion/deletion.' },
    { q: 'Explain Binary Search Tree.', a: 'A BST is a tree where each node has at most two children, with left child < parent < right child. Search, insert, delete operations are O(log n) on average.' },
    { q: 'What is a Hash Table?', a: 'A hash table uses a hash function to map keys to array indices, providing O(1) average-case lookup, insertion, and deletion.' },
    { q: 'Explain Stack and Queue.', a: 'Stack follows LIFO (Last In First Out), Queue follows FIFO (First In First Out). Both support O(1) insertion and deletion.' },
    { q: 'What is Dynamic Programming?', a: 'DP is an optimization technique that solves complex problems by breaking them into simpler subproblems and storing results to avoid redundant calculations.' },
  ],
  'Behavioral - Leadership': [
    { q: 'Tell me about a time you led a team.', a: 'Use STAR method: Situation, Task, Action, Result. Describe the context, your role, actions taken, and measurable outcomes.' },
    { q: 'How do you handle conflicts in a team?', a: 'Listen to all perspectives, find common ground, focus on solutions not blame, and ensure everyone feels heard.' },
    { q: 'Describe a challenging project you completed.', a: 'Explain the challenge, your approach, obstacles faced, how you overcame them, and the final outcome.' },
    { q: 'How do you prioritize tasks?', a: 'Use frameworks like Eisenhower Matrix (urgent/important), consider deadlines, impact, and dependencies.' },
    { q: 'Tell me about a failure and what you learned.', a: 'Be honest, focus on lessons learned, and explain how you applied those lessons to improve.' },
  ],
  'Behavioral - Problem Solving': [
    { q: 'How do you approach a problem you have never seen before?', a: 'Break it down into smaller parts, research similar problems, brainstorm solutions, test hypotheses, and iterate.' },
    { q: 'Describe a time you had to learn something quickly.', a: 'Explain the situation, your learning strategy, resources used, and how you applied the knowledge successfully.' },
    { q: 'How do you handle tight deadlines?', a: 'Prioritize tasks, communicate with stakeholders, break work into manageable chunks, and stay focused on deliverables.' },
    { q: 'Tell me about a time you improved a process.', a: 'Identify the inefficiency, propose solution, implement changes, and measure the improvement.' },
    { q: 'How do you stay updated with technology?', a: 'Follow tech blogs, take online courses, work on side projects, attend meetups, and participate in communities.' },
  ],
  'HR - General': [
    { q: 'Tell me about yourself.', a: 'Give a 2-minute pitch covering education, skills, experience, and why you are interested in this role.' },
    { q: 'Why do you want to work here?', a: 'Research the company, mention specific aspects that align with your goals, and show genuine interest.' },
    { q: 'What are your strengths and weaknesses?', a: 'Be honest, provide examples, and for weaknesses, explain how you are working to improve.' },
    { q: 'Where do you see yourself in 5 years?', a: 'Show ambition but be realistic, align with company growth, and demonstrate commitment to learning.' },
    { q: 'Why should we hire you?', a: 'Highlight unique skills, relevant experience, cultural fit, and enthusiasm for the role.' },
  ],
  'Company Specific - Google': [
    { q: 'Why Google?', a: 'Mention innovation, impact at scale, learning opportunities, and specific products/projects you admire.' },
    { q: 'How would you improve Google Search?', a: 'Consider user experience, personalization, speed, accuracy, and emerging technologies like AI.' },
    { q: 'Describe Googles culture.', a: 'Innovation-driven, data-focused, collaborative, emphasis on 20% time, and user-centric approach.' },
  ],
  'Company Specific - Microsoft': [
    { q: 'Why Microsoft?', a: 'Mention cloud computing leadership, diverse products, growth mindset culture, and impact on businesses worldwide.' },
    { q: 'How would you improve Microsoft Teams?', a: 'Consider collaboration features, integration with other tools, performance, and user experience.' },
    { q: 'What is Microsofts mission?', a: 'To empower every person and organization on the planet to achieve more.' },
  ],
};

// Resume Templates
const resumeTemplates = {
  'Software Engineer': {
    description: 'Professional template for software engineering roles',
    sections: ['Contact Info', 'Summary', 'Technical Skills', 'Experience', 'Projects', 'Education', 'Certifications'],
    tips: ['Highlight programming languages', 'Include GitHub links', 'Quantify achievements', 'Use action verbs'],
  },
  'Data Scientist': {
    description: 'Template focused on data analysis and ML skills',
    sections: ['Contact Info', 'Summary', 'Technical Skills', 'Experience', 'Projects', 'Publications', 'Education'],
    tips: ['Emphasize ML frameworks', 'Include Kaggle profile', 'Show data visualization skills', 'Mention statistical tools'],
  },
  'Product Manager': {
    description: 'Template for product management positions',
    sections: ['Contact Info', 'Summary', 'Experience', 'Product Launches', 'Skills', 'Education', 'Certifications'],
    tips: ['Focus on impact metrics', 'Show cross-functional leadership', 'Highlight user research', 'Include product strategy'],
  },
  'Business Analyst': {
    description: 'Template for business analysis roles',
    sections: ['Contact Info', 'Summary', 'Experience', 'Skills', 'Projects', 'Education', 'Certifications'],
    tips: ['Emphasize analytical tools', 'Show business impact', 'Include process improvements', 'Highlight stakeholder management'],
  },
  'Fresher - General': {
    description: 'Template for fresh graduates',
    sections: ['Contact Info', 'Objective', 'Education', 'Skills', 'Projects', 'Internships', 'Achievements'],
    tips: ['Focus on academic projects', 'Highlight relevant coursework', 'Include extracurricular activities', 'Show eagerness to learn'],
  },
};

// Mock Interview Topics
const mockInterviewTopics = {
  'Technical Round - Coding': {
    description: 'Practice coding problems and algorithms',
    duration: '45-60 minutes',
    format: 'Live coding on whiteboard/screen',
    topics: ['Data Structures', 'Algorithms', 'Problem Solving', 'Code Optimization'],
  },
  'Technical Round - System Design': {
    description: 'Design scalable systems and architectures',
    duration: '45-60 minutes',
    format: 'Whiteboard discussion',
    topics: ['Scalability', 'Database Design', 'API Design', 'Microservices'],
  },
  'Behavioral Round': {
    description: 'Discuss experiences and soft skills',
    duration: '30-45 minutes',
    format: 'Conversational interview',
    topics: ['Leadership', 'Teamwork', 'Conflict Resolution', 'Problem Solving'],
  },
  'HR Round': {
    description: 'General questions about background and fit',
    duration: '20-30 minutes',
    format: 'Conversational interview',
    topics: ['Background', 'Career Goals', 'Company Fit', 'Salary Expectations'],
  },
  'Case Study Round': {
    description: 'Solve business problems and case studies',
    duration: '45-60 minutes',
    format: 'Problem-solving discussion',
    topics: ['Business Analysis', 'Market Strategy', 'Product Decisions', 'Data Analysis'],
  },
};

// Department and Job Role based Interview Questions
const departmentJobRoleQuestions: { [key: string]: { [key: string]: Array<{ q: string; a: string }> } } = {
  'CSE': {
    'Software Engineer': [
      { q: 'Explain the difference between process and thread.', a: 'A process is an independent program in execution with its own memory space. A thread is a lightweight unit of execution within a process that shares memory with other threads.' },
      { q: 'What is the time complexity of binary search?', a: 'O(log n) - Binary search divides the search space in half with each iteration.' },
      { q: 'Explain REST API principles.', a: 'REST uses HTTP methods (GET, POST, PUT, DELETE), is stateless, uses standard status codes, and resources are identified by URIs.' },
      { q: 'What is polymorphism in OOP?', a: 'Polymorphism allows objects of different classes to be treated as objects of a common parent class. It includes method overloading and overriding.' },
      { q: 'Explain database normalization.', a: 'Normalization organizes data to reduce redundancy. Forms include 1NF (atomic values), 2NF (no partial dependencies), 3NF (no transitive dependencies).' },
    ],
    'Full Stack Developer': [
      { q: 'What is the difference between SQL and NoSQL?', a: 'SQL databases are relational with fixed schemas (MySQL, PostgreSQL). NoSQL databases are non-relational with flexible schemas (MongoDB, Cassandra).' },
      { q: 'Explain the concept of middleware in Express.js.', a: 'Middleware functions have access to request and response objects. They can execute code, modify req/res, end the request-response cycle, or call next middleware.' },
      { q: 'What is CORS and why is it important?', a: 'Cross-Origin Resource Sharing allows servers to specify which origins can access resources. It prevents unauthorized cross-origin requests for security.' },
      { q: 'Explain the Virtual DOM in React.', a: 'Virtual DOM is a lightweight copy of the actual DOM. React compares it with the real DOM and updates only changed elements, improving performance.' },
      { q: 'What is JWT and how does it work?', a: 'JSON Web Token is used for authentication. It contains encoded user data, is signed by the server, and sent with each request for verification.' },
    ],
    'Data Scientist': [
      { q: 'What is the difference between supervised and unsupervised learning?', a: 'Supervised learning uses labeled data to train models (classification, regression). Unsupervised learning finds patterns in unlabeled data (clustering, dimensionality reduction).' },
      { q: 'Explain overfitting and how to prevent it.', a: 'Overfitting occurs when a model learns training data too well, including noise. Prevention: cross-validation, regularization, more training data, simpler models.' },
      { q: 'What is the bias-variance tradeoff?', a: 'Bias is error from wrong assumptions (underfitting). Variance is error from sensitivity to training data (overfitting). Goal is to balance both.' },
      { q: 'Explain the difference between bagging and boosting.', a: 'Bagging trains models in parallel on random subsets (Random Forest). Boosting trains models sequentially, each correcting previous errors (XGBoost, AdaBoost).' },
      { q: 'What is feature engineering?', a: 'Creating new features from existing data to improve model performance. Includes scaling, encoding, creating interactions, and domain-specific transformations.' },
    ],
    'DevOps Engineer': [
      { q: 'What is CI/CD?', a: 'Continuous Integration merges code frequently with automated testing. Continuous Deployment automatically deploys tested code to production.' },
      { q: 'Explain Docker containers vs Virtual Machines.', a: 'Containers share the host OS kernel and are lightweight. VMs include full OS and are heavier but provide better isolation.' },
      { q: 'What is Kubernetes?', a: 'Kubernetes is a container orchestration platform that automates deployment, scaling, and management of containerized applications.' },
      { q: 'Explain Infrastructure as Code (IaC).', a: 'IaC manages infrastructure using code files (Terraform, CloudFormation). Benefits: version control, reproducibility, automation.' },
      { q: 'What is a load balancer?', a: 'Distributes incoming traffic across multiple servers to ensure availability, reliability, and optimal resource utilization.' },
    ],
  },
  'IT': {
    'Software Developer': [
      { q: 'What is Agile methodology?', a: 'Agile is an iterative development approach with short sprints, continuous feedback, and adaptive planning. Includes Scrum and Kanban frameworks.' },
      { q: 'Explain version control with Git.', a: 'Git tracks code changes, enables collaboration, branching, and merging. Key commands: commit, push, pull, branch, merge.' },
      { q: 'What is API testing?', a: 'Testing API endpoints for functionality, reliability, performance, and security. Tools include Postman, REST Assured, and automated test frameworks.' },
      { q: 'Explain the MVC architecture.', a: 'Model-View-Controller separates application into data (Model), UI (View), and logic (Controller) for better organization and maintainability.' },
      { q: 'What is cloud computing?', a: 'Delivering computing services (servers, storage, databases) over the internet. Types: IaaS, PaaS, SaaS. Providers: AWS, Azure, GCP.' },
    ],
    'Web Developer': [
      { q: 'What is responsive web design?', a: 'Designing websites that adapt to different screen sizes using flexible layouts, media queries, and responsive images.' },
      { q: 'Explain the box model in CSS.', a: 'Every element is a box with content, padding, border, and margin. Box-sizing property controls how width/height are calculated.' },
      { q: 'What is the difference between var, let, and const?', a: 'var is function-scoped and hoisted. let is block-scoped and not hoisted. const is block-scoped and cannot be reassigned.' },
      { q: 'Explain event delegation in JavaScript.', a: 'Attaching a single event listener to a parent element instead of multiple children, using event bubbling for efficiency.' },
      { q: 'What is SEO and why is it important?', a: 'Search Engine Optimization improves website visibility in search results through proper HTML structure, meta tags, performance, and content quality.' },
    ],
    'System Administrator': [
      { q: 'What is DNS and how does it work?', a: 'Domain Name System translates domain names to IP addresses. Process: DNS query → recursive resolver → root server → TLD server → authoritative server.' },
      { q: 'Explain the OSI model.', a: '7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application. Each layer has specific functions for network communication.' },
      { q: 'What is RAID?', a: 'Redundant Array of Independent Disks combines multiple drives for performance or redundancy. Types: RAID 0 (striping), RAID 1 (mirroring), RAID 5 (parity).' },
      { q: 'Explain Linux file permissions.', a: 'Three permission types (read, write, execute) for three user categories (owner, group, others). Represented as rwxrwxrwx or octal (755).' },
      { q: 'What is a firewall?', a: 'Network security system that monitors and controls traffic based on rules. Types: packet filtering, stateful inspection, application-level gateway.' },
    ],
  },
  'ECE': {
    'VLSI Design Engineer': [
      { q: 'What is the difference between combinational and sequential circuits?', a: 'Combinational circuits output depends only on current inputs. Sequential circuits have memory elements and output depends on current inputs and previous state.' },
      { q: 'Explain setup time and hold time.', a: 'Setup time is minimum time data must be stable before clock edge. Hold time is minimum time data must be stable after clock edge.' },
      { q: 'What is clock skew?', a: 'Difference in arrival times of clock signal at different parts of the circuit. Can cause timing violations if not managed properly.' },
      { q: 'Explain Moore vs Mealy machines.', a: 'Moore machine output depends only on current state. Mealy machine output depends on current state and inputs. Mealy is generally faster.' },
      { q: 'What is DFT (Design for Testability)?', a: 'Techniques to make circuits easier to test: scan chains, BIST (Built-In Self-Test), boundary scan, and test point insertion.' },
    ],
    'Embedded Systems Engineer': [
      { q: 'What is an interrupt?', a: 'Signal that temporarily halts CPU to handle urgent tasks. Types: hardware interrupts (external devices) and software interrupts (system calls).' },
      { q: 'Explain the difference between microprocessor and microcontroller.', a: 'Microprocessor is just a CPU requiring external components. Microcontroller integrates CPU, memory, and peripherals on single chip.' },
      { q: 'What is I2C protocol?', a: 'Inter-Integrated Circuit is a serial communication protocol using two wires (SDA, SCL) for master-slave communication between ICs.' },
      { q: 'Explain RTOS (Real-Time Operating System).', a: 'OS designed for real-time applications with deterministic response times. Features: task scheduling, priority management, inter-task communication.' },
      { q: 'What is watchdog timer?', a: 'Hardware timer that resets the system if software fails to periodically reset it, preventing system hangs.' },
    ],
    'Signal Processing Engineer': [
      { q: 'What is Fourier Transform?', a: 'Mathematical transform that converts time-domain signal to frequency domain, revealing frequency components and their magnitudes.' },
      { q: 'Explain sampling theorem (Nyquist theorem).', a: 'Sampling rate must be at least twice the highest frequency component to accurately reconstruct the signal without aliasing.' },
      { q: 'What is the difference between FIR and IIR filters?', a: 'FIR (Finite Impulse Response) has linear phase and is always stable. IIR (Infinite Impulse Response) is more efficient but can be unstable.' },
      { q: 'Explain convolution in signal processing.', a: 'Mathematical operation combining two signals to produce a third signal, representing how one signal modifies another. Used in filtering and system analysis.' },
      { q: 'What is SNR (Signal-to-Noise Ratio)?', a: 'Ratio of signal power to noise power, measured in dB. Higher SNR indicates better signal quality.' },
    ],
  },
  'EEE': {
    'Power Systems Engineer': [
      { q: 'What is the difference between AC and DC?', a: 'AC (Alternating Current) periodically reverses direction. DC (Direct Current) flows in one direction. AC is used for transmission, DC for electronics.' },
      { q: 'Explain three-phase power system.', a: 'Three AC voltages with 120° phase difference. Advantages: constant power delivery, efficient transmission, smaller conductors for same power.' },
      { q: 'What is power factor?', a: 'Ratio of real power to apparent power (cosφ). Low power factor means inefficient power usage. Improved using capacitors or synchronous condensers.' },
      { q: 'Explain transformer working principle.', a: 'Based on electromagnetic induction. Changing current in primary coil creates magnetic flux, inducing voltage in secondary coil. Voltage ratio equals turns ratio.' },
      { q: 'What is a circuit breaker?', a: 'Automatic switch that protects electrical circuits from damage caused by overload or short circuit by interrupting current flow.' },
    ],
    'Control Systems Engineer': [
      { q: 'What is PID controller?', a: 'Proportional-Integral-Derivative controller. P responds to current error, I eliminates steady-state error, D predicts future error based on rate of change.' },
      { q: 'Explain open-loop vs closed-loop control.', a: 'Open-loop has no feedback (e.g., timer). Closed-loop uses feedback to adjust output (e.g., thermostat). Closed-loop is more accurate.' },
      { q: 'What is transfer function?', a: 'Mathematical representation of system relating output to input in Laplace domain. Used for system analysis and controller design.' },
      { q: 'Explain stability in control systems.', a: 'Stable system returns to equilibrium after disturbance. Analyzed using Routh-Hurwitz criterion, Nyquist plot, or Bode plot.' },
      { q: 'What is state-space representation?', a: 'Modern control approach using matrices to represent system dynamics. Advantages: handles MIMO systems, time-varying systems, and nonlinear systems.' },
    ],
    'Automation Engineer': [
      { q: 'What is PLC (Programmable Logic Controller)?', a: 'Industrial computer for automation of processes. Programs control machinery using ladder logic, function blocks, or structured text.' },
      { q: 'Explain SCADA system.', a: 'Supervisory Control and Data Acquisition monitors and controls industrial processes. Components: HMI, RTU, communication network, database.' },
      { q: 'What is HMI (Human-Machine Interface)?', a: 'Graphical interface allowing operators to interact with machines. Displays process data, alarms, and accepts operator commands.' },
      { q: 'Explain sensor types used in automation.', a: 'Proximity sensors (detect presence), temperature sensors (thermocouples, RTDs), pressure sensors, flow sensors, level sensors.' },
      { q: 'What is industrial IoT?', a: 'Connecting industrial equipment to internet for data collection, analysis, and remote monitoring. Enables predictive maintenance and optimization.' },
    ],
  },
  'MECH': {
    'Mechanical Design Engineer': [
      { q: 'What is FEA (Finite Element Analysis)?', a: 'Numerical method for solving complex engineering problems by dividing structure into small elements. Used for stress, thermal, and vibration analysis.' },
      { q: 'Explain the difference between stress and strain.', a: 'Stress is internal force per unit area (Pa). Strain is deformation per unit length (dimensionless). Related by Young\'s modulus: σ = Eε.' },
      { q: 'What is factor of safety?', a: 'Ratio of material strength to applied stress. Accounts for uncertainties in loads, materials, and manufacturing. Typical values: 1.5-4.' },
      { q: 'Explain CAD/CAM integration.', a: 'CAD (Computer-Aided Design) creates models. CAM (Computer-Aided Manufacturing) generates toolpaths for machining. Integration streamlines production.' },
      { q: 'What is GD&T (Geometric Dimensioning and Tolerancing)?', a: 'Symbolic language for specifying part geometry and tolerances. Ensures proper fit and function while allowing manufacturing variation.' },
    ],
    'Production Engineer': [
      { q: 'What is lean manufacturing?', a: 'Philosophy focused on minimizing waste while maximizing value. Seven wastes: overproduction, waiting, transport, over-processing, inventory, motion, defects.' },
      { q: 'Explain Six Sigma.', a: 'Data-driven methodology for reducing defects and variation. DMAIC process: Define, Measure, Analyze, Improve, Control. Target: 3.4 defects per million.' },
      { q: 'What is TPM (Total Productive Maintenance)?', a: 'Proactive maintenance approach involving all employees. Eight pillars include autonomous maintenance, planned maintenance, and quality maintenance.' },
      { q: 'Explain JIT (Just-In-Time) manufacturing.', a: 'Production strategy where materials arrive exactly when needed. Reduces inventory costs, improves cash flow, and minimizes waste.' },
      { q: 'What is OEE (Overall Equipment Effectiveness)?', a: 'Metric measuring manufacturing productivity. OEE = Availability × Performance × Quality. World-class OEE is 85% or higher.' },
    ],
    'Thermal Engineer': [
      { q: 'What are the three modes of heat transfer?', a: 'Conduction (through solids), Convection (through fluids), Radiation (electromagnetic waves). Each has different governing equations and applications.' },
      { q: 'Explain the first law of thermodynamics.', a: 'Energy cannot be created or destroyed, only converted. For closed system: ΔU = Q - W (change in internal energy = heat added - work done).' },
      { q: 'What is heat exchanger effectiveness?', a: 'Ratio of actual heat transfer to maximum possible heat transfer. Depends on flow arrangement (parallel, counter, cross) and NTU (Number of Transfer Units).' },
      { q: 'Explain Carnot cycle.', a: 'Ideal thermodynamic cycle with maximum efficiency. Four processes: isothermal expansion, adiabatic expansion, isothermal compression, adiabatic compression.' },
      { q: 'What is thermal conductivity?', a: 'Material property indicating heat conduction ability (W/m·K). Metals have high conductivity, insulators have low conductivity.' },
    ],
  },
  'CIVIL': {
    'Structural Engineer': [
      { q: 'What is the difference between beam and column?', a: 'Beam is horizontal member resisting bending and shear. Column is vertical member resisting compression. Both are primary structural elements.' },
      { q: 'Explain moment of inertia.', a: 'Measure of resistance to bending. Depends on cross-section shape and axis. Higher moment of inertia means greater bending resistance.' },
      { q: 'What is reinforced concrete?', a: 'Concrete with embedded steel bars (rebar). Concrete resists compression, steel resists tension. Together they form strong composite material.' },
      { q: 'Explain load combinations in structural design.', a: 'Different load scenarios considered: dead load, live load, wind, seismic, snow. Combinations ensure structure safety under various conditions.' },
      { q: 'What is deflection limit?', a: 'Maximum allowable deformation of structural member. Typical limit: span/360 for floors, span/240 for roofs. Prevents damage and discomfort.' },
    ],
    'Construction Manager': [
      { q: 'What is CPM (Critical Path Method)?', a: 'Project scheduling technique identifying longest sequence of dependent activities. Determines minimum project duration and critical activities.' },
      { q: 'Explain PERT (Program Evaluation and Review Technique).', a: 'Probabilistic scheduling method using three time estimates: optimistic, most likely, pessimistic. Accounts for uncertainty in activity durations.' },
      { q: 'What is earned value management?', a: 'Project performance measurement integrating scope, schedule, and cost. Key metrics: PV (Planned Value), EV (Earned Value), AC (Actual Cost).' },
      { q: 'Explain quality control in construction.', a: 'Ensuring work meets specifications through inspections, testing, and documentation. Includes material testing, workmanship checks, and compliance verification.' },
      { q: 'What is risk management in projects?', a: 'Identifying, analyzing, and responding to project risks. Process: risk identification, assessment, mitigation planning, monitoring.' },
    ],
    'Site Engineer': [
      { q: 'What is soil bearing capacity?', a: 'Maximum pressure soil can support without failure. Determined by soil type, depth, and moisture. Critical for foundation design.' },
      { q: 'Explain different types of foundations.', a: 'Shallow: spread footing, mat foundation. Deep: pile foundation, drilled shaft. Selection depends on soil conditions and loads.' },
      { q: 'What is concrete slump test?', a: 'Measures concrete workability. Fresh concrete placed in cone, cone removed, slump measured. Typical range: 25-100mm depending on application.' },
      { q: 'Explain compaction in earthwork.', a: 'Increasing soil density by removing air voids. Methods: rolling, tamping, vibration. Measured by field density tests and compared to maximum dry density.' },
      { q: 'What is surveying and its importance?', a: 'Measuring and mapping land features. Essential for site layout, elevation control, volume calculations, and as-built documentation.' },
    ],
  },
};

// Departments list
const departments = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'];

// Job roles by department
const jobRolesByDepartment: { [key: string]: string[] } = {
  'CSE': ['Software Engineer', 'Full Stack Developer', 'Data Scientist', 'DevOps Engineer'],
  'IT': ['Software Developer', 'Web Developer', 'System Administrator'],
  'ECE': ['VLSI Design Engineer', 'Embedded Systems Engineer', 'Signal Processing Engineer'],
  'EEE': ['Power Systems Engineer', 'Control Systems Engineer', 'Automation Engineer'],
  'MECH': ['Mechanical Design Engineer', 'Production Engineer', 'Thermal Engineer'],
  'CIVIL': ['Structural Engineer', 'Construction Manager', 'Site Engineer'],
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string>('');
  const [resourceDialog, setResourceDialog] = useState<'questions' | 'resume' | 'mock' | 'explore' | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedJobRole, setSelectedJobRole] = useState<string>('');
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pendingAssessments, setPendingAssessments] = useState<any[]>([]);

  // Fetch student profile data including photo
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profile = await api.students.getProfile();
        setStudentData(profile);
        
        // Set profile image if exists
        if (profile.profile_photo_url) {
          setProfileImage(`http://localhost:3001${profile.profile_photo_url}`);
          
          // Update user object in localStorage to include photo
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          user.avatar = `http://localhost:3001${profile.profile_photo_url}`;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Fetch pending assessments
    assessmentAPI.getAvailable().then((data: any[]) => {
      if (data) setPendingAssessments(data.filter((a: any) => !a.alreadyAttempted));
    }).catch(() => {});
  }, []);
  
  const eligibleDrives = placementDrives.filter(
    (d) =>
      d.status === 'upcoming' &&
      d.eligibleBranches.includes(studentData?.branch || studentProfile.branch) &&
      (studentData?.cgpa || studentProfile.cgpa) >= d.minCgpa
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'interview':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'selected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return <Badge className="bg-blue-500">Applied</Badge>;
      case 'interview':
        return <Badge className="bg-orange-500">Interview</Badge>;
      case 'selected':
        return <Badge className="bg-green-500">Selected</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 2MB.",
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPG, PNG, or GIF).",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        toast({
          title: "Photo updated",
          description: "Your profile photo has been updated successfully.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.name.split(' ')[0] || 'Student'}!</h1>
            <p className="text-muted-foreground">Track your placement journey</p>
          </div>
          <div className="relative group">
            <Avatar className="h-20 w-20 border-4 border-primary/20">
              <AvatarImage src={profileImage} />
              <AvatarFallback className="text-2xl bg-primary/10">
                {user?.name.split(' ').map(n => n[0]).join('') || 'ST'}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Your CGPA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{studentData?.cgpa || studentProfile.cgpa}</p>
              <p className="text-xs text-muted-foreground">Branch: {studentData?.branch || studentProfile.branch}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Jobs Applied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{studentProfile.appliedJobs.length}</p>
              <p className="text-xs text-muted-foreground">
                {studentProfile.appliedJobs.filter((j) => j.status === 'interview').length} in interview
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Eligible Drives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{eligibleDrives.length}</p>
              <p className="text-xs text-muted-foreground">Upcoming opportunities</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Placement Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className={
                  studentProfile.placementStatus === 'placed'
                    ? 'bg-green-500'
                    : 'bg-orange-500'
                }
              >
                {studentProfile.placementStatus === 'placed' ? 'Placed' : 'Seeking'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Profile Completion */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
            <CardDescription>Complete your profile to increase visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">{studentProfile.profileCompletion}%</span>
              </div>
              <Progress value={studentProfile.profileCompletion} />
              <p className="text-sm text-muted-foreground mt-2">
                Add your resume and certifications to reach 100%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pending Assessments Alert */}
        {pendingAssessments.length > 0 && (
          <Card className="border-orange-300 bg-orange-50 dark:bg-orange-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <ClipboardList className="h-5 w-5" />
                Pending Assessments
                <Badge className="bg-orange-500">{pendingAssessments.length}</Badge>
              </CardTitle>
              <CardDescription>Complete these tests to strengthen your applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingAssessments.slice(0, 3).map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-white dark:bg-card rounded-lg border border-orange-200">
                  <div>
                    <p className="font-medium text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.duration} min · {a.questionCount} questions · {a.totalMarks} marks</p>
                  </div>
                  <Button size="sm" onClick={() => navigate(`/student/assessment/${a.driveId}`)}>
                    Take Test
                  </Button>
                </div>
              ))}
              {pendingAssessments.length > 3 && (
                <Button variant="outline" className="w-full" onClick={() => navigate('/student/assessments')}>
                  View All {pendingAssessments.length} Assessments
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Applied Jobs */}          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                My Applications
              </CardTitle>
              <CardDescription>Track your job applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentProfile.appliedJobs.map((job, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <p className="font-medium">{job.company}</p>
                        <p className="text-sm text-muted-foreground">{job.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(job.status)}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(job.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/student/applications')}>
                View All Applications
              </Button>
            </CardContent>
          </Card>

          {/* Eligible Drives */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Drives for You
              </CardTitle>
              <CardDescription>Drives matching your eligibility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eligibleDrives.slice(0, 3).map((drive) => (
                  <div
                    key={drive.id}
                    className="p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{drive.companyName}</p>
                      <Badge variant="secondary">
                        ₹{(drive.packageOffered / 100000).toFixed(0)} LPA
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{drive.jobRole}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {format(new Date(drive.date), 'MMM d, yyyy')}
                      </span>
                      <Button size="sm">Apply Now</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Career Resources & Interview Prep */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Career Resources
              </CardTitle>
              <CardDescription>Prepare for your interviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div 
                  className="p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => setResourceDialog('questions')}
                >
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Interview Questions</p>
                      <p className="text-sm text-muted-foreground">Practice common interview questions</p>
                    </div>
                  </div>
                </div>
                <div 
                  className="p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => setResourceDialog('resume')}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Resume Templates</p>
                      <p className="text-sm text-muted-foreground">Download professional resume templates</p>
                    </div>
                  </div>
                </div>
                <div 
                  className="p-3 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30 hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-900/40 dark:hover:to-pink-900/40 cursor-pointer transition-all border-2 border-purple-300 dark:border-purple-700"
                  onClick={() => navigate('/student/resume-builder')}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        Resume Builder 
                        <Badge variant="secondary" className="text-xs bg-purple-200 text-purple-700">NEW</Badge>
                      </p>
                      <p className="text-sm text-muted-foreground">Create your professional resume in minutes</p>
                    </div>
                  </div>
                </div>
                <div 
                  className="p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => setResourceDialog('mock')}
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Mock Interviews</p>
                      <p className="text-sm text-muted-foreground">Schedule practice sessions</p>
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => setResourceDialog('explore')}>
                Explore More Opportunities
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Skills Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Your Skills
            </CardTitle>
            <CardDescription>Skills listed on your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {studentProfile.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-sm">
                  {skill}
                </Badge>
              ))}
              <Button variant="outline" size="sm" onClick={() => navigate('/student/profile')}>
                + Add Skill
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interview Questions Dialog */}
      <Dialog open={resourceDialog === 'questions'} onOpenChange={(open) => !open && setResourceDialog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Interview Questions
            </DialogTitle>
            <DialogDescription>
              Select a category to practice interview questions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Select a question category..." />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(interviewQuestions).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTopic && (
              <div className="space-y-4 mt-6">
                <h3 className="font-semibold text-lg">{selectedTopic}</h3>
                <Separator />
                {interviewQuestions[selectedTopic as keyof typeof interviewQuestions].map((item, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardContent className="pt-4">
                      <p className="font-medium text-primary mb-2">Q{index + 1}: {item.q}</p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Answer: </span>
                        {item.a}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Resume Templates Dialog */}
      <Dialog open={resourceDialog === 'resume'} onOpenChange={(open) => !open && setResourceDialog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Resume Templates
            </DialogTitle>
            <DialogDescription>
              Choose a template based on your target role
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Select a resume template..." />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(resumeTemplates).map((template) => (
                  <SelectItem key={template} value={template}>
                    {template}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTopic && (
              <div className="space-y-4 mt-6">
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle>{selectedTopic}</CardTitle>
                    <CardDescription>
                      {resumeTemplates[selectedTopic as keyof typeof resumeTemplates].description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Recommended Sections:</h4>
                      <div className="flex flex-wrap gap-2">
                        {resumeTemplates[selectedTopic as keyof typeof resumeTemplates].sections.map((section) => (
                          <Badge key={section} variant="secondary">{section}</Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Pro Tips:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {resumeTemplates[selectedTopic as keyof typeof resumeTemplates].tips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                    <Button className="w-full mt-4">Download Template</Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Mock Interviews Dialog */}
      <Dialog open={resourceDialog === 'mock'} onOpenChange={(open) => !open && setResourceDialog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Mock Interviews
            </DialogTitle>
            <DialogDescription>
              Select an interview type to schedule a practice session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Select interview type..." />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(mockInterviewTopics).map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTopic && (
              <div className="space-y-4 mt-6">
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle>{selectedTopic}</CardTitle>
                    <CardDescription>
                      {mockInterviewTopics[selectedTopic as keyof typeof mockInterviewTopics].description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium">{mockInterviewTopics[selectedTopic as keyof typeof mockInterviewTopics].duration}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Format</p>
                        <p className="font-medium">{mockInterviewTopics[selectedTopic as keyof typeof mockInterviewTopics].format}</p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Topics Covered:</h4>
                      <div className="flex flex-wrap gap-2">
                        {mockInterviewTopics[selectedTopic as keyof typeof mockInterviewTopics].topics.map((topic) => (
                          <Badge key={topic} variant="outline">{topic}</Badge>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full mt-4">Schedule Mock Interview</Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Explore Opportunities Dialog */}
      <Dialog open={resourceDialog === 'explore'} onOpenChange={(open) => {
        if (!open) {
          setResourceDialog(null);
          setSelectedDepartment('');
          setSelectedJobRole('');
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Explore Career Opportunities
            </DialogTitle>
            <DialogDescription>
              Select your department and desired job role to get personalized interview questions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* Department Selection */}
            <div className="space-y-2">
              <Label htmlFor="department">Select Your Department</Label>
              <Select value={selectedDepartment} onValueChange={(value) => {
                setSelectedDepartment(value);
                setSelectedJobRole(''); // Reset job role when department changes
              }}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Choose your department..." />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept} - {dept === 'CSE' ? 'Computer Science Engineering' : 
                                dept === 'IT' ? 'Information Technology' :
                                dept === 'ECE' ? 'Electronics & Communication' :
                                dept === 'EEE' ? 'Electrical & Electronics' :
                                dept === 'MECH' ? 'Mechanical Engineering' :
                                'Civil Engineering'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Job Role Selection */}
            {selectedDepartment && (
              <div className="space-y-2">
                <Label htmlFor="jobRole">Select Job Role</Label>
                <Select value={selectedJobRole} onValueChange={setSelectedJobRole}>
                  <SelectTrigger id="jobRole">
                    <SelectValue placeholder="Choose your desired job role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {jobRolesByDepartment[selectedDepartment].map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Interview Questions Display */}
            {selectedDepartment && selectedJobRole && (
              <div className="space-y-4 mt-6">
                <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-l-primary">
                  <h3 className="font-semibold text-lg mb-1">
                    {selectedJobRole} - {selectedDepartment}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Here are the top interview questions for this role
                  </p>
                </div>
                <Separator />
                <div className="space-y-4">
                  {departmentJobRoleQuestions[selectedDepartment]?.[selectedJobRole]?.map((item, index) => (
                    <Card key={index} className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1 space-y-2">
                            <p className="font-medium text-primary">Q: {item.q}</p>
                            <div className="pl-4 border-l-2 border-muted">
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">Answer: </span>
                                {item.a}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex gap-2 mt-6">
                  <Button className="flex-1" onClick={() => {
                    toast({
                      title: "Questions Saved!",
                      description: `Interview questions for ${selectedJobRole} have been saved to your profile.`,
                    });
                  }}>
                    Save Questions
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => navigate('/student/opportunities')}>
                    View Job Openings
                  </Button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!selectedDepartment && (
              <div className="text-center py-12">
                <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select your department to get started
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
