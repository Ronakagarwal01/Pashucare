import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Consultation from './pages/Consultation';
import Animals from './pages/Animals';
import History from './pages/History';
import CaseSummary from './pages/CaseSummary';

export default function App() {
  return (
    <Routes>
      {/* Landing has its own header */}
      <Route path="/" element={<Landing />} />

      {/* App pages with shared navbar */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white">
            <Navbar />
            <main className="flex-1 w-full">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/consultation" element={<Consultation />} />
                <Route path="/animals" element={<Animals />} />
                <Route path="/history" element={<History />} />
                <Route path="/history/:id" element={<History />} />
                <Route path="/case-summary/:id" element={<CaseSummary />} />
              </Routes>
            </main>
          </div>
        }
      />
    </Routes>
  );
}
