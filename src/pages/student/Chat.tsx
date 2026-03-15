import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, MessageCircle, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api';
import { format } from 'date-fns';

interface Message {
  id: string;
  message: string;
  createdAt: string;
  isMine: boolean;
  senderName: string;
  isRead: boolean;
}

export default function StudentChat() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch admin ID and conversation
  useEffect(() => {
    fetchAdminAndConversation();
    
    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      if (adminId) {
        fetchConversation(adminId, true);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [adminId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchAdminAndConversation = async () => {
    try {
      setLoading(true);
      
      // Get admin user ID from backend
      const response = await api.messages.getAdminId();
      
      if (response.success && response.adminId) {
        setAdminId(response.adminId);
        await fetchConversation(response.adminId);
      } else {
        toast({
          title: 'Error',
          description: 'Admin not found',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to fetch admin:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async (adminUserId: string, silent = false) => {
    try {
      const response = await api.messages.getConversation(adminUserId);
      setMessages(response);
      
      // Mark messages as read
      const unreadMessages = response.filter((msg: Message) => !msg.isMine && !msg.isRead);
      for (const msg of unreadMessages) {
        await api.messages.markAsRead(msg.id);
      }
    } catch (error) {
      if (!silent) {
        console.error('Failed to fetch conversation:', error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !adminId) return;

    try {
      setSending(true);
      await api.messages.send({
        recipientId: adminId,
        subject: 'Chat Message',
        message: newMessage.trim(),
        priority: 'normal'
      });

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
      setTimeout(() => fetchConversation(adminId, true), 500);

      toast({
        title: 'Message Sent',
        description: 'Your message has been delivered to admin',
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

  return (
    <DashboardLayout userRole="student">
      <div className="h-[calc(100vh-8rem)]">
        <Card className="h-full flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Chat with Admin
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ask questions about placements, drives, and more
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
                  <p>Loading chat...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium mb-2">No messages yet</p>
                      <p className="text-sm">
                        Start a conversation with the admin. Ask about placement drives,
                        application status, or any queries you have!
                      </p>
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
                          {!message.isMine && (
                            <p className="text-xs font-medium mb-1 opacity-70">
                              Admin
                            </p>
                          )}
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
                            {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t bg-muted/30">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sending}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
