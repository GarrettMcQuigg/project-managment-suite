import React, { useState } from 'react';
import { Trash2, Pencil } from 'lucide-react';
import { Button } from '@/packages/lib/components/button';
import { Input } from '@/packages/lib/components/input';
import { FormLabel } from '@/packages/lib/components/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/packages/lib/components/select';
import { Textarea } from '@/packages/lib/components/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/packages/lib/components/popover';
import { Calendar } from '@/packages/lib/components/calendar';
import { Card } from '@/packages/lib/components/card';
import { Phase, PhaseType } from '@prisma/client';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarIcon } from 'lucide-react';

interface TimelineStepProps {
  phases: Phase[];
  onPhasesChange: (phases: Phase[]) => void;
}

interface SortablePhaseItemProps {
  phase: Phase;
  onEdit: (e: React.MouseEvent, phase: Phase) => void;
  onDelete: (e: React.MouseEvent, phaseId: string) => void;
}

function SortablePhaseItem({ phase, onEdit, onDelete }: SortablePhaseItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: phase.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="relative group bg-background/50 border border-foreground/20 rounded-lg p-2 w-32 cursor-grab active:cursor-grabbing"
    >
      {/* Order Circle */}
      <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium z-10">{phase.order}</div>

      <div className="flex flex-col items-start pt-2">
        <span className="font-medium text-sm truncate w-full">{phase.type.replace('_', ' ')}</span>
        {phase.name && <span className="text-muted-foreground text-xs truncate w-full">{phase.name}</span>}
      </div>

      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
        <Button type="button" variant="ghost" size="icon" onClick={(e) => onEdit(e, phase)} className="h-6 w-6 text-muted-foreground hover:text-foreground">
          <Pencil className="h-3 w-3" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={(e) => onDelete(e, phase.id)} className="h-6 w-6 text-red-500 hover:text-red-600">
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export default function TimelineStep({ phases, onPhasesChange }: TimelineStepProps) {
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [showAllPhases, setShowAllPhases] = useState(false);
  const [activePhase, setActivePhase] = useState<Phase>(createEmptyPhase());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  function createEmptyPhase(): Phase {
    return {
      id: Date.now().toString(),
      projectId: '',
      type: PhaseType.PREPARATION,
      name: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      status: 'PENDING',
      order: phases.length + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  const reorderPhases = (phaseList: Phase[]): Phase[] => {
    return phaseList.map((phase, index) => ({
      ...phase,
      order: index + 1
    }));
  };

  const editPhase = (e: React.MouseEvent, phase: Phase) => {
    e.preventDefault();
    e.stopPropagation();
    setActivePhase(phase);
    setEditingPhaseId(phase.id);
  };

  const handlePhasePublish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let updatedPhases: Phase[];
    if (editingPhaseId) {
      updatedPhases = reorderPhases(phases.map((p) => (p.id === editingPhaseId ? activePhase : p)));
    } else {
      updatedPhases = reorderPhases([...phases, activePhase]);
    }

    onPhasesChange(updatedPhases);
    setActivePhase(createEmptyPhase());
    setEditingPhaseId(null);
  };

  const updateActivePhase = (updates: Partial<Phase>) => {
    setActivePhase({ ...activePhase, ...updates });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = phases.findIndex((phase) => phase.id === active.id);
      const newIndex = phases.findIndex((phase) => phase.id === over.id);

      const reorderedPhases = reorderPhases(arrayMove(phases, oldIndex, newIndex));
      onPhasesChange(reorderedPhases);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="mb-6">
          <h3 className="text-lg font-medium">Project Timeline</h3>
          <div className="text-xs opacity-55">Hover over the phase to drag and reorder.</div>
        </div>

        {phases.length > 0 && (
          <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={phases.map((phase) => phase.id)} strategy={horizontalListSortingStrategy}>
                <div className="flex flex-wrap justify-center gap-2">
                  {phases.slice(0, showAllPhases ? undefined : 4).map((phase) => (
                    <SortablePhaseItem
                      key={phase.id}
                      phase={phase}
                      onEdit={editPhase}
                      onDelete={(e, phaseId) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const updatedPhases = reorderPhases(phases.filter((p) => p.id !== phaseId));
                        onPhasesChange(updatedPhases);

                        if (updatedPhases.length <= 4) {
                          setShowAllPhases(false);
                        }
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {phases.length > 4 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAllPhases(!showAllPhases)} className="mt-2 text-xs flex justify-center w-full">
                {showAllPhases ? 'Show Less' : `Show ${phases.length - 4} More`}
              </Button>
            )}
          </>
        )}
      </div>

      <Card className="p-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormLabel>Phase Type</FormLabel>
              <Select value={activePhase.type} onValueChange={(value: PhaseType) => updateActivePhase({ type: value })}>
                <SelectTrigger className="border-foreground/20">
                  <SelectValue placeholder="Select phase type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PhaseType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <FormLabel>Phase Name</FormLabel>
              <Input value={activePhase.name} onChange={(e) => updateActivePhase({ name: e.target.value })} className="border-foreground/20" placeholder="Enter phase name" />
            </div>
          </div>

          <div>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={activePhase.description ?? ''}
              onChange={(e) => updateActivePhase({ description: e.target.value })}
              className="border-foreground/20"
              placeholder="Describe this phase"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="w-full justify-start text-left font-normal border-foreground/20">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {activePhase.startDate.toLocaleDateString()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={activePhase.startDate} onSelect={(date) => date && updateActivePhase({ startDate: date })} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <FormLabel>End Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="w-full justify-start text-left font-normal border-foreground/20">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {activePhase.endDate.toLocaleDateString()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={activePhase.endDate}
                    onSelect={(date) => date && updateActivePhase({ endDate: date })}
                    initialFocus
                    disabled={(date) => date < activePhase.startDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button type="button" onClick={handlePhasePublish} className="w-full sm:w-auto">
              {editingPhaseId ? 'Update' : 'Add'} Phase
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
