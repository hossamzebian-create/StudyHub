const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function runTests() {
    console.log('--- Starting Backend API Tests ---');
    let token = '';
    let courseId = '';
    let assignmentId = '';
    let examId = '';
    
    // Generate a random email to avoid collision
    const testEmail = `testuser_${Date.now()}@example.com`;

    try {
        // 1. Test Registration
        console.log('1. Testing Registration...');
        const regRes = await axios.post(`${API_URL}/register`, {
            name: 'Integration Test User',
            email: testEmail,
            password: 'password123'
        });
        console.log('   ✅ Registration successful! User ID:', regRes.data.id);

        // 2. Test Login
        console.log('\n2. Testing Login...');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: testEmail,
            password: 'password123'
        });
        token = loginRes.data.token;
        console.log('   ✅ Login successful! Token received.');

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 3. Test Course Creation
        console.log('\n3. Testing Course Creation...');
        const courseRes = await axios.post(`${API_URL}/courses`, {
            name: 'Automated Testing 101',
            code: 'TEST101'
        }, config);
        courseId = courseRes.data.id;
        console.log('   ✅ Course created! Course ID:', courseId);

        // 4. Test Assignment Creation
        console.log('\n4. Testing Assignment Creation...');
        const assnRes = await axios.post(`${API_URL}/assignments`, {
            title: 'Write test scripts',
            description: 'Test the backend APIs',
            due_date: '2026-12-31',
            priority: 'High',
            status: 'Pending',
            course_id: courseId
        }, config);
        assignmentId = assnRes.data.id;
        console.log('   ✅ Assignment created! Assignment ID:', assignmentId);

        // 5. Test Exam Creation
        console.log('\n5. Testing Exam Creation...');
        const examRes = await axios.post(`${API_URL}/exams`, {
            title: 'Final Automated Exam',
            description: 'Pass the tests',
            exam_date: '2026-12-31',
            course_id: courseId
        }, config);
        examId = examRes.data.id;
        console.log('   ✅ Exam created! Exam ID:', examId);

        // 6. Test Dashboard Retrieval
        console.log('\n6. Testing Dashboard Retrieval...');
        const dashRes = await axios.get(`${API_URL}/dashboard`, config);
        console.log('   ✅ Dashboard retrieved! Stats:', dashRes.data.stats);

        // 7. Cleanup
        console.log('\n7. Cleaning up test data...');
        await axios.delete(`${API_URL}/exams/${examId}`, config);
        await axios.delete(`${API_URL}/assignments/${assignmentId}`, config);
        await axios.delete(`${API_URL}/courses/${courseId}`, config);
        console.log('   ✅ Cleanup successful!');

        console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉');
        
    } catch (error) {
        console.error('\n❌ TEST FAILED ❌');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
}

runTests();
