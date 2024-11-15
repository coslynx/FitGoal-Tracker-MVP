import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@web/context/AuthContext';
import Layout from '@web/components/Layout';
import Dashboard from '@web/components/Dashboard';
import Goals from '@web/components/Goals';
import Progress from '@web/components/Progress'; // Assuming Progress component exists
import SocialFeed from '@web/components/SocialFeed';
import Profile from '@web/components/Profile';
import LoginForm from '@web/components/LoginForm';
import SignupForm from '@web/components/SignupForm';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/goals" element={<Layout><Goals /></Layout>} />
          <Route path="/progress" element={<Layout><Progress /></Layout>} />
          <Route path="/social" element={<Layout><SocialFeed /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/login" element={<Layout><LoginForm /></Layout>} />
          <Route path="/signup" element={<Layout><SignupForm /></Layout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);

```