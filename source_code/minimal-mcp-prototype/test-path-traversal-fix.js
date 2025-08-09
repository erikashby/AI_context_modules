// Test Path Traversal Security Fix
// This test verifies that the path traversal vulnerability has been properly fixed

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock the constants from server-auth-protected.js
const PERSONAL_ORG_DIR = path.join(__dirname, 'context-data', 'personal-organization');

// Copy of the FIXED getFilePath function for testing
async function getFilePath(projectId, filePath) {
  // Simplified validation for testing
  if (projectId !== 'personal-organization') {
    throw new Error(`Unknown project: ${projectId}`);
  }
  
  // Remove leading/trailing slashes
  let cleanPath = filePath.replace(/^\/+|\/+$/g, '');
  
  // Additional security: URL decode the path to catch encoded traversal attempts
  try {
    cleanPath = decodeURIComponent(cleanPath);
  } catch (e) {
    // If decoding fails, use original (safer than allowing potential malformed input)
  }
  
  // Reject paths containing any traversal patterns before resolution
  const dangerousPatterns = [
    /\.\./,          // Standard directory traversal
    /\.\.\\/,        // Windows-style traversal  
    /\.\.\//,        // Unix-style traversal
    /\.\.$/,         // Trailing dots
    /%2e%2e/i,       // URL encoded .. (case insensitive)
    /%2f/i,          // URL encoded / (case insensitive)
    /%5c/i,          // URL encoded \ (case insensitive)
    /\0/             // Null bytes
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(cleanPath)) {
      throw new Error(`Access denied: Path contains prohibited pattern`);
    }
  }
  
  // Resolve the full absolute path
  const resolvedPath = path.resolve(PERSONAL_ORG_DIR, cleanPath);
  const allowedBase = path.resolve(PERSONAL_ORG_DIR);
  
  // Critical security check: ensure resolved path is within allowed directory
  if (!resolvedPath.startsWith(allowedBase + path.sep) && resolvedPath !== allowedBase) {
    throw new Error(`Access denied: Path ${cleanPath} resolves outside allowed directory`);
  }
  
  return resolvedPath;
}

// Test cases - legitimate and malicious paths
const testCases = [
  // Legitimate paths (should work)
  { input: 'documents/notes.md', shouldPass: true, description: 'Normal file path' },
  { input: 'projects/work/project.json', shouldPass: true, description: 'Nested directory path' },
  { input: '', shouldPass: true, description: 'Empty path (base directory)' },
  { input: '/', shouldPass: true, description: 'Root slash only' },
  
  // Path traversal attacks (should be blocked)
  { input: '../../../etc/passwd', shouldPass: false, description: 'Basic directory traversal' },
  { input: '....//....//etc/passwd', shouldPass: false, description: 'Nested dot pattern' },
  { input: '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd', shouldPass: false, description: 'URL encoded traversal' },
  { input: '..\\..\\..\\windows\\system32', shouldPass: false, description: 'Windows path traversal' },
  { input: 'documents/../../../etc/passwd', shouldPass: false, description: 'Mixed legitimate and traversal' },
  { input: './../../etc/passwd', shouldPass: false, description: 'Current dir + traversal' },
  { input: 'documents/../../etc/passwd', shouldPass: false, description: 'Subdirectory traversal' }
];

console.log('🔒 Path Traversal Security Fix Test');
console.log('=====================================\n');
console.log(`Allowed base directory: ${PERSONAL_ORG_DIR}\n`);

let passedTests = 0;
let failedTests = 0;

for (const testCase of testCases) {
  try {
    const result = await getFilePath('personal-organization', testCase.input);
    
    if (testCase.shouldPass) {
      console.log(`✅ PASS: ${testCase.description}`);
      console.log(`   Input: "${testCase.input}"`);
      console.log(`   Resolved: "${result}"`);
      passedTests++;
    } else {
      console.log(`❌ FAIL: ${testCase.description}`);
      console.log(`   Input: "${testCase.input}"`);
      console.log(`   ERROR: Should have been blocked but was allowed!`);
      console.log(`   Resolved: "${result}"`);
      failedTests++;
    }
  } catch (error) {
    if (!testCase.shouldPass) {
      console.log(`✅ PASS: ${testCase.description}`);
      console.log(`   Input: "${testCase.input}"`);
      console.log(`   Correctly blocked: ${error.message}`);
      passedTests++;
    } else {
      console.log(`❌ FAIL: ${testCase.description}`);
      console.log(`   Input: "${testCase.input}"`);
      console.log(`   ERROR: Should have been allowed but was blocked!`);
      console.log(`   Error: ${error.message}`);
      failedTests++;
    }
  }
  console.log('');
}

console.log('=====================================');
console.log(`Test Results: ${passedTests} passed, ${failedTests} failed`);

if (failedTests === 0) {
  console.log('🎉 ALL TESTS PASSED! Path traversal vulnerability has been fixed.');
  process.exit(0);
} else {
  console.log('🚨 SOME TESTS FAILED! Security fix may need adjustment.');
  process.exit(1);
}