import { Routes, Route } from 'react-router-dom';
import ScheduleAppointment from '../../pages/patient/schedule-appointment/ScheduleAppointment';
import ConfirmAppointment from '../../pages/patient/schedule-appointment/ConfirmAppointment';

const ScheduleAppointmentRoutes = () => (
  <Routes>
    <Route index element={<ScheduleAppointment />} />
    <Route path="confirmar/:slotId" element={<ConfirmAppointment />} />
  </Routes>
);

export default ScheduleAppointmentRoutes;