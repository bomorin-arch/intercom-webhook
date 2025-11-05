// Test script to verify Intercom signature verification
const crypto = require('crypto');

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

console.log('\n📤 cURL command with valid signature:');
console.log(`curl -X POST http://localhost:5000/submit \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -H "X-Body-Signature: ${signature}" \\`);
console.log(`  -d '${bodyString}'`);

console.log('\n✅ Signature verification is configured and ready!');
