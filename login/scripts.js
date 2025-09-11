// mothergame/page/login/scripts.js
document.addEventListener('DOMContentLoaded', () => {
    const customerBtn = document.getElementById('customerBtn');
    const staffBtn = document.getElementById('staffBtn');
    const loginBtn = document.getElementById('loginBtn');
    const idCardInput = document.getElementById('id_card_number');
    const passwordInput = document.getElementById('passwordInput');
    const togglePassword = document.getElementById('togglePassword');
    const eyeIcon = document.getElementById('eyeIcon');

    let selectedRole = 'customer'; // Default role

    function updateRoleButtons() {
        customerBtn.classList.remove('bg-blue-500', 'text-white', 'shadow-md');
        staffBtn.classList.remove('bg-blue-500', 'text-white', 'shadow-md');

        if (selectedRole === 'customer') {
            customerBtn.classList.add('bg-blue-500', 'text-white', 'shadow-md');
        } else {
            staffBtn.classList.add('bg-blue-500', 'text-white', 'shadow-md');
        }
    }

    updateRoleButtons();

    customerBtn.addEventListener('click', () => {
        selectedRole = 'customer';
        updateRoleButtons();
    });

    staffBtn.addEventListener('click', () => {
        selectedRole = 'admin';
        updateRoleButtons();
    });

    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        eyeIcon.classList.toggle('fa-eye');
        eyeIcon.classList.toggle('fa-eye-slash');
    });

    loginBtn.addEventListener('click', async () => {
        const idCardNumber = idCardInput.value.trim();
        const password = passwordInput.value.trim();

        if (!idCardNumber || !password) {
            alert('กรุณากรอกเลขบัตรประชาชนและรหัสผ่านให้ครบถ้วน');
            return;
        }

        try {
            const response = await window.makeAuthenticatedApiRequest('/auth/login', 'POST', {
                idCardNumber,
                password,
                role: selectedRole
            });

            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('userRole', response.user.role); // เก็บ role ของผู้ใช้
            localStorage.setItem('userId', response.user.userId); // เก็บ userId
            localStorage.setItem('userBalance', response.user.coinBalance); // เก็บยอดคอยน์
            localStorage.setItem('idCardNumber', response.user.idCardNumber); // <<< เพิ่มบรรทัดนี้ลงไป


            const userRole = response.user.role.trim(); // เพิ่ม .trim() เพื่อความปลอดภัย
            if (userRole === 'customer') {
                window.location.href = '/page/customer/dashboard/index.html';
            } else if (userRole === 'admin') { // ใช้ else if เพื่อตรวจสอบบทบาท admin โดยเฉพาะ
                window.location.href = '/page/admin/dashboard/index.html';
            } else {
                alert('บทบาทผู้ใช้ไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ');
                localStorage.clear(); // ล้างข้อมูลที่ไม่ถูกต้อง
                window.location.href = '../../../login/index.html';
            }
        } catch (error) {
            alert(`เข้าสู่ระบบไม่สำเร็จ: ${error.message}`);
        }
    });
});