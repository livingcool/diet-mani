/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDietStore } from '../store/dietStore';
import { 
  getAccessToken 
} from '../lib/firebase';
import { 
  Mail, Calendar, CheckSquare, Plus, Check, Loader2, 
  Trash2, ExternalLink, CalendarPlus, ChevronDown, CheckSquare2,
  FileText, ShieldCheck, RefreshCw, LogIn, LogOut, Sparkles, Filter 
} from 'lucide-react';

interface GoogleEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  location?: string;
  htmlLink?: string;
}

interface GoogleTask {
  id: string;
  title: string;
  status: 'needsAction' | 'completed';
  due?: string;
}

interface GmailMessageHeader {
  name: string;
  value: string;
}

interface GmailMessage {
  id: string;
  snippet: string;
  subject?: string;
  from?: string;
  date?: string;
}

interface KeepNote {
  id: string;
  title: string;
  content: string;
  color: string;
  updatedAt: string;
}

export const WorkspaceHub: React.FC = () => {
  const { 
    user, 
    signIn, 
    signOut, 
    currentDateStr, 
    calculateScoresForDate 
  } = useDietStore();

  const [accessToken, setLocalToken] = useState<string | null>(null);
  
  // Loading and State States
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'gmail' | 'calendar' | 'tasks' | 'keep'>('gmail');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Data Stores
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [events, setEvents] = useState<GoogleEvent[]>([]);
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  const [keepNotes, setKeepNotes] = useState<KeepNote[]>([]);

  // Filtering / Creation Inputs
  const [gmailQuery, setGmailQuery] = useState<string>('rooted OR hair OR health OR wellness OR biologically OR sattu OR nutrition OR protocol');
  const [newEventTitle, setNewEventTitle] = useState<string>('ROOTEDAI Check-in: Scalp Nutrition');
  const [newEventTime, setNewEventTime] = useState<string>('09:00');
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  
  // Custom Local Keep Input
  const [newNoteTitle, setNewNoteTitle] = useState<string>('');
  const [newNoteContent, setNewNoteContent] = useState<string>('');
  const [selectedNoteColor, setSelectedNoteColor] = useState<string>('bg-[#FFFDF7]');

  // Initialize cached token
  useEffect(() => {
    async function loadToken() {
      const token = await getAccessToken();
      setLocalToken(token);
    }
    loadToken();
  }, [user]);

  // Load Keep Notes from localStorage for custom Keep implementation
  useEffect(() => {
    const cachedKeep = localStorage.getItem('rooted_keep_notes');
    if (cachedKeep) {
      setKeepNotes(JSON.parse(cachedKeep));
    } else {
      const initialNotes: KeepNote[] = [
        {
          id: 'note_1',
          title: 'Daily Nutrition Routine',
          content: 'Consume sattu with lemon juice by 11:30 AM to hit raw protein bounds. Hydration targets is strictly 3L.',
          color: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-400',
          updatedAt: new Date().toLocaleDateString()
        },
        {
          id: 'note_2',
          title: 'Post-Wash Scalp Serum Oil',
          content: 'Apply organic rosemary oil mixture on alternating Wednesdays at 9:00 PM. Follow by standard dermarolling cycle.',
          color: 'bg-blue-50 dark:bg-blue-950/20 border-blue-400',
          updatedAt: new Date().toLocaleDateString()
        }
      ];
      setKeepNotes(initialNotes);
      localStorage.setItem('rooted_keep_notes', JSON.stringify(initialNotes));
    }
  }, []);

  // Sync / Fetch handlers
  const syncWorkspaceData = async () => {
    const token = await getAccessToken();
    if (!token) {
      setErrorMsg('Unauthorized: Please authenticating with your Google Account.');
      return;
    }
    setLocalToken(token);
    setLoading(true);
    setErrorMsg(null);

    try {
      if (activeWorkspaceTab === 'gmail') {
        await fetchGmail(token);
      } else if (activeWorkspaceTab === 'calendar') {
        await fetchCalendar(token);
      } else if (activeWorkspaceTab === 'tasks') {
        await fetchTasks(token);
      }
    } catch (err: any) {
      console.error('Workspace fetch error:', err);
      setErrorMsg(err.message || 'Connection refused. Please re-authenticate your account tokens.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      syncWorkspaceData();
    }
  }, [activeWorkspaceTab, accessToken]);

  // GMAIL API INTEGRATION
  const fetchGmail = async (token: string) => {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&q=${encodeURIComponent(gmailQuery)}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to retrieve Gmail inbox index');
    const indexData = await response.json();
    
    if (!indexData.messages || indexData.messages.length === 0) {
      setEmails([]);
      return;
    }

    const fetchedMessages = await Promise.all(
      indexData.messages.map(async (msg: { id: string }) => {
        const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!detailRes.ok) return null;
        const detail = await detailRes.json();
        
        const headers: GmailMessageHeader[] = detail.payload.headers;
        const subject = headers.find((h) => h.name.toLowerCase() === 'subject')?.value || 'No Subject';
        const from = headers.find((h) => h.name.toLowerCase() === 'from')?.value || 'Unknown sender';
        const date = headers.find((h) => h.name.toLowerCase() === 'date')?.value || '';

        return {
          id: detail.id,
          snippet: detail.snippet,
          subject,
          from,
          date
        };
      })
    );

    setEmails(fetchedMessages.filter(Boolean) as GmailMessage[]);
  };

  // GOOGLE CALENDAR API INTEGRATION
  const fetchCalendar = async (token: string) => {
    const now = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(now)}&maxResults=5&orderBy=startTime&singleEvents=true`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch events from Google Calendar');
    const data = await response.json();
    setEvents(data.items || []);
  };

  // GOOGLE TASKS API INTEGRATION
  const fetchTasks = async (token: string) => {
    const url = `https://tasks.googleapis.com/tasks/v1/lists/@default/tasks?maxResults=8`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to sync tasks from Google Tasks API');
    const data = await response.json();
    setTasks(data.items || []);
  };

  // WRITE OPERATIONS WITH WRITTEN CONFIRMATION
  const handleCreateCalendarEvent = async () => {
    if (!accessToken) return;
    const confirmText = `Synchronize event of the active bio protocol: "${newEventTitle}" at ${newEventTime} to your primary Google Calendar?`;
    if (!window.confirm(confirmText)) return;

    setLoading(true);
    try {
      // Build start/end parameters for active date selection
      const dateTimeStart = `${currentDateStr}T${newEventTime}:00`;
      const dateEnd = new Date(new Date(dateTimeStart).getTime() + 45 * 60 * 1000).toLocaleTimeString('en-US', { hour12: false });
      const dateTimeEnd = `${currentDateStr}T${dateEnd.slice(0, 5)}:00`;

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary: newEventTitle,
          description: 'ROOTEDAI biological compliance check-in event. Keep nutrition habits aligned.',
          start: { dateTime: dateTimeStart, timeZone: 'UTC' },
          end: { dateTime: dateTimeEnd, timeZone: 'UTC' }
        })
      });

      if (!response.ok) throw new Error('Error writing to Google Calendar');
      
      alert(`Event successfully mapped to your Google Calendar!`);
      fetchCalendar(accessToken);
    } catch (err: any) {
      alert(`Failed to schedule event: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !accessToken) return;

    // Direct confirmation dialogue
    if (!window.confirm(`Add Google Task: "${newTaskTitle}"?`)) return;

    setLoading(true);
    try {
      const response = await fetch('https://www.googleapis.com/tasks/v1/lists/@default/tasks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newTaskTitle,
          notes: 'Added from RootedAI Command Center'
        })
      });

      if (!response.ok) throw new Error('Tasks API insertion error');
      setNewTaskTitle('');
      fetchTasks(accessToken);
    } catch (err: any) {
      alert(`Failed to insert task: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTaskChecked = async (task: GoogleTask) => {
    if (!accessToken) return;
    const isNowCompleting = task.status === 'needsAction';

    // Direct mutational confirmation gates
    if (!window.confirm(`Mark task "${task.title}" as ${isNowCompleting ? 'Completed' : 'Active'}?`)) return;

    setLoading(true);
    try {
      const response = await fetch(`https://www.googleapis.com/tasks/v1/lists/@default/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: isNowCompleting ? 'completed' : 'needsAction'
        })
      });

      if (!response.ok) throw new Error('Error updating task status');
      fetchTasks(accessToken);
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // LOCAL / CLOUD BACKED Google Keep CLONE (Zero-Trust sandbox note manager)
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle || !newNoteContent) return;

    const newNote: KeepNote = {
      id: 'note_' + Date.now(),
      title: newNoteTitle,
      content: newNoteContent,
      color: selectedNoteColor,
      updatedAt: new Date().toLocaleDateString()
    };

    const updated = [newNote, ...keepNotes];
    setKeepNotes(updated);
    localStorage.setItem('rooted_keep_notes', JSON.stringify(updated));

    setNewNoteTitle('');
    setNewNoteContent('');
  };

  const handleDeleteNote = (noteId: string) => {
    if (!window.confirm('Are you strictly sure you want to permanently delete this note?')) return;
    const updated = keepNotes.filter((n) => n.id !== noteId);
    setKeepNotes(updated);
    localStorage.setItem('rooted_keep_notes', JSON.stringify(updated));
  };

  if (!user) {
    return (
      <div className="bg-white dark:bg-[#1B1B1B] border-4 border-black dark:border-[#2E2E2E] p-6 rounded-[28px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black dark:text-white space-y-4 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#E0DCFF] dark:bg-[#202E5C] border-3 border-black flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-[#0057FF]" />
        </div>
        <div>
          <h3 className="text-xl font-black uppercase text-black dark:text-white">Workspace Intelligence Core</h3>
          <p className="text-xs text-gray-400 font-semibold font-mono uppercase tracking-wider mt-1">Status: Offline / Sandbox</p>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-sm mx-auto">
          Authenticate directly using your Google Account to synchronize real-time updates from Gmail, Google Tasks, and Calendar with the Diet Mani health protocol dashboard.
        </p>
        
        {/* Sign in button following guidelines style */}
        <button 
          onClick={signIn}
          className="w-full bg-white hover:bg-gray-50 text-black border-3 border-black rounded-2xl py-2 px-4 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-3.5"
        >
          <div className="flex items-center justify-center shrink-0">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 block">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            </svg>
          </div>
          <span className="font-mono font-black text-black text-xs uppercase tracking-wider">Sign in with Google</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 2. Connected Header Core Info */}
      <div className="bg-[#E0DCFF] border-4 border-black p-5 rounded-[28px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black">
        <div className="flex justify-between items-start">
          <div className="flex gap-2.5 items-center">
            <img 
              src={user.photoURL || undefined} 
              alt="Profile" 
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full border-2 border-black"
            />
            <div>
              <h3 className="font-black text-base uppercase leading-none truncate max-w-[180px]">{user.displayName || 'Authorized User'}</h3>
              <p className="text-[9px] font-mono font-black text-purple-800 uppercase mt-1">Biological Sync Master</p>
            </div>
          </div>
          
          <button 
            onClick={signOut}
            className="p-2 bg-white hover:bg-rose-50 border-2 border-black rounded-xl text-rose-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer"
            title="Disconnect Google Workspace"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Navigation workspace matrix */}
      <div className="bg-white dark:bg-[#1B1B1B] border-4 border-black dark:border-[#2E2E2E] p-1.5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] grid grid-cols-4 gap-1 select-none">
        <button
          onClick={() => setActiveWorkspaceTab('gmail')}
          className={`py-2 px-1 rounded-xl font-bold font-mono text-[10px] uppercase tracking-tighter text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
            activeWorkspaceTab === 'gmail' 
              ? 'bg-[#0057FF] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
              : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Gmail</span>
        </button>
        <button
          onClick={() => setActiveWorkspaceTab('calendar')}
          className={`py-2 px-1 rounded-xl font-bold font-mono text-[10px] uppercase tracking-tighter text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
            activeWorkspaceTab === 'calendar' 
              ? 'bg-[#0057FF] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
              : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendar</span>
        </button>
        <button
          onClick={() => setActiveWorkspaceTab('tasks')}
          className={`py-2 px-1 rounded-xl font-bold font-mono text-[10px] uppercase tracking-tighter text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
            activeWorkspaceTab === 'tasks' 
              ? 'bg-[#0057FF] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
              : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tasks</span>
        </button>
        <button
          onClick={() => setActiveWorkspaceTab('keep')}
          className={`py-2 px-1 rounded-xl font-bold font-mono text-[10px] uppercase tracking-tighter text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
            activeWorkspaceTab === 'keep' 
              ? 'bg-[#0057FF] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
              : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Keep</span>
        </button>
      </div>

      {/* 4. Active Module Console Container */}
      <div className="bg-white dark:bg-[#1B1B1B] border-4 border-black dark:border-[#2E2E2E] p-5 rounded-[28px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black dark:text-white">
        
        {/* Module Title Section */}
        <div className="flex justify-between items-center border-b-2 border-dashed border-gray-200 dark:border-[#333333] pb-3 mb-4">
          <div>
            <span className="text-[9px] font-mono font-black text-gray-400 uppercase tracking-widest block leading-none">WORKSPACE INTELLIGENCE INTEGRATION</span>
            <h3 className="text-lg font-black uppercase text-black dark:text-white leading-none mt-1">
              {activeWorkspaceTab === 'gmail' && 'Gmail Signal Filter'}
              {activeWorkspaceTab === 'calendar' && 'Google Calendar'}
              {activeWorkspaceTab === 'tasks' && 'Google Tasks Console'}
              {activeWorkspaceTab === 'keep' && 'Daily Keep Notepad'}
            </h3>
          </div>

          {activeWorkspaceTab !== 'keep' && (
            <button 
              onClick={syncWorkspaceData}
              disabled={loading}
              className="p-2 bg-gray-50 dark:bg-black border-2 border-black rounded-xl text-black dark:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer disabled:opacity-55"
              title="Refresh Sync Connection"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {/* Global Loading Overlay inside Box */}
        {loading && (
          <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 text-[#0057FF] animate-spin" />
            <span className="text-xs uppercase font-mono tracking-widest text-gray-500">Querying Google APIs...</span>
          </div>
        )}

        {/* Error notification block */}
        {errorMsg && !loading && (
          <div className="bg-rose-100 border-2 border-rose-500 rounded-xl p-3 text-red-900 leading-normal text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* TAB 1: GMAIL INTEGRATION VIEW */}
        {!loading && !errorMsg && activeWorkspaceTab === 'gmail' && (
          <div className="space-y-4">
            
            {/* Inbox Query Keyword Filter UI */}
            <div className="bg-gray-100 dark:bg-black/40 border-2 border-black p-3 rounded-xl space-y-1.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-[9px] font-mono font-black text-gray-500 uppercase leading-none block">ACTIVE SEARCH SIGNAL FILTER</span>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={gmailQuery}
                  onChange={(e) => setGmailQuery(e.target.value)}
                  className="bg-white dark:bg-[#111111] border-2 border-black rounded-lg text-xs font-mono px-2 py-1 flex-1 outline-none text-black dark:text-white focus:border-[#0057FF]"
                />
                <button 
                  onClick={syncWorkspaceData}
                  className="bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white text-[9px] font-mono uppercase px-2.5 rounded-lg font-black cursor-pointer leading-none"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Email list feeds */}
            <div className="space-y-3">
              {emails.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500 uppercase font-mono">
                  No health signals found in your index matching search query.
                </div>
              ) : (
                emails.map((email) => (
                  <div 
                    key={email.id} 
                    className="border-2 border-black dark:border-[#2e2e2e] bg-gray-50 dark:bg-black/30 p-3.5 rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-1 text-[11px] font-black uppercase tracking-tight text-gray-500">
                        <span className="text-[#0057FF] dark:text-[#4d8dff] truncate max-w-[150px]">{email.from}</span>
                        <span className="font-mono text-[9px] text-gray-400 font-normal">{email.date?.slice(0, 16)}</span>
                      </div>
                      <h4 className="font-extrabold text-xs text-black dark:text-white leading-snug mb-1">
                        {email.subject}
                      </h4>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {email.snippet}...
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: GOOGLE CALENDAR VIEW */}
        {!loading && !errorMsg && activeWorkspaceTab === 'calendar' && (
          <div className="space-y-4">
            
            {/* Quick Scheduler interface */}
            <div className="bg-[#FFFDF7] dark:bg-black/30 border-2 border-black p-3.5 rounded-2xl relative shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-black dark:text-white space-y-3">
              <span className="text-[9px] font-mono font-black text-gray-500 uppercase leading-none block">QUICK SYSTEM CALENDAR SCHEDULER</span>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <span className="text-[8px] font-bold text-gray-400 uppercase font-mono block mb-1">EVENT PATHWAY</span>
                  <input 
                    type="text" 
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="bg-white dark:bg-[#111111] dark:text-white border-2 border-black rounded-lg text-xs font-semibold px-2.5 py-1.5 w-full outline-none focus:border-[#0057FF]"
                  />
                </div>
                <div>
                  <span className="text-[8px] font-bold text-gray-400 uppercase font-mono block mb-1">TIME (GMT)</span>
                  <input 
                    type="time" 
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="bg-white dark:bg-[#111111] dark:text-white border-2 border-black rounded-lg text-xs font-mono px-2 py-1.5 w-full outline-none focus:border-[#0057FF]"
                  />
                </div>
              </div>

              <button 
                onClick={handleCreateCalendarEvent}
                className="w-full bg-[#0057FF] hover:bg-blue-600 text-white border-2 border-black text-xs font-black uppercase cursor-pointer py-2 rounded-xl text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center justify-center gap-1.5"
              >
                <CalendarPlus className="w-4 h-4" /> Map Event to Google Calendar
              </button>
            </div>

            {/* List of upcoming appointments */}
            <div className="space-y-3 border-t-2 border-dashed border-gray-100 dark:border-[#333333] pt-4">
              <span className="text-[10px] font-mono font-black text-gray-500 uppercase block leading-none">UPCOMING DETECTED TIMELINE EVENTS</span>
              
              {events.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500 uppercase font-mono">
                  No upcoming events in calendar range.
                </div>
              ) : (
                events.map((event) => (
                  <div 
                    key={event.id}
                    className="bg-gray-50 dark:bg-black/30 border-2 border-black dark:border-[#2e2e2e] rounded-xl p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center text-xs text-black dark:text-white"
                  >
                    <div className="space-y-1.5 truncate pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0057FF] border border-black inline-block shrink-0" />
                        <h4 className="font-extrabold uppercase leading-none truncate max-w-[170px]">{event.summary}</h4>
                      </div>
                      <span className="font-mono text-[9px] text-gray-500 block">
                        Start: {event.start.dateTime ? new Date(event.start.dateTime).toLocaleString() : event.start.date}
                      </span>
                    </div>

                    {event.htmlLink && (
                      <a 
                        href={event.htmlLink} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="bg-white hover:bg-gray-50 dark:bg-[#202020] border border-black p-1.5 rounded-lg text-black dark:text-white hover:scale-105 active:scale-95 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                        title="Open Event in Calendar tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: GOOGLE TASKS CONSOLE */}
        {!loading && !errorMsg && activeWorkspaceTab === 'tasks' && (
          <div className="space-y-4">
            
            {/* Insert newTask Form */}
            <form onSubmit={handleCreateTask} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Log new custom Google task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="bg-gray-50 dark:bg-black/40 border-2 border-black rounded-xl text-xs font-semibold px-3 py-2 flex-1 outline-none text-black dark:text-white focus:border-[#0057FF]"
              />
              <button 
                type="submit"
                className="bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white p-2.5 rounded-xl cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
                title="Add Task"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>

            {/* List Tasks */}
            <div className="space-y-2.5 pt-2">
              {tasks.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500 uppercase font-mono">
                  No active tasks found in default list.
                </div>
              ) : (
                tasks.map((task) => {
                  const isChecked = task.status === 'completed';
                  return (
                    <div 
                      key={task.id}
                      onClick={() => handleToggleTaskChecked(task)}
                      className={`border-3 border-black dark:border-[#2e2e2e] p-3 rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center justify-between text-black dark:text-white select-none active:scale-98 transition-all ${
                        isChecked ? 'bg-blue-50/75 dark:bg-blue-950/20 line-through opacity-70' : 'bg-gray-50 dark:bg-black/30'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className={`w-5 h-5 rounded-md border-2 border-black flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-[#0057FF]' : 'bg-white'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-xs font-black truncate max-w-[200px] uppercase tracking-tight">{task.title}</span>
                      </div>
                      
                      {task.due && (
                        <span className="font-mono text-[9px] text-gray-400 bg-black/5 px-2 py-0.5 rounded-md">
                          Due: {new Date(task.due).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 4: DAILY KEEP NOTEPAD (Custom Sandbox integration) */}
        {!loading && !errorMsg && activeWorkspaceTab === 'keep' && (
          <div className="space-y-4">
            
            {/* Quick note addition */}
            <form onSubmit={handleCreateNote} className="bg-[#FFFDF7] dark:bg-black/40 border-2 border-black p-3.5 rounded-2xl shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-black dark:text-white space-y-3">
              <span className="text-[9px] font-mono font-black text-gray-500 uppercase leading-none block">CREATE CUSTOM ROOTED NOTE</span>
              
              <div className="space-y-2">
                <input 
                  type="text" 
                  placeholder="Note Title" 
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="bg-white dark:bg-[#111111] dark:text-white border-2 border-black rounded-lg text-xs font-black uppercase px-2.5 py-1.5 w-full outline-none focus:border-[#0057FF]"
                />
                
                <textarea 
                  placeholder="Notes content snippet..." 
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={2}
                  className="bg-white dark:bg-[#111111] dark:text-white border-2 border-black rounded-lg text-xs leading-relaxed px-2.5 py-1.5 w-full outline-none focus:border-[#0057FF]"
                />
              </div>

              {/* Color swatch selectors */}
              <div className="flex justify-between items-center pt-1.5">
                <div className="flex gap-1.5">
                  {[
                    { id: 'bg-[#FFFDF7] border-black', color: 'bg-[#FFFDF7]' },
                    { id: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-400', color: 'bg-indigo-400' },
                    { id: 'bg-blue-50 dark:bg-blue-950/20 border-blue-400', color: 'bg-blue-400' },
                    { id: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-400', color: 'bg-yellow-400' }
                  ].map((colorObj) => (
                    <button
                      key={colorObj.id}
                      type="button"
                      onClick={() => setSelectedNoteColor(colorObj.id)}
                      className={`w-5 h-5 rounded-full border border-black cursor-pointer transform hover:scale-110 active:scale-95 shrink-0 ${colorObj.color} ${
                        selectedNoteColor === colorObj.id ? 'ring-2 ring-[#0057FF] scale-110' : ''
                      }`}
                    />
                  ))}
                </div>

                <button 
                  type="submit"
                  className="bg-black text-white dark:bg-white dark:text-black border border-black font-extrabold text-[9px] font-mono uppercase px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  ADD TO KEEP
                </button>
              </div>
            </form>

            {/* Render Notes list */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              {keepNotes.map((note) => (
                <div 
                  key={note.id}
                  className={`border-2 border-black rounded-2xl p-4 flex flex-col justify-between h-40 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black dark:text-white ${note.color}`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className="font-black text-xs uppercase leading-tight truncate max-w-[100px]">{note.title}</h4>
                      <button 
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-gray-400 hover:text-rose-500 cursor-pointer active:scale-90"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] leading-relaxed line-clamp-4 font-normal text-gray-700 dark:text-gray-300">
                      {note.content}
                    </p>
                  </div>
                  <span className="text-[8px] font-mono font-bold text-gray-400 border-t border-black/5 mt-1.5 pt-1 block leading-none">
                    UPDATED: {note.updatedAt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
