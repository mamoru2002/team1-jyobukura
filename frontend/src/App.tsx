import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Step1 from './pages/Step1';
import Step2 from './pages/Step2';
import Step3 from './pages/Step3';
import Step4 from './pages/Step4';
import Step5 from './pages/Step5';
import Step6 from './pages/Step6';
import Step7_1 from './pages/Step7_1';
import Step7_2 from './pages/Step7_2';
import Step8 from './pages/Step8';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/step8" replace />} />
        <Route path="/step1" element={<Layout><Step1 /></Layout>} />
        <Route path="/step2" element={<Layout><Step2 /></Layout>} />
        <Route path="/step3" element={<Layout><Step3 /></Layout>} />
        <Route path="/step4" element={<Layout><Step4 /></Layout>} />
        <Route path="/step5" element={<Layout><Step5 /></Layout>} />
        <Route path="/step6" element={<Layout><Step6 /></Layout>} />
        <Route path="/step7-1" element={<Layout><Step7_1 /></Layout>} />
        <Route path="/step7-2" element={<Layout><Step7_2 /></Layout>} />
        <Route path="/step8" element={<Step8 />} />
      </Routes>
    </Router>
  );
}

export default App;
