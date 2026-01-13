import { useState } from 'react';
import { Send, ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

interface Thread {
  id: string;
  vendorName: string;
  vendorAvatar: string;
  experienceTitle: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

interface MessagingThreadListProps {
  onSelectThread: (threadId: string) => void;
  onBack: () => void;
}

const mockThreads: Thread[] = [
  {
    id: '1',
    vendorName: 'Made Artana',
    vendorAvatar: '',
    experienceTitle: 'Sunrise Yoga at Tanah Lot',
    lastMessage: 'Great! Looking forward to seeing you tomorrow',
    timestamp: '2h ago',
    unread: true,
  },
  {
    id: '2',
    vendorName: 'Wayan Sujana',
    vendorAvatar: '',
    experienceTitle: 'Mount Batur Sunrise Trek',
    lastMessage: 'The weather should be perfect for hiking',
    timestamp: '1d ago',
    unread: false,
  },
];

export function MessagingThreadList({
  onSelectThread,
  onBack,
}: MessagingThreadListProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <h1 className="font-display text-2xl font-semibold">Messages</h1>
        </div>
      </div>

      <div className="container max-w-3xl space-y-2 py-4">
        {mockThreads.map((thread) => (
          <Card
            key={thread.id}
            className="cursor-pointer transition-all hover:shadow-md"
            onClick={() => onSelectThread(thread.id)}
          >
            <CardContent className="flex gap-3 p-4">
              <Avatar>
                <AvatarImage src={thread.vendorAvatar} />
                <AvatarFallback>{thread.vendorName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{thread.vendorName}</p>
                    <p className="text-sm text-muted-foreground">
                      {thread.experienceTitle}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-muted-foreground">
                      {thread.timestamp}
                    </span>
                    {thread.unread && (
                      <Badge
                        variant="default"
                        className="h-5 w-5 rounded-full p-0 flex items-center justify-center"
                      >
                        1
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {thread.lastMessage}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface MessagingConversationViewProps {
  onBack: () => void;
}

export function MessagingConversationView({
  onBack,
}: MessagingConversationViewProps) {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: 'vendor1',
      text: 'Hi! Thanks for booking. Looking forward to your visit!',
      timestamp: '10:30 AM',
      isOwn: false,
    },
    {
      id: '2',
      senderId: 'user1',
      text: 'Thank you! What should I bring?',
      timestamp: '10:32 AM',
      isOwn: true,
    },
    {
      id: '3',
      senderId: 'vendor1',
      text: 'Just bring comfortable clothing, water, and sunscreen. We provide the yoga mats!',
      timestamp: '10:35 AM',
      isOwn: false,
    },
  ]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'user1',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isOwn: true,
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container flex items-center gap-4 py-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarFallback>MA</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium">Made Artana</p>
            <p className="text-sm text-muted-foreground">
              Sunrise Yoga at Tanah Lot
            </p>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.isOwn
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p
                className={`mt-1 text-xs ${message.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
              >
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
