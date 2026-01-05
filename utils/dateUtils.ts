
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDayOfWeek = (dateString: string): number => {
  // Criar data garantindo que seja interpretada como local e não UTC
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getDay();
};

export const isSunday = (dateString: string): boolean => {
  return getDayOfWeek(dateString) === 0;
};

export const generateTimeSlots = (start: number, end: number): string[] => {
  const slots = [];
  for (let i = start; i < end; i++) {
    slots.push(`${i.toString().padStart(2, '0')}:00`);
  }
  return slots;
};

export const getNextHour = (time: string): string => {
  const hour = parseInt(time.split(':')[0]);
  return `${(hour + 1).toString().padStart(2, '0')}:00`;
};
