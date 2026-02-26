import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TaskProvider } from './context/TaskContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import AddTaskModal from './pages/AddTaskModal';

import Login from './pages/Login';
import Signup from './pages/Signup';
import PublicAudit from './pages/PublicAudit';
import FriendsProgress from './pages/FriendsProgress';
import EliteAdvocacy from './pages/EliteAdvocacy';
import ResurrectionAudit from './pages/ResurrectionAudit';
import PermanentExit from './pages/PermanentExit';
import TaskAudit from './pages/TaskAudit';
import TaskCompletionPage from './pages/TaskCompletionPage';
import Report from './pages/Report';
import FriendProfile from './pages/FriendProfile';
import ShareableProfile from './pages/ShareableProfile';
import AdminPanel from './pages/AdminPanel';
import SettingsPage from './pages/SettingsPage';
import FAQPage from './pages/FAQPage';
import AboutPage from './pages/AboutPage';
import FeedbackPage from './pages/FeedbackPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ContactPage from './pages/ContactPage';
import HowItWorksPage from './pages/HowItWorksPage';
import WhatIsNoZeroPage from './pages/WhatIsNoZeroPage';
import OnboardingFlow from './pages/OnboardingFlow';
import UserPledgePolicyPage from './pages/UserPledgePolicyPage';
import DayOffPage from './pages/DayOffPage';

function App() {
  return (
    <TaskProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/public-audit" element={<PublicAudit />} />
            <Route path="/friends" element={<FriendsProgress />} />
            <Route path="/elite-protocol" element={<EliteAdvocacy />} />
            <Route path="/audit/resurrection" element={<ResurrectionAudit />} />
            <Route path="/audit/exit" element={<PermanentExit />} />
            <Route path="/audit/:taskId" element={<TaskAudit />} />
            <Route path="/complete/:taskId" element={<TaskCompletionPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/add-task" element={<AddTaskModal />} />
            <Route path="/report" element={<Report />} />
            <Route path="/friend/:friendId" element={<FriendProfile />} />
            <Route path="/u/:username" element={<ShareableProfile />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/what-is-nozero" element={<WhatIsNoZeroPage />} />
            <Route path="/onboarding" element={<OnboardingFlow />} />
            <Route path="/pledge-policy" element={<UserPledgePolicyPage />} />
            <Route path="/day-off" element={<DayOffPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TaskProvider>
  );
}

export default App;
