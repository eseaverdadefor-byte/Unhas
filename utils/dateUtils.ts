
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getDayOfWeek = (dateString: string): number => {
  const date = new Date(dateString + 'T12:00:00'); // Mid-day to avoid TZ issues
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
