import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChecklistItem, ChecklistItemPriority } from "@/types/checklist";
import { Plus, Trash2, GripVertical, Paperclip } from "lucide-react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

interface ChecklistItemManagerProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

export function ChecklistItemManager({ items, onChange }: ChecklistItemManagerProps) {
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    priority: "Média" as ChecklistItemPriority,
    requiresAttachment: false,
    isObligatory: true
  });

  const generateId = () => `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addItem = () => {
    if (!newItem.title.trim()) return;

    const item: ChecklistItem = {
      id: generateId(),
      title: newItem.title,
      description: newItem.description || undefined,
      priority: newItem.priority,
      status: "Não iniciado",
      requiresAttachment: newItem.requiresAttachment,
      isObligatory: newItem.isObligatory,
      attachments: []
    };

    onChange([...items, item]);
    
    // Reset form
    setNewItem({
      title: "",
      description: "",
      priority: "Média",
      requiresAttachment: false,
      isObligatory: true
    });
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<ChecklistItem>) => {
    onChange(items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    onChange(newItems);
  };

  const getPriorityColor = (priority: ChecklistItemPriority) => {
    switch (priority) {
      case 'Crítica':
        return 'destructive';
      case 'Alta':
        return 'default';
      case 'Média':
        return 'secondary';
      case 'Baixa':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Item Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Adicionar Novo Item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item-title">Título *</Label>
              <Input
                id="item-title"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="Ex: Verificar EPIs da equipe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-priority">Prioridade</Label>
              <Select 
                value={newItem.priority} 
                onValueChange={(value: ChecklistItemPriority) => 
                  setNewItem({ ...newItem, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Crítica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="item-description">Descrição (Opcional)</Label>
            <Textarea
              id="item-description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="Descrição detalhada do que deve ser verificado..."
              rows={3}
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="item-obligatory"
                checked={newItem.isObligatory}
                onCheckedChange={(checked) => setNewItem({ ...newItem, isObligatory: checked })}
              />
              <Label htmlFor="item-obligatory" className="text-sm">Item obrigatório</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="item-attachment"
                checked={newItem.requiresAttachment}
                onCheckedChange={(checked) => setNewItem({ ...newItem, requiresAttachment: checked })}
              />
              <Label htmlFor="item-attachment" className="text-sm">Anexo obrigatório</Label>
            </div>
          </div>

          <Button 
            onClick={addItem} 
            disabled={!newItem.title.trim()}
            className="w-full md:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Item
          </Button>
        </CardContent>
      </Card>

      {/* Items List */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Itens do Checklist
              <Badge variant="outline">{items.length} itens</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="checklist-items">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`border rounded-lg p-4 ${
                              snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                {...provided.dragHandleProps}
                                className="mt-1 cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                              
                              <div className="flex-1 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <Label className="text-sm">Título</Label>
                                    <Input
                                      value={item.title}
                                      onChange={(e) => updateItem(item.id, { title: e.target.value })}
                                      placeholder="Título do item"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm">Prioridade</Label>
                                    <Select
                                      value={item.priority}
                                      onValueChange={(value: ChecklistItemPriority) =>
                                        updateItem(item.id, { priority: value })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Baixa">Baixa</SelectItem>
                                        <SelectItem value="Média">Média</SelectItem>
                                        <SelectItem value="Alta">Alta</SelectItem>
                                        <SelectItem value="Crítica">Crítica</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-sm">Descrição</Label>
                                  <Textarea
                                    value={item.description || ""}
                                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                                    placeholder="Descrição do item (opcional)"
                                    rows={2}
                                  />
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        checked={item.isObligatory}
                                        onCheckedChange={(checked) =>
                                          updateItem(item.id, { isObligatory: checked })
                                        }
                                      />
                                      <Label className="text-sm">Obrigatório</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        checked={item.requiresAttachment}
                                        onCheckedChange={(checked) =>
                                          updateItem(item.id, { requiresAttachment: checked })
                                        }
                                      />
                                      <Label className="text-sm flex items-center gap-1">
                                        <Paperclip className="h-3 w-3" />
                                        Anexo obrigatório
                                      </Label>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Badge variant={getPriorityColor(item.priority) as any}>
                                      {item.priority}
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeItem(item.id)}
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>
      )}

      {items.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="text-center py-8">
            <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum item adicionado. Use o formulário acima para adicionar itens ao checklist.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}