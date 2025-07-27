import React, { useState } from 'react';
import { Trash2, Pencil, GripVertical } from 'lucide-react';
import { Button } from '@/packages/lib/components/button';
import { Input } from '@/packages/lib/components/input';
import { FormLabel } from '@/packages/lib/components/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/packages/lib/components/select';
import { Textarea } from '@/packages/lib/components/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/packages/lib/components/popover';
import { Calendar } from '@/packages/lib/components/calendar';
import { Card } from '@/packages/lib/components/card';
import { Checkpoint, CheckpointStatus, CheckpointType } from '@prisma/client';
import { DndContext, closestCenter, KeyboardSensor, useSensor, useSensors, DragEndEvent, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarIcon } from 'lucide-react';

interface TimelineStepProps {
  checkpoints: Checkpoint[];
  onCheckpointsChange: (checkpoints: Checkpoint[]) => void;
}

interface SortableCheckpointItemProps {
  checkpoint: Checkpoint;
  onEdit: (e: React.MouseEvent, checkpoint: Checkpoint) => void;
  onDelete: (e: React.MouseEvent, checkpointId: string) => void;
}

function SortableCheckpointItem({ checkpoint, onEdit, onDelete }: SortableCheckpointItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: checkpoint.id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group bg-background/50 border border-foreground/20 rounded-lg p-2 w-32 touch-none">
      <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium z-10">{checkpoint.order}</div>

      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(e) => onEdit(e, checkpoint)}
          className="h-6 w-6 bg-background rounded-medium text-muted-foreground hover:text-foreground shadow-sm"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(e) => onDelete(e, checkpoint.id)}
          className="h-6 w-6 bg-background rounded-medium text-red-500 hover:text-red-600 shadow-sm"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div
        {...attributes}
        {...listeners}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-6 h-6 text-foreground/60" />
      </div>

      <div className="flex flex-col items-start pt-2">
        <span className="font-medium text-sm truncate w-full">{checkpoint.type.replace('_', ' ')}</span>
        {checkpoint.name && <span className="text-muted-foreground text-xs truncate w-full">{checkpoint.name}</span>}
      </div>
    </div>
  );
}

export default function TimelineStep({ checkpoints, onCheckpointsChange }: TimelineStepProps) {
  const [editingCheckpointId, setEditingCheckpointId] = useState<string | null>(null);
  const [showAllCheckpoints, setShowAllCheckpoints] = useState(false);
  const [activeCheckpoint, setActiveCheckpoint] = useState<Checkpoint>(createEmptyCheckpoint());

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  function createEmptyCheckpoint(): Checkpoint & { isModified?: boolean } {
    return {
      id: Date.now().toString(),
      projectId: '',
      type: CheckpointType.PREPARATION,
      name: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      status: CheckpointStatus.PENDING,
      order: checkpoints.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      isModified: true
    };
  }

  const reorderCheckpoints = (checkpointList: Checkpoint[]): Checkpoint[] => {
    return checkpointList.map((checkpoint, index) => ({
      ...checkpoint,
      order: index + 1
    }));
  };

  const editCheckpoint = (e: React.MouseEvent, checkpoint: Checkpoint) => {
    e.preventDefault();
    e.stopPropagation();
    const checkpointWithDates = {
      ...checkpoint,
      startDate: new Date(checkpoint.startDate),
      endDate: new Date(checkpoint.endDate),
      isModified: true
    };
    setActiveCheckpoint(checkpointWithDates);
    setEditingCheckpointId(checkpoint.id);
  };

  const handleCheckpointPublish = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let updatedCheckpoints: (Checkpoint & { isModified?: boolean })[];
    if (editingCheckpointId) {
      updatedCheckpoints = reorderCheckpoints(checkpoints.map((c) => (c.id === editingCheckpointId ? activeCheckpoint : c)));
    } else {
      updatedCheckpoints = reorderCheckpoints([...checkpoints, activeCheckpoint]);
    }

    onCheckpointsChange(updatedCheckpoints);
    setActiveCheckpoint(createEmptyCheckpoint());
    setEditingCheckpointId(null);
  };

  const updateActiveCheckpoint = (updates: Partial<Checkpoint>) => {
    setActiveCheckpoint({ ...activeCheckpoint, ...updates });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = checkpoints.findIndex((checkpoint) => checkpoint.id === active.id);
      const newIndex = checkpoints.findIndex((checkpoint) => checkpoint.id === over.id);

      const reorderedCheckpoints = reorderCheckpoints(arrayMove(checkpoints, oldIndex, newIndex));
      onCheckpointsChange(reorderedCheckpoints);
    }
  };
  return (
    <div>
      <span className="flex justify-center text-xs text-muted-foreground">
        <i>This is an optional step. You can add checkpoints later.</i>
      </span>
      <div className="space-y-4">
        <div className="mb-6">
          <h3 className="text-lg font-medium">Project Checkpoints</h3>

          {checkpoints.length > 0 && <div className="text-xs opacity-55">Hover over a checkpoint to drag and reorder, edit, or delete the checkpoint.</div>}
        </div>

        {checkpoints.length > 0 && (
          <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={checkpoints.map((checkpoint) => checkpoint.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-4 gap-3 auto-rows-fr">
                  {checkpoints.slice(0, showAllCheckpoints ? undefined : 4).map((checkpoint) => (
                    <SortableCheckpointItem
                      key={checkpoint.id}
                      checkpoint={checkpoint}
                      onEdit={editCheckpoint}
                      onDelete={(e, checkpointId) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const updatedCheckpoints = reorderCheckpoints(checkpoints.filter((c) => c.id !== checkpointId));
                        onCheckpointsChange(updatedCheckpoints);

                        if (updatedCheckpoints.length <= 4) {
                          setShowAllCheckpoints(false);
                        }
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {checkpoints.length > 4 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAllCheckpoints(!showAllCheckpoints)} className="mt-2 text-xs flex justify-center w-full">
                {showAllCheckpoints ? 'Show Less' : `Show ${checkpoints.length - 4} More`}
              </Button>
            )}
          </>
        )}
      </div>

      <Card className="p-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormLabel>Checkpoint Type</FormLabel>
              <Select value={activeCheckpoint.type} onValueChange={(value: CheckpointType) => updateActiveCheckpoint({ type: value })}>
                <SelectTrigger className="border-foreground/20">
                  <SelectValue placeholder="Select checkpoint type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CheckpointType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <FormLabel>Checkpoint Name</FormLabel>
              <Input value={activeCheckpoint.name} onChange={(e) => updateActiveCheckpoint({ name: e.target.value })} className="border-foreground/20" placeholder="Enter checkpoint name" />
            </div>
          </div>

          <div>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={activeCheckpoint.description ?? ''}
              onChange={(e) => updateActiveCheckpoint({ description: e.target.value })}
              className="border-foreground/20"
              placeholder="Describe this checkpoint"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="w-full justify-start text-left font-normal border-foreground/20">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {activeCheckpoint.startDate instanceof Date ? activeCheckpoint.startDate.toLocaleDateString() : new Date(activeCheckpoint.startDate).toLocaleDateString()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={activeCheckpoint.startDate instanceof Date ? activeCheckpoint.startDate : new Date(activeCheckpoint.startDate)}
                    onSelect={(date) => date && updateActiveCheckpoint({ startDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <FormLabel>End Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="w-full justify-start text-left font-normal border-foreground/20">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {activeCheckpoint.endDate instanceof Date ? activeCheckpoint.endDate.toLocaleDateString() : new Date(activeCheckpoint.endDate).toLocaleDateString()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={activeCheckpoint.endDate instanceof Date ? activeCheckpoint.endDate : new Date(activeCheckpoint.endDate)}
                    onSelect={(date) => date && updateActiveCheckpoint({ endDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button type="button" variant="outlinePrimary" onClick={handleCheckpointPublish} className="w-full sm:w-auto">
              {editingCheckpointId ? 'Update' : 'Add'} Checkpoint
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
