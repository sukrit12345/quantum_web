// mothergame/config/config.js
const BASE_API_URL = 'https://quantumbackend-production.up.railway.app/api';// ตรวจสอบให้แน่ใจว่าตรงกับ PORT ของ Backend ของคุณ

// ฟังก์ชันช่วยในการเรียก API พร้อมการยืนยันตัวตน
async function makeAuthenticatedApiRequest(endpoint, method = 'GET', data = null) {
    const token = localStorage.getItem('accessToken'); // ดึง Token จาก localStorage
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`; // เพิ่ม Token ใน Header
    }

    const options = {
        method,
        headers,
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${BASE_API_URL}${endpoint}`, options);
        const responseData = await response.json();

        if (!response.ok) {
            // จัดการข้อผิดพลาดจาก Backend
            const errorMessage = responseData.message || (responseData.errors && responseData.errors[0] && responseData.errors[0].msg) || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
            throw new Error(errorMessage);
        }

        return responseData;
    } catch (error) {
        console.error(`API Request Error to ${endpoint}:`, error);
        throw error; // ส่ง Error ไปยังฟังก์ชันที่เรียกใช้
    }
}

// ทำให้ฟังก์ชันพร้อมใช้งานแบบ Global
window.BASE_API_URL = BASE_API_URL;
window.makeAuthenticatedApiRequest = makeAuthenticatedApiRequest;