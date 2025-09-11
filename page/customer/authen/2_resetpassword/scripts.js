document.addEventListener('DOMContentLoaded', () => {
    // ใช้ BASE_API_URL จาก config.js
    const API_BASE_URL = window.BASE_API_URL;

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

    let currentEmail = '';
    let resetToken = '';
    let resendTimer = 0;
    const RESEND_OTP_COOLDOWN = 60; // วินาที

    const showStep = (stepName) => {
        forgotPasswordStep.classList.add('hidden');
        otpVerificationStep.classList.add('hidden');
        resetPasswordStep.classList.add('hidden');

        if (stepName === 'forgotPassword') forgotPasswordStep.classList.remove('hidden');
        else if (stepName === 'otpVerification') otpVerificationStep.classList.remove('hidden');
        else if (stepName === 'resetPassword') resetPasswordStep.classList.remove('hidden');
    };

    const displayMessage = (message, colorClass, targetDiv) => {
        targetDiv.textContent = message;
        targetDiv.className = `mt-4 text-center text-sm font-medium ${colorClass}`;
    };

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
            // ใช้ฟังก์ชัน global จาก config.js
            const data = await makeAuthenticatedApiRequest('/auth/forgot-password', 'POST', { email: currentEmail });
            displayMessage(data.message || 'รหัส OTP ถูกส่งไปยังอีเมลของคุณแล้ว.', 'text-green-600', forgotPasswordMessageDiv);
            showStep('otpVerification');
            startResendTimer();
        } catch (error) {
            displayMessage(error.message, 'text-red-500', forgotPasswordMessageDiv);
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
            const data = await makeAuthenticatedApiRequest('/auth/verify-otp', 'POST', { email: currentEmail, otpCode });
            resetToken = data.resetToken;
            displayMessage(data.message || 'รหัส OTP ถูกต้อง. กรุณาตั้งรหัสผ่านใหม่.', 'text-green-600', otpMessageDiv);
            otpCodeInput.value = '';
            showStep('resetPassword');
        } catch (error) {
            displayMessage(error.message, 'text-red-500', otpMessageDiv);
        } finally {
            verifyOtpButton.disabled = false;
            verifyOtpButton.textContent = 'ยืนยัน OTP';
        }
    });

    // Step 2: ส่ง OTP อีกครั้ง
    resendOtpButton.addEventListener('click', async () => {
        if (!currentEmail || resendTimer > 0) return;

        displayMessage('กำลังส่งรหัส OTP อีกครั้ง...', 'text-gray-600', otpMessageDiv);
        resendOtpButton.disabled = true;
        resendOtpButton.textContent = 'กำลังส่ง...';

        try {
            const data = await makeAuthenticatedApiRequest('/auth/forgot-password', 'POST', { email: currentEmail });
            displayMessage(data.message || 'รหัส OTP ใหม่ถูกส่งแล้ว.', 'text-green-600', otpMessageDiv);
            startResendTimer();
        } catch (error) {
            displayMessage(error.message, 'text-red-500', otpMessageDiv);
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
        if (newPassword.length < 6) {
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
            const data = await makeAuthenticatedApiRequest('/auth/reset-password', 'POST', { resetToken, newPassword });
            displayMessage(data.message || 'รีเซ็ตรหัสผ่านสำเร็จแล้ว.', 'text-green-600', resetPasswordMessageDiv);
            setTimeout(() => { window.location.href = '/login.html'; }, 3000);
        } catch (error) {
            displayMessage(error.message, 'text-red-500', resetPasswordMessageDiv);
        } finally {
            setNewPasswordButton.disabled = false;
            setNewPasswordButton.textContent = 'เปลี่ยนรหัสผ่าน';
        }
    });

    showStep('forgotPassword');
});
