interface Ride {
  departureDate?: string;
  departureTime?: string;
  status?: string;
}

export const getDerivedRideStatus = (ride: Ride): 'active' | 'completed' | 'cancelled' | 'expired' => {
  if (!ride) return 'active';
  
  if (ride.status === 'cancelled') return 'cancelled';
  if (ride.status === 'completed') return 'completed';
  if (ride.status === 'expired') return 'expired';

  if (ride.departureDate && ride.departureTime) {
    const departureTimeMs = new Date(`${ride.departureDate}T${ride.departureTime}:00`).getTime();
    const now = new Date().getTime();
    // 10 minutes past departure
    if (now > departureTimeMs + 10 * 60 * 1000) {
      return 'completed';
    }
  }

  return (ride.status || 'active') as 'active' | 'completed' | 'cancelled' | 'expired';
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parts[0].substring(2); // "26"
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
  }
  return dateString;
};
