/* student.js
  - captures multiple images from webcam
  - prepares FormData with student info and images
  - posts to /api/students/register
*/

const video = document.getElementById('video');
const canvas = document.getElementById('captureCanvas');
const captureBtn = document.getElementById('captureBtn');
const thumbs = document.getElementById('thumbs');
const photoCount = document.getElementById('photoCount');
const clearPhotosBtn = document.getElementById('clearPhotos');
const fileInput = document.getElementById('fileInput');
const studentForm = document.getElementById('studentForm');

let capturedBlobs = []; // array of Blob objects (images)

// start webcam if available
async function startWebcam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    video.srcObject = stream;
    return true;
  } catch (err) {
    console.warn('Webcam not available', err);
    captureBtn.disabled = true;
    return false;
  }
}

function updateThumbs() {
  thumbs.innerHTML = '';
  capturedBlobs.forEach((b, idx) => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(b);
    img.className = 'thumb';
    thumbs.appendChild(img);
  });
  photoCount.textContent = `${capturedBlobs.length} photos`;
}

captureBtn.addEventListener('click', () => {
  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  canvas.toBlob((blob) => {
    capturedBlobs.push(blob);
    updateThumbs();
  }, 'image/jpeg', 0.85);
});

// allow files from disk to be appended to capturedBlobs for upload
fileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  files.forEach((f) => {
    // we convert to Blob (File is a Blob already)
    capturedBlobs.push(f);
  });
  updateThumbs();
});

clearPhotosBtn.addEventListener('click', () => {
  capturedBlobs = [];
  fileInput.value = '';
  updateThumbs();
});

// submit registration
studentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // validate required fields
  const fullName = document.getElementById('fullName').value.trim();
  const matric = document.getElementById('matric').value.trim();
  const institution = document.getElementById('institution').value.trim();
  const faculty = document.getElementById('faculty').value.trim();
  const email = document.getElementById('email').value.trim();

  if (!fullName || !matric || !institution || !faculty || !email) {
    alert('Please fill all required fields.');
    return;
  }

  if (capturedBlobs.length < 3) {
    const ok = confirm('We recommend at least 3 photos. Continue with ' + capturedBlobs.length + ' photos?');
    if (!ok) return;
  }

  const formData = new FormData();
  formData.append('fullName', fullName);
  formData.append('matric', matric);
  formData.append('institution', institution);
  formData.append('faculty', faculty);
  formData.append('program', document.getElementById('program').value.trim());
  formData.append('email', email);
  formData.append('phone', document.getElementById('phone').value.trim());
  formData.append('gender', document.getElementById('gender').value);

  // attach images
  capturedBlobs.forEach((b, i) => {
    // ensure we name files uniquely
    formData.append('photos', b, `${matric}_${i}.jpg`);
  });

  // show loading UI
  submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Uploading...';

  try {
    const res = await fetch('/api/students/register', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Upload failed');
    }

    alert('Registration submitted successfully. Wait for admin approval if required.');
    // clear form
    studentForm.reset();
    capturedBlobs = [];
    updateThumbs();
  } catch (err) {
    console.error(err);
    alert('Upload failed: ' + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Registration';
  }
});

// start webcam on load
startWebcam().then(() => {
  // no op
});
