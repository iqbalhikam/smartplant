import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useDeviceStore, PlantPreset } from '../store/useDeviceStore';
import { X, GripVertical, Plus, Trash2, Check, Settings2, Loader2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortablePresetItemProps {
  preset: PlantPreset;
  onApply: (preset: PlantPreset) => void;
  onRemove: (id: string) => void;
}

function SortablePresetItem({ preset, onApply, onRemove }: SortablePresetItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: preset.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 mb-2 bg-slate-50 dark:bg-slate-800/80 border rounded-xl shadow-sm transition-colors ${
        isDragging ? 'border-primary shadow-md' : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <button
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{preset.icon}</span>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-slate-800 dark:text-white">{preset.label}</span>
            <span className="text-[10px] text-slate-500 font-mono">
              {preset.keringPct}% - {preset.basahPct}%
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onApply(preset)}
          className="p-1.5 px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
        >
          <Check className="w-3.5 h-3.5" /> Apply
        </button>
        <button
          onClick={() => onRemove(preset.id)}
          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface PresetManagerModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onApplyPreset: (keringPct: number, basahPct: number) => void;
  deviceId: string;
}

export default function PresetManagerModal({ isOpen, setIsOpen, onApplyPreset, deviceId }: PresetManagerModalProps) {
  const { plantPresets, setPlantPresets } = useDeviceStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // New Preset State
  const [newLabel, setNewLabel] = useState('');
  const [newIcon, setNewIcon] = useState('🌱');
  const [newKering, setNewKering] = useState(30);
  const [newBasah, setNewBasah] = useState(80);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchPresets = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/presets?deviceId=${deviceId}`);
      if (res.ok) {
        const data = await res.json();
        // Fallback to default if empty (so they don't get completely blank)
        if (data.presets && data.presets.length > 0) {
          setPlantPresets(data.presets);
        } else {
          // If empty in DB, we can optionally POST the defaults, but for now just show empty or local ones.
          if (plantPresets.length > 0) {
            // First time migrating? Let's just keep the store's ones in UI or push them.
            // A better way is just to let the user create them.
            setPlantPresets([]); 
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && deviceId) {
      fetchPresets();
    }
  }, [isOpen, deviceId]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = plantPresets.findIndex((p) => p.id === active.id);
      const newIndex = plantPresets.findIndex((p) => p.id === over.id);
      const newArr = arrayMove(plantPresets, oldIndex, newIndex);
      
      // Update UI optimistically
      setPlantPresets(newArr);

      // Reorder payload
      const payload = newArr.map((p, idx) => ({ id: p.id, urutan: idx }));
      
      try {
        await fetch('/api/presets', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ presets: payload })
        });
      } catch (e) {
        console.error(e);
        // Revert on error if needed
      }
    }
  };

  const handleApply = (preset: PlantPreset) => {
    onApplyPreset(preset.keringPct, preset.basahPct);
    setIsOpen(false);
  };

  const handleRemove = async (id: string) => {
    try {
      // Optimistic update
      setPlantPresets(plantPresets.filter(p => p.id !== id));
      
      await fetch(`/api/presets?id=${id}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.error(e);
      fetchPresets(); // Revert
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newIcon.trim()) return;

    try {
      setIsLoading(true);
      const res = await fetch('/api/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          label: newLabel,
          icon: newIcon,
          keringPct: newKering,
          basahPct: newBasah
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setPlantPresets([...plantPresets, data.preset]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setIsAdding(false);
      setNewLabel('');
      setNewIcon('🌱');
      setNewKering(30);
      setNewBasah(80);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100" />
        <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-surface p-0 shadow-2xl focus:outline-none z-101 border border-border flex flex-col overflow-hidden">
          
          <div className="p-5 border-b border-border bg-background flex items-center justify-between shrink-0">
            <Dialog.Title className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" /> Kelola Preset {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            {!isAdding && (
              <div className="mb-4">
                <button
                  onClick={() => setIsAdding(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-primary/50 text-primary hover:bg-primary/5 rounded-xl font-bold transition-colors"
                >
                  <Plus className="w-5 h-5" /> Buat Preset Baru
                </button>
              </div>
            )}

            {isAdding && (
              <form onSubmit={handleAddSubmit} className="mb-6 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-border">
                <h4 className="font-bold text-sm mb-3">Tambah Preset</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Icon</label>
                      <input 
                        type="text" 
                        value={newIcon} 
                        onChange={(e) => setNewIcon(e.target.value)} 
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-center text-lg focus:ring-2 ring-primary outline-none" 
                        required 
                        maxLength={2}
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Tanaman</label>
                      <input 
                        type="text" 
                        value={newLabel} 
                        onChange={(e) => setNewLabel(e.target.value)} 
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 ring-primary outline-none" 
                        placeholder="Contoh: Anggrek" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Batas Kering (%)</label>
                      <input 
                        type="number" 
                        value={newKering} 
                        onChange={(e) => setNewKering(Number(e.target.value))} 
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 ring-primary outline-none font-mono" 
                        min="0" max="100" required 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Batas Basah (%)</label>
                      <input 
                        type="number" 
                        value={newBasah} 
                        onChange={(e) => setNewBasah(Number(e.target.value))} 
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 ring-primary outline-none font-mono" 
                        min="0" max="100" required 
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 rounded-lg transition-colors">Batal</button>
                    <button type="submit" className="flex-1 py-2 text-xs font-bold text-white bg-primary hover:bg-indigo-600 rounded-lg transition-colors">Simpan</button>
                  </div>
                </div>
              </form>
            )}

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={plantPresets.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {plantPresets.map((preset) => (
                  <SortablePresetItem
                    key={preset.id}
                    preset={preset}
                    onApply={handleApply}
                    onRemove={handleRemove}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {plantPresets.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                Belum ada preset. Silakan buat baru.
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
