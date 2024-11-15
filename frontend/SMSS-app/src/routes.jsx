import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
// import Schedule from './pages/Schedule';
// import Evaluation from './pages/Evaluation';
// import PatientEvaluation from './pages/PatientEvaluation';
// import DietPlan from './pages/DietPlan';
// import PatientDietPlan from './pages/PatientDietPlan';
// import Appointment from './pages/Appointment';
// import PatientAppointment from './pages/PatientAppointment';
import ErrorPage from './pages/ErrorPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

const routes = createRoutesFromElements(
    <Route element={<MainLayout />}>
      <Route path="/" element={<Home />} />
      <Route element={<ProtectedRoute />}>
        {/* <Route path="agenda" element={<Schedule />} />
        <Route path="avaliacao" element={<Evaluation />} />
        <Route path="avaliacao/:patientId" element={<PatientEvaluation />} />
        <Route path="plano-alimentar" element={<DietPlan />} />
        <Route path="plano-alimentar/:patientId" element={<PatientDietPlan />} />
        <Route path="consulta" element={<Appointment />} />
        <Route path="consulta/:patientId" element={<PatientAppointment />} /> */}
      </Route>
      <Route path="*" element={<ErrorPage />} />
    </Route>
);

export const router = createBrowserRouter(routes);