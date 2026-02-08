import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import NewAnalysis from './pages/NewAnalysis';
import PropertyAnalysis from './pages/PropertyAnalysis';
import Report from './pages/Report';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="new" element={<NewAnalysis />} />
          <Route path="analysis/:id" element={<PropertyAnalysis />} />
          <Route path="report/:id" element={<Report />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
