import { useState, useMemo, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { LogOut, Plus, StickyNote } from 'lucide-react';
import { NoteCard } from '../components/NoteCard';
import { NoteDialog } from '../components/NoteDialog';
import type { Note, User } from '../app';
import { api, setToken } from '../api';

interface DashboardProps {
  onLogout: () => void;
  // onUpdateNote: (id: string, updates: Partial<Note>) => void;
  // onDeleteNote: (id: string) => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const token = localStorage.getItem('token');
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    try {
      setToken(token);
      const decoded = jwtDecode<User>(token);
      setUser(decoded);
    } catch (err) {
      console.error('Invalid token');
    }
  }, []);

  const fetchNotes = async (tagsFilter: string[]) => {
    const res = await api.get('api/notes', { params: { tags: tagsFilter.join(',') } });
    setNotes(res.data);
  };

  useEffect(() => {
    fetchNotes(filterTags);
  }, [filterTags]);

  const handleCreate = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    await api.post('/api/notes', { ...note });
    fetchNotes(filterTags);
  };

  const handleUpdateNote = async (id: number, updates: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'userId'>>) => {
    await api.patch(`/api/notes/${id}`, { ...updates });
    fetchNotes(filterTags);
  }

  const handleOnDelete = async (id: number) => {
    await api.delete(`/api/notes/${id}`);
    fetchNotes(filterTags);
  }

  // Get all unique tags from notes
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    notes?.forEach(note => {
      note.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [notes]);

  // Filter notes based on search and selected tags
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {

      // Filter by selected tags
      const matchesTags = filterTags.length === 0 ||
        filterTags.every(tag => note.tags.includes(tag));

      return matchesTags;
    });
  }, [notes, filterTags]);

  const toggleTag = (tag: string) => {
    setFilterTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <StickyNote className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1>Notes App</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.username}</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Actions */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 -ml-2">
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Filter by tags:</span>
              {allTags.map(tag => (
                <Badge
                  key={tag}
                  variant={filterTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
              {filterTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterTags([])}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No notes found</CardTitle>
              <CardDescription>
                { filterTags.length > 0
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first note'}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onUpdate={handleUpdateNote}
                onDelete={handleOnDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Note Dialog */}
      <NoteDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleCreate}
      />
    </div>
  );
}
