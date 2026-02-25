export type CBCRating = 'EE' | 'ME' | 'AE' | 'BE';

export interface LearningArea {
  id: string;
  name: string;
  code: string;
  gradeIds: string[];
  strands: Strand[];
}

export interface Strand {
  id: string;
  learningAreaId: string;
  name: string;
  subStrands: SubStrand[];
  requiredEvidenceCount: number;
}

export interface SubStrand {
  id: string;
  strandId: string;
  name: string;
}

export type EvidenceType =
  | 'photo'
  | 'video'
  | 'document'
  | 'drawing'
  | 'craft_photo'
  | 'written_work'
  | 'audio';

export type EvidenceVisibility = 'draft' | 'published';

export interface PortfolioEvidence {
  id: string;
  studentId: string;
  learningAreaId: string;
  strandId: string;
  subStrandId: string;
  termId: string;
  title: string;
  description: string;
  evidenceType: EvidenceType;
  fileUrls: string[];
  thumbnailUrl: string;
  teacherObservation: string;
  cbcRating: CBCRating;
  dateOfActivity: string;
  uploadedBy: string;
  visibility: EvidenceVisibility;
  createdAt: string;
  updatedAt: string;
}

export interface StudentPortfolio {
  id: string;
  studentId: string;
  termId: string;
  completionPercentage: number;
  evidenceItems: PortfolioEvidence[];
  learningAreaSummaries: LearningAreaSummary[];
  lastUpdated: string;
}

export interface LearningAreaSummary {
  learningAreaId: string;
  completedStrands: number;
  totalStrands: number;
  evidenceCount: number;
  overallRating: CBCRating | null;
}
