
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  obra: string;
}

interface PresenceRecord {
  memberId: string;
  date: string;
  status: 'presente' | 'ferias' | 'afastado' | 'externo';
  hours?: number;
  observations?: string;
}

interface PresenceControlProps {
  members: TeamMember[];
  onPresenceUpdate: (record: PresenceRecord) => void;
}

export function PresenceControl({ members, onPresenceUpdate }: PresenceControlProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [presenceRecords, setPresenceRecords] = useState<PresenceRecord[]>([]);

  const getStatusColor = (status: PresenceRecord['status']) => {
    switch (status) {
      case 'presente':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ferias':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'afastado':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'externo':
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const getStatusLabel = (status: PresenceRecord['status']) => {
    switch (status) {
      case 'presente': return 'Presente';
      case 'ferias': return 'Férias';
      case 'afastado': return 'Afastado';
      case 'externo': return 'Externo';
    }
  };

  const handleStatusChange = (memberId: string, status: PresenceRecord['status']) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const record: PresenceRecord = {
      memberId,
      date: dateStr,
      status
    };

    setPresenceRecords(prev => {
      const filtered = prev.filter(r => !(r.memberId === memberId && r.date === dateStr));
      return [...filtered, record];
    });

    onPresenceUpdate(record);
  };

  const getMemberStatus = (memberId: string): PresenceRecord['status'] | undefined => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const record = presenceRecords.find(r => r.memberId === memberId && r.date === dateStr);
    return record?.status;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Controle de Presença</span>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-4">
        {members.map((member) => {
          const currentStatus = getMemberStatus(member.id);
          
          return (
            <Card key={member.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{member.name}</CardTitle>
                      <CardDescription>{member.role} - {member.obra}</CardDescription>
                    </div>
                  </div>
                  
                  {currentStatus && (
                    <Badge className={getStatusColor(currentStatus)}>
                      {getStatusLabel(currentStatus)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={currentStatus === 'presente' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(member.id, 'presente')}
                    className="text-xs"
                  >
                    Presente
                  </Button>
                  <Button
                    variant={currentStatus === 'ferias' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(member.id, 'ferias')}
                    className="text-xs"
                  >
                    Férias
                  </Button>
                  <Button
                    variant={currentStatus === 'afastado' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(member.id, 'afastado')}
                    className="text-xs"
                  >
                    Afastado
                  </Button>
                  <Button
                    variant={currentStatus === 'externo' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(member.id, 'externo')}
                    className="text-xs"
                  >
                    Externo
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
