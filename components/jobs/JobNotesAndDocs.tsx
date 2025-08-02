'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  StickyNote, 
  Plus, 
  Calendar, 
  Edit3, 
  Trash2, 
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface JobNote {
  id: string;
  content: string;
  note_type?: string;
  note_status: string;
  is_blocker: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface JobDocument {
  id: string;
  title: string;
  doc_type: string;
  content?: string;
  doc_status: string;
  file_size?: number;
  mime_type?: string;
  tags: string[];
  memo?: string;
  created_at: string;
  updated_at: string;
}

interface JobNotesAndDocsProps {
  jobId: string;
  jobTitle: string;
  company: string;
}

export default function JobNotesAndDocs({ jobId, jobTitle, company }: JobNotesAndDocsProps) {
  const [notes, setNotes] = useState<JobNote[]>([]);
  const [documents, setDocuments] = useState<JobDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadMemo, setUploadMemo] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const supabase = createClient();

  // Fetch notes and documents
  const fetchNotesAndDocs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Authentication required');
        return;
      }

      // Fetch notes
      const { data: notesData, error: notesError } = await supabase
        .from('job_notes')
        .select('*')
        .eq('job_id', jobId)
        .eq('profile_uid', user.id)
        .order('created_at', { ascending: false });

      if (notesError) {
        console.error('Error fetching notes:', notesError);
      } else {
        setNotes((notesData || []).map(note => ({
          id: note.id,
          content: note.content,
          note_type: note.note_type || undefined,
          note_status: note.note_status || 'active',
          is_blocker: note.is_blocker || false,
          tags: note.tags || [],
          created_at: note.created_at || new Date().toISOString(),
          updated_at: note.updated_at || new Date().toISOString()
        })));
      }

      // Fetch documents
      const { data: docsData, error: docsError } = await supabase
        .from('job_documents')
        .select('*')
        .eq('job_id', jobId)
        .eq('profile_uid', user.id)
        .order('created_at', { ascending: false });

      if (docsError) {
        console.error('Error fetching documents:', docsError);
      } else {
        setDocuments((docsData || []).map(doc => ({
          id: doc.id,
          title: doc.title || 'Untitled Document',
          doc_type: doc.doc_type,
          content: doc.content || undefined,
          doc_status: doc.doc_status || 'active',
          file_size: doc.file_size || undefined,
          mime_type: doc.mime_type || undefined,
          tags: doc.tags || [],
          memo: doc.memo || undefined,
          created_at: doc.created_at || new Date().toISOString(),
          updated_at: doc.updated_at || new Date().toISOString()
        })));
      }

    } catch (err) {
      console.error('Error fetching notes and documents:', err);
      setError('Failed to load notes and documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotesAndDocs();
  }, [jobId]);

  // Add new note
  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setIsAddingNote(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('job_notes')
        .insert({
          job_id: jobId,
          profile_uid: user.id,
          content: newNote.trim(),
          note_type: 'general',
          note_status: 'active'
        });

      if (error) {
        console.error('Error adding note:', error);
        setError('Failed to add note');
      } else {
        setNewNote('');
        fetchNotesAndDocs(); // Refresh the list
      }
    } catch (err) {
      console.error('Error adding note:', err);
      setError('Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  // Edit note
  const handleEditNote = async (noteId: string) => {
    if (!editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('job_notes')
        .update({ 
          content: editContent.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId);

      if (error) {
        console.error('Error updating note:', error);
        setError('Failed to update note');
      } else {
        setEditingNote(null);
        setEditContent('');
        fetchNotesAndDocs(); // Refresh the list
      }
    } catch (err) {
      console.error('Error updating note:', err);
      setError('Failed to update note');
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const { error } = await supabase
        .from('job_notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        console.error('Error deleting note:', error);
        setError('Failed to delete note');
      } else {
        fetchNotesAndDocs(); // Refresh the list
      }
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note');
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill title with filename (without extension)
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setUploadTitle(nameWithoutExt);
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile || !uploadTitle.trim()) return;

    try {
      setIsUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create file name with user ID prefix for organization
      const fileName = `${user.id}/${Date.now()}_${selectedFile.name}`;
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('docs')
        .upload(fileName, selectedFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        setError('Failed to upload file');
        return;
      }

      // Get file type category
      const getDocType = (mimeType: string) => {
        if (mimeType.includes('pdf')) return 'resume';
        if (mimeType.includes('word') || mimeType.includes('document')) return 'cover_letter';
        if (mimeType.includes('image')) return 'screenshot';
        return 'document';
      };

      // Insert document record
      const { error: dbError } = await supabase
        .from('job_documents')
        .insert({
          job_id: jobId,
          profile_uid: user.id,
          title: uploadTitle.trim(),
          doc_type: getDocType(selectedFile.type),
          doc_status: 'active',
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          memo: uploadMemo.trim() || null,
          metadata: {
            original_filename: selectedFile.name,
            storage_path: uploadData.path
          }
        });

      if (dbError) {
        console.error('Database error:', dbError);
        setError('Failed to save document record');
        // Clean up uploaded file
        await supabase.storage.from('docs').remove([fileName]);
      } else {
        // Reset form
        setSelectedFile(null);
        setUploadTitle('');
        setUploadMemo('');
        setShowUploadForm(false);
        fetchNotesAndDocs(); // Refresh the list
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  // Reset upload form
  const resetUploadForm = () => {
    setSelectedFile(null);
    setUploadTitle('');
    setUploadMemo('');
    setShowUploadForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading notes and documents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Notes & Documents</h3>
          <p className="text-sm text-muted-foreground">
            {jobTitle} at {company}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{notes.length} notes</Badge>
          <Badge variant="outline">{documents.length} documents</Badge>
        </div>
      </div>

      {/* Add New Note */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Note
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Add a note about this job..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleAddNote}
              disabled={!newNote.trim() || isAddingNote}
              size="sm"
            >
              {isAddingNote ? 'Adding...' : 'Add Note'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Document */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Document
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showUploadForm ? (
            <Button 
              onClick={() => setShowUploadForm(true)}
              variant="outline"
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File to Upload
            </Button>
          ) : (
            <div className="space-y-4">
              {/* File Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Select File</label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  className="block w-full text-sm text-muted-foreground
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-primary file:text-primary-foreground
                    hover:file:bg-primary/90"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {/* Document Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Document Title</label>
                <Input
                  placeholder="e.g., Resume for Software Engineer"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                />
              </div>

              {/* Optional Memo */}
              <div>
                <label className="block text-sm font-medium mb-2">Memo (Optional)</label>
                <Textarea
                  placeholder="Add any notes about this document..."
                  value={uploadMemo}
                  onChange={(e) => setUploadMemo(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetUploadForm}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleFileUpload}
                  disabled={!selectedFile || !uploadTitle.trim() || isUploading}
                  size="sm"
                >
                  {isUploading ? 'Uploading...' : 'Upload Document'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <StickyNote className="h-5 w-5" />
          <h4 className="font-medium">Notes ({notes.length})</h4>
        </div>

        {notes.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notes added yet</p>
                <p className="text-sm">Add your first note using the form above</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardContent className="p-4">
                  {editingNote === note.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingNote(null);
                            setEditContent('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleEditNote(note.id)}
                          disabled={!editContent.trim()}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <p className="text-sm leading-relaxed flex-1">{note.content}</p>
                        <div className="flex items-center gap-1 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingNote(note.id);
                              setEditContent(note.content);
                            }}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(note.note_status)}
                          <span>{note.note_status}</span>
                          {note.is_blocker && (
                            <Badge variant="destructive" className="text-xs">Blocker</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(note.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Documents Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h4 className="font-medium">Documents ({documents.length})</h4>
        </div>

        {documents.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No documents uploaded yet</p>
                <p className="text-sm">Documents like resumes and cover letters will appear here</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">{doc.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{doc.doc_type}</span>
                          {doc.file_size && (
                            <>
                              <span>•</span>
                              <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{formatDate(doc.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(doc.doc_status)}
                      <Badge variant="outline" className="text-xs">
                        {doc.doc_status}
                      </Badge>
                    </div>
                  </div>
                  
                  {doc.memo && (
                    <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                      {doc.memo}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}