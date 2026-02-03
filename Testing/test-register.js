/**
 * Test script cho Register API
 * Chạy: node test-register.js
 */

const testCases = [
  {
    name: '✅ Test 1: Đăng ký thành công',
    data: {
      username: 'john_doe',
      email: 'john@example.com',
      password: 'password123',
    },
    expectedStatus: 201,
  },
  {
    name: '❌ Test 2: Username quá ngắn (< 4 ký tự)',
    data: {
      username: 'abc',
      email: 'test@example.com',
      password: 'password123',
    },
    expectedStatus: 400,
  },
  {
    name: '❌ Test 3: Email không hợp lệ',
    data: {
      username: 'testuser',
      email: 'invalid-email',
      password: 'password123',
    },
    expectedStatus: 400,
  },
  {
    name: '❌ Test 4: Password quá ngắn (< 8 ký tự)',
    data: {
      username: 'testuser',
      email: 'test@example.com',
      password: '1234567',
    },
    expectedStatus: 400,
  },
  {
    name: '❌ Test 5: Thiếu trường username',
    data: {
      email: 'test@example.com',
      password: 'password123',
    },
    expectedStatus: 400,
  },
  {
    name: '❌ Test 6: Username đã tồn tại',
    data: {
      username: 'john_doe', // Trùng với test 1
      email: 'another@example.com',
      password: 'password123',
    },
    expectedStatus: 409,
  },
  {
    name: '❌ Test 7: Email đã tồn tại',
    data: {
      username: 'another_user',
      email: 'john@example.com', // Trùng với test 1
      password: 'password123',
    },
    expectedStatus: 409,
  },
];

async function runTest(testCase) {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
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
  console.log('🚀 Bắt đầu test Register API...\n');
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
    // Delay giữa các test
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
