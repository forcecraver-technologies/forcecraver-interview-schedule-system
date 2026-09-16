'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import {
  ShieldCheck,
  Plus,
  Calendar,
  Clock,
  Building2,
  Briefcase,
  User,
  UserCheck,
  Video,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
  Download,
  Search,
  Filter,
  LogOut,
  Loader2,
  AlertCircle,
  X,
  Sparkles,
  ListOrdered,
  Check,
} from 'lucide-react';
import { InterviewItem } from '@/components/ScheduleCard';
import { formatInterviewDate, getStatusBadgeInfo, isInterviewCooledDown, isRealCandidateEmail } from '@/lib/formatters';
import CopyMeetLinkButton from '@/components/CopyMeetLinkButton';

interface AdminSession {
  adminId: string;
  email: string;
  name: string;
}

interface JobOption {
  id: string;
  companyName: string;
  jobTitle: string;
  contactPerson?: string | null;
  location?: string | null;
  experience?: string | null;
}

interface CompanyGroup {
  companyName: string;
  jobCount: number;
  jobs: JobOption[];
}

export default function AdminPortalPage() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Interviews data
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Companies & Jobs data from Open JD DB
  const [companies, setCompanies] = useState<CompanyGroup[]>([]);

  // Existing candidates
  const [candidates, setCandidates] = useState<any[]>([]);

  // Modals state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [feedbackModalItem, setFeedbackModalItem] = useState<InterviewItem | null>(null);

  // Edit interview modal state
  const [editModalItem, setEditModalItem] = useState<InterviewItem | null>(null);
  const [editCompany, setEditCompany] = useState('');
  const [editJobId, setEditJobId] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editRecruiterCompany, setEditRecruiterCompany] = useState('');
  const [editRecruiterCandidate, setEditRecruiterCandidate] = useState('');
  const [editCandName, setEditCandName] = useState('');
  const [editCandPhone, setEditCandPhone] = useState('');
  const [editCandExperience, setEditCandExperience] = useState('');
  const [editCandRole, setEditCandRole] = useState('');
  const [editCandLocation, setEditCandLocation] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editTimezone, setEditTimezone] = useState('IST (UTC+5:30)');
  const [editRoundNumber, setEditRoundNumber] = useState(1);
  const [editRoundName, setEditRoundName] = useState('');
  const [editMode, setEditMode] = useState('GOOGLE_MEET');
  const [editMeetingLink, setEditMeetingLink] = useState('');
  const [editLocationAddress, setEditLocationAddress] = useState('');
  const [editInterviewerName, setEditInterviewerName] = useState('');
  const [editInterviewerEmail, setEditInterviewerEmail] = useState('');
  const [editStatus, setEditStatus] = useState('SCHEDULED');
  const [editAdminNotes, setEditAdminNotes] = useState('');
  const [editFeedback, setEditFeedback] = useState('');
  const [editRating, setEditRating] = useState<number | null>(null);
  const [editL1Questions, setEditL1Questions] = useState('');
  const [editL2Questions, setEditL2Questions] = useState('');
  const [editL3Questions, setEditL3Questions] = useState('');
  const [editL4Questions, setEditL4Questions] = useState('');
  const [editL5Questions, setEditL5Questions] = useState('');
  const [editQTab, setEditQTab] = useState<'L1' | 'L2' | 'L3' | 'L4' | 'L5'>('L1');
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Schedule form state
  const [companyMode, setCompanyMode] = useState<'open_jd' | 'custom'>('open_jd');
  const [customCompanyName, setCustomCompanyName] = useState('');
  const [customJobTitle, setCustomJobTitle] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  const [recruiterCompany, setRecruiterCompany] = useState('');
  const [recruiterCandidate, setRecruiterCandidate] = useState('');
  const [candidateMode, setCandidateMode] = useState<'existing' | 'new'>('new');
  const [selectedCandidateId, setSelectedCandidateId] = useState('');

  // Edit form company mode
  const [editCompanyMode, setEditCompanyMode] = useState<'open_jd' | 'custom'>('open_jd');

  // New candidate fields
  const [candName, setCandName] = useState('');
  const [candPhone, setCandPhone] = useState('');
  const [candExperience, setCandExperience] = useState('');
  const [candRole, setCandRole] = useState('');
  const [candLocation, setCandLocation] = useState('');

  // Schedule slot fields
  const [interviewDate, setInterviewDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('02:00 PM');
  const [endTime, setEndTime] = useState('02:45 PM');
  const [timezone, setTimezone] = useState('IST (UTC+5:30)');
  const [roundNumber, setRoundNumber] = useState(1);
  const [roundName, setRoundName] = useState('Round 1');
  const [mode, setMode] = useState('GOOGLE_MEET');
  const [meetingLink, setMeetingLink] = useState('');
  const [interviewerName, setInterviewerName] = useState('');
  const [interviewerEmail, setInterviewerEmail] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [l1Questions, setL1Questions] = useState('');
  const [l2Questions, setL2Questions] = useState('');
  const [l3Questions, setL3Questions] = useState('');
  const [l4Questions, setL4Questions] = useState('');
  const [l5Questions, setL5Questions] = useState('');
  const [scheduleQTab, setScheduleQTab] = useState<'L1' | 'L2' | 'L3' | 'L4' | 'L5'>('L1');
  const [submittingSchedule, setSubmittingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState('');

  // Quick Questions Modal state
  const [questionsModalItem, setQuestionsModalItem] = useState<InterviewItem | null>(null);
  const [qL1, setQL1] = useState('');
  const [qL2, setQL2] = useState('');
  const [qL3, setQL3] = useState('');
  const [qL4, setQL4] = useState('');
  const [qL5, setQL5] = useState('');
  const [qActiveTab, setQActiveTab] = useState<'L1' | 'L2' | 'L3' | 'L4' | 'L5'>('L1');
  const [submittingQuestions, setSubmittingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState('');
  const [questionsSuccess, setQuestionsSuccess] = useState(false);

  // Feedback form state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Check auth session
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.admin) {
        setSession(data.admin);
      } else {
        setSession(null);
      }
    } catch {
      setSession(null);
    } finally {
      setLoadingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch interviews & companies when authenticated
  const fetchData = async () => {
    if (!session) return;
    setLoadingInterviews(true);
    try {
      const [intRes, jobsRes, candRes] = await Promise.all([
        fetch('/api/interviews?limit=100'),
        fetch('/api/jobs'),
        fetch('/api/candidates'),
      ]);

      const [intData, jobsData, candData] = await Promise.all([
        intRes.json(),
        jobsRes.json(),
        candRes.json(),
      ]);

      if (intData.success) setInterviews(intData.interviews);
      if (jobsData.success) {
        setCompanies(jobsData.companies);
        if (jobsData.companies.length > 0 && !selectedCompany) {
          setSelectedCompany(jobsData.companies[0].companyName);
          if (jobsData.companies[0].jobs.length > 0) {
            setSelectedJobId(jobsData.companies[0].jobs[0].id);
            setSelectedJobTitle(jobsData.companies[0].jobs[0].jobTitle);
            setRecruiterCompany(jobsData.companies[0].jobs[0].contactPerson || '');
          }
        }
      }
      if (candData.success) setCandidates(candData.candidates);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoadingInterviews(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || 'Invalid credentials');
      } else {
        setSession(data.admin);
      }
    } catch {
      setLoginError('Login request failed. Please check network.');
    } finally {
      setLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSession(null);
    } catch (err) {
      console.error(err);
    }
  };

  // When company dropdown changes in schedule modal, update job title & recruiter
  const handleCompanyChange = (companyName: string) => {
    setSelectedCompany(companyName);
    const found = companies.find((c) => c.companyName === companyName);
    if (found && found.jobs.length > 0) {
      setSelectedJobId(found.jobs[0].id);
      setSelectedJobTitle(found.jobs[0].jobTitle);
      setRecruiterCompany(found.jobs[0].contactPerson || '');
    } else {
      setSelectedJobId('');
      setSelectedJobTitle('');
      setRecruiterCompany('');
    }
  };

  // Handle Schedule Submit
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSchedule(true);
    setScheduleError('');

    try {
      let finalCompanyName = selectedCompany;
      let finalJobTitle = selectedJobTitle;
      let finalJobId: string | undefined = selectedJobId || undefined;
      const isCustom = companyMode === 'custom';

      if (isCustom) {
        if (!customCompanyName.trim()) {
          setScheduleError('Please enter Custom Company Name.');
          setSubmittingSchedule(false);
          return;
        }
        if (!customJobTitle.trim()) {
          setScheduleError('Please enter Custom Job Title.');
          setSubmittingSchedule(false);
          return;
        }
        finalCompanyName = customCompanyName.trim();
        finalJobTitle = customJobTitle.trim();
        finalJobId = undefined;
      } else {
        if (!selectedCompany || !selectedJobTitle) {
          setScheduleError('Please select a Company and Job from the list.');
          setSubmittingSchedule(false);
          return;
        }
      }

      const payload: any = {
        companyName: finalCompanyName,
        jobTitle: finalJobTitle,
        jobId: finalJobId,
        isCustom,
        recruiterCompany: recruiterCompany.trim() || null,
        recruiterCandidate: recruiterCandidate.trim() || null,
        interviewDate,
        startTime,
        endTime,
        timezone,
        roundNumber: Number(roundNumber),
        roundName,
        mode,
        meetingLink,
        l1Questions: l1Questions.trim() || null,
        l2Questions: l2Questions.trim() || null,
        l3Questions: l3Questions.trim() || null,
        l4Questions: l4Questions.trim() || null,
        l5Questions: l5Questions.trim() || null,
      };

      if (candidateMode === 'existing') {
        if (!selectedCandidateId) {
          setScheduleError('Please select an existing candidate.');
          setSubmittingSchedule(false);
          return;
        }
        payload.candidateId = selectedCandidateId;
      } else {
        if (!candName.trim()) {
          setScheduleError('Candidate Name is required.');
          setSubmittingSchedule(false);
          return;
        }
        payload.newCandidate = {
          name: candName.trim(),
          phone: candPhone.trim(),
          experience: candExperience.trim(),
          currentRole: candRole.trim(),
          location: candLocation.trim(),
        };
      }

      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setScheduleError(data.error || 'Failed to schedule interview.');
      } else {
        setCompanyMode('open_jd');
        setCustomCompanyName('');
        setCustomJobTitle('');
        setCandName('');
        setCandPhone('');
        setCandExperience('');
        setCandRole('');
        setCandLocation('');
        setMeetingLink('');
        setL1Questions('');
        setL2Questions('');
        setL3Questions('');
        setL4Questions('');
        setL5Questions('');
        setScheduleQTab('L1');
        // Refresh list
        fetchData();
      }
    } catch {
      setScheduleError('An error occurred while submitting schedule.');
    } finally {
      setSubmittingSchedule(false);
    }
  };

  // Status changer directly in table
  const handleStatusChange = async (interviewId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/interviews/${interviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setInterviews((prev) =>
          prev.map((i) => (i.id === interviewId ? { ...i, status: newStatus } : i))
        );
      }
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  // Submit feedback
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackModalItem) return;
    setSubmittingFeedback(true);

    try {
      const res = await fetch(`/api/interviews/${feedbackModalItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: feedbackRating,
          feedback: feedbackNotes,
        }),
      });

      if (res.ok) {
        setFeedbackModalItem(null);
        setFeedbackNotes('');
        fetchData();
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Delete interview
  const handleDeleteInterview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this interview schedule?')) return;

    try {
      const res = await fetch(`/api/interviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setInterviews((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete interview:', err);
    }
  };

  // Open Edit Modal with selected interview data
  const handleOpenEditModal = (item: InterviewItem) => {
    setEditModalItem(item);
    setEditCompany(item.companyName);
    setEditJobId(item.job?.id || '');
    setEditJobTitle(item.jobTitle);
    setEditCompanyMode(item.job ? 'open_jd' : 'custom');
    setEditRecruiterCompany(item.recruiterCompany || item.job?.contactPerson || '');
    setEditRecruiterCandidate(item.recruiterCandidate || '');
    setEditCandName(item.candidate.name || '');
    setEditCandPhone(item.candidate.phone || '');
    setEditCandExperience(item.candidate.experience || '');
    setEditCandRole(item.candidate.currentRole || '');
    setEditCandLocation(item.candidate.location || '');

    try {
      const d = new Date(item.interviewDate);
      setEditDate(d.toISOString().split('T')[0]);
    } catch {
      setEditDate('');
    }

    setEditStartTime(item.startTime || '02:00 PM');
    setEditEndTime(item.endTime || '02:45 PM');
    setEditTimezone(item.timezone || 'IST (UTC+5:30)');
    setEditRoundNumber(item.roundNumber || 1);
    setEditRoundName(item.roundName || 'Round 1');
    setEditMode(item.mode || 'GOOGLE_MEET');
    setEditMeetingLink(item.meetingLink || '');
    setEditLocationAddress(item.locationAddress || '');
    setEditStatus(item.status || 'SCHEDULED');
    setEditFeedback(item.feedback || '');
    setEditRating(item.rating || null);
    setEditL1Questions(item.l1Questions || '');
    setEditL2Questions(item.l2Questions || '');
    setEditL3Questions(item.l3Questions || '');
    setEditL4Questions(item.l4Questions || '');
    setEditL5Questions(item.l5Questions || '');
    setEditQTab('L1');
    setEditError('');
  };

  // Handle company change in edit modal
  const handleEditCompanyChange = (companyName: string) => {
    setEditCompany(companyName);
    const found = companies.find((c) => c.companyName === companyName);
    if (found && found.jobs.length > 0) {
      setEditJobId(found.jobs[0].id);
      setEditJobTitle(found.jobs[0].jobTitle);
      setEditRecruiterCompany(found.jobs[0].contactPerson || '');
    } else {
      setEditJobId('');
      setEditJobTitle('');
      setEditRecruiterCompany('');
    }
  };

  // Submit interview edits
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalItem) return;
    setSubmittingEdit(true);
    setEditError('');

    try {
      const isCustom = editCompanyMode === 'custom';
      if (!editCompany.trim() || !editJobTitle.trim()) {
        setEditError('Company Name and Job Title are required.');
        setSubmittingEdit(false);
        return;
      }

      const payload: any = {
        companyName: editCompany.trim(),
        jobTitle: editJobTitle.trim(),
        jobId: isCustom ? null : (editJobId || null),
        isCustom,
        recruiterCompany: editRecruiterCompany.trim() || null,
        recruiterCandidate: editRecruiterCandidate.trim() || null,
        interviewDate: editDate,
        startTime: editStartTime,
        endTime: editEndTime,
        timezone: editTimezone,
        roundNumber: Number(editRoundNumber),
        roundName: editRoundName,
        mode: editMode,
        meetingLink: editMeetingLink,
        locationAddress: editLocationAddress,
        status: editStatus,
        feedback: editFeedback || null,
        rating: editRating,
        l1Questions: editL1Questions.trim() || null,
        l2Questions: editL2Questions.trim() || null,
        l3Questions: editL3Questions.trim() || null,
        l4Questions: editL4Questions.trim() || null,
        l5Questions: editL5Questions.trim() || null,
        candidate: {
          id: editModalItem.candidate.id,
          name: editCandName.trim(),
          phone: editCandPhone.trim(),
          experience: editCandExperience.trim(),
          currentRole: editCandRole.trim(),
          location: editCandLocation.trim(),
        },
      };

      const res = await fetch(`/api/interviews/${editModalItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || 'Failed to update interview');
      } else {
        setEditModalItem(null);
        fetchData();
      }
    } catch {
      setEditError('An error occurred while saving edits.');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Open quick questions modal
  const handleOpenQuestionsModal = (item: InterviewItem) => {
    setQuestionsModalItem(item);
    setQL1(item.l1Questions || '');
    setQL2(item.l2Questions || '');
    setQL3(item.l3Questions || '');
    setQL4(item.l4Questions || '');
    setQL5(item.l5Questions || '');
    setQActiveTab('L1');
    setQuestionsError('');
    setQuestionsSuccess(false);
  };

  // Save quick questions
  const handleSaveQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionsModalItem) return;
    setSubmittingQuestions(true);
    setQuestionsError('');
    setQuestionsSuccess(false);

    try {
      const res = await fetch(`/api/interviews/${questionsModalItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          l1Questions: qL1.trim() || null,
          l2Questions: qL2.trim() || null,
          l3Questions: qL3.trim() || null,
          l4Questions: qL4.trim() || null,
          l5Questions: qL5.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setQuestionsError(data.error || 'Failed to save questions');
      } else {
        setQuestionsSuccess(true);
        // Update local state
        setInterviews((prev) =>
          prev.map((i) =>
            i.id === questionsModalItem.id
              ? {
                  ...i,
                  l1Questions: qL1.trim() || null,
                  l2Questions: qL2.trim() || null,
                  l3Questions: qL3.trim() || null,
                  l4Questions: qL4.trim() || null,
                  l5Questions: qL5.trim() || null,
                }
              : i
          )
        );
        setTimeout(() => {
          setQuestionsModalItem(null);
          setQuestionsSuccess(false);
        }, 500);
      }
    } catch {
      setQuestionsError('An error occurred while saving interview questions.');
    } finally {
      setSubmittingQuestions(false);
    }
  };

  // Export to Excel (.xlsx)
  const exportToExcel = async () => {
    setExportingExcel(true);
    try {
      const params = new URLSearchParams();
      if (searchFilter) params.set('search', searchFilter);
      if (statusFilter && statusFilter !== 'All') params.set('status', statusFilter);

      const res = await fetch(`/api/interviews/export?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to download Excel file');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const contentDisposition = res.headers.get('Content-Disposition');
      let filename = `Forcecraver_Interviews_${new Date().toISOString().split('T')[0]}.xlsx`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export Excel failed:', err);
      alert('Failed to export Excel file. Please try again.');
    } finally {
      setExportingExcel(false);
    }
  };

  // Filtered interviews
  const filteredInterviews = interviews.filter((item) => {
    const matchesSearch =
      !searchFilter ||
      item.companyName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.jobTitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.candidate.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.referenceCode.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // If not logged in, render Admin Login view
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Admin Authentication</h2>
              <p className="text-xs text-slate-500">
                Log in to schedule interviews, map candidates to active client JDs, and manage status.
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your admin password"
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log In to Admin Portal'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Current selected company's available jobs
  const currentCompanyJobs = companies.find((c) => c.companyName === selectedCompany)?.jobs || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800">
                ADMIN CONSOLE
              </span>
              <span className="text-xs text-slate-500 font-medium">Logged in as {session.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Interview Management & Scheduling
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (!recruiterCompany && companies.length > 0) {
                  const currCo = companies.find((c) => c.companyName === selectedCompany) || companies[0];
                  const currJob = currCo?.jobs.find((j) => j.id === selectedJobId) || currCo?.jobs[0];
                  if (currJob?.contactPerson) {
                    setRecruiterCompany(currJob.contactPerson);
                  }
                }
                setScheduleModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Interview</span>
            </button>

            <button
              onClick={exportToExcel}
              disabled={exportingExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
              title="Export schedules as Excel (.xlsx)"
            >
              {exportingExcel ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{exportingExcel ? 'Exporting...' : 'Export Excel'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search interview or candidate..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="L1">L1</option>
              <option value="L2">L2</option>
              <option value="L3">L3</option>
              <option value="L4">L4</option>
              <option value="L5">L5</option>
              <option value="SELECTED">Selected</option>
              <option value="RESCHEDULED">Rescheduled</option>
              <option value="REJECTED">Not Selected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Interviews Management Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Ref & Candidate</th>
                  <th className="py-3.5 px-4">Client Company & JD</th>
                  <th className="py-3.5 px-4">Recruiters</th>
                  <th className="py-3.5 px-4">Interview Slot</th>
                  <th className="py-3.5 px-4">Platform / Mode</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loadingInterviews ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                      Loading interviews...
                    </td>
                  </tr>
                ) : filteredInterviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      No interviews match the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInterviews.map((item) => {
                    const status = getStatusBadgeInfo(item.status);
                    const isCooledDown = isInterviewCooledDown(item.interviewDate);
                    return (
                      <tr
                        key={item.id}
                        className={`${
                          isCooledDown
                            ? 'bg-slate-50/40 opacity-85 hover:opacity-100 hover:bg-slate-50'
                            : 'hover:bg-slate-50/60'
                        } transition-colors`}
                      >
                        {/* Ref & Candidate */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.referenceCode}
                          </span>
                          <div className="font-bold text-slate-900 mt-1">{item.candidate.name}</div>
                          {item.candidate.phone && (
                            <div className="text-[11px] text-slate-500">{item.candidate.phone}</div>
                          )}
                        </td>

                        {/* Company & Role */}
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-blue-600">{item.companyName}</span>
                          <div className="font-medium text-slate-800 line-clamp-1">{item.jobTitle}</div>
                        </td>

                        {/* Recruiters (Company & Candidate) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-[11px] flex items-center gap-1.5">
                              <span className="text-[9px] font-bold uppercase px-1 py-0.2 rounded bg-slate-100 text-slate-500 border border-slate-200">
                                Co:
                              </span>
                              <span className="font-semibold text-slate-800">
                                {item.recruiterCompany || item.job?.contactPerson || '—'}
                              </span>
                            </div>
                            <div className="text-[11px] flex items-center gap-1.5">
                              <span className="text-[9px] font-bold uppercase px-1 py-0.2 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                                Cand:
                              </span>
                              <span className="font-semibold text-indigo-700">
                                {item.recruiterCandidate || '—'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <span>{formatInterviewDate(item.interviewDate)}</span>
                            {isCooledDown && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                                Cooled Down
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {item.startTime} - {item.endTime}
                          </div>
                        </td>

                        {/* Platform / Mode */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span>{item.mode === 'NOT_KNOWN' ? 'Not Known' : item.mode.replace('_', ' ')}</span>
                          </div>
                        </td>

                        {/* Status Changer */}
                        <td className="py-3.5 px-4">
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border focus:outline-none ${status.bg}`}
                          >
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="L1">L1</option>
                            <option value="L2">L2</option>
                            <option value="L3">L3</option>
                            <option value="L4">L4</option>
                            <option value="L5">L5</option>
                            <option value="SELECTED">Selected</option>
                            <option value="RESCHEDULED">Rescheduled</option>
                            <option value="REJECTED">Not Selected</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit Schedule Button */}
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-semibold transition-colors flex items-center gap-1"
                              title="Edit Interview Schedule"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

                            {/* Questions Button */}
                            <button
                              onClick={() => handleOpenQuestionsModal(item)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[11px] font-semibold transition-colors flex items-center gap-1"
                              title="Manage Round L1-L5 Questions"
                            >
                              <ListOrdered className="w-3 h-3" />
                              <span>Questions</span>
                            </button>

                            {/* Feedback Button */}
                            <button
                              onClick={() => {
                                setFeedbackModalItem(item);
                                setFeedbackRating(item.rating || 5);
                                setFeedbackNotes(item.feedback || '');
                              }}
                              className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-semibold transition-colors"
                              title="Add Client Feedback & Rating"
                            >
                              Feedback
                            </button>

                            {/* Copy Meeting Link button */}
                            {item.meetingLink && (
                              <CopyMeetLinkButton
                                meetingLink={item.meetingLink}
                                variant="icon"
                              />
                            )}

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteInterview(item.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete interview"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* SCHEDULE INTERVIEW MODAL */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Schedule Client Interview</h3>
                <p className="text-xs text-slate-500">
                  Select client company & active JD from database, map candidate, and set company slot.
                </p>
              </div>
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {scheduleError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {scheduleError}
              </div>
            )}

            <form onSubmit={handleScheduleSubmit} className="mt-6 space-y-6">
              {/* STEP 1: COMPANY & ACTIVE JD */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    1. Client Company & Position
                  </h4>

                  <div className="flex items-center p-0.5 rounded-lg bg-blue-100/70 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setCompanyMode('open_jd')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        companyMode === 'open_jd' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      From Open JD Portal
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompanyMode('custom')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        companyMode === 'custom' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      + Custom Company & JD
                    </button>
                  </div>
                </div>

                {companyMode === 'open_jd' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Client Company *
                      </label>
                      <select
                        value={selectedCompany}
                        onChange={(e) => handleCompanyChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                        required={companyMode === 'open_jd'}
                      >
                        {companies.map((c) => (
                          <option key={c.companyName} value={c.companyName}>
                            {c.companyName} ({c.jobCount} active JDs)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Active JD / Role *
                      </label>
                      <select
                        value={selectedJobId}
                        onChange={(e) => {
                          setSelectedJobId(e.target.value);
                          const j = currentCompanyJobs.find((item) => item.id === e.target.value);
                          if (j) {
                            setSelectedJobTitle(j.jobTitle);
                            setRecruiterCompany(j.contactPerson || '');
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                        required={companyMode === 'open_jd'}
                      >
                        {currentCompanyJobs.map((j) => (
                          <option key={j.id} value={j.id}>
                            {j.jobTitle} {j.experience ? `(${j.experience})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Custom Company Name *
                        </label>
                        <input
                          type="text"
                          value={customCompanyName}
                          onChange={(e) => setCustomCompanyName(e.target.value)}
                          placeholder="e.g. Google, Stealth Startup, TechCorp"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                          required={companyMode === 'custom'}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Custom Job Title / Role *
                        </label>
                        <input
                          type="text"
                          value={customJobTitle}
                          onChange={(e) => setCustomJobTitle(e.target.value)}
                          placeholder="e.g. Senior Frontend Architect"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                          required={companyMode === 'custom'}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 2: RECRUITER DETAILS */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    2. Recruiter Details
                  </h4>
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                    Company & Candidate Alignment
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Recruiter Company (Client SPOC / Handled By) *
                    </label>
                    <input
                      type="text"
                      value={recruiterCompany}
                      onChange={(e) => setRecruiterCompany(e.target.value)}
                      placeholder="e.g. Sakshi"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Recruiter Candidate (Forcecraver Sourced By)
                    </label>
                    <input
                      type="text"
                      value={recruiterCandidate}
                      onChange={(e) => setRecruiterCandidate(e.target.value)}
                      placeholder="e.g. Rahul / Sourced By"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 3: CANDIDATE INFORMATION */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-600" />
                    3. Candidate Assignment
                  </h4>

                  <div className="flex items-center p-0.5 rounded-lg bg-slate-200 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setCandidateMode('new')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        candidateMode === 'new' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      + Add New
                    </button>
                    <button
                      type="button"
                      onClick={() => setCandidateMode('existing')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        candidateMode === 'existing' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Existing ({candidates.length})
                    </button>
                  </div>
                </div>

                {candidateMode === 'existing' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Select Existing Candidate
                    </label>
                    <select
                      value={selectedCandidateId}
                      onChange={(e) => setSelectedCandidateId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    >
                      <option value="">-- Choose Candidate --</option>
                      {candidates.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} • {c.email} ({c.experience || 'N/A'})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Candidate Name *
                      </label>
                      <input
                        type="text"
                        value={candName}
                        onChange={(e) => setCandName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={candPhone}
                        onChange={(e) => setCandPhone(e.target.value)}
                        placeholder="+91..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Total Experience
                      </label>
                      <input
                        type="text"
                        value={candExperience}
                        onChange={(e) => setCandExperience(e.target.value)}
                        placeholder="e.g. 4.5 years"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Current Designation
                      </label>
                      <input
                        type="text"
                        value={candRole}
                        onChange={(e) => setCandRole(e.target.value)}
                        placeholder="e.g. Backend Developer"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={candLocation}
                        onChange={(e) => setCandLocation(e.target.value)}
                        placeholder="e.g. Ahmedabad, Pune, Remote"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 4: COMPANY'S DATE, TIME & ROUND */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  4. Company's Interview Schedule & Slot
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Interview Date *
                    </label>
                    <input
                      type="date"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="text"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      placeholder="e.g. 02:30 PM"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="text"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      placeholder="e.g. 03:15 PM"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Platform / Mode
                    </label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    >
                      <option value="GOOGLE_MEET">Google Meet</option>
                      <option value="ZOOM">Zoom</option>
                      <option value="TEAMS">Microsoft Teams</option>
                      <option value="IN_PERSON">In-Person</option>
                      <option value="PHONE">Phone Call</option>
                      <option value="NOT_KNOWN">Not Known</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Meeting Link (URL)
                    </label>
                    <input
                      type="url"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://meet.google.com/..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                {/* Round Questions (L1 - L5) */}
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                      <ListOrdered className="w-4 h-4 text-indigo-600" />
                      Round Interview Questions (L1 — L5)
                    </h4>
                    <span className="text-[11px] text-indigo-600 font-medium">Publicly visible on portal</span>
                  </div>

                  {/* Round Tabs */}
                  <div className="flex items-center gap-1.5 border-b border-indigo-100 pb-2">
                    {(['L1', 'L2', 'L3', 'L4', 'L5'] as const).map((r) => {
                      const count = {
                        L1: l1Questions.trim().length,
                        L2: l2Questions.trim().length,
                        L3: l3Questions.trim().length,
                        L4: l4Questions.trim().length,
                        L5: l5Questions.trim().length,
                      }[r];
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setScheduleQTab(r)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                            scheduleQTab === r
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-white text-slate-600 hover:bg-indigo-100/50 border border-slate-200'
                          }`}
                        >
                          <span>{r}</span>
                          {count > 0 && (
                            <span className={`w-1.5 h-1.5 rounded-full ${scheduleQTab === r ? 'bg-emerald-300' : 'bg-indigo-500'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Questions asked in {scheduleQTab} Round
                      </label>
                      <span className="text-[10px] text-slate-400">Preserves line breaks & bullet points</span>
                    </div>
                    <textarea
                      value={
                        scheduleQTab === 'L1' ? l1Questions :
                        scheduleQTab === 'L2' ? l2Questions :
                        scheduleQTab === 'L3' ? l3Questions :
                        scheduleQTab === 'L4' ? l4Questions : l5Questions
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (scheduleQTab === 'L1') setL1Questions(val);
                        else if (scheduleQTab === 'L2') setL2Questions(val);
                        else if (scheduleQTab === 'L3') setL3Questions(val);
                        else if (scheduleQTab === 'L4') setL4Questions(val);
                        else setL5Questions(val);
                      }}
                      placeholder={`Enter question list, coding problems, or topics asked in ${scheduleQTab} round (one per line)...`}
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSchedule}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingSchedule ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Confirm & Schedule Interview'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FEEDBACK & RATING MODAL */}
      {feedbackModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Client Feedback</h3>
                <p className="text-xs text-slate-500">
                  {feedbackModalItem.candidate.name} • {feedbackModalItem.companyName}
                </p>
              </div>
              <button
                onClick={() => setFeedbackModalItem(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Client Evaluation Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= feedbackRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {feedbackRating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Interviewer Notes / Verdict
                </label>
                <textarea
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder="e.g. Strong conceptual grasp, cleared technical coding task. Selected for client director round."
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFeedbackModalItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                >
                  {submittingFeedback ? 'Saving...' : 'Save Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT INTERVIEW SCHEDULE MODAL */}
      {editModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {editModalItem.referenceCode}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {editStatus}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Edit Interview Schedule</h3>
                <p className="text-xs text-slate-500">
                  Update client date/time slots, assigned JD, meeting link, or candidate details.
                </p>
              </div>
              <button
                onClick={() => setEditModalItem(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="mt-6 space-y-6">
              {/* SECTION 1: CLIENT COMPANY & ACTIVE JD */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    1. Client Company & Position
                  </h4>

                  <div className="flex items-center p-0.5 rounded-lg bg-blue-100/70 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setEditCompanyMode('open_jd')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        editCompanyMode === 'open_jd' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      From Open JD Portal
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditCompanyMode('custom')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        editCompanyMode === 'custom' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      + Custom Company & JD
                    </button>
                  </div>
                </div>

                {editCompanyMode === 'open_jd' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Client Company *
                      </label>
                      <select
                        value={editCompany}
                        onChange={(e) => handleEditCompanyChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                        required={editCompanyMode === 'open_jd'}
                      >
                        {companies.map((c) => (
                          <option key={c.companyName} value={c.companyName}>
                            {c.companyName} ({c.jobCount} active JDs)
                          </option>
                        ))}
                        {!companies.some((c) => c.companyName === editCompany) && (
                          <option value={editCompany}>{editCompany}</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Active JD / Role *
                      </label>
                      <select
                        value={editJobId}
                        onChange={(e) => {
                          setEditJobId(e.target.value);
                          const j = companies
                            .find((c) => c.companyName === editCompany)
                            ?.jobs.find((item) => item.id === e.target.value);
                          if (j) {
                            setEditJobTitle(j.jobTitle);
                            if (j.contactPerson) setEditRecruiterCompany(j.contactPerson);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                        required={editCompanyMode === 'open_jd'}
                      >
                        {companies
                          .find((c) => c.companyName === editCompany)
                          ?.jobs.map((j) => (
                            <option key={j.id} value={j.id}>
                              {j.jobTitle} {j.experience ? `(${j.experience})` : ''}
                            </option>
                          ))}
                        <option value="">Custom / Specific Role: {editJobTitle}</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Custom Company Name *
                        </label>
                        <input
                          type="text"
                          value={editCompany}
                          onChange={(e) => setEditCompany(e.target.value)}
                          placeholder="e.g. Google, Stealth Startup"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                          required={editCompanyMode === 'custom'}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Custom Job Title / Role *
                        </label>
                        <input
                          type="text"
                          value={editJobTitle}
                          onChange={(e) => setEditJobTitle(e.target.value)}
                          placeholder="e.g. Senior Frontend Architect"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                          required={editCompanyMode === 'custom'}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: RECRUITER DETAILS */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    2. Recruiter Details
                  </h4>
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                    Company & Candidate Alignment
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Recruiter Company (Client SPOC / Handled By)
                    </label>
                    <input
                      type="text"
                      value={editRecruiterCompany}
                      onChange={(e) => setEditRecruiterCompany(e.target.value)}
                      placeholder="e.g. Sakshi"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Recruiter Candidate (Forcecraver Sourced By)
                    </label>
                    <input
                      type="text"
                      value={editRecruiterCandidate}
                      onChange={(e) => setEditRecruiterCandidate(e.target.value)}
                      placeholder="e.g. Recruiter Name"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: CANDIDATE INFORMATION */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" />
                  3. Candidate Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Candidate Name *
                    </label>
                    <input
                      type="text"
                      value={editCandName}
                      onChange={(e) => setEditCandName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editCandPhone}
                      onChange={(e) => setEditCandPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Total Experience
                    </label>
                    <input
                      type="text"
                      value={editCandExperience}
                      onChange={(e) => setEditCandExperience(e.target.value)}
                      placeholder="e.g. 5 years"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Current Designation
                    </label>
                    <input
                      type="text"
                      value={editCandRole}
                      onChange={(e) => setEditCandRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editCandLocation}
                      onChange={(e) => setEditCandLocation(e.target.value)}
                      placeholder="e.g. Ahmedabad, Pune, Remote"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: COMPANY'S DATE, TIME & ROUND */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  4. Company's Interview Schedule & Slot
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Interview Date *
                    </label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="text"
                      value={editStartTime}
                      onChange={(e) => setEditStartTime(e.target.value)}
                      placeholder="03:00 PM"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="text"
                      value={editEndTime}
                      onChange={(e) => setEditEndTime(e.target.value)}
                      placeholder="03:45 PM"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Platform / Mode
                    </label>
                    <select
                      value={editMode}
                      onChange={(e) => setEditMode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    >
                      <option value="GOOGLE_MEET">Google Meet</option>
                      <option value="ZOOM">Zoom</option>
                      <option value="TEAMS">Microsoft Teams</option>
                      <option value="IN_PERSON">In-Person</option>
                      <option value="PHONE">Phone Call</option>
                      <option value="NOT_KNOWN">Not Known</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Meeting Link (URL)
                    </label>
                    <input
                      type="url"
                      value={editMeetingLink}
                      onChange={(e) => setEditMeetingLink(e.target.value)}
                      placeholder="https://meet.google.com/..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Location / Address (if In-Person)
                    </label>
                  <input
                    type="text"
                    value={editLocationAddress}
                    onChange={(e) => setEditLocationAddress(e.target.value)}
                    placeholder="e.g. Novigo Office, 4th Floor, Tech Park"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* SECTION 4: STATUS & RECRUITER NOTES */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  4. Status, Feedback & Internal Notes
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Interview Status *
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                    >
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="L1">L1</option>
                      <option value="L2">L2</option>
                      <option value="L3">L3</option>
                      <option value="L4">L4</option>
                      <option value="L5">L5</option>
                      <option value="SELECTED">Selected</option>
                      <option value="RESCHEDULED">Rescheduled</option>
                      <option value="REJECTED">Not Selected</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Client Rating (1 to 5 Stars)
                    </label>
                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditRating(star)}
                          className="p-0.5 focus:outline-none"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              editRating && star <= editRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      {editRating && (
                        <button
                          type="button"
                          onClick={() => setEditRating(null)}
                          className="text-[10px] text-slate-400 hover:text-slate-600 ml-1"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Client Verdict / Feedback
                  </label>
                  <textarea
                    value={editFeedback}
                    onChange={(e) => setEditFeedback(e.target.value)}
                    placeholder="Client feedback notes after interview round..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                {/* Edit Round Questions (L1 - L5) */}
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                      <ListOrdered className="w-4 h-4 text-indigo-600" />
                      Round Interview Questions (L1 — L5)
                    </h4>
                    <span className="text-[11px] text-indigo-600 font-medium">Publicly visible on portal</span>
                  </div>

                  {/* Round Tabs */}
                  <div className="flex items-center gap-1.5 border-b border-indigo-100 pb-2">
                    {(['L1', 'L2', 'L3', 'L4', 'L5'] as const).map((r) => {
                      const count = {
                        L1: editL1Questions.trim().length,
                        L2: editL2Questions.trim().length,
                        L3: editL3Questions.trim().length,
                        L4: editL4Questions.trim().length,
                        L5: editL5Questions.trim().length,
                      }[r];
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setEditQTab(r)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                            editQTab === r
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-white text-slate-600 hover:bg-indigo-100/50 border border-slate-200'
                          }`}
                        >
                          <span>{r}</span>
                          {count > 0 && (
                            <span className={`w-1.5 h-1.5 rounded-full ${editQTab === r ? 'bg-emerald-300' : 'bg-indigo-500'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Questions asked in {editQTab} Round
                      </label>
                      <span className="text-[10px] text-slate-400">Preserves line breaks & formatting</span>
                    </div>
                    <textarea
                      value={
                        editQTab === 'L1' ? editL1Questions :
                        editQTab === 'L2' ? editL2Questions :
                        editQTab === 'L3' ? editL3Questions :
                        editQTab === 'L4' ? editL4Questions : editL5Questions
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (editQTab === 'L1') setEditL1Questions(val);
                        else if (editQTab === 'L2') setEditL2Questions(val);
                        else if (editQTab === 'L3') setEditL3Questions(val);
                        else if (editQTab === 'L4') setEditL4Questions(val);
                        else setEditL5Questions(val);
                      }}
                      placeholder={`Enter question list, coding problems, or topics asked in ${editQTab} round (one per line)...`}
                      rows={3}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingEdit ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Save Changes & Update Schedule'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK QUESTIONS MODAL */}
      {questionsModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ListOrdered className="w-5 h-5 text-indigo-600" />
                  Interview Questions (Rounds L1 — L5)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Candidate: <strong className="text-slate-800">{questionsModalItem.candidate.name}</strong> •{' '}
                  <span className="text-indigo-600 font-semibold">{questionsModalItem.companyName}</span> ({questionsModalItem.jobTitle})
                </p>
              </div>
              <button
                onClick={() => setQuestionsModalItem(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {questionsError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{questionsError}</span>
              </div>
            )}

            {questionsSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Questions updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveQuestions} className="mt-4 space-y-4">
              {/* Tab Selector */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                {(['L1', 'L2', 'L3', 'L4', 'L5'] as const).map((round) => {
                  const content = {
                    L1: qL1,
                    L2: qL2,
                    L3: qL3,
                    L4: qL4,
                    L5: qL5,
                  }[round];
                  const hasQuestions = content.trim().length > 0;
                  return (
                    <button
                      key={round}
                      type="button"
                      onClick={() => setQActiveTab(round)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                        qActiveTab === round
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      <span>Round {round}</span>
                      {hasQuestions && (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            qActiveTab === round ? 'bg-emerald-300' : 'bg-indigo-600'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Questions for Round {qActiveTab}
                </label>
                <textarea
                  value={
                    qActiveTab === 'L1' ? qL1 :
                    qActiveTab === 'L2' ? qL2 :
                    qActiveTab === 'L3' ? qL3 :
                    qActiveTab === 'L4' ? qL4 : qL5
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (qActiveTab === 'L1') setQL1(val);
                    else if (qActiveTab === 'L2') setQL2(val);
                    else if (qActiveTab === 'L3') setQL3(val);
                    else if (qActiveTab === 'L4') setQL4(val);
                    else setQL5(val);
                  }}
                  placeholder={`Add technical questions, coding problems, behavioral questions, or topics asked in Round ${qActiveTab}... (These are visible on the public interview details page)`}
                  rows={8}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  💡 Tip: Questions can be formatted with line breaks, numbered lists, or bullets. Formatting is preserved on candidate and public views.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuestionsModalItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submittingQuestions}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingQuestions ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Save Questions'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
