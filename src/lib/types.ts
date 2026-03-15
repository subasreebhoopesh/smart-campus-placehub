export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  phone: string;
  branch: string;
  cgpa: number;
  skills: string[];
  placementStatus: 'placed' | 'unplaced' | 'not-eligible';
  company?: string;
  package?: number;
  resumeUrl?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  jobRoles: string[];
  packageOffered: { min: number; max: number };
  visitHistory: { date: string; studentsHired: number }[];
  logo?: string;
  createdAt: string;
}

export interface PlacementDrive {
  id: string;
  companyId: string;
  companyName: string;
  jobRole: string;
  date: string;
  eligibleBranches: string[];
  minCgpa: number;
  packageOffered: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  registeredStudents: number;
  selectedStudents: number;
  description: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: 'placement' | 'drive' | 'registration' | 'company';
  message: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  avatar?: string;
}

export type Branch = 'CSE' | 'ECE' | 'EEE' | 'MECH' | 'CIVIL' | 'IT';

export const BRANCHES: Branch[] = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];
