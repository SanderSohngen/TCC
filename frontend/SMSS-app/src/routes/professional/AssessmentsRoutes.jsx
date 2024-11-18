import { Route, Routes } from 'react-router-dom';
import Assessments from '../../pages/professional/assessments/Assessments';
import CreateAssessment from '../../pages/professional/assessments/CreateAssessment';
import AssessmentDetails from '../../pages/professional/assessments/AssessmentDetails';

const AssessmentsRoutes = () => (
  <Routes>
    <Route index element={<Assessments />} />
    <Route path="novo" element={<CreateAssessment />} />
    <Route path=":assessmentId/detalhes" element={<AssessmentDetails />} />
  </Routes>
);

export default AssessmentsRoutes;