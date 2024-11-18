import CompanyAccordion from './CompanyAccordion';
import PatientAccordion from './PatientAccordion';
import ProfessionalAccordion from './ProfessionalAccordion';
import { useAuth } from '../../context/AuthContext';

const HomeAccordion = () => {
  const { user } = useAuth();

  switch (user.user_type) {
    case 'company':
      return <CompanyAccordion />;
    case 'patient':
      return <PatientAccordion />;
    case 'professional':
      return <ProfessionalAccordion />;
    default:
      return null;
  }
};

export default HomeAccordion;