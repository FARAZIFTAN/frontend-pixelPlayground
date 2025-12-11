// Test file utility functions
import { getFileExtension, getMimeType } from '../src/lib/fileUtils';

console.log('=== Testing File Utility Functions ===\n');

// Test 1: getFileExtension with various URLs
console.log('Test 1: getFileExtension()');
console.log('---');

const testUrls = [
  '/uploads/composites/photo-123.jpg',
  '/uploads/composites/image.png',
  'https://example.com/photo.jpeg?v=123',
  'https://cdn.example.com/image.webp#hash',
  '/api/composite/693a39338419390c370b629e.jpg',
  '/path/without/extension',
  'data:image/png;base64,iVBORw...',
];

testUrls.forEach(url => {
  const ext = getFileExtension(url);
  console.log(`URL: ${url}`);
  console.log(`Extension: ${ext}`);
  console.log('');
});

// Test 2: getMimeType
console.log('\nTest 2: getMimeType()');
console.log('---');

const extensions = ['.jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
extensions.forEach(ext => {
  const mime = getMimeType(ext);
  console.log(`Extension: ${ext} -> MIME: ${mime}`);
});

console.log('\n=== All Tests Completed ===');
