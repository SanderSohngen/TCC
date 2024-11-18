import { Routes, Route } from 'react-router-dom';
import MyAppointments from '../../pages/patient/my-appointments/MyAppointments';
import AppointmentDetails from '../../pages/patient/my-appointments/AppointmentDetails';
import RescheduleAppointment from '../../pages/patient/my-appointments/RescheduleAppointment';
import CancelAppointment from '../../pages/patient/my-appointments/CancelAppointment';

const MyAppointmentRoutes = () => (
  <Routes>
    <Route index element={<MyAppointments />} />
    <Route path=":appointmentId" element={<AppointmentDetails />} />
    <Route path=":appointmentId/remarcar" element={<RescheduleAppointment />} />
    <Route path=":appointmentId/cancelar" element={<CancelAppointment />} />
  </Routes>
);

export default MyAppointmentRoutes;