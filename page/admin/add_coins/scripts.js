// mothergame/page/admin/add_coins/scripts.js
document.addEventListener('DOMContentLoaded', () => {
    const addCoinsForm = document.getElementById('addCoinsForm');

    if (addCoinsForm) {
        addCoinsForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // ดึงค่าจาก input
            const targetIdCardNumber = document.getElementById('targetUsername').value.trim();
            const amountCoins = parseFloat(document.getElementById('addAmount').value);
            const reason = document.getElementById('reason').value.trim();

            // Validation เบื้องต้น
            if (!targetIdCardNumber || targetIdCardNumber.length !== 13 || !/^\d{13}$/.test(targetIdCardNumber)) {
                alert('กรุณากรอกเลขบัตรประชาชน 13 หลัก');
                return;
            }

            if (!amountCoins || amountCoins <= 0) {
                alert('กรุณากรอกจำนวนคอยที่ถูกต้อง');
                return;
            }

            try {
                console.log('Sending ID Card Number:', targetIdCardNumber);
                console.log('Amount of Coins:', amountCoins);
                console.log('Reason:', reason);

                // เรียก API เพิ่มคอย
                const response = await window.makeAuthenticatedApiRequest(
                    `/admin/users/${targetIdCardNumber}/add-coins`,
                    'POST',
                    {
                        amountCoins,
                        reason
                    }
                );

                alert(`${response.message} (ยอดคอยน์ใหม่: ${parseFloat(response.user.newCoinBalance).toFixed(2)})`);
                addCoinsForm.reset();
            } catch (error) {
                console.error('Error adding coins:', error);
                alert(`เพิ่มคอยน์ไม่สำเร็จ: ${error.message}`);
            }
        });
    }
});
