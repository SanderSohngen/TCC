import { Route, Routes } from 'react-router-dom';
import HealthHistory from '../../pages/patient/health-history/HealthHistory';
import Assessments from '../../pages/patient/health-history/assessments/Assessments';
import AssessmentDetails from '../../pages/patient/health-history/assessments/AssessmentDetails';
import TreatmentPlans from '../../pages/patient/health-history/treatment-plans/TreatmentPlans';
import TreatmentPlanDetails from '../../pages/patient/health-history/treatment-plans/TreatmentPlanDetails';
import MedicalDocuments from '../../pages/patient/health-history/medical-documents/MedicalDocuments';
import ViewDocument from '../../pages/patient/health-history/medical-documents/ViewDocument';

const HealthHistoryRoutes = () => (
  <Routes >
    <Route index element={<HealthHistory />} />
    <Route path="avaliacoes">
      <Route index element={<Assessments />} />
      <Route path=":assessmentId/detalhes" element={<AssessmentDetails />} />
    </Route>
    <Route path="planos">
      <Route index element={<TreatmentPlans />} />
      <Route path=":planId/detalhes" element={<TreatmentPlanDetails />} />
    </Route>
    <Route path="documentos">
      <Route index element={<MedicalDocuments />} />
      <Route path=":documentId/visualizar" element={<ViewDocument />} />
    </Route>
  </Routes>
);

export default HealthHistoryRoutes;