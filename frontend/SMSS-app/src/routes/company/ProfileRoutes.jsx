import { Route, Routes } from 'react-router-dom';
import CompanyProfile from '../../pages/company/profile/CompanyProfile';
import EditProfile from '../../pages/company/profile/EditProfile';

const ProfileRoutes = () => (
  <Routes>
    <Route index element={<CompanyProfile />} />
    <Route path="editar" element={<EditProfile />} />
  </Routes>
);

export default ProfileRoutes;