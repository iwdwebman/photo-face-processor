import fs from 'fs';
import path from 'path';
import { PhotoList, Photo, FaceFile } from './types/t_file';
import * as faceapi from '@vladmandic/face-api/dist/face-api.node-gpu.js';
import { loadImage, createCanvas, } from 'canvas';
import * as tf from '@tensorflow/tfjs-node-gpu';
import * as image from '@canvas/image';

const FOLDER_LOCATION = "Z:\\PhotoDisplay";

/*const loadLocalImage = async (path:string) : Promise<tf.Tensor3D | null> => {
   const img = await loadImage(path);
   const canvas = createCanvas(img.width, img.height);
   const ctx = canvas.getContext('2d');
   ctx.drawImage(img, 0, 0, img.width, img.height);
   const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
   
   // Convert ImageData to Uint8Array buffer
   const { data, width, height } = imageData;
   const float32Array = new Float32Array(data);

   return tf.tensor3d(float32Array, [height, width, 4], 'float32');
}*/

const loadLocalImage = async (imageFile: string) : Promise<tf.Tensor<tf.Rank> | null> => {
    const buffer = fs.readFileSync(imageFile); // read image from disk
   const canvas = await image.imageFromBuffer(buffer); // decode to canvas
   const imageData = image.getImageData(canvas); // read decoded image data from canvas

   const tensor = tf.tidy(() => { // create tensor from image data
      const data = tf.tensor(new Uint8Array(imageData?.data || []), [canvas.height, canvas.width, 4], 'int32'); // create rgba image tensor from flat array and flip to height x width
      const channels = tf.split(data, 4, 2); // split rgba to channels
      const rgb = tf.stack([channels[0], channels[1], channels[2]], 2); // stack channels back to rgb
      const reshape = tf.reshape(rgb, [1, canvas.height, canvas.width, 3]); // move extra dim from the end of tensor and use it as batch number instead
      return reshape;
   });

   return tensor;
};

const scanForFiles = async () : Promise<PhotoList> => {

   console.log(`Scanning folder: ${FOLDER_LOCATION}`);

   if (!FOLDER_LOCATION) {
      throw new Error("Folder location not provided");
   }

   const allFiles = fs.readdirSync(FOLDER_LOCATION);

   //Find all jpg, jpeg, png files in the folder
   const imageFiles = allFiles.filter((file) => {
      const extension = path.extname(file).toLowerCase();
      return extension === '.jpg' || extension === '.jpeg' || extension === '.png';
   });

   //Find all .face files in the folder
   const faceFiles = allFiles.filter((file) => {
      const extension = path.extname(file).toLowerCase();
      return extension.includes('.face');
   });

   //Combine the two arrays to create the final list
   const files: PhotoList = imageFiles.map((image) => {
      const face = faceFiles.find((face) => {
         return face.includes(path.basename(image, path.extname(image)));
      });

      return { image, face };
   });

   return files;
}

const createFaceFile = async (photo: Photo) : Promise<FaceFile | null> => {
   const tensor = await loadLocalImage(`${FOLDER_LOCATION}\\${photo.image}`);
   const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.1, maxResults: 10 })

   try {
      if (!tensor) {
         console.log(`Error loading image for ${photo.image}`);
         return null;
      }
      console.log(`Loaded image for ${photo.image}`);
      const detection = await faceapi.detectAllFaces(tensor, options);

      if (detection) {
         const faces = detection.map((face) => {
            return {
               x: face.box.x,
               y: face.box.y,
               width: face.box.width,
               height: face.box.height,
               confidence: face.score
            };
         });

         return faces;
      }

      return [];
   } catch (error) {
      console.log(`Error detecting face for ${photo.image}::`, error);
      return null;
   } finally {
      if (tensor) {
         tensor.dispose();
      }
   }
};

const doWork = async () => {
   const files = await scanForFiles();

   const filesWithNoFaces = files.filter((file) => !file.face);

   const modelPath = 'models/';

   await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
   await faceapi.nets.ageGenderNet.loadFromDisk(modelPath);
   await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
   await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
   await faceapi.nets.faceExpressionNet.loadFromDisk(modelPath);

   console.log("Are we fucking loaded?", faceapi.nets.ssdMobilenetv1.isLoaded);

   for (let i = 0; i < 10; i++) {
      const faceData = await createFaceFile(filesWithNoFaces[i]);

      if (!faceData) {
         console.log(`Error creating face file for ${filesWithNoFaces[i].image}`);
         continue;
      }

      const faceFilePath = path.join("Z:\\PhotoDisplay",
         path.basename(filesWithNoFaces[i].image,
         path.extname(filesWithNoFaces[i].image)) + ".face");

      fs.writeFileSync(faceFilePath, JSON.stringify(faceData, null, 2));

      console.log(`${i + 1} of ${filesWithNoFaces.length} complete`)
   };
};

doWork();