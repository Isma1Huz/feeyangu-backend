export type ConditionType =
  | 'chronic'
  | 'allergy'
  | 'disability'
  | 'dietary'
  | 'mental_health'
  | 'other';

export type Severity = 'mild' | 'moderate' | 'severe' | 'critical' | 'life_threatening';
export type ConditionStatus = 'active' | 'resolved' | 'monitoring';

export type IncidentType =
  | 'injury'
  | 'illness'
  | 'allergic_reaction'
  | 'mental_health'
  | 'emergency'
  | 'other';

export type VaccinationStatus = 'up_to_date' | 'due_soon' | 'overdue';

export interface StudentHealthProfile {
  id: string;
  studentId: string;
  bloodType: string;
  height: number;
  weight: number;
  visionNotes: string;
  hearingNotes: string;
  generalHealthStatus: string;
  conditions: MedicalCondition[];
  allergies: Allergy[];
  vaccinations: VaccinationRecord[];
  incidents: HealthIncident[];
  emergencyContacts: EmergencyContact[];
  documents: HealthDocument[];
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

export interface MedicalCondition {
  id: string;
  studentId: string;
  name: string;
  type: ConditionType;
  severity: Severity;
  diagnosedDate: string;
  treatingDoctor: string;
  managementNotes: string;
  emergencyActionPlan: string;
  status: ConditionStatus;
  documents: string[];
  createdAt: string;
}

export interface Allergy {
  id: string;
  studentId: string;
  allergen: string;
  allergenCategory: 'food' | 'medication' | 'environmental' | 'insect' | 'other';
  reactionType: string;
  severity: Severity;
  emergencyProtocol: string;
  epiPenAvailable: boolean;
  epiPenLocation: string;
  createdAt: string;
}

export interface VaccinationRecord {
  id: string;
  studentId: string;
  vaccineName: string;
  dateAdministered: string;
  administeredBy: string;
  nextDueDate: string;
  batchNumber: string;
  certificateUrl: string;
  status: VaccinationStatus;
}

export interface HealthIncident {
  id: string;
  studentId: string;
  incidentDate: string;
  incidentTime: string;
  type: IncidentType;
  description: string;
  actionTaken: string;
  reportedBy: string;
  parentNotified: boolean;
  parentNotifiedAt: string;
  externalMedicalHelp: boolean;
  externalMedicalDetails: string;
  photoUrls: string[];
  followUpRequired: boolean;
  followUpDate: string;
  followUpCompleted: boolean;
  followUpNotes: string;
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  studentId: string;
  fullName: string;
  relationship: string;
  primaryPhone: string;
  secondaryPhone: string;
  priority: number;
  notes: string;
}

export interface HealthDocument {
  id: string;
  studentId: string;
  type: 'medical_certificate' | 'vaccination_card' | 'doctor_letter' | 'disability_assessment' | 'insurance_card' | 'other';
  title: string;
  description: string;
  fileUrl: string;
  uploadDate: string;
  uploadedBy: string;
}

export interface HealthUpdateRequest {
  id: string;
  studentId: string;
  parentId: string;
  updateDescription: string;
  status: 'pending' | 'reviewed' | 'applied' | 'declined';
  submittedAt: string;
  reviewedBy: string;
  reviewedAt: string;
  reviewNotes: string;
}
