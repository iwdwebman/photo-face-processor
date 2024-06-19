export type Photo = {
   image: string;
   face?: string;
};

export type PhotoList = Photo[];

export type FaceFile = {
   x: number;
   y: number;
   width: number;
   height: number;
   confidence: number;
}[];