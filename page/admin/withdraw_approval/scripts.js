// mothergame/page/admin/withdraw_approval/scripts.js
document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    const withdrawalsTableBody = document.querySelector('#withdrawalsTable tbody');

    if (!userId || userRole !== 'admin') {
        alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้ หรือไม่ได้เข้าสู่ระบบในฐานะแอดมิน');
        window.location.href = '/login.html';
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

    // ฟังก์ชันแปลงรหัสธนาคารเป็นชื่อไทย
    function translateBank(bankCode) {
        switch(bankCode) {
            case 'kbank': return 'กสิกรไทย';
            case 'scb': return 'ไทยพาณิชย์';
            case 'krungsri': return 'กรุงศรีอยุธยา';
            case 'bbl': return 'กรุงเทพ';
            case 'ktb': return 'กรุงไทย';
            case 'tmb': return 'ทีเอ็มบีธนชาต';
            default: return bankCode;
        }
    }

    async function fetchPendingWithdrawals() {
        try {
            const withdrawals = await window.makeAuthenticatedApiRequest('/admin/withdrawals/pending', 'GET');
            withdrawalsTableBody.innerHTML = '';
            if (withdrawals.length === 0) {
                withdrawalsTableBody.innerHTML = '<tr><td colspan="9" class="py-4 text-center text-gray-500">ไม่มีรายการถอนเงินที่รอดำเนินการ</td></tr>';
                return;
            }

            withdrawals.forEach(withdraw => {
                const row = document.createElement('tr');
                row.className = 'border-b border-gray-200 hover:bg-gray-50';
                row.dataset.withdrawId = withdraw._id;

                const requestDate = new Date(withdraw.requestAt);
                const formattedDate = requestDate.toLocaleDateString('th-TH', {
                    day: '2-digit', month: '2-digit', year: 'numeric'
                });
                const formattedTime = requestDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

                row.innerHTML = `
                    <td data-label="ID" class="py-3 px-4 text-left whitespace-nowrap">${withdraw._id.substring(0, 8)}...</td>
                    <td data-label="ผู้ใช้" class="py-3 px-4 text-left">${withdraw.userId.fullName || withdraw.userId.idCardNumber}</td>
                    <td data-label="คอยที่ถอน" class="py-3 px-4 text-left">${parseFloat(withdraw.amountCoins).toFixed(2)}</td>
                    <td data-label="ธนาคาร" class="py-3 px-4 text-left">${translateBank(withdraw.bankName)}</td>
                    <td data-label="เลขบัญชี" class="py-3 px-4 text-left">${withdraw.bankAccountNumber}</td>
                    <td data-label="ชื่อบัญชี" class="py-3 px-4 text-left">${withdraw.bankAccountName}</td>
                    <td data-label="สถานะ" class="py-3 px-4 text-left">
                        <span class="py-1 px-3 rounded-full text-xs ${
                            withdraw.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                            withdraw.status === 'approved' ? 'bg-green-200 text-green-800' :
                            'bg-red-200 text-red-800'
                        }">
                            ${translateStatus(withdraw.status)}
                        </span>
                    </td>
                    <td data-label="วันที่" class="py-3 px-4 text-left">${formattedDate} ${formattedTime}</td>
                    <td data-label="จัดการ" class="py-3 px-4 text-center">
                        <button class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg text-xs md:text-sm transition-colors duration-200 mr-2 btn-approve">
                            <i class="fas fa-check"></i> อนุมัติ
                        </button>
                        <button class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg text-xs md:text-sm transition-colors duration-200 btn-reject">
                            <i class="fas fa-times"></i> ไม่อนุมัติ
                        </button>
                    </td>
                `;
                withdrawalsTableBody.appendChild(row);
            });

            // ปุ่มอนุมัติ
            withdrawalsTableBody.querySelectorAll('.btn-approve').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const row = event.target.closest('tr');
                    const withdrawId = row.dataset.withdrawId;
                    const adminNotes = prompt('บันทึกการอนุมัติ (ถ้ามี):');
                    try {
                        const response = await window.makeAuthenticatedApiRequest(`/admin/withdrawals/${withdrawId}/approve`, 'POST', { adminNotes });
                        alert(response.message);
                        fetchPendingWithdrawals();
                    } catch (error) {
                        alert(`อนุมัติไม่สำเร็จ: ${error.message}`);
                    }
                });
            });

            // ปุ่มปฏิเสธ
            withdrawalsTableBody.querySelectorAll('.btn-reject').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const row = event.target.closest('tr');
                    const withdrawId = row.dataset.withdrawId;
                    const adminNotes = prompt('เหตุผลในการไม่อนุมัติ:');
                    if (!adminNotes) {
                        alert('กรุณากรอกเหตุผลในการปฏิเสธ');
                        return;
                    }
                    try {
                        const response = await window.makeAuthenticatedApiRequest(`/admin/withdrawals/${withdrawId}/reject`, 'POST', { adminNotes });
                        alert(response.message);
                        fetchPendingWithdrawals();
                    } catch (error) {
                        alert(`ปฏิเสธไม่สำเร็จ: ${error.message}`);
                    }
                });
            });

        } catch (error) {
            alert(`ไม่สามารถดึงรายการถอนเงินได้: ${error.message}`);
            if (error.message.includes('token failed') || error.message.includes('Not authorized')) {
                localStorage.clear();
                window.location.href = '/login.html';
            }
        }
    }

    fetchPendingWithdrawals();
});
