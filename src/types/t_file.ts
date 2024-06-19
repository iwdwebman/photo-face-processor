export type Photo = {
   image: string;
   face?: string;
};

export type PhotoList = Photo[];

export type FaceFile = {
   faces: {
      x: number;
      y: number;
      width: number;
      height: number;
   }[];
}