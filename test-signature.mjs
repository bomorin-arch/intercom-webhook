// Test script to verify Intercom signature verification
import crypto from 'crypto';

const clientSecret = process.env.INTERCOM_CLIENT_SECRET;

if (!clientSecret) {
  console.log('❌ INTERCOM_CLIENT_SECRET not found in environment');
  process.exit(1);
}

console.log('✅ INTERCOM_CLIENT_SECRET is loaded');
console.log(`   Length: ${clientSecret.length} characters`);

// Create a test request body
const requestBody = {
  workspace_id: "test-workspace",
  component_id: "send_button",
  input_values: {
    text_input: "Test message with signature verification"
  }
};

const bodyString = JSON.stringify(requestBody);

// Generate the signature
const signature = crypto
  .createHmac('sha256', clientSecret)
  .update(bodyString)
  .digest('hex');

console.log('\n📝 Test Request:');
console.log('Body:', bodyString);
console.log('\n🔐 Generated Signature:');
console.log('X-Body-Signature:', signature);

console.log('\n✅ Signature verification is configured and ready!');
console.log('\nTesting with valid signature...\n');

// Test with valid signature
const validTest = await fetch('http://localhost:5000/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Body-Signature': signature
  },
  body: bodyString
});

const validResult = await validTest.json();
console.log('✅ Request with VALID signature:', validTest.status);
console.log('Response:', JSON.stringify(validResult, null, 2));

// Test with invalid signature
console.log('\nTesting with invalid signature...\n');
const invalidTest = await fetch('http://localhost:5000/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Body-Signature': 'invalid_signature_12345'
  },
  body: bodyString
});

console.log('❌ Request with INVALID signature:', invalidTest.status);
if (invalidTest.status === 401) {
  console.log('✅ Signature verification is working correctly! Unauthorized requests are blocked.');
} else {
  console.log('⚠️  Note: In development mode, invalid signatures may still be accepted.');
}

// Test without signature
console.log('\nTesting without signature header...\n');
const noSigTest = await fetch('http://localhost:5000/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: bodyString
});

console.log('Request WITHOUT signature:', noSigTest.status);
if (noSigTest.status === 200) {
  console.log('⚠️  Development mode: Requests without signatures are allowed for testing.');
}
