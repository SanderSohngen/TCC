import { Route, Routes } from 'react-router-dom';
import Schedule from '../../pages/professional/schedule/Schedule';
import ConfigureAvailability from '../../pages/professional/schedule/ConfigureAvailability';
import AppointmentDetails from '../../pages/professional/schedule/AppointmentDetails';

const ScheduleRoutes = () => (
  <Routes>
    <Route index element={<Schedule />} />
    <Route path="configurar" element={<ConfigureAvailability />} />
    <Route path="atendimentos/:appointmentId" element={<AppointmentDetails />} />
  </Routes>
);

export default ScheduleRoutes;