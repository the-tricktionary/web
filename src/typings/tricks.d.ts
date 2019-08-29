interface Trick {
  id: string;
  name: string;
  description: string;
  slug: string;
  type: string;
  by: string;

  levels: TrickLevels;
  videos: VideoIDList;
  i18n: TrickTranslationData;

  level: number;
  oldid?: number;

  slowMoStart?: number;
  alternativeNames?: string[];
  prerequisites: Prerequisite[];
}

interface TrickTranslationData {
  name?: string;
  description?: string;
  alternativeNames?: string[];
}

interface TrickLevels {
  [prop: string]: FederationTrickLevel;
}

interface FederationTrickLevel {
  level: string;

  verified?: TrickVerificationStatus;
}

interface TrickVerificationStatus {
  date: string;
  vLevel: number;
  verified: boolean;
  verifier: string;

  suggested?: string;
}

interface VideoIDList {
  youtube: string;
}

interface Prerequisite {
  discipline?: string
  id: string;
  ref: firebase.firestore.DocumentReference | firebase.firestore.CollectionReference
}

interface Level {
  name: number;
  types: Type[];
}

interface Type {
  name: string;
  tricks: Trick[];
}

interface ListOfTricks {
  [prop: string]: Trick;
}
