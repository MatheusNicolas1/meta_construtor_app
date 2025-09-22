import { Bell, CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState, startTransition } from "react";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "RDO Aprovado",
    message: "RDO da obra Residencial Vista Verde foi aprovado",
    type: "success",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    actionUrl: "/rdo",
  },
  {
    id: "2",
    title: "Prazo Próximo",
    message: "Ponte Rio Azul vence em 5 dias",
    type: "warning",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: false,
    actionUrl: "/obras",
  },
  {
    id: "3",
    title: "Equipamento Disponível",
    message: "Escavadeira CAT-320 voltou da manutenção",
    type: "info",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    read: true,
    actionUrl: "/equipamentos",
  },
  {
    id: "4",
    title: "Nova Atividade Agendada",
    message: "Concretagem da laje agendada para amanhã",
    type: "info",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
    actionUrl: "/atividades",
  },
];

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-construction-green" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-construction-orange" />;
    case "error":
      return <X className="h-4 w-4 text-destructive" />;
    default:
      return <Info className="h-4 w-4 text-construction-blue" />;
  }
};

const formatTimestamp = (timestamp: Date) => {
  const now = new Date();
  const diffInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return "Agora há pouco";
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h atrás`;
  } else {
    return `${Math.floor(diffInHours / 24)}d atrás`;
  }
};

export function NotificationPanel() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      startTransition(() => {
        navigate(notification.actionUrl);
        setIsOpen(false);
      });
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative text-sidebar-foreground hover:text-sidebar-accent-foreground">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center z-10"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[400px] max-h-screen overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle>Notificações</SheetTitle>
          <SheetDescription>
            Suas atualizações mais recentes
          </SheetDescription>
        </SheetHeader>
        
        {unreadCount > 0 && (
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Marcar todas como lidas
            </Button>
          </div>
        )}

        <ScrollArea className="mt-6 flex-1 min-h-0 h-full pr-2">
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <div 
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    notification.read 
                      ? "bg-muted/50" 
                      : "bg-accent/50 border border-accent"
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-construction-blue rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
                {index < notifications.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}