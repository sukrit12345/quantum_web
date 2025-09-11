// mothergame/page/admin/deposit_approval/scripts.js
document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    const depositsTableBody = document.querySelector('#depositsTable tbody');

    if (!userId || userRole !== 'admin') {
        alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ หรือไม่ได้เข้าสู่ระบบในฐานะแอดมิน');
        window.location.href = '/index.html';
        return;
    }

    // ฟังก์ชันแปลงสถานะเป็นภาษาไทย
    function translateStatus(status) {
        switch(status) {
            case 'pending': return 'รอดำเนินการ';
            case 'approved': return 'อนุมัติแล้ว';
            case 'rejected': return 'ไม่อนุมัติ';
            default: return status;
        }
    }

    // ฟังก์ชันแปลงช่องทางเป็นภาษาไทย
    function translatePaymentMethod(method) {
        switch(method) {
            case 'bank_transfer': return 'ธนาคาร';
            case 'promptpay': return 'พร้อมเพย์';
            default: return method;
        }
    }

    async function fetchPendingDeposits() {
        try {
            const deposits = await window.makeAuthenticatedApiRequest('/admin/deposits/pending', 'GET');
            depositsTableBody.innerHTML = ''; // Clear existing rows

            if (deposits.length === 0) {
                depositsTableBody.innerHTML = '<tr><td colspan="7" class="py-4 text-center text-gray-500">ไม่มีรายการฝากเงินที่รอดำเนินการ</td></tr>';
                return;
            }

            deposits.forEach(deposit => {
                const row = document.createElement('tr');
                row.className = 'border-b border-gray-200 hover:bg-gray-50';
                row.dataset.depositId = deposit._id;
                row.innerHTML = `
                    <td data-label="รหัสฝาก" class="py-3 px-4 text-left whitespace-nowrap">${deposit._id.substring(0, 8)}...</td>
                    <td data-label="ผู้ใช้" class="py-3 px-4 text-left">${deposit.userId.fullName || deposit.userId.idCardNumber}</td>
                    <td data-label="จำนวน (บาท)" class="py-3 px-4 text-left">${parseFloat(deposit.amountThb).toFixed(2)}</td>
                    <td data-label="ช่องทาง" class="py-3 px-4 text-left">${translatePaymentMethod(deposit.paymentMethod)}</td>
                    <td data-label="สถานะ" class="py-3 px-4 text-left">
                        <span class="py-1 px-3 rounded-full text-xs ${
                            deposit.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                            deposit.status === 'approved' ? 'bg-green-200 text-green-800' :
                            'bg-red-200 text-red-800'
                        }">
                            ${translateStatus(deposit.status)}
                        </span>
                    </td>
                    <td data-label="วันที่" class="py-3 px-4 text-left">
                        ${new Date(deposit.requestAt).toLocaleDateString('th-TH')} ${new Date(deposit.requestAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td data-label="จัดการ" class="py-3 px-4 text-center">
                        <button class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-xs md:text-sm transition-colors duration-200 mr-2 btn-approve">
                            <i class="fas fa-check"></i> อนุมัติ
                        </button>
                        <button class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-xs md:text-sm transition-colors duration-200 btn-reject">
                            <i class="fas fa-times"></i> ไม่อนุมัติ
                        </button>
                    </td>
                `;
                depositsTableBody.appendChild(row);
            });

            // Event listener สำหรับปุ่ม
            depositsTableBody.querySelectorAll('.btn-approve').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const row = event.target.closest('tr');
                    const depositId = row.dataset.depositId;
                    const adminNotes = prompt('บันทึกการอนุมัติ (ถ้ามี):');
                    try {
                        const response = await window.makeAuthenticatedApiRequest(`/admin/deposits/${depositId}/approve`, 'POST', { adminNotes });
                        alert(response.message);
                        fetchPendingDeposits();
                    } catch (error) {
                        alert(`อนุมัติไม่สำเร็จ: ${error.message}`);
                    }
                });
            });

            depositsTableBody.querySelectorAll('.btn-reject').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const row = event.target.closest('tr');
                    const depositId = row.dataset.depositId;
                    const adminNotes = prompt('เหตุผลในการไม่อนุมัติ:');
                    if (!adminNotes) {
                        alert('กรุณากรอกเหตุผลในการปฏิเสธ');
                        return;
                    }
                    try {
                        const response = await window.makeAuthenticatedApiRequest(`/admin/deposits/${depositId}/reject`, 'POST', { adminNotes });
                        alert(response.message);
                        fetchPendingDeposits();
                    } catch (error) {
                        alert(`ปฏิเสธไม่สำเร็จ: ${error.message}`);
                    }
                });
            });

        } catch (error) {
            alert(`ไม่สามารถดึงรายการฝากเงินได้: ${error.message}`);
            if (error.message.includes('token failed') || error.message.includes('Not authorized')) {
                localStorage.clear();
                window.location.href = '/index.html';
            }
        }
    }

    fetchPendingDeposits();
});
