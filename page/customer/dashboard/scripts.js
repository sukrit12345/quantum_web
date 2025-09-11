// mothergame/page/customer/dashboard/scripts.js
document.addEventListener('DOMContentLoaded', async () => {
    const coinBalanceDisplay = document.getElementById('customerCoinBalance');
    const userRoleDisplay = document.getElementById('userRoleDisplay');
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    const idCardNumber = localStorage.getItem('idCardNumber'); // ดึงเลขบัตรประชาชนจาก localStorage

    if (!userId || userRole !== 'customer') {
        alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ หรือไม่ได้เข้าสู่ระบบ');
        window.location.href = '/index.html';
        return;
    }

    userRoleDisplay.textContent = `(เลขบัตรประชาชน: ${idCardNumber})`; // แสดงเลขบัตรประชาชน
    
    try {
        const response = await window.makeAuthenticatedApiRequest(`/customer/dashboard`, 'GET');
        coinBalanceDisplay.textContent = parseFloat(response.coinBalance).toFixed(2);
        localStorage.setItem('userBalance', response.coinBalance);
        localStorage.setItem('idCardNumber', response.idCardNumber); // อัปเดต idCardNumber ใน localStorage ด้วย
    } catch (error) {
        alert(`ไม่สามารถดึงข้อมูลแดชบอร์ดได้: ${error.message}`);
        if (error.message.includes('token failed') || error.message.includes('Not authorized')) {
            localStorage.clear();
            window.location.href = '/index.html';
        }
    }
});