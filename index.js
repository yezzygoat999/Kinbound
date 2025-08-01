const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const chokidar = require('chokidar');
require('dotenv').config();

// === CONFIGURATION ===
const API_KEY = 'gxxuaa5ZC0i/pC+kiLnITaTH6K0EIg8FXxrZNYcExQxhnt3jZXlKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNkluTnBaeTB5TURJeExUQTNMVEV6VkRFNE9qVXhPalE1V2lJc0luUjVjQ0k2SWtwWFZDSjkuZXlKaVlYTmxRWEJwUzJWNUlqb2laM2g0ZFdGaE5WcERNR2t2Y0VNcmEybE1ia2xVWVZSSU5rc3dSVWxuT0VaWWVISmFUbGxqUlhoUmVHaHVkRE5xSWl3aWIzZHVaWEpKWkNJNklqRTBOVEkwTVRrMUlpd2lZWFZrSWpvaVVtOWliRzk0U1c1MFpYSnVZV3dpTENKcGMzTWlPaUpEYkc5MVpFRjFkR2hsYm5ScFkyRjBhVzl1VTJWeWRtbGpaU0lzSW1WNGNDSTZNVGMxTkRBM01qRTBPQ3dpYVdGMElqb3hOelUwTURZNE5UUTRMQ0p1WW1ZaU9qRTNOVFF3TmpnMU5EaDkuaTVuOEI4TVR3MnFqOEVpYktacEtQSkx2ZlZ0WDJQVnFIVVVWczg4YUFUNmotaHBYdmtOcGkwekJuSXJsLWxvZHdRUkRCYTc4S3U1UjVwYlE3bG15TmdJVUNkV0ZDMU5HV0lHR1BHcTJIaHpQVW54UGlZQWlpanpGQWdINmxCOFVSYkFaN2ZmLTRlNkdvUmw4YV9IWmJJb0s3WFBCaTRBWjNIZGtEeS1PajVNRWR1bUpRQUNYdktzckxaX2FfcERyaFp4X2FwMmtIWGRZcFpwQ1picnVFc2VUNVNRa1ZudmxsRDZoczY2bldyR0EwNkFYQWc4NjhyQlZCdTdxSFlsTmxnYVhpeWRQcE1tcE0ydXRPR3JVbjNJaWtfQU05bHQwX0x3WmRRSW1KczlpYk0xcElSZmJDdjJjUFQwTDhhOWFLbExpdmQ0bXVjRlB2Y244cVh2Mk1B';
const IMAGE_FOLDER = path.join(__dirname, 'images');
const GROUP_ID = '14524195'; // optional; leave empty if not using a group

// Track uploaded images
const uploaded = new Set();

// Upload function
async function uploadImage(filePath) {
  const fileName = path.basename(filePath);
  if (uploaded.has(fileName)) {
    return; // already uploaded
  }

  console.log(`Uploading: ${fileName}`);
  const form = new FormData();
  form.append('fileContent', fs.createReadStream(filePath));
  form.append('name', path.parse(fileName).name);
  form.append('description', 'Uploaded via Roblox Open Cloud API');
  form.append('assetType', 'Image');
  if (GROUP_ID) form.append('groupId', GROUP_ID);

  try {
    const response = await axios.post(
      'https://apis.roblox.com/assets/v1/assets',
      form,
      {
        headers: {
          'x-api-key': API_KEY,
          ...form.getHeaders(),
        },
        maxBodyLength: Infinity,
      }
    );

    console.log(`✅ Uploaded: ${fileName} | Asset ID: ${response.data.assetId}`);
    uploaded.add(fileName);
  } catch (error) {
    if (error.response) {
      console.error(`❌ Failed to upload ${fileName}:`, error.response.data);
    } else {
      console.error(`❌ Unexpected error with ${fileName}:`, error.message);
    }
  }
}

// Upload all existing images
function uploadAllImages() {
  const imageFiles = fs.readdirSync(IMAGE_FOLDER).filter(file =>
    /\.(png|jpe?g)$/i.test(file)
  );

  for (const file of imageFiles) {
    const fullPath = path.join(IMAGE_FOLDER, file);
    uploadImage(fullPath);
  }
}

// Watch for new files
function watchForNewImages() {
  console.log(`👀 Watching folder: ${IMAGE_FOLDER}`);

  const watcher = chokidar.watch(IMAGE_FOLDER, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: true,
    depth: 0
  });

  watcher.on('add', filePath => {
    if (/\.(png|jpe?g)$/i.test(filePath)) {
      uploadImage(filePath);
    }
  });
}

// === RUN ===
uploadAllImages();
watchForNewImages();
