import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import ProtectedRoute from './ProtectedRoute';
import ErrorPage from '../pages/ErrorPage';
import PatientRoutes from './patient/PatientRoutes';
import ProfessionalRoutes from './professional/ProfessionalRoutes';
import CompanyRoutes from './company/CompanyRoutes';

const routes = createRoutesFromElements(
  <Route path="" element={<MainLayout />}>
    <Route path="/" element={<Home />} />
    <Route element={<ProtectedRoute allowedUserType="patient" />}>
      {PatientRoutes()}
    </Route>
    <Route element={<ProtectedRoute allowedUserType="professional" />}>
      {ProfessionalRoutes()}
    </Route>
    <Route element={<ProtectedRoute allowedUserType="company" />}>
      {CompanyRoutes()}
    </Route>
    <Route path="*" element={<ErrorPage />} />
  </Route>
);

const router = createBrowserRouter(routes);

export default router;