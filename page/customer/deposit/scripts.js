// mothergame/page/customer/deposit/scripts.js
document.addEventListener('DOMContentLoaded', () => {
    const depositForm = document.getElementById('depositForm');
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    if (!userId || userRole !== 'customer') {
        alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ หรือไม่ได้เข้าสู่ระบบ');
        window.location.href = '/index.html';
        return;
    }

    if (depositForm) {
        depositForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const amountThb = document.getElementById('depositAmount').value.trim();
            const paymentMethod = document.getElementById('paymentMethod').value;

            if (!amountThb || parseFloat(amountThb) <= 0) {
                alert('กรุณากรอกจำนวนเงินที่ถูกต้อง');
                return;
            }
            if (!paymentMethod) {
                alert('กรุณาเลือกช่องทางการชำระเงิน');
                return;
            }

            try {
                const response = await window.makeAuthenticatedApiRequest('/customer/deposit', 'POST', {
                    amountThb: parseFloat(amountThb),
                    paymentMethod
                });
                alert(response.message + ` (ID: ${response.depositId})`);
                window.location.href = '../dashboard/index.html'; // กลับไปหน้าแดชบอร์ดลูกค้า
            } catch (error) {
                alert(`ส่งคำขอฝากเงินไม่สำเร็จ: ${error.message}`);
            }
        });
    }
});




const dropdownButton = document.getElementById("dropdownButton");
const dropdownList = document.getElementById("dropdownList");
const selectedOption = document.getElementById("selectedOption");
const hiddenInput = document.getElementById("paymentMethod");

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