import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SimulationProvider } from './context/SimulationContext';
import { AuthProvider } from './context/AuthContext';
import TopPage from './pages/TopPage';
import InputForm from './pages/InputForm';
import ResultsPage from './pages/ResultsPage';
import DetailedResultsPage from './pages/DetailedResultsPage';
import LoginPage from './pages/LoginPage';
import MyPage from './pages/MyPage';
import CalculationPage from './pages/CalculationPage';

export default function App() {
  return (
    <AuthProvider>
      <SimulationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<TopPage />} />
            <Route path="/simulate" element={<InputForm />} />
            <Route path="/input" element={<InputForm />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/details" element={<DetailedResultsPage />} />
            <Route path="/detailed" element={<DetailedResultsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/calculation" element={<CalculationPage />} />
          </Routes>
        </BrowserRouter>
      </SimulationProvider>
    </AuthProvider>
  );
}
