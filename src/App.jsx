import React from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { useAuth } from './contexts/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import ActivityLog from './pages/ActivityLog.jsx';
import OrgStructure from './pages/OrgStructure.jsx';
import Tasks from './pages/Tasks.jsx';
import Messenger from './pages/Messenger.jsx';
import Users from './pages/Users.jsx';
import { Loader } from 'lucide-react';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <div className="text-center">
          <Loader className="loader-inline mx-auto mb-2" />
          Loading workspace...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation('/login');
    return null;
  }

  return <Component {...rest} />;
};

function App() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <Layout>
          <ProtectedRoute component={Dashboard} />
        </Layout>
      </Route>
      <Route path="/dashboard">
        <Layout>
          <ProtectedRoute component={Dashboard} />
        </Layout>
      </Route>
      <Route path="/activity">
        <Layout>
          <ProtectedRoute component={ActivityLog} />
        </Layout>
      </Route>
      <Route path="/org-structure">
        <Layout>
          <ProtectedRoute component={OrgStructure} />
        </Layout>
      </Route>
      <Route path="/org-chart">
        <Layout>
          <ProtectedRoute component={OrgStructure} />
        </Layout>
      </Route>
      <Route path="/tasks">
        <Layout>
          <ProtectedRoute component={Tasks} />
        </Layout>
      </Route>
      <Route path="/messenger">
        <Layout>
          <ProtectedRoute component={Messenger} />
        </Layout>
      </Route>
      <Route path="/org-chat">
        <Layout>
          <ProtectedRoute component={Messenger} />
        </Layout>
      </Route>
      <Route path="/users">
        <Layout>
          <ProtectedRoute component={Users} />
        </Layout>
      </Route>
    </Switch>
  );
}

export default App;
