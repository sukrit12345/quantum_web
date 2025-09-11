// mothergame/page/customer/authen/1_signup/scripts.js
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const idCardNumber = document.getElementById('signup_id_card_number').value.trim();
            const email = document.getElementById('signup_email').value.trim();
            const password = document.getElementById('signup_password').value.trim();
            const confirmPassword = document.getElementById('confirm_password').value.trim();

            if (password !== confirmPassword) {
                alert('รหัสผ่านไม่ตรงกัน');
                return;
            }

            if (!idCardNumber || !email || !password) {
                alert('กรุณากรอกข้อมูลให้ครบถ้วน');
                return;
            }

            try {
                const response = await window.makeAuthenticatedApiRequest('/auth/register', 'POST', {
                    idCardNumber,
                    email,
                    password
                });
                alert(response.message);
                window.location.href = '/index.html'; // กลับไปหน้า Login
            } catch (error) {
                alert(`สมัครสมาชิกไม่สำเร็จ: ${error.message}`);
            }
        });
    }
});