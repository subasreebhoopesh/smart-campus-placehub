/**
 * Question Bank - generates MCQ + Coding questions based on company required skills
 */

const mcqByTopic = {
  javascript: [
    { question: 'What is the output of typeof null in JavaScript?', options: ['null', 'object', 'undefined', 'string'], correctAnswer: 'object', topic: 'JavaScript' },
    { question: 'Which method removes the last element from an array?', options: ['shift()', 'pop()', 'splice()', 'slice()'], correctAnswer: 'pop()', topic: 'JavaScript' },
    { question: 'What does === check in JavaScript?', options: ['Value only', 'Type only', 'Value and type', 'Reference'], correctAnswer: 'Value and type', topic: 'JavaScript' },
    { question: 'What is a closure in JavaScript?', options: ['A loop construct', 'A function with access to its outer scope', 'A class method', 'An async function'], correctAnswer: 'A function with access to its outer scope', topic: 'JavaScript' },
    { question: 'Which keyword declares a block-scoped variable?', options: ['var', 'let', 'function', 'global'], correctAnswer: 'let', topic: 'JavaScript' },
  ],
  python: [
    { question: 'What is the output of len("hello")?', options: ['4', '5', '6', 'Error'], correctAnswer: '5', topic: 'Python' },
    { question: 'Which of these is a mutable data type in Python?', options: ['tuple', 'string', 'list', 'int'], correctAnswer: 'list', topic: 'Python' },
    { question: 'What does the "self" keyword refer to in Python?', options: ['The class itself', 'The current instance', 'The parent class', 'A global variable'], correctAnswer: 'The current instance', topic: 'Python' },
    { question: 'What is a lambda function in Python?', options: ['A named function', 'An anonymous function', 'A class method', 'A decorator'], correctAnswer: 'An anonymous function', topic: 'Python' },
    { question: 'Which method is used to add an element to a list?', options: ['add()', 'insert()', 'append()', 'push()'], correctAnswer: 'append()', topic: 'Python' },
  ],
  java: [
    { question: 'Which keyword is used to inherit a class in Java?', options: ['implements', 'extends', 'inherits', 'super'], correctAnswer: 'extends', topic: 'Java' },
    { question: 'What is the default value of an int in Java?', options: ['null', '1', '0', 'undefined'], correctAnswer: '0', topic: 'Java' },
    { question: 'Which of these is not a Java access modifier?', options: ['public', 'private', 'protected', 'friend'], correctAnswer: 'friend', topic: 'Java' },
    { question: 'What does JVM stand for?', options: ['Java Virtual Machine', 'Java Variable Method', 'Java Verified Module', 'Java Version Manager'], correctAnswer: 'Java Virtual Machine', topic: 'Java' },
    { question: 'Which interface must be implemented for a class to be used in a for-each loop?', options: ['Runnable', 'Comparable', 'Iterable', 'Serializable'], correctAnswer: 'Iterable', topic: 'Java' },
  ],
  react: [
    { question: 'What hook is used to manage state in a functional component?', options: ['useEffect', 'useState', 'useContext', 'useRef'], correctAnswer: 'useState', topic: 'React' },
    { question: 'What does JSX stand for?', options: ['JavaScript XML', 'Java Syntax Extension', 'JSON XML', 'JavaScript Extension'], correctAnswer: 'JavaScript XML', topic: 'React' },
    { question: 'Which hook runs after every render by default?', options: ['useState', 'useCallback', 'useEffect', 'useMemo'], correctAnswer: 'useEffect', topic: 'React' },
    { question: 'What is a prop in React?', options: ['State variable', 'Input passed to a component', 'A lifecycle method', 'A CSS class'], correctAnswer: 'Input passed to a component', topic: 'React' },
    { question: 'What is the virtual DOM?', options: ['A browser API', 'A lightweight copy of the real DOM', 'A CSS framework', 'A database'], correctAnswer: 'A lightweight copy of the real DOM', topic: 'React' },
  ],
  sql: [
    { question: 'Which SQL command retrieves data from a table?', options: ['INSERT', 'UPDATE', 'SELECT', 'DELETE'], correctAnswer: 'SELECT', topic: 'SQL' },
    { question: 'What does PRIMARY KEY ensure?', options: ['Unique and not null values', 'Only unique values', 'Only not null values', 'Foreign key reference'], correctAnswer: 'Unique and not null values', topic: 'SQL' },
    { question: 'Which JOIN returns all rows from both tables?', options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'], correctAnswer: 'FULL OUTER JOIN', topic: 'SQL' },
    { question: 'What does GROUP BY do?', options: ['Sorts results', 'Groups rows with same values', 'Filters rows', 'Joins tables'], correctAnswer: 'Groups rows with same values', topic: 'SQL' },
    { question: 'Which aggregate function counts rows?', options: ['SUM()', 'AVG()', 'COUNT()', 'MAX()'], correctAnswer: 'COUNT()', topic: 'SQL' },
  ],
  mongodb: [
    { question: 'What is the primary key field in MongoDB called?', options: ['id', '_id', 'pk', 'key'], correctAnswer: '_id', topic: 'MongoDB' },
    { question: 'Which method inserts a document in MongoDB?', options: ['insert()', 'insertOne()', 'add()', 'create()'], correctAnswer: 'insertOne()', topic: 'MongoDB' },
    { question: 'What does $gt mean in a MongoDB query?', options: ['Greater than', 'Less than', 'Equal to', 'Not equal'], correctAnswer: 'Greater than', topic: 'MongoDB' },
    { question: 'What is a collection in MongoDB?', options: ['A row', 'A table equivalent', 'A database', 'An index'], correctAnswer: 'A table equivalent', topic: 'MongoDB' },
    { question: 'Which command shows all databases in MongoDB?', options: ['show dbs', 'list databases', 'show collections', 'db.list()'], correctAnswer: 'show dbs', topic: 'MongoDB' },
  ],
  'data structures': [
    { question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctAnswer: 'O(log n)', topic: 'Data Structures' },
    { question: 'Which data structure uses LIFO order?', options: ['Queue', 'Stack', 'Linked List', 'Tree'], correctAnswer: 'Stack', topic: 'Data Structures' },
    { question: 'What is the worst case time complexity of quicksort?', options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], correctAnswer: 'O(n²)', topic: 'Data Structures' },
    { question: 'Which traversal visits root first?', options: ['Inorder', 'Postorder', 'Preorder', 'Level order'], correctAnswer: 'Preorder', topic: 'Data Structures' },
    { question: 'What is a hash collision?', options: ['Two keys map to same index', 'A key with no value', 'An empty hash table', 'A deleted entry'], correctAnswer: 'Two keys map to same index', topic: 'Data Structures' },
  ],
  default: [
    { question: 'What does OOP stand for?', options: ['Object Oriented Programming', 'Open Object Protocol', 'Ordered Object Processing', 'None'], correctAnswer: 'Object Oriented Programming', topic: 'General' },
    { question: 'What is an API?', options: ['Application Programming Interface', 'Automated Process Integration', 'Application Process Index', 'None'], correctAnswer: 'Application Programming Interface', topic: 'General' },
    { question: 'What does HTTP stand for?', options: ['HyperText Transfer Protocol', 'High Transfer Text Protocol', 'Hyper Transfer Text Process', 'None'], correctAnswer: 'HyperText Transfer Protocol', topic: 'General' },
    { question: 'What is version control?', options: ['Managing code changes over time', 'A type of database', 'A programming language', 'A testing framework'], correctAnswer: 'Managing code changes over time', topic: 'General' },
    { question: 'What is recursion?', options: ['A loop', 'A function calling itself', 'A data type', 'An algorithm'], correctAnswer: 'A function calling itself', topic: 'General' },
  ]
};

const codingQuestions = [
  {
    question: 'Reverse a String',
    description: 'Write a function that takes a string as input and returns the reversed string.\n\nExample:\nInput: "hello"\nOutput: "olleh"',
    testCases: [
      { input: 'hello', expectedOutput: 'olleh', isHidden: false },
      { input: 'world', expectedOutput: 'dlrow', isHidden: false },
      { input: 'abcde', expectedOutput: 'edcba', isHidden: true },
    ],
    starterCode: {
      python: 'def reverse_string(s):\n    # Write your code here\n    pass\n\n# Read input\ns = input()\nprint(reverse_string(s))',
      java: 'import java.util.Scanner;\npublic class Main {\n    public static String reverseString(String s) {\n        // Write your code here\n        return "";\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        System.out.println(reverseString(s));\n    }\n}',
      cpp: '#include<iostream>\n#include<string>\n#include<algorithm>\nusing namespace std;\nstring reverseString(string s) {\n    // Write your code here\n    return "";\n}\nint main() {\n    string s;\n    cin >> s;\n    cout << reverseString(s);\n    return 0;\n}',
      javascript: 'const readline = require("readline");\nconst rl = readline.createInterface({ input: process.stdin });\nrl.on("line", (s) => {\n    // Write your code here\n    console.log(s.split("").reverse().join(""));\n    rl.close();\n});'
    },
    points: 20,
    topic: 'Strings'
  },
  {
    question: 'Find Maximum in Array',
    description: 'Write a function that finds the maximum element in an array of integers.\n\nExample:\nInput: 5\n3 1 4 1 5\nOutput: 5\n\n(First line is array size, second line is space-separated elements)',
    testCases: [
      { input: '5\n3 1 4 1 5', expectedOutput: '5', isHidden: false },
      { input: '4\n10 20 5 8', expectedOutput: '20', isHidden: false },
      { input: '3\n-1 -5 -2', expectedOutput: '-1', isHidden: true },
    ],
    starterCode: {
      python: 'n = int(input())\narr = list(map(int, input().split()))\n# Write your code here\nprint(max(arr))',
      java: 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for(int i=0;i<n;i++) arr[i] = sc.nextInt();\n        // Write your code here\n        int max = arr[0];\n        for(int x : arr) if(x > max) max = x;\n        System.out.println(max);\n    }\n}',
      cpp: '#include<iostream>\n#include<algorithm>\nusing namespace std;\nint main(){\n    int n; cin>>n;\n    int arr[n];\n    for(int i=0;i<n;i++) cin>>arr[i];\n    // Write your code here\n    cout << *max_element(arr, arr+n);\n    return 0;\n}',
      javascript: 'const lines = [];\nconst rl = require("readline").createInterface({input:process.stdin});\nrl.on("line",l=>lines.push(l));\nrl.on("close",()=>{\n    const arr = lines[1].split(" ").map(Number);\n    console.log(Math.max(...arr));\n});'
    },
    points: 20,
    topic: 'Arrays'
  },
  {
    question: 'Check Palindrome',
    description: 'Write a function to check if a given string is a palindrome.\nPrint "YES" if palindrome, "NO" otherwise.\n\nExample:\nInput: racecar\nOutput: YES',
    testCases: [
      { input: 'racecar', expectedOutput: 'YES', isHidden: false },
      { input: 'hello', expectedOutput: 'NO', isHidden: false },
      { input: 'madam', expectedOutput: 'YES', isHidden: true },
    ],
    starterCode: {
      python: 's = input()\n# Write your code here\nif s == s[::-1]:\n    print("YES")\nelse:\n    print("NO")',
      java: 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        // Write your code here\n        String rev = new StringBuilder(s).reverse().toString();\n        System.out.println(s.equals(rev) ? "YES" : "NO");\n    }\n}',
      cpp: '#include<iostream>\n#include<string>\n#include<algorithm>\nusing namespace std;\nint main(){\n    string s; cin>>s;\n    string r = s;\n    reverse(r.begin(),r.end());\n    cout << (s==r ? "YES" : "NO");\n    return 0;\n}',
      javascript: 'const rl = require("readline").createInterface({input:process.stdin});\nrl.on("line",(s)=>{\n    const rev = s.split("").reverse().join("");\n    console.log(s===rev?"YES":"NO");\n    rl.close();\n});'
    },
    points: 20,
    topic: 'Strings'
  },
  {
    question: 'Fibonacci Series',
    description: 'Print the first N numbers of the Fibonacci series (space-separated).\n\nExample:\nInput: 6\nOutput: 0 1 1 2 3 5',
    testCases: [
      { input: '6', expectedOutput: '0 1 1 2 3 5', isHidden: false },
      { input: '1', expectedOutput: '0', isHidden: false },
      { input: '8', expectedOutput: '0 1 1 2 3 5 8 13', isHidden: true },
    ],
    starterCode: {
      python: 'n = int(input())\n# Write your code here\na, b = 0, 1\nresult = []\nfor _ in range(n):\n    result.append(str(a))\n    a, b = b, a+b\nprint(" ".join(result))',
      java: 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        // Write your code here\n        int a=0,b=1;\n        StringBuilder sb = new StringBuilder();\n        for(int i=0;i<n;i++){\n            if(i>0) sb.append(" ");\n            sb.append(a);\n            int c=a+b; a=b; b=c;\n        }\n        System.out.println(sb);\n    }\n}',
      cpp: '#include<iostream>\nusing namespace std;\nint main(){\n    int n; cin>>n;\n    int a=0,b=1;\n    for(int i=0;i<n;i++){\n        if(i>0) cout<<" ";\n        cout<<a;\n        int c=a+b; a=b; b=c;\n    }\n    return 0;\n}',
      javascript: 'const rl = require("readline").createInterface({input:process.stdin});\nrl.on("line",(line)=>{\n    const n=parseInt(line);\n    let a=0,b=1,res=[];\n    for(let i=0;i<n;i++){res.push(a);[a,b]=[b,a+b];}\n    console.log(res.join(" "));\n    rl.close();\n});'
    },
    points: 20,
    topic: 'Algorithms'
  },
  {
    question: 'Count Vowels',
    description: 'Count the number of vowels (a, e, i, o, u) in a given string (case-insensitive).\n\nExample:\nInput: Hello World\nOutput: 3',
    testCases: [
      { input: 'Hello World', expectedOutput: '3', isHidden: false },
      { input: 'aeiou', expectedOutput: '5', isHidden: false },
      { input: 'Python Programming', expectedOutput: '4', isHidden: true },
    ],
    starterCode: {
      python: 's = input()\n# Write your code here\ncount = sum(1 for c in s.lower() if c in "aeiou")\nprint(count)',
      java: 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine().toLowerCase();\n        // Write your code here\n        int count = 0;\n        for(char c : s.toCharArray())\n            if("aeiou".indexOf(c) >= 0) count++;\n        System.out.println(count);\n    }\n}',
      cpp: '#include<iostream>\n#include<string>\nusing namespace std;\nint main(){\n    string s; getline(cin,s);\n    int count=0;\n    for(char c:s) if(string("aeiou").find(tolower(c))!=string::npos) count++;\n    cout<<count;\n    return 0;\n}',
      javascript: 'const rl = require("readline").createInterface({input:process.stdin});\nrl.on("line",(s)=>{\n    const count = s.toLowerCase().split("").filter(c=>"aeiou".includes(c)).length;\n    console.log(count);\n    rl.close();\n});'
    },
    points: 20,
    topic: 'Strings'
  }
];

/**
 * Generate questions based on company required skills
 */
function generateQuestions(requiredSkills = [], numMcq = 5, numCoding = 2) {
  const questions = [];
  const usedMcq = new Set();

  // Normalize skills
  const normalizedSkills = requiredSkills.map(s => s.toLowerCase().trim());

  // Pick MCQ questions based on skills
  const skillTopics = normalizedSkills.filter(s => mcqByTopic[s]);
  const fallbackTopics = ['default'];

  const topicsToUse = skillTopics.length > 0 ? skillTopics : fallbackTopics;

  let mcqCount = 0;
  let topicIndex = 0;

  while (mcqCount < numMcq) {
    const topic = topicsToUse[topicIndex % topicsToUse.length];
    const pool = mcqByTopic[topic] || mcqByTopic['default'];

    for (const q of pool) {
      const key = q.question;
      if (!usedMcq.has(key) && mcqCount < numMcq) {
        usedMcq.add(key);
        questions.push({ type: 'mcq', ...q, points: 10 });
        mcqCount++;
      }
    }
    topicIndex++;
    if (topicIndex > topicsToUse.length * 3) break; // safety
  }

  // Fill remaining MCQ from default if needed
  if (mcqCount < numMcq) {
    for (const q of mcqByTopic['default']) {
      if (!usedMcq.has(q.question) && mcqCount < numMcq) {
        usedMcq.add(q.question);
        questions.push({ type: 'mcq', ...q, points: 10 });
        mcqCount++;
      }
    }
  }

  // Pick coding questions (shuffle and pick)
  const shuffled = [...codingQuestions].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(numCoding, shuffled.length); i++) {
    questions.push({ type: 'coding', ...shuffled[i] });
  }

  return questions;
}

module.exports = { generateQuestions, mcqByTopic, codingQuestions };
