// Tab filtering
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        const filter = this.dataset.filter;
        const rows = document.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            if (filter === 'all' || row.dataset.status === filter) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
});

// Mark as complete
document.querySelectorAll('.btn-icon.complete').forEach(btn => {
    btn.addEventListener('click', function() {
        const row = this.closest('tr');
        const badge = row.querySelector('.status-badge');
        badge.className = 'status-badge completed';
        badge.textContent = 'Completed';
        row.dataset.status = 'completed';
    });
});

// Delete confirmation
document.querySelectorAll('.btn-icon.delete').forEach(btn => {
    btn.addEventListener('click', function() {
        if (confirm('Are you sure you want to delete this reminder?')) {
            this.closest('tr').remove();
        }
    });
});
