import { Route, Routes } from 'react-router-dom';
import Patients from '../../pages/professional/patients/Patients';
import PatientProfile from '../../pages/professional/patients/PatientProfile';
import ConsultationHistory from '../../pages/professional/patients/ConsultationHistory';
import AssessmentHistory from '../../pages/professional/patients/AssessmentHistory';
import PatientTreatmentPlans from '../../pages/professional/patients/PatientTreatmentPlans';

const PatientsRoutes = () => (
  <Routes>
    <Route index element={<Patients />} />
    <Route path=":patientId">
      <Route index element={<PatientProfile />} />
      <Route path="consultas" element={<ConsultationHistory />} />
      <Route path="avaliacoes" element={<AssessmentHistory />} />
      <Route path="planos" element={<PatientTreatmentPlans />} />
    </Route>
  </Routes>
);

export default PatientsRoutes;