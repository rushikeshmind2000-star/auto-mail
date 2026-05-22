document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const navCompose = document.getElementById('nav-compose');
    const navHistory = document.getElementById('nav-history');
    const composeSection = document.getElementById('compose-section');
    const historySection = document.getElementById('history-section');

    navCompose.addEventListener('click', (e) => {
        e.preventDefault();
        navCompose.classList.add('active');
        navHistory.classList.remove('active');
        composeSection.style.display = 'block';
        historySection.style.display = 'none';
    });

    navHistory.addEventListener('click', (e) => {
        e.preventDefault();
        navHistory.classList.add('active');
        navCompose.classList.remove('active');
        historySection.style.display = 'block';
        composeSection.style.display = 'none';
        loadMailHistory();
    });

    // Form Submission
    const mailForm = document.getElementById('mail-form');
    const sendBtn = document.getElementById('send-btn');
    const sendLoader = document.getElementById('send-loader');
    const statusMessage = document.getElementById('status-message');

    mailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const recipient = document.getElementById('recipient').value;
        const subject = document.getElementById('subject').value;
        const body = document.getElementById('body').value;

        // UI updates
        sendBtn.disabled = true;
        sendLoader.style.display = 'block';
        sendBtn.querySelector('span').textContent = 'Sending...';
        statusMessage.className = 'status-message';
        statusMessage.style.display = 'none';

        try {
            const response = await fetch('/api/mails/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ recipient, subject, body })
            });

            const data = await response.json();

            if (response.ok && (data.status === 'SENT' || (data.status && data.status.startsWith('SENT')))) {
                statusMessage.textContent = 'Mail sent successfully!';
                statusMessage.classList.add('success');
                mailForm.reset();
            } else {
                statusMessage.textContent = data.status || 'Failed to send mail.';
                statusMessage.classList.add('error');
            }
        } catch (error) {
            statusMessage.textContent = 'Network error occurred. Please try again.';
            statusMessage.classList.add('error');
        } finally {
            sendBtn.disabled = false;
            sendLoader.style.display = 'none';
            sendBtn.querySelector('span').textContent = 'Send Mail';
        }
    });

    // Load History
    const refreshBtn = document.getElementById('refresh-btn');
    const historyBody = document.getElementById('history-body');

    refreshBtn.addEventListener('click', loadMailHistory);

    async function loadMailHistory() {
        historyBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading...</td></tr>';
        
        try {
            const response = await fetch('/api/mails');
            const data = await response.json();
            
            historyBody.innerHTML = '';
            
            if (data.length === 0) {
                historyBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">No mails found.</td></tr>';
                return;
            }

            // Sort by date desc
            data.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

            data.forEach(mail => {
                const date = mail.sentAt ? new Date(mail.sentAt).toLocaleString() : 'N/A';
                const isSent = mail.status === 'SENT';
                const statusClass = isSent ? 'sent' : 'failed';
                const statusText = isSent ? 'Sent' : 'Failed';
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${escapeHtml(mail.recipient)}</td>
                    <td>${escapeHtml(mail.subject)}</td>
                    <td>${date}</td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                    <td class="action-btns">
                        <button class="btn-icon view-btn" data-id="${mail.id}" title="View">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button class="btn-icon delete-btn" data-id="${mail.id}" title="Delete">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--danger)"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </td>
                `;
                historyBody.appendChild(tr);
            });

            // Add event listeners to buttons
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.addEventListener('click', () => viewMail(btn.dataset.id));
            });
            
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => deleteMail(btn.dataset.id));
            });

        } catch (error) {
            historyBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--danger);">Failed to load data.</td></tr>';
        }
    }

    // Modal
    const modal = document.getElementById('mail-modal');
    const closeModal = document.querySelector('.close-modal');

    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    async function viewMail(id) {
        try {
            const response = await fetch(`/api/mails/${id}`);
            const mail = await response.json();
            
            document.getElementById('modal-subject').textContent = mail.subject;
            document.getElementById('modal-to').textContent = mail.recipient;
            document.getElementById('modal-date').textContent = mail.sentAt ? new Date(mail.sentAt).toLocaleString() : 'N/A';
            document.getElementById('modal-status').textContent = mail.status;
            document.getElementById('modal-body-text').textContent = mail.body;
            
            modal.classList.add('active');
        } catch (error) {
            alert('Failed to fetch mail details.');
        }
    }

    async function deleteMail(id) {
        if (!confirm('Are you sure you want to delete this mail record?')) return;
        
        try {
            const response = await fetch(`/api/mails/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadMailHistory();
            } else {
                alert('Failed to delete mail.');
            }
        } catch (error) {
            alert('Error deleting mail.');
        }
    }

    function escapeHtml(unsafe) {
        return (unsafe || '').toString()
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }
});
