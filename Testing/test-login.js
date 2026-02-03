/**
 * Test script cho Login API
 * Chạy: node test-login.js
 */

const testCases = [
  {
    name: '✅ Test 1: Đăng nhập thành công',
    data: {
      email: 'test@example.com',
      password: 'password123',
    },
    expectedStatus: 200,
  },
  {
    name: '❌ Test 2: Sai mật khẩu',
    data: {
      email: 'test@example.com',
      password: 'wrongpassword',
    },
    expectedStatus: 401,
  },
  {
    name: '❌ Test 3: Email không tồn tại',
    data: {
      email: 'nonexistent@example.com',
      password: 'password123',
    },
    expectedStatus: 401,
  },
  {
    name: '❌ Test 4: Email không hợp lệ',
    data: {
      email: 'invalid-email',
      password: 'password123',
    },
    expectedStatus: 400,
  },
  {
    name: '❌ Test 5: Thiếu password',
    data: {
      email: 'test@example.com',
    },
    expectedStatus: 400,
  },
];

async function runTest(testCase) {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCase.data),
    });

    const result = await response.json();
    const passed = response.status === testCase.expectedStatus;

    console.log('\n' + testCase.name);
    console.log('Expected Status:', testCase.expectedStatus);
    console.log('Actual Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (response.status === 200 && result.accessToken) {
        console.log('🔑 Token received:', result.accessToken.substring(0, 20) + '...');
    }

    console.log(passed ? '✅ PASSED' : '❌ FAILED');
    console.log('─'.repeat(60));

    return passed;
  } catch (error) {
    console.error('\n❌ Error:', testCase.name);
    console.error(error.message);
    console.log('─'.repeat(60));
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Bắt đầu test Login API...\n');
  console.log('Note: Đảm bảo user "test@example.com" / "password123" đã tồn tại.');
  console.log('Nếu chưa, hãy chạy "node test-register.js" trước.\n');
  console.log('═'.repeat(60));

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    const result = await runTest(testCase);
    if (result) {
      passed++;
    } else {
      failed++;
    }
    // Delay
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📊 KẾT QUẢ TEST');
  console.log('═'.repeat(60));
  console.log(`✅ Passed: ${passed}/${testCases.length}`);
  console.log(`❌ Failed: ${failed}/${testCases.length}`);
  console.log('═'.repeat(60));
}

// Chạy tests
runAllTests().catch(console.error);
