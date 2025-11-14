import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import NavBar from './components/NavBar';
import Dashboard from './pages/Dashboard';
import ManageData from './pages/ManageData';
import GeneratePage from './pages/GeneratePage';
import ViewTimetable from './pages/ViewTimetable';
import ViewAllTimetables from './pages/ViewAllTimetables';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Settings from './pages/Settings';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/manage" element={<ManageData />} />
          <Route path="/generate" element={<GeneratePage />} />
          <Route path="/view" element={<ViewTimetable />} />
          <Route path="/view-all" element={<ViewAllTimetables />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;

