// scripts.js

document.addEventListener('DOMContentLoaded', () => {
    // กำหนด API Base URL จาก config.js หรือใช้ค่าเริ่มต้น
    const API_BASE_URL = window.config?.API_BASE_URL || 'http://localhost:3000/api/auth';

    // อ้างอิงถึงองค์ประกอบ HTML
    const forgotPasswordStep = document.getElementById('forgotPasswordStep');
    const otpVerificationStep = document.getElementById('otpVerificationStep');
    const resetPasswordStep = document.getElementById('resetPasswordStep');

    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const resetEmailInput = document.getElementById('resetEmail');
    const forgotPasswordMessageDiv = document.getElementById('forgotPasswordMessage');
    const sendOtpButton = document.getElementById('sendOtpButton');

    const otpVerificationForm = document.getElementById('otpVerificationForm');
    const otpCodeInput = document.getElementById('otpCode');
    const otpMessageDiv = document.getElementById('otpMessage');
    const verifyOtpButton = document.getElementById('verifyOtpButton');
    const resendOtpButton = document.getElementById('resendOtpButton');

    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    const resetPasswordMessageDiv = document.getElementById('resetPasswordMessage');
    const setNewPasswordButton = document.getElementById('setNewPasswordButton');

    // ตัวแปรสำหรับเก็บข้อมูลระหว่างขั้นตอน
    let currentEmail = '';
    let resetToken = '';
    let resendTimer = 0;
    const RESEND_OTP_COOLDOWN = 60; // วินาที

    // ฟังก์ชันสำหรับแสดง/ซ่อนขั้นตอน
    const showStep = (stepName) => {
        forgotPasswordStep.classList.add('hidden');
        otpVerificationStep.classList.add('hidden');
        resetPasswordStep.classList.add('hidden');

        if (stepName === 'forgotPassword') {
            forgotPasswordStep.classList.remove('hidden');
        } else if (stepName === 'otpVerification') {
            otpVerificationStep.classList.remove('hidden');
        } else if (stepName === 'resetPassword') {
            resetPasswordStep.classList.remove('hidden');
        }
    };

    // ฟังก์ชันสำหรับแสดงข้อความสถานะ
    const displayMessage = (message, colorClass, targetDiv) => {
        targetDiv.textContent = message;
        targetDiv.className = `mt-4 text-center text-sm font-medium ${colorClass}`;
    };

    // ฟังก์ชันสำหรับนับถอยหลังปุ่มส่ง OTP ซ้ำ
    const startResendTimer = () => {
        resendTimer = RESEND_OTP_COOLDOWN;
        resendOtpButton.disabled = true;
        resendOtpButton.textContent = `ส่ง OTP อีกครั้งใน ${resendTimer} วินาที`;

        const timerInterval = setInterval(() => {
            resendTimer--;
            resendOtpButton.textContent = `ส่ง OTP อีกครั้งใน ${resendTimer} วินาที`;
            if (resendTimer <= 0) {
                clearInterval(timerInterval);
                resendOtpButton.disabled = false;
                resendOtpButton.textContent = 'ส่ง OTP อีกครั้ง';
            }
        }, 1000);
    };

    // --- Event Listeners ---

    // Step 1: ส่งรหัส OTP
    forgotPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        currentEmail = resetEmailInput.value.trim();

        if (!currentEmail) {
            displayMessage('กรุณากรอกอีเมลของคุณ.', 'text-red-500', forgotPasswordMessageDiv);
            return;
        }

        displayMessage('กำลังส่งรหัส OTP...', 'text-gray-600', forgotPasswordMessageDiv);
        sendOtpButton.disabled = true;
        sendOtpButton.textContent = 'กำลังส่ง...';

        try {
            const response = await fetch(`${API_BASE_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentEmail })
            });

            const data = await response.json();

            if (response.ok) {
                displayMessage(data.message || 'รหัส OTP ได้ถูกส่งไปยังอีเมลของคุณแล้ว. โปรดตรวจสอบอีเมล.', 'text-green-600', forgotPasswordMessageDiv);
                showStep('otpVerification');
                startResendTimer(); // เริ่มจับเวลาหลังจากส่ง OTP ครั้งแรก
            } else {
                // Backend ส่งข้อความ generic อยู่แล้ว แม้จะเกิดข้อผิดพลาดภายใน
                displayMessage(data.message || 'เกิดข้อผิดพลาดในการส่งรหัส OTP. โปรดลองอีกครั้ง.', 'text-red-500', forgotPasswordMessageDiv);
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            displayMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้. โปรดลองอีกครั้งในภายหลัง.', 'text-red-500', forgotPasswordMessageDiv);
        } finally {
            sendOtpButton.disabled = false;
            sendOtpButton.textContent = 'ส่งรหัส OTP';
        }
    });

    // Step 2: ยืนยัน OTP
    otpVerificationForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const otpCode = otpCodeInput.value.trim();

        if (!otpCode) {
            displayMessage('กรุณากรอกรหัส OTP.', 'text-red-500', otpMessageDiv);
            return;
        }

        displayMessage('กำลังยืนยัน OTP...', 'text-gray-600', otpMessageDiv);
        verifyOtpButton.disabled = true;
        verifyOtpButton.textContent = 'กำลังยืนยัน...';

        try {
            const response = await fetch(`${API_BASE_URL}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentEmail, otpCode: otpCode })
            });

            const data = await response.json();

            if (response.ok) {
                resetToken = data.resetToken; // เก็บ resetToken ที่ได้จาก Backend
                displayMessage(data.message || 'รหัส OTP ถูกต้อง. กรุณาตั้งรหัสผ่านใหม่.', 'text-green-600', otpMessageDiv);
                otpCodeInput.value = ''; // เคลียร์ช่อง OTP
                showStep('resetPassword');
            } else {
                displayMessage(data.message || 'รหัส OTP ไม่ถูกต้องหรือไม่หมดอายุ. โปรดลองอีกครั้ง.', 'text-red-500', otpMessageDiv);
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            displayMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้. โปรดลองอีกครั้งในภายหลัง.', 'text-red-500', otpMessageDiv);
        } finally {
            verifyOtpButton.disabled = false;
            verifyOtpButton.textContent = 'ยืนยัน OTP';
        }
    });

    // Step 2 (ปุ่ม): ส่ง OTP อีกครั้ง
    resendOtpButton.addEventListener('click', async () => {
        if (!currentEmail || resendTimer > 0) return;

        displayMessage('กำลังส่งรหัส OTP อีกครั้ง...', 'text-gray-600', otpMessageDiv);
        resendOtpButton.disabled = true;
        resendOtpButton.textContent = 'กำลังส่ง...';

        try {
            const response = await fetch(`${API_BASE_URL}/forgot-password`, { // ใช้ endpoint เดิมในการส่ง OTP
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentEmail })
            });

            const data = await response.json();

            if (response.ok) {
                displayMessage(data.message || 'รหัส OTP ใหม่ได้ถูกส่งไปยังอีเมลของคุณแล้ว.', 'text-green-600', otpMessageDiv);
                startResendTimer();
            } else {
                displayMessage(data.message || 'เกิดข้อผิดพลาดในการส่งรหัส OTP ซ้ำ. โปรดลองอีกครั้ง.', 'text-red-500', otpMessageDiv);
            }
        } catch (error) {
            console.error('Error resending OTP:', error);
            displayMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้. โปรดลองอีกครั้งในภายหลัง.', 'text-red-500', otpMessageDiv);
        } finally {
            // ไม่ต้องเปิดใช้งานปุ่มทันที ให้ timer เป็นตัวจัดการ
            if (resendTimer <= 0) {
                 resendOtpButton.disabled = false;
                 resendOtpButton.textContent = 'ส่ง OTP อีกครั้ง';
            }
        }
    });


    // Step 3: ตั้งรหัสผ่านใหม่
    resetPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const newPassword = newPasswordInput.value;
        const confirmNewPassword = confirmNewPasswordInput.value;

        if (!newPassword || !confirmNewPassword) {
            displayMessage('กรุณากรอกรหัสผ่านใหม่และยืนยันรหัสผ่าน.', 'text-red-500', resetPasswordMessageDiv);
            return;
        }
        if (newPassword !== confirmNewPassword) {
            displayMessage('รหัสผ่านใหม่ไม่ตรงกัน.', 'text-red-500', resetPasswordMessageDiv);
            return;
        }
        if (newPassword.length < 6) { // ตัวอย่างการตรวจสอบความยาวรหัสผ่าน
            displayMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร.', 'text-red-500', resetPasswordMessageDiv);
            return;
        }

        if (!resetToken) {
            displayMessage('เกิดข้อผิดพลาด: ไม่พบ Token สำหรับรีเซ็ตรหัสผ่าน. โปรดเริ่มกระบวนการใหม่.', 'text-red-500', resetPasswordMessageDiv);
            return;
        }

        displayMessage('กำลังตั้งรหัสผ่านใหม่...', 'text-gray-600', resetPasswordMessageDiv);
        setNewPasswordButton.disabled = true;
        setNewPasswordButton.textContent = 'กำลังเปลี่ยน...';

        try {
            const response = await fetch(`${API_BASE_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetToken: resetToken, newPassword: newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                displayMessage(data.message || 'รหัสผ่านถูกรีเซ็ตสำเร็จแล้ว. คุณสามารถเข้าสู่ระบบได้.', 'text-green-600', resetPasswordMessageDiv);
                // อาจหน่วงเวลาเล็กน้อยก่อน redirect
                setTimeout(() => {
                    window.location.href = '/login.html'; // Redirect ไปหน้า Login
                }, 3000);
            } else {
                displayMessage(data.message || 'ไม่สามารถรีเซ็ตรหัสผ่านได้. โปรดลองอีกครั้ง.', 'text-red-500', resetPasswordMessageDiv);
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            displayMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้. โปรดลองอีกครั้งในภายหลัง.', 'text-red-500', resetPasswordMessageDiv);
        } finally {
            setNewPasswordButton.disabled = false;
            setNewPasswordButton.textContent = 'เปลี่ยนรหัสผ่าน';
        }
    });

    // เริ่มต้นแสดงขั้นตอนแรกเมื่อโหลดหน้า
    showStep('forgotPassword');
});