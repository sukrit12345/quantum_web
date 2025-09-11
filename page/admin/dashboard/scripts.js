// mothergame/page/admin/dashboard/scripts.js
document.addEventListener('DOMContentLoaded', async () => {
    const adminRoleDisplay = document.getElementById('adminRoleDisplay');
    const adminWelcomeIdCardNumber = document.getElementById('adminWelcomeIdCardNumber'); // ดึง Element ที่เพิ่มเข้ามา
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    const idCardNumber = localStorage.getItem('idCardNumber'); // ดึงเลขบัตรประชาชนจาก localStorage

    if (!userId || userRole !== 'admin') {
        alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ หรือไม่ได้เข้าสู่ระบบในฐานะแอดมิน');
        window.location.href = '/index.html';
        return;
    }

    adminRoleDisplay.textContent = `เข้าสู่ระบบในฐานะ: แอดมิน`;
    adminWelcomeIdCardNumber.textContent = `เลขบัตรประชาชน: ${idCardNumber}`; // แสดงเลขบัตรประชาชน

    try {
        const response = await window.makeAuthenticatedApiRequest('/admin/dashboard', 'GET');
        console.log('Admin Dashboard Data:', response);
    } catch (error) {
        alert(`ไม่สามารถดึงข้อมูลแดชบอร์ดแอดมินได้: ${error.message}`);
        // >>> ตรงนี้คือจุดที่จับ Error และแจ้งเตือน
        if (error.message.includes('token failed') || error.message.includes('Not authorized')) {
            localStorage.clear();
            window.location.href = '/index.html';
        }
    }
});