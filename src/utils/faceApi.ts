import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export const loadModels = async () => {
  if (modelsLoaded) return true;
  try {
    const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    return true;
  } catch (error) {
    console.error("Error loading face-api models:", error);
    return false;
  }
};

export const getFaceDescriptor = async (videoEl: HTMLVideoElement) => {
  const detection = await faceapi.detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();
  
  return detection;
};

export const matchFace = (descriptor: Float32Array, knownEmbeddings: { id: string, name: string, embeddings: number[][] }[], threshold = 0.5) => {
  if (!knownEmbeddings || knownEmbeddings.length === 0) return null;
  
  // Convert our DB arrays back to LabeledFaceDescriptors
  const labeledDescriptors = knownEmbeddings.map(student => {
    let descriptors: Float32Array[] = [];
    
    // Check if embeddings is a 1D array of numbers (single face) or 2D array (multiple faces)
    if (student.embeddings.length > 0 && typeof student.embeddings[0] === 'number') {
      descriptors = [new Float32Array(student.embeddings as any)];
    } else {
      descriptors = student.embeddings.map((arr: any) => new Float32Array(Object.values(arr)));
    }
    
    return new faceapi.LabeledFaceDescriptors(
      student.id,
      descriptors
    );
  });
  
  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, threshold);
  const bestMatch = faceMatcher.findBestMatch(descriptor);
  
  if (bestMatch.label === 'unknown') return null;
  
  return knownEmbeddings.find(s => s.id === bestMatch.label);
};
