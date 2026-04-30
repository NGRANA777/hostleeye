const https = require('https');
const fs = require('fs');
const path = require('path');

const models = [
  "tiny_face_detector_model-weights_manifest.json",
  "tiny_face_detector_model.weights.bin",
  "face_landmark_68_model-weights_manifest.json",
  "face_landmark_68_model.weights.bin",
  "face_recognition_model-weights_manifest.json",
  "face_recognition_model.weights.bin"
];

const dir = path.join(__dirname, '..', 'public', 'models');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

models.forEach(model => {
  const file = fs.createWriteStream(path.join(dir, model));
  https.get(`https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/${model}`, function(response) {
    if (response.statusCode === 200) {
      response.pipe(file);
      console.log(`Downloaded ${model}`);
    } else {
      console.error(`Failed to download ${model}: ${response.statusCode}`);
    }
  }).on('error', err => {
    console.error(`Error downloading ${model}:`, err);
  });
});
