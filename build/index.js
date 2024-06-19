"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var faceapi = __importStar(require("@vladmandic/face-api/dist/face-api.node-gpu.js"));
var tf = __importStar(require("@tensorflow/tfjs-node-gpu"));
var image = __importStar(require("@canvas/image"));
var FOLDER_LOCATION = "Z:\\PhotoDisplay";
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
var loadLocalImage = function (imageFile) { return __awaiter(void 0, void 0, void 0, function () {
    var buffer, canvas, imageData, tensor;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                buffer = fs_1.default.readFileSync(imageFile);
                return [4 /*yield*/, image.imageFromBuffer(buffer)];
            case 1:
                canvas = _a.sent();
                imageData = image.getImageData(canvas);
                tensor = tf.tidy(function () {
                    var data = tf.tensor(new Uint8Array((imageData === null || imageData === void 0 ? void 0 : imageData.data) || []), [canvas.height, canvas.width, 4], 'int32'); // create rgba image tensor from flat array and flip to height x width
                    var channels = tf.split(data, 4, 2); // split rgba to channels
                    var rgb = tf.stack([channels[0], channels[1], channels[2]], 2); // stack channels back to rgb
                    var reshape = tf.reshape(rgb, [1, canvas.height, canvas.width, 3]); // move extra dim from the end of tensor and use it as batch number instead
                    return reshape;
                });
                return [2 /*return*/, tensor];
        }
    });
}); };
var scanForFiles = function () { return __awaiter(void 0, void 0, void 0, function () {
    var allFiles, imageFiles, faceFiles, files;
    return __generator(this, function (_a) {
        console.log("Scanning folder: ".concat(FOLDER_LOCATION));
        if (!FOLDER_LOCATION) {
            throw new Error("Folder location not provided");
        }
        allFiles = fs_1.default.readdirSync(FOLDER_LOCATION);
        imageFiles = allFiles.filter(function (file) {
            var extension = path_1.default.extname(file).toLowerCase();
            return extension === '.jpg' || extension === '.jpeg' || extension === '.png';
        });
        faceFiles = allFiles.filter(function (file) {
            var extension = path_1.default.extname(file).toLowerCase();
            return extension.includes('.face');
        });
        files = imageFiles.map(function (image) {
            var face = faceFiles.find(function (face) {
                return face.includes(path_1.default.basename(image, path_1.default.extname(image)));
            });
            return { image: image, face: face };
        });
        return [2 /*return*/, files];
    });
}); };
var createFaceFile = function (photo) { return __awaiter(void 0, void 0, void 0, function () {
    var tensor, options, detection, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, loadLocalImage("".concat(FOLDER_LOCATION, "\\").concat(photo.image))];
            case 1:
                tensor = _a.sent();
                options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.1, maxResults: 10 });
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 6]);
                if (!tensor) {
                    console.log("Error loading image for ".concat(photo.image));
                    return [2 /*return*/, null];
                }
                console.log("Loaded image for ".concat(photo.image));
                return [4 /*yield*/, faceapi.detectAllFaces(tensor, options)];
            case 3:
                detection = _a.sent();
                console.log("Detecting face for ".concat(photo.image, "::"), JSON.stringify(detection, null, 2));
                return [3 /*break*/, 6];
            case 4:
                error_1 = _a.sent();
                console.log("Error detecting face for ".concat(photo.image, "::"), error_1);
                return [2 /*return*/, null];
            case 5:
                if (tensor) {
                    tensor.dispose();
                }
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/, null];
        }
    });
}); };
var doWork = function () { return __awaiter(void 0, void 0, void 0, function () {
    var files, filesWithNoFaces, modelPath, i, faceData, faceFilePath;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, scanForFiles()];
            case 1:
                files = _a.sent();
                filesWithNoFaces = files.filter(function (file) { return !file.face; });
                modelPath = 'models/';
                return [4 /*yield*/, faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath)];
            case 2:
                _a.sent();
                return [4 /*yield*/, faceapi.nets.ageGenderNet.loadFromDisk(modelPath)];
            case 3:
                _a.sent();
                return [4 /*yield*/, faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath)];
            case 4:
                _a.sent();
                return [4 /*yield*/, faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath)];
            case 5:
                _a.sent();
                return [4 /*yield*/, faceapi.nets.faceExpressionNet.loadFromDisk(modelPath)];
            case 6:
                _a.sent();
                console.log("Are we fucking loaded?", faceapi.nets.ssdMobilenetv1.isLoaded);
                i = 0;
                _a.label = 7;
            case 7:
                if (!(i < 10)) return [3 /*break*/, 10];
                return [4 /*yield*/, createFaceFile(filesWithNoFaces[i])];
            case 8:
                faceData = _a.sent();
                if (!faceData) {
                    console.log("Error creating face file for ".concat(filesWithNoFaces[i].image));
                    return [3 /*break*/, 9];
                }
                faceFilePath = path_1.default.join("Z:\\PhotoDisplay", path_1.default.basename(filesWithNoFaces[i].image, path_1.default.extname(filesWithNoFaces[i].image)) + ".face");
                fs_1.default.writeFileSync(faceFilePath, JSON.stringify(faceData, null, 2));
                console.log("".concat(i + 1, " of ").concat(filesWithNoFaces.length, " complete"));
                _a.label = 9;
            case 9:
                i++;
                return [3 /*break*/, 7];
            case 10:
                ;
                return [2 /*return*/];
        }
    });
}); };
doWork();
