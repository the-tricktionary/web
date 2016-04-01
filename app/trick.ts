export class Trick {
  id: number;
  level: string;
  subs: {
    id2: number;
    name: string;
    video: string;
    description?: string;
    perquisites?: {
      id1?: number;
      id2?: number;
      name?: string;
    }[]
    type?: string;
  }[];
}
