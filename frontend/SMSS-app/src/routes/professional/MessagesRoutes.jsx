import { Route, Routes } from 'react-router-dom';
import Messages from '../../pages/professional/messages/Messages';
import ChatWithPatient from '../../pages/professional/messages/ChatWithPatient';

const MensagensRoutes = () => (
  <Routes>
    <Route index element={<Messages />} />
    <Route path=":appointmentId" element={<ChatWithPatient />} />
  </Routes>
);

export default MensagensRoutes;