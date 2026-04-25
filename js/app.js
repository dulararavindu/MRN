document.addEventListener('DOMContentLoaded', () => {
    // State
    const state = {
        user: null,
        mrns: [],
        departments: [],
        locations: [],
        selectedMrn: null
    };

    // DOM Elements
    const viewLogin = document.getElementById('view-login');
    const viewDashboard = document.getElementById('view-dashboard');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const btnLogout = document.getElementById('btn-logout');
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    // Filter Elements
    const filterSearch = document.getElementById('filter-search');
    const filterStatus = document.getElementById('filter-status');
    
    
    // Auth Check
    async function checkAuth() {
        try {
            const res = await fetch('api/auth.php?action=me');
            if (res.ok) {
                const data = await res.json();
                state.user = data.user;
                showDashboard();
            } else {
                showLogin();
            }
        } catch (e) {
            showLogin();
        }
    }

    // Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const res = await fetch('api/auth.php?action=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok) {
                state.user = data.user;
                showDashboard();
            } else {
                loginError.textContent = data.error || 'Login failed';
                loginError.classList.remove('hidden');
            }
        } catch (e) {
            loginError.textContent = 'Network error. Make sure API is running.';
            loginError.classList.remove('hidden');
        }
    });

    // Logout
    btnLogout.addEventListener('click', async () => {
        await fetch('api/auth.php?action=logout', { method: 'POST' });
        state.user = null;
        showLogin();
    });

    // Views
    function showLogin() {
        viewDashboard.classList.remove('active');
        viewDashboard.classList.add('hidden');
        viewLogin.classList.add('active');
        viewLogin.classList.remove('hidden');
        loginForm.reset();
        loginError.classList.add('hidden');
    }

    function showDashboard() {
        viewLogin.classList.remove('active');
        viewLogin.classList.add('hidden');
        viewDashboard.classList.add('active');
        viewDashboard.classList.remove('hidden');
        
        document.getElementById('user-name').textContent = state.user.full_name;
        document.getElementById('user-role').textContent = state.user.role;
        document.getElementById('user-avatar').textContent = state.user.full_name.charAt(0);
        
        // Hide/Show role specific elements
        const isRequester = state.user.role === 'requester';
        document.getElementById('nav-new-request').classList.toggle('hidden', !isRequester);
        document.getElementById('btn-create-new').classList.toggle('hidden', !isRequester);
        
        loadData();
    }

    // Navigation
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            nav.classList.add('active');
            
            document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
            document.getElementById(nav.dataset.target).classList.remove('hidden');
            
            // Close sidebar on mobile
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    });

    // Mobile Sidebar Toggle
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
    });

    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });

    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('[data-target="dashboard-main"]').click();
        });
    });

    document.getElementById('btn-create-new').addEventListener('click', () => {
        document.getElementById('nav-new-request').click();
    });

    // Loading Data
    async function loadData() {
        try {
            const [metaRes, mrnRes] = await Promise.all([
                fetch('api/meta.php'),
                fetch('api/mrn.php')
            ]);
            
            if (metaRes.ok) {
                const meta = await metaRes.json();
                state.departments = meta.departments;
                state.locations = meta.locations;
                populateSelects();
            }
            if (mrnRes.ok) {
                state.mrns = await mrnRes.json();
                renderMRNs();
                setupFilters();
            }
        } catch (e) {
            console.error('Failed to load data', e);
        }
    }

    function setupFilters() {
        filterSearch.addEventListener('input', () => renderMRNs());
        filterStatus.addEventListener('change', () => renderMRNs());
    }

    function populateSelects() {
        const deptSelect = document.getElementById('mrn-dept');
        const locSelect = document.getElementById('mrn-loc');
        
        deptSelect.innerHTML = '<option value="">Select Dept</option>' + 
            state.departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
            
        locSelect.innerHTML = '<option value="">Select Location</option>' + 
            state.locations.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    }

    function renderMRNs() {
        const tbody = document.getElementById('mrn-table-body');
        const searchTerm = filterSearch ? filterSearch.value.toLowerCase() : '';
        const statusFilter = filterStatus ? filterStatus.value : 'all';
        
        tbody.innerHTML = '';
        
        let pending = 0, approved = 0, fulfilled = 0;
        
        // Calculate global stats
        state.mrns.forEach(m => {
            if (m.status === 'pending') pending++;
            if (m.status === 'approved') approved++;
            if (m.status === 'fulfilled') fulfilled++;
        });

        // Filter MRNs for display
        const displayMrns = state.mrns.filter(m => {
            const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
            
            const mrnId = m.id.toString();
            const itemsList = m.items ? m.items.map(i => i.item_name).join(' ').toLowerCase() : '';
            const requester = m.requester_name.toLowerCase();
            const dept = m.department_name.toLowerCase();
            const loc = m.location_name.toLowerCase();
            
            const matchesSearch = !searchTerm || 
                mrnId.includes(searchTerm) || 
                itemsList.includes(searchTerm) || 
                requester.includes(searchTerm) || 
                dept.includes(searchTerm) || 
                loc.includes(searchTerm);
                
            return matchesStatus && matchesSearch;
        });

        displayMrns.forEach(m => {
            const tr = document.createElement('tr');
            
            let actionHtml = '';
            if (state.user.role === 'coo' && m.status === 'pending') {
                actionHtml = `<button class="action-btn btn-approve" data-id="${m.id}" data-action="approved">Approve</button>
                              <button class="action-btn btn-reject" data-id="${m.id}" data-action="rejected">Reject</button>`;
            } else if (state.user.role === 'fulfillment' && m.status === 'approved') {
                actionHtml = `<button class="action-btn btn-fulfill" data-id="${m.id}" data-action="fulfilled">Mark Fulfilled</button>`;
            }

            const itemCount = m.items ? m.items.length : 0;
            const itemsList = m.items ? m.items.map(i => `${i.quantity}x ${i.item_name}`).join(', ') : '';

            tr.innerHTML = `
                <td><strong>#${m.id}</strong></td>
                <td><div style="font-weight:600; color:#111827">${itemCount} Items</div><div style="font-size:13px; color:#6b7280; margin-top:4px; max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${itemsList}">${itemsList}</div></td>
                <td><div style="color:#111827">${m.department_name}</div><div style="font-size:13px; color:#6b7280">${m.location_name}</div></td>
                <td>${m.requester_name}</td>
                <td style="color:#6b7280">${new Date(m.created_at).toLocaleDateString()}</td>
                <td><span class="status-badge status-${m.status}">${m.status}</span></td>
                <td>
                    ${actionHtml} 
                    <button class="action-btn btn-view" style="background:#6366f1; color:white;" data-id="${m.id}">View</button>
                    <button class="action-btn btn-print" style="background:#4b5563; color:white;" data-id="${m.id}">Print</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        document.getElementById('stat-total').textContent = state.mrns.length;
        document.getElementById('stat-pending').textContent = pending;
        document.getElementById('stat-approved').textContent = approved;
        document.getElementById('stat-fulfilled').textContent = fulfilled;
    }

    // Actions & Printing
    document.getElementById('mrn-table-body').addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-print')) {
            const id = e.target.dataset.id;
            const mrn = state.mrns.find(m => m.id == id);
            if (!mrn) return;
            
            // Populate Print Template
            document.getElementById('print-mrn-id').innerText = mrn.id;
            document.getElementById('print-mrn-date').innerText = new Date(mrn.created_at).toLocaleDateString();
            document.getElementById('print-mrn-requester').innerText = mrn.requester_name;
            document.getElementById('print-mrn-status').innerText = mrn.status.toUpperCase();
            document.getElementById('print-mrn-dept').innerText = mrn.department_name;
            document.getElementById('print-mrn-loc').innerText = mrn.location_name;
            document.getElementById('print-mrn-purpose').innerText = mrn.purpose || 'N/A';
            
            // Handle E-Signature for Approved MRNs
            const sigBox = document.getElementById('print-signature-coo');
            if (mrn.status === 'approved' || mrn.status === 'fulfilled') {
                sigBox.innerText = 'Approved by the COO';
            } else {
                sigBox.innerText = '';
            }
            
            document.getElementById('print-current-date').innerText = new Date().toLocaleString();

            const tbody = document.getElementById('print-mrn-items');
            tbody.innerHTML = '';
            if (mrn.items) {
                mrn.items.forEach((item, index) => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td style="padding:10px; border:1px solid #ccc;">${index + 1}</td>
                        <td style="padding:10px; border:1px solid #ccc; text-align:left;">${item.item_name}</td>
                        <td style="padding:10px; border:1px solid #ccc; text-align:right;">${item.quantity}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }

            // Print with a tiny delay to ensure rendering
            setTimeout(() => {
                window.print();
            }, 100);
            return;
        }

        if (e.target.classList.contains('btn-view')) {
            const id = e.target.dataset.id;
            openModal(id);
            return;
        }

        if (e.target.classList.contains('action-btn')) {
            const id = e.target.dataset.id;
            const action = e.target.dataset.action;
            
            e.target.innerText = 'Wait...';
            
            try {
                const res = await fetch('api/mrn.php', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, status: action })
                });
                if (res.ok) {
                    loadData();
                } else {
                    alert("Failed to update status.");
                    loadData();
                }
            } catch (err) {
                console.error(err);
                loadData();
            }
        }
    });

    // Modal Logic
    const viewModal = document.getElementById('view-modal');
    const modalContent = document.getElementById('modal-content');
    const btnModalPrint = document.getElementById('btn-modal-print');

    function openModal(id) {
        const mrn = state.mrns.find(m => m.id == id);
        if (!mrn) return;
        state.selectedMrn = mrn;

        const itemsHtml = mrn.items ? mrn.items.map((it, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${it.item_name}</td>
                <td style="text-align:right;">${it.quantity}</td>
            </tr>
        `).join('') : '<tr><td colspan="3">No items</td></tr>';

        modalContent.innerHTML = `
            <div class="mrn-detail-grid">
                <div class="detail-item"><label>MRN NO</label><div class="val">#${mrn.id}</div></div>
                <div class="detail-item"><label>STATUS</label><div class="val"><span class="status-badge status-${mrn.status}">${mrn.status.toUpperCase()}</span></div></div>
                <div class="detail-item"><label>REQUESTER</label><div class="val">${mrn.requester_name}</div></div>
                <div class="detail-item"><label>DATE</label><div class="val">${new Date(mrn.created_at).toLocaleDateString()}</div></div>
                <div class="detail-item"><label>DEPARTMENT</label><div class="val">${mrn.department_name}</div></div>
                <div class="detail-item"><label>LOCATION</label><div class="val">${mrn.location_name}</div></div>
                <div class="detail-item" style="grid-column: span 2;"><label>PURPOSE</label><div class="val">${mrn.purpose || 'N/A'}</div></div>
            </div>
            <div style="font-weight:700; margin-bottom:10px; font-size:14px; color:var(--text-main);">Requested Items</div>
            <table class="modal-items-table">
                <thead>
                    <tr><th>#</th><th>Item</th><th style="text-align:right;">Qty</th></tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>
        `;

        viewModal.classList.remove('hidden');
    }

    function closeModal() {
        viewModal.classList.add('hidden');
        state.selectedMrn = null;
    }

    document.querySelectorAll('.btn-close-modal').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    viewModal.addEventListener('click', (e) => {
        if (e.target === viewModal) closeModal();
    });

    btnModalPrint.addEventListener('click', () => {
        if (state.selectedMrn) {
            closeModal();
            // Trigger the print logic manually by finding the button and clicking it
            const printBtn = document.querySelector(`.btn-print[data-id="${state.selectedMrn.id}"]`);
            if (printBtn) printBtn.click();
        }
    });

    // Dynamic Items Logic
    document.getElementById('btn-add-item').addEventListener('click', () => {
        const container = document.getElementById('items-container');
        const row = document.createElement('div');
        row.className = 'form-row item-row';
        row.style.marginBottom = '10px';
        row.innerHTML = `
            <div class="form-group" style="flex:2; margin:0;">
                <input type="text" class="item-name" placeholder="Item Name or Description" required>
            </div>
            <div class="form-group" style="flex:1; margin:0;">
                <input type="number" class="item-qty" placeholder="Quantity" min="1" required>
            </div>
            <button type="button" class="btn outline btn-remove-item" style="height:48px; border-color:#ef4444; color:#ef4444; width:48px; padding:0;">✕</button>
        `;
        container.appendChild(row);
        
        row.querySelector('.btn-remove-item').addEventListener('click', () => {
            row.remove();
        });
    });

    // Create MRN
    document.getElementById('mrn-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.innerText = 'Submitting...';
        btn.disabled = true;

        const items = [];
        document.querySelectorAll('.item-row').forEach(row => {
            const name = row.querySelector('.item-name').value;
            const qty = row.querySelector('.item-qty').value;
            if (name && qty) {
                items.push({ item_name: name, quantity: qty });
            }
        });

        if (items.length === 0) {
            alert("Please add at least one item.");
            btn.innerText = 'Submit Request';
            btn.disabled = false;
            return;
        }

        const payload = {
            department_id: document.getElementById('mrn-dept').value,
            location_id: document.getElementById('mrn-loc').value,
            purpose: document.getElementById('mrn-purpose').value,
            items: items
        };
        
        try {
            const res = await fetch('api/mrn.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                document.getElementById('mrn-form').reset();
                document.getElementById('items-container').innerHTML = `
                    <div class="form-row item-row" style="margin-bottom:10px;">
                        <div class="form-group" style="flex:2; margin:0;">
                            <input type="text" class="item-name" placeholder="Item Name or Description" required>
                        </div>
                        <div class="form-group" style="flex:1; margin:0;">
                            <input type="number" class="item-qty" placeholder="Quantity" min="1" required>
                        </div>
                        <button type="button" class="btn outline btn-remove-item" style="height:48px; border-color:transparent; color:#ef4444; width:48px; padding:0; background:transparent;" disabled></button>
                    </div>
                `;
                document.querySelector('[data-target="dashboard-main"]').click();
                loadData();
            } else {
                alert('Failed to submit request');
            }
        } catch (err) {
            console.error(err);
            alert('Network error');
        } finally {
            btn.innerText = 'Submit Request';
            btn.disabled = false;
        }
    });

    // Cancel Button Form View
    document.querySelector('.form-actions .btn-back').addEventListener('click', () => {
        document.getElementById('mrn-form').reset();
        document.querySelector('[data-target="dashboard-main"]').click();
    });

    // Init Validation
    checkAuth();
});
