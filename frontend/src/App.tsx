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
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/step8" replace />} />
          <Route path="/step1" element={<Step1 />} />
          <Route path="/step2" element={<Step2 />} />
          <Route path="/step3" element={<Step3 />} />
          <Route path="/step4" element={<Step4 />} />
          <Route path="/step5" element={<Step5 />} />
          <Route path="/step6" element={<Step6 />} />
          <Route path="/step7-1" element={<Step7_1 />} />
          <Route path="/step7-2" element={<Step7_2 />} />
          <Route path="/step8" element={<Step8 />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
