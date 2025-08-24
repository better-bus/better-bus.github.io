export interface Bus {
  number: number;
  rows: number;
  ridersPerBench: number;
  shortRearBench?: boolean;
  wheelchairAccessible?: boolean;
  notes?: string;
}

export type GeoPosition = [latitude: number, longitude: number];

export interface Stop {
  id: string;
  nickname: string;
  address: string;
  location: GeoPosition;
  sideOfStreet: Array<'north' | 'south' | 'east' | 'west' | 'northeast' | 'southeast' | 'southwest' | 'northwest'>;
  notes?: string;
}

export type TimeString = string;
export interface Schedule {
  name: string;
  days: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>;
  stops: Array<{ stopId: string, time: TimeString, stopType: 'pick up' | 'drop off' }>;
}

export interface StopAssignment {
  stop: Stop;
  student: Student;
}

export type Grade = 'K' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
export interface Student {
  name: string;
  id: string;
  address: string;
  contact: {
    name: string;
    phone: string;
  };
  grade: Grade;
  school: School;
}

export interface School {
  id: string;
  name: string;
  address: string;
  location: GeoPosition;
  type: 'Preschool' | 'Elementary' | 'Middle' | 'High' | 'K-8' | 'K-12';
  grades: Grade[];
}

export interface SeatAssignment {
  studentId: string;
  seatId: SeatId;
}

export interface Route {
  id: string;
  bus: Bus;
  schedule: Schedule;
  roster: Roster;
}

export interface Roster {
  id: string;
  name: string;
  schoolIds: string[];
  studentIds: string[];
  stopAssignments: StopAssignment[];
}

export type DateString = string;
export type SeatId = string;
export interface StudentBusContext {
  studentId: string;
  busNumber: number;
  hasRidden?: boolean;
  seatingPreferences?: {
    prefer: string[];
    avoid: string[];
  };
  assignedSeat?: SeatId;
  lastRiddenAM?: DateString;
  lastRiddenPM?: DateString;
  rideHistory?: RideHistoryEntry[];
}

export interface RideHistoryEntry {
  date: DateString;
  studentId: string;
  busNumber: number;
  boardedAM?: boolean;
  boardedPM?: boolean;
  seatId: string;
  notes?: string;
}
