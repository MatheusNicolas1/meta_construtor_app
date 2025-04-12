
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

export interface TeamMember {
  id: string;
  role: string;
  quantity: number;
}

interface TeamMemberFormProps {
  onTeamMembersChange?: (members: TeamMember[]) => void;
}

export function TeamMemberForm({ onTeamMembersChange }: TeamMemberFormProps) {
  const { resolvedTheme } = useTheme();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [currentRole, setCurrentRole] = useState("");
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addOrUpdateTeamMember = () => {
    if (!currentRole.trim()) return;
    
    const updatedMembers = [...teamMembers];
    
    if (editingId) {
      const index = updatedMembers.findIndex(member => member.id === editingId);
      if (index !== -1) {
        updatedMembers[index] = {
          id: editingId,
          role: currentRole,
          quantity: currentQuantity
        };
      }
      setEditingId(null);
    } else {
      updatedMembers.push({
        id: crypto.randomUUID(),
        role: currentRole,
        quantity: currentQuantity
      });
    }
    
    setTeamMembers(updatedMembers);
    setCurrentRole("");
    setCurrentQuantity(1);
    onTeamMembersChange?.(updatedMembers);
  };

  const editTeamMember = (member: TeamMember) => {
    setCurrentRole(member.role);
    setCurrentQuantity(member.quantity);
    setEditingId(member.id);
  };

  const removeTeamMember = (id: string) => {
    const updatedMembers = teamMembers.filter(member => member.id !== id);
    setTeamMembers(updatedMembers);
    onTeamMembersChange?.(updatedMembers);
    
    if (editingId === id) {
      setEditingId(null);
      setCurrentRole("");
      setCurrentQuantity(1);
    }
  };

  const getTotalMembers = () => {
    return teamMembers.reduce((total, member) => total + member.quantity, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Nome da Função (ex: Engenheiro)"
          value={currentRole}
          onChange={(e) => setCurrentRole(e.target.value)}
          className="flex-1"
        />
        <Input
          type="number"
          min={1}
          placeholder="Quantidade"
          value={currentQuantity}
          onChange={(e) => setCurrentQuantity(parseInt(e.target.value) || 1)}
          className="w-full sm:w-28"
        />
        <Button 
          type="button"
          onClick={addOrUpdateTeamMember}
          variant="default"
          size="sm"
          className="bg-orange-500 hover:bg-orange-600 text-white whitespace-nowrap"
        >
          {editingId ? "Atualizar" : "Adicionar Função"}
          <Plus size={16} className={editingId ? "hidden" : ""} />
        </Button>
      </div>

      {teamMembers.length > 0 && (
        <>
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <div 
                key={member.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded-md",
                  resolvedTheme === "dark" ? "bg-gray-800" : "bg-gray-100"
                )}
              >
                <div className="flex-1">
                  <span className="font-medium">{member.role}</span>
                  <span className="mx-2">|</span>
                  <span>Quantidade: {member.quantity}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => editTeamMember(member)} 
                    className="p-1 rounded-md hover:bg-gray-200 hover:bg-opacity-20"
                  >
                    <Pencil size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => removeTeamMember(member.id)} 
                    className="p-1 rounded-md hover:bg-gray-200 hover:bg-opacity-20"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div 
            className={cn(
              "p-2 rounded-md font-medium",
              resolvedTheme === "dark" 
                ? "bg-gray-700 text-white" 
                : "bg-gray-200 text-gray-800"
            )}
          >
            Total de Colaboradores: {getTotalMembers()}
          </div>
        </>
      )}
    </div>
  );
}
