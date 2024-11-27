import { useEffect, useState, forwardRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import ptLocale from '@fullcalendar/core/locales/pt';
import { Box } from '@chakra-ui/react';
import Loading from '../Loading/Loading';

const Calendar = forwardRef(({ data, getTitle, getColor, onEventClick }, ref) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (data) {
      const formattedEvents = data.map((item) => ({
        id: item.id,
        title: getTitle(item),
        start: item.start,
        end: item.end || calculateEndTime(item.start),
        color: getColor(item),
      }));
      setEvents(formattedEvents);
    }
  }, [data, getTitle, getColor]);

  if (!data) return <Loading />;

  return (
    <Box mt={4} maxW="container.lg" mx="auto">
      <FullCalendar
        locale={ptLocale}
        plugins={[timeGridPlugin, dayGridPlugin]}
        initialView="timeGridWeek"
        contentHeight={500}
        events={events}
        headerToolbar={{
          start: 'prev,next today',
          center: 'title',
          end: 'timeGridDay,timeGridWeek,dayGridMonth',
        }}
        buttonText={{
          today: 'Hoje',
          month: 'Mês',
          week: 'Semana',
          day: 'Dia',
        }}
        allDaySlot={false}
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        eventClick={onEventClick}
        displayEventTime={false}
      />
    </Box>
  );
});

const calculateEndTime = (startTime) => {
  return new Date(new Date(startTime).getTime() + 60 * 60 * 1000).toISOString();
};

export default Calendar;