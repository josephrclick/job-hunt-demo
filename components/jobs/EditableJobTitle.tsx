import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditableJobTitleProps {
  jobId: string;
  initialTitle: string;
  onTitleUpdate?: (newTitle: string) => void;
  className?: string;
}

export function EditableJobTitle({ 
  jobId, 
  initialTitle, 
  onTitleUpdate,
  className = ""
}: EditableJobTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [tempTitle, setTempTitle] = useState(initialTitle);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(initialTitle);
    setTempTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setTempTitle(title);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempTitle(title);
    setError(null);
  };

  const handleSave = async () => {
    if (tempTitle.trim() === title.trim()) {
      setIsEditing(false);
      return;
    }

    if (!tempTitle.trim()) {
      setError('Job title cannot be empty');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: tempTitle.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update job title: ${response.status}`);
      }

      await response.json();
      setTitle(tempTitle.trim());
      setIsEditing(false);
      
      // Notify parent component of the update
      if (onTitleUpdate) {
        onTitleUpdate(tempTitle.trim());
      }
    } catch (error) {
      console.error('Error updating job title:', error);
      setError(error instanceof Error ? error.message : 'Failed to update job title');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full text-xl font-bold bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          {error && (
            <p className="text-xs text-destructive mt-1">{error}</p>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 group ${className}`}>
      <h1 className="text-xl font-bold text-foreground flex-1">{title}</h1>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleEdit}
        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
      >
        <Edit2 className="h-4 w-4" />
      </Button>
    </div>
  );
}