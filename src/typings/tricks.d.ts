interface Trick {
  by: string;
  description: string;
  level: number;
  name: string;
  oldid?: number;
  slowMoStart?: number;
  alternativeNames?: string[];
  slug: string;
  type: string;
  id: string;

  videos: any;
  i18n: any;
  levels: any;
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
