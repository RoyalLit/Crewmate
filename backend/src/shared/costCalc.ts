export function calculateFarePerSeat(totalFare: number, seats: number): number {
  if (seats <= 0) return 0;
  return Math.ceil(totalFare / seats);
}

export function calculateTotalFare(farePerSeat: number, seats: number): number {
  return farePerSeat * seats;
}
