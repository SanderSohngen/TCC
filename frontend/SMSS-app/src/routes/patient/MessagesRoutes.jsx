import { Routes, Route } from 'react-router-dom';
import Messages from '../../pages/patient/messages/Messages';
import ChatWithProfessional from '../../pages/patient/messages/ChatWithProfessional';

const MessagesRoutes = () => (
  <Routes>
    <Route index element={<Messages />} />
    <Route path=":appointmentId" element={<ChatWithProfessional />} />
  </Routes>
);

export default MessagesRoutes;
