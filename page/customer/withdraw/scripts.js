// mothergame/page/customer/withdraw/scripts.js
document.addEventListener('DOMContentLoaded', async () => {
    const withdrawForm = document.getElementById('withdrawForm');
    const currentCoinBalanceDisplay = document.getElementById('currentCoinBalance');
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    if (!userId || userRole !== 'customer') {
        alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ หรือไม่ได้เข้าสู่ระบบ');
        window.location.href = '../../../login/index.html';
        return;
    }

    // ดึงยอดคอยน์ปัจจุบันมาแสดง
    try {
        const userProfile = await window.makeAuthenticatedApiRequest('/auth/me', 'GET');
        currentCoinBalanceDisplay.textContent = parseFloat(userProfile.coinBalance).toFixed(2) + ' คอย';
        localStorage.setItem('userBalance', userProfile.coinBalance); // อัปเดตยอดคอยน์
    } catch (error) {
        alert(`ไม่สามารถดึงยอดคอยน์ได้: ${error.message}`);
    }

    if (withdrawForm) {
    withdrawForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const amountCoins = document.getElementById('withdrawAmount').value.trim();
        const bankName = document.getElementById('bankNameInput').value.trim(); // ← ใช้อันนี้แทน
        const bankAccountNumber = document.getElementById('bankAccount').value.trim();
        const bankAccountName = document.getElementById('accountName').value.trim();

        const currentBalance = parseFloat(localStorage.getItem('userBalance'));

        if (!amountCoins || parseFloat(amountCoins) <= 0) {
            alert('กรุณากรอกจำนวนคอยน์ที่ถูกต้อง');
            return;
        }
        if (parseFloat(amountCoins) < 100) {
            alert('จำนวนถอนขั้นต่ำคือ 100 คอยน์');
            return;
        }
        if (parseFloat(amountCoins) > currentBalance) {
            alert('ยอดคอยน์ไม่เพียงพอ');
            return;
        }
        if (!bankName || !bankAccountNumber || !bankAccountName) {
            alert('กรุณากรอกข้อมูลบัญชีธนาคารให้ครบถ้วน');
            return;
        }

        try {
            const response = await window.makeAuthenticatedApiRequest('/customer/withdraw', 'POST', {
                amountCoins: parseFloat(amountCoins),
                bankName,
                bankAccountNumber,
                bankAccountName
            });
            alert(response.message + ` (ID: ${response.withdrawId})`);
            // อัปเดตยอดคอยน์ใน localStorage ทันที
            localStorage.setItem('userBalance', currentBalance - parseFloat(amountCoins));
            window.location.href = '../dashboard/index.html';
        } catch (error) {
            alert(`ส่งคำขอถอนเงินไม่สำเร็จ: ${error.message}`);
        }
    });
}


    // ======================
    // Dropdown Section
    // ======================
    const dropdownButton = document.getElementById("dropdownButton");
    const dropdownList = document.getElementById("dropdownList");
    const selectedOption = document.getElementById("selectedOption");
    const hiddenInput = document.getElementById("bankNameInput"); // ← เปลี่ยนตาม id ใหม่

    if (dropdownButton && dropdownList && selectedOption && hiddenInput) {
        // Toggle dropdown
        dropdownButton.addEventListener("click", () => {
            dropdownList.classList.toggle("hidden");
        });

        // เลือก option
        dropdownList.querySelectorAll("li").forEach(item => {
            item.addEventListener("click", () => {
                selectedOption.textContent = item.textContent.trim();
                hiddenInput.value = item.dataset.value;
                dropdownList.classList.add("hidden");
            });
        });

        // ปิด dropdown เมื่อคลิกข้างนอก
        document.addEventListener("click", (e) => {
            if (!dropdownButton.contains(e.target) && !dropdownList.contains(e.target)) {
                dropdownList.classList.add("hidden");
            }
        });
    }
});
