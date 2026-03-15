import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Search, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { format } from 'date-fns';

interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  branch: string;
  unreadCount: number;
}

interface Message {
  id: string;
  message: string;
  createdAt: string;
  isMine: boolean;
  senderName: string;
  isRead: boolean;
}

export default function AdminChat() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all students
  useEffect(() => {
    fetchStudents();
  }, []);

  // Fetch conversation when student is selected
  useEffect(() => {
    if (selectedStudent) {
      fetchConversation(selectedStudent.id);
    }
  }, [selectedStudent]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.students.getAll();
      
      console.log('Raw students response:', response);
      
      const studentsData = response.map((student: any) => {
        console.log('Processing student:', student);
        
        return {
          id: student.userId || student.id, // Use userId for messaging, fallback to id
          name: student.name || 'Unknown',
          email: student.email || '',
          rollNumber: student.rollNumber || '',
          branch: student.branch || '',
          unreadCount: 0
        };
      });
      
      // Filter out students without valid userId
      const validStudents = studentsData.filter(s => s.id);
      
      console.log('Valid students:', validStudents);
      setStudents(validStudents);
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async (studentId: string) => {
    try {
      const response = await api.messages.getConversation(studentId);
      setMessages(response);
      
      // Mark messages as read
      const unreadMessages = response.filter((msg: Message) => !msg.isMine && !msg.isRead);
      for (const msg of unreadMessages) {
        await api.messages.markAsRead(msg.id);
      }
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversation',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedStudent) return;

    console.log('Sending message to student:', selectedStudent);
    console.log('Recipient ID:', selectedStudent.id);

    try {
      setSending(true);
      const messageData = {
        recipientId: selectedStudent.id,
        subject: 'Chat Message',
        message: newMessage.trim(),
        priority: 'normal'
      };
      
      console.log('Message data:', messageData);
      
      await api.messages.send(messageData);

      // Add message to UI immediately
      const tempMessage: Message = {
        id: Date.now().toString(),
        message: newMessage.trim(),
        createdAt: new Date().toISOString(),
        isMine: true,
        senderName: 'You',
        isRead: false
      };

      setMessages([...messages, tempMessage]);
      setNewMessage('');

      // Refresh conversation to get actual message from server
      setTimeout(() => fetchConversation(selectedStudent.id), 500);

      toast({
        title: 'Message Sent',
        description: 'Your message has been delivered',
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout userRole="admin">
      <div className="h-[calc(100vh-8rem)]">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Student Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex h-[calc(100vh-14rem)]">
              {/* Students List */}
              <div className="w-80 border-r flex flex-col">
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Loading students...
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No students found
                    </div>
                  ) : (
                    filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedStudent?.id === student.id ? 'bg-muted' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">{student.name}</p>
                              {student.unreadCount > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                  {student.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {student.rollNumber} • {student.branch}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {selectedStudent ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {selectedStudent.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedStudent.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedStudent.rollNumber} • {selectedStudent.branch}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          No messages yet. Start the conversation!
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                message.isMine
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {message.message}
                              </p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.isMine
                                    ? 'text-primary-foreground/70'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                {format(new Date(message.createdAt), 'h:mm a')}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          disabled={sending}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || sending}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a student to start chatting</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
