import { Navigate } from 'react-router-dom';

/* Booking is handled via the modal — redirect to home */
export default function Booking() {
  return <Navigate to="/" replace />;
}

