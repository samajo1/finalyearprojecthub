window.admin = {
    activeTab: 'projects',

    getBadgeForStage: function (student) {
        let baseBadge = '';
        switch (student.stage) {
            case 'payment': baseBadge = '<span class="badge badge-warning">Awaiting Payment</span>'; break;
            case 'topics': baseBadge = '<span class="badge badge-info">Selecting Topic</span>'; break;
            case 'pending_project': baseBadge = '<span class="badge badge-primary">Awaiting Upload</span>'; break;
            case 'project_ready': baseBadge = '<span class="badge badge-success">Ready for Download</span>'; break;
            case 'completed': baseBadge = '<span class="badge badge-success">Completed</span>'; break;
            default: baseBadge = '<span class="badge">Unknown</span>';
        }

        if (student.pendingPayment > 0) {
            return baseBadge + `<br><span class="badge" style="background:#f59e0b; color:#fff; margin-top:0.25rem; display:inline-block;">Pay Verification</span>`;
        }
        return baseBadge;
    },

    renderProjectsTab: function (allUsers) {
        let tableRows = '';
        if (allUsers.length === 0) {
            tableRows = '<tr><td colspan="5" class="text-center">No students registered yet.</td></tr>';
        } else {
            allUsers.forEach((student) => {
                tableRows += `
                    <tr>
                        <td>
                            <div style="font-weight: 500; color: #fff;">${student.name}</div>
                            <div style="font-size: 0.8rem; color: #94a3b8;">${student.email}</div>
                        </td>
                        <td style="text-transform: capitalize;">${student.department.replace('_', ' ')}</td>
                        <td>
                            <div style="max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${student.approvedTopic || 'N/A'}">
                                ${student.approvedTopic || '<span style="color:#64748b">Pending Approval</span>'}
                            </div>
                        </td>
                        <td>${this.getBadgeForStage(student)}</td>
                        <td>
                            <button class="btn manage-btn" style="padding: 0.5rem 1rem; width: auto; font-size: 0.85rem;" data-email="${student.email}">Manage</button>
                        </td>
                    </tr>
                `;
            });
        }

        return `
            <div class="glass-card fade-in" style="width: 100%; max-width: 1200px; margin: 0 auto;">
                <div class="header">
                    <div>
                        <h2>Project Submissions Database</h2>
                        <p style="margin:0">Control student workflows, confirm payments, edit stages, and manage files.</p>
                    </div>
                </div>
                <div style="overflow-x: auto;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Department</th>
                                <th>Approved Topic</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Manage Modal -->
            <div id="manage-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 100; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
                <div class="glass-card fade-in" style="width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; position: relative;">
                    <button id="close-manage-modal" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: #fff; cursor: pointer;">
                        <svg style="width: 24px; height: 24px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    <h3 class="mb-1">Manage Student Progress</h3>
                    <div id="manage-student-info" style="color: #cbd5e1; margin-bottom: 1.5rem; font-size: 0.95rem; line-height: 1.5;"></div>
                    
                    <div id="manage-topics-section" style="margin-bottom: 2rem;"></div>

                    <div id="manage-finance-section" style="margin-bottom: 2rem;"></div>

                    <div class="form-group" style="margin-bottom: 2rem;">
                        <label>Override Status/Stage</label>
                        <select id="manage-stage-select">
                            <option value="payment">Awaiting Payment</option>
                            <option value="topics">Selecting Topic</option>
                            <option value="pending_project">Awaiting Upload (Pending)</option>
                            <option value="project_ready">Ready for Download</option>
                            <option value="completed">Completed</option>
                        </select>
                        <button id="save-stage-btn" class="btn mt-1" style="font-size: 0.85rem; padding: 0.5rem 1rem; width: auto; background: var(--secondary-color);">Force Update Status</button>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 2rem 0;">
                    <div id="manage-project-section"></div>
                </div>
            </div>
        `;
    },

    renderFeedbacksTab: function () {
        const feedbacks = window.db.getFeedbacks();
        let feedbackHtml = '';
        if (feedbacks.length === 0) {
            feedbackHtml = '<div class="text-center" style="padding: 3rem;"><p>No standard complaints in the inbox.</p></div>';
        } else {
            feedbackHtml = feedbacks.reverse().map(f => `
                <div class="feedback-card">
                    <div class="flex-between mb-1" style="align-items: flex-start;">
                        <div>
                            <strong style="color: white; font-size: 1.1rem;">${f.subject}</strong>
                            <p style="margin:0; font-size:0.8rem; color:var(--text-muted);">From: ${f.name} (${f.email}) - ${f.date}</p>
                        </div>
                        <span class="badge ${f.status === 'Resolved' ? 'badge-success' : 'badge-warning'}">${f.status}</span>
                    </div>
                    <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <p style="margin:0; font-size: 0.95rem; color: #e2e8f0;">${f.message}</p>
                    </div>
                    ${f.status === 'Pending' ?
                    `<button class="btn resolve-btn" data-id="${f.id}" style="width: auto; padding: 0.5rem 1rem; font-size: 0.85rem; background: #10b981;">Mark as Resolved</button>`
                    : ''
                }
                </div>
            `).join('');
        }
        return `
            <div class="glass-card fade-in" style="width: 100%; max-width: 800px; margin: 0 auto;">
                <div class="header">
                    <div>
                        <h2>Feedback Inbox</h2>
                        <p style="margin:0">Review and resolve student complaints and suggestions.</p>
                    </div>
                </div>
                <div>${feedbackHtml}</div>
            </div>
        `;
    },

    renderUsersTab: function (allUsers) {
        let userRows = '';
        if (allUsers.length === 0) {
            userRows = '<tr><td colspan="4" class="text-center">No students registered yet.</td></tr>';
        } else {
            userRows = allUsers.map(u => `
                <tr>
                    <td>
                        <div style="font-weight: 500; color: #fff;">${u.name}</div>
                        <div style="font-size: 0.8rem; color: #94a3b8;">${u.email}</div>
                    </td>
                    <td style="text-transform: capitalize;">${u.department.replace('_', ' ')}</td>
                    <td><strong>${u.password}</strong></td>
                    <td><button class="btn delete-user-btn" style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.3); padding: 0.5rem; width: auto; font-size: 0.8rem;" data-email="${u.email}">Delete</button></td>
                </tr>
            `).join('');
        }

        const depts = window.db.getDepartments();
        const deptOptions = depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('');

        return `
            <div class="grid-2 fade-in" style="align-items: start; max-width: 1200px; margin: 0 auto;">
                <div class="glass-card" style="padding: 2rem;">
                    <h3 class="mb-1">Create Student Registration</h3>
                    <p class="mb-2" style="font-size:0.9rem;">Manually inject a user into the system for troubleshooting or direct support.</p>
                    <form id="admin-create-user-form">
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" id="new-name" required placeholder="John Doe">
                        </div>
                        <div class="form-group">
                            <label>Department</label>
                            <select id="new-department" required>
                                ${deptOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Email Address</label>
                            <input type="email" id="new-email" required placeholder="student@example.com">
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="text" id="new-password" required placeholder="Initial Password">
                        </div>
                        <button type="submit" class="btn">Register Student</button>
                    </form>
                </div>
                <div class="glass-card" style="padding: 2rem;">
                    <h3 class="mb-1">Registered Users Directory</h3>
                    <div style="max-height: 60vh; overflow-y: auto;">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Department</th>
                                    <th>Password</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>${userRows}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    renderSettingsTab: function () {
        const events = window.db.getEvents();
        const settings = window.db.getSettings();
        const depts = window.db.getDepartments();

        let eventsHtml = '';
        if (events.length === 0) {
            eventsHtml = '<p>No events active.</p>';
        } else {
            eventsHtml = events.map(e => `
                <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; margin-bottom: 0.5rem; display:flex; justify-content:space-between; align-items: center;">
                    <div>
                        <strong style="color:white;">${e.title}</strong> (${e.time})<br>
                        <span style="font-size:0.8rem; color:var(--text-muted);">${e.detail}</span>
                    </div>
                    <button class="delete-event-btn" data-id="${e.id}" style="background:none; border:none; color:#ef4444; cursor:pointer;" title="Delete Event">
                        <svg style="width: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            `).join('');
        }

        let deptsHtml = '';
        if (depts.length === 0) {
            deptsHtml = '<p>No departments configured.</p>';
        } else {
            deptsHtml = depts.map(d => {
                const topicRow = d.topics.map((t, idx) => `
                    <div style="background: rgba(0,0,0,0.2); padding: 0.5rem 1rem; border-radius: 4px; margin-bottom: 0.25rem; display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:0.9rem; color:#fff;">${t}</span>
                        <button class="delete-topic-btn" data-dept="${d.id}" data-idx="${idx}" style="background:none; border:none; color:#ef4444; cursor:pointer;" title="Delete Topic"><svg style="width: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                    </div>
                `).join('');

                return `
                    <div style="background: rgba(255,255,255,0.02); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--glass-border); margin-bottom: 1rem;">
                        <h4 style="margin-bottom:1rem; color: #818cf8; font-size:1.1rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem; display:flex; justify-content:space-between; align-items:center;">
                            <span>${d.name} <span class="badge badge-warning" style="margin-left:0.5rem; font-size:0.75rem;">Fee: ₦${(d.fee || 50000).toLocaleString()}</span></span>
                            <button class="delete-dept-btn" data-id="${d.id}" style="font-size:0.8rem; background: rgba(239, 68, 68, 0.2); color: #fca5a5; padding: 0.25rem 0.5rem; border:none; cursor:pointer; border-radius:4px;">Delete Dept</button>
                        </h4>
                        
                        <div style="margin-bottom: 1rem;">
                            ${topicRow || '<p style="font-size:0.85rem; color:#fca5a5; margin-bottom:0.5rem;">No topics available. Students will be blocked from selecting.</p>'}
                        </div>

                        <form class="add-topic-form" data-dept="${d.id}" style="display:flex; gap:0.5rem;">
                            <input type="text" class="new-topic-input" required placeholder="New Project Topic" style="flex:1; padding:0.5rem; background: rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:4px;">
                            <button type="submit" class="btn btn-secondary" style="padding: 0.5rem 1rem; width:auto; font-size:0.85rem;">Add Topic</button>
                        </form>
                    </div>
                `;
            }).join('');
        }

        return `
            <div class="grid-2 fade-in" style="align-items: start; max-width: 1200px; margin: 0 auto; gap: 2rem;">
                <!-- Left Column -->
                <div>
                    <div class="glass-card" style="padding: 2rem; margin-bottom: 2rem;">
                        <h3 class="mb-1">Global Project Rules</h3>
                        <p class="mb-2" style="font-size:0.9rem;">Update the guidelines students see embedded on their primary dashboard interface.</p>
                        <textarea id="rules-input" rows="8" style="width: 100%; padding: 1rem; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; color: white; font-family: inherit; font-size: 0.95rem; resize: vertical; margin-bottom:1rem;">${settings.projectRules}</textarea>
                        
                        <h3 class="mb-1 mt-2" style="padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1);">Manual Payment Details</h3>
                        <p class="mb-1" style="font-size:0.9rem;">Configure exactly what bank details you want students to see when choosing the manual Bank Transfer option.</p>
                        
                        <div class="form-group">
                            <label>Bank Name</label>
                            <input type="text" id="bank-name-input" value="${settings.bankName || ''}" placeholder="e.g. GTBank" style="width:100%; margin-bottom:0.8rem; padding:0.5rem; background: rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:4px;">
                        </div>
                        <div class="form-group">
                            <label>Account Name</label>
                            <input type="text" id="account-name-input" value="${settings.accountName || ''}" placeholder="e.g. Samajo Academic Projects" style="width:100%; margin-bottom:0.8rem; padding:0.5rem; background: rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:4px;">
                        </div>
                        <div class="form-group">
                            <label>Account Number</label>
                            <input type="text" id="account-no-input" value="${settings.accountNo || ''}" placeholder="e.g. 0123456789" style="width:100%; margin-bottom:1.5rem; padding:0.5rem; background: rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:4px;">
                        </div>

                        <button id="save-rules-btn" class="btn">Publish Global Settings</button>
                    </div>

                    <div class="glass-card" style="padding: 2rem;">
                        <h3 class="mb-1">Event Publisher</h3>
                        <p class="mb-2" style="font-size:0.9rem;">Broadcast lectures and critical notifications to all students.</p>
                        
                        <form id="add-event-form" style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--glass-border); margin-bottom: 2rem;">
                            <input type="text" id="event-title" placeholder="Event Title" required style="width:100%; margin-bottom:0.5rem; padding:0.5rem; background: rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:4px;">
                            <input type="text" id="event-detail" placeholder="Short Description" required style="width:100%; margin-bottom:0.5rem; padding:0.5rem; background: rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:4px;">
                            <input type="text" id="event-time" placeholder="Time/Date (e.g. Tomorrow 10:00 AM)" required style="width:100%; margin-bottom:1rem; padding:0.5rem; background: rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:4px;">
                            <button type="submit" class="btn btn-secondary" style="padding: 0.5rem; font-size:0.9rem;">Broadcast Event</button>
                        </form>

                        <h4 style="margin-bottom: 1rem; color: #cbd5e1;">Active Live Events</h4>
                        <div style="max-height: 40vh; overflow-y: auto;">
                            ${eventsHtml}
                        </div>
                    </div>
                </div>
                
                <!-- Right Column for Departments/Topics -->
                <div class="glass-card" style="padding: 2rem; max-height: 90vh; overflow-y: auto;">
                    <h3 class="mb-1">Academic Departments & Topics</h3>
                    <p class="mb-2" style="font-size:0.9rem; color:var(--text-muted);">Manage overarching faculties and define strict allowable topics students are assigned to pick from.</p>
                    
                    <form id="add-dept-form" style="display:flex; gap:0.5rem; margin-bottom: 2rem; flex-wrap:wrap;">
                        <input type="text" id="new-dept-name" required placeholder="New Department Form (e.g. Law)" style="flex:2; min-width: 200px; padding:0.5rem; background: rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:4px;">
                        <input type="number" id="new-dept-fee" required placeholder="Project Fee (₦)" style="flex:1; min-width: 150px; padding:0.5rem; background: rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:4px;">
                        <button type="submit" class="btn" style="padding: 0.5rem 1rem; width:auto; font-size:0.85rem; background: #10b981;">Add Dept</button>
                    </form>

                    <div id="departments-list">
                        ${deptsHtml}
                    </div>
                </div>
            </div>
        `;
    },

    renderAdminDashboard: function (container) {
        const allUsers = window.db.getUsers().filter(u => u.role !== 'admin');

        let mainContent = '';
        if (this.activeTab === 'projects') mainContent = this.renderProjectsTab(allUsers);
        if (this.activeTab === 'feedbacks') mainContent = this.renderFeedbacksTab();
        if (this.activeTab === 'users') mainContent = this.renderUsersTab(allUsers);
        if (this.activeTab === 'settings') mainContent = this.renderSettingsTab();

        container.innerHTML = `
            <div class="dashboard-layout fade-in">
                <!-- Sidebar -->
                <div class="sidebar">
                    <div class="sidebar-title" style="color: var(--secondary-color);">Admin Panel</div>
                    <div style="margin-bottom: 2rem;">
                        <p style="color: white; font-weight: 500; margin: 0;">System Administrator</p>
                        <p style="font-size: 0.8rem; margin: 0;">Full CMS Access</p>
                    </div>
                    
                    <div class="nav-item ${this.activeTab === 'projects' ? 'active' : ''}" data-tab="projects">
                        <svg style="width: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        Project Submissions
                    </div>
                    <div class="nav-item ${this.activeTab === 'feedbacks' ? 'active' : ''}" data-tab="feedbacks">
                        <svg style="width: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        Feedback Inbox
                        ${window.db.getFeedbacks().filter(f => f.status === 'Pending').length > 0 ?
                `<span class="badge badge-warning" style="margin-left: auto; font-size: 0.7rem;">${window.db.getFeedbacks().filter(f => f.status === 'Pending').length}</span>`
                : ''
            }
                    </div>
                    <div class="nav-item ${this.activeTab === 'users' ? 'active' : ''}" data-tab="users">
                        <svg style="width: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        User Management
                    </div>
                    <div class="nav-item ${this.activeTab === 'settings' ? 'active' : ''}" data-tab="settings">
                        <svg style="width: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        Platform Publisher
                    </div>
                    
                    <div style="flex:1;"></div>
                    <button id="logout-btn" class="logout-btn" style="width: 100%;">Logout</button>
                </div>
                
                <!-- Main Content -->
                <div class="main-content">
                    ${mainContent}
                </div>
            </div>
        `;

        // Nav Links
        document.querySelectorAll('.nav-item').forEach(el => {
            el.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                if (tab && tab !== this.activeTab) {
                    this.activeTab = tab;
                    window.app.render();
                }
            });
        });

        document.getElementById('logout-btn').addEventListener('click', () => {
            window.db.logout();
        });

        // Tab Specific Listeners
        if (this.activeTab === 'projects') this.initProjectsTab(allUsers);
        if (this.activeTab === 'feedbacks') this.initFeedbacksTab();
        if (this.activeTab === 'users') this.initUsersTab();
        if (this.activeTab === 'settings') this.initSettingsTab();
    },

    initProjectsTab: function (allUsers) {
        const manageModal = document.getElementById('manage-modal');
        const closeManageBtn = document.getElementById('close-manage-modal');
        let currentManageEmail = null;

        closeManageBtn.addEventListener('click', () => {
            manageModal.style.display = 'none';
            currentManageEmail = null;
        });

        const updateManageModalUI = () => {
            const user = window.db.getUsers().find(u => u.email === currentManageEmail);
            if (!user) return;

            const rawPaid = user.amountPaid || 0;
            const rawBalance = user.balance === undefined ? 50000 : user.balance;
            const totalFee = user.totalFee || (rawPaid + rawBalance) || 50000;

            document.getElementById('manage-student-info').innerHTML = `
                <strong style="color:white; font-size:1.1rem;">${user.name}</strong><br>
                <span style="color:var(--text-muted);">${user.email}</span><br>
                Approved Topic: <strong style="color:var(--primary-color);">${user.approvedTopic || 'None Selected Yet'}</strong>
            `;
            document.getElementById('manage-stage-select').value = user.stage;

            const topicsSec = document.getElementById('manage-topics-section');
            if (topicsSec) {
                if (!user.approvedTopic) {
                    const t1 = (user.assignedTopics && user.assignedTopics[0]) || '';
                    const t2 = (user.assignedTopics && user.assignedTopics[1]) || '';
                    
                    topicsSec.innerHTML = `
                        <h4 style="margin-bottom:1rem; color: #f8fafc;">Manage Topic Options</h4>
                        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Rewrite the options below to give the student custom topics to choose from if they are unsatisfied.</p>
                        <div class="form-group">
                            <label>Option A</label>
                            <input type="text" id="override-topic-1" value="${t1}" placeholder="First Topic Option..." style="width:100%; padding: 0.5rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 4px; margin-bottom:0.5rem;">
                            <label>Option B</label>
                            <input type="text" id="override-topic-2" value="${t2}" placeholder="Second Topic Option..." style="width:100%; padding: 0.5rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 4px;">
                        </div>
                        <button id="save-assigned-topics-btn" class="btn mt-1" style="font-size: 0.85rem; padding: 0.5rem 1rem; width: auto; background: var(--secondary-color);">Update Topic Options</button>
                        <button id="reroll-topics-btn" class="btn mt-1" style="font-size: 0.85rem; padding: 0.5rem 1rem; width: auto; background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.5); margin-left: 0.5rem;">Re-roll Randomly</button>
                    `;

                    document.getElementById('save-assigned-topics-btn').addEventListener('click', () => {
                        const newT1 = document.getElementById('override-topic-1').value.trim();
                        const newT2 = document.getElementById('override-topic-2').value.trim();
                        let newAssign = [];
                        if (newT1) newAssign.push(newT1);
                        if (newT2) newAssign.push(newT2);
                        window.db.updateUser(user.email, { assignedTopics: newAssign });
                        alert("Topic options updated successfully. The student will see these options when they log in.");
                        window.app.render();
                        // Re-fetch DOM elements after render to avoid stale references if necessary, or just wait for another click
                    });

                    document.getElementById('reroll-topics-btn').addEventListener('click', () => {
                        const depts = window.db.getDepartments();
                        const myDept = depts.find(d => d.id === user.department);
                        const availableTopics = myDept ? myDept.topics : [];
                        if (availableTopics.length >= 2) {
                            let shuffled = [...availableTopics].sort(() => 0.5 - Math.random());
                            window.db.updateUser(user.email, { assignedTopics: shuffled.slice(0, 2) });
                            window.app.render();
                        } else {
                            alert("Not enough topics in the department to re-roll. Add more topics in the settings tab.");
                        }
                    });

                } else {
                    topicsSec.innerHTML = `
                        <h4 style="margin-bottom:1rem; color: #f8fafc;">Manage Topic Details</h4>
                        <div class="form-group">
                            <label>Edit Approved Topic</label>
                            <input type="text" id="override-approved-topic" value="${user.approvedTopic}" style="width:100%; padding: 0.5rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 4px;">
                        </div>
                        <button id="save-approved-topic-btn" class="btn mt-1" style="font-size: 0.85rem; padding: 0.5rem 1rem; width: auto; background: var(--secondary-color);">Save Topic Edit</button>
                        <button id="revoke-topic-btn" class="btn mt-1" style="font-size: 0.85rem; padding: 0.5rem 1rem; width: auto; background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.3); margin-left: 0.5rem;">Revoke Approval & Force Re-select</button>
                    `;

                    document.getElementById('save-approved-topic-btn').addEventListener('click', () => {
                        const newApproved = document.getElementById('override-approved-topic').value.trim();
                        if (newApproved) {
                            window.db.updateUser(user.email, { approvedTopic: newApproved });
                            alert("Approved topic updated.");
                            window.app.render();
                        }
                    });

                    document.getElementById('revoke-topic-btn').addEventListener('click', () => {
                        if (confirm("Are you sure you want to revoke their approved topic? This will force them to pick a new topic.")) {
                            window.db.updateUser(user.email, { approvedTopic: null, stage: 'topics' });
                            window.app.render();
                        }
                    });
                }
            }

            const financeSec = document.getElementById('manage-finance-section');
            financeSec.innerHTML = `
                <h4 style="margin-bottom:1rem; color: #f8fafc;">Financial Status</h4>
                <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; border: 1px solid var(--glass-border); display:flex; justify-content:space-between; margin-bottom: 1rem;">
                    <div>
                        <span style="color: var(--text-muted); font-size: 0.85rem;">Amount Paid</span><br>
                        <strong style="color: #10b981;">₦${rawPaid.toLocaleString()}</strong>
                    </div>
                    <div style="text-align: right;">
                        <span style="color: var(--text-muted); font-size: 0.85rem;">Outstanding Balance</span><br>
                        <strong style="color: #ef4444;">₦${rawBalance.toLocaleString()}</strong>
                    </div>
                </div>
                <div class="form-group" style="margin-top: 1rem;">
                    <label style="font-size: 0.85rem; color: var(--text-muted);">Override Total Project Fee (₦)</label>
                    <div style="display:flex; gap:0.5rem; flex-wrap: wrap;">
                        <input type="number" id="override-total-fee" value="${totalFee}" style="flex:1; padding: 0.5rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 4px;">
                        <button id="save-fee-btn" class="btn btn-secondary" style="width:auto; padding:0.5rem 1rem; font-size: 0.85rem;">Update Fee</button>
                    </div>
                </div>
                <button id="reset-payment-btn" class="btn btn-secondary mt-1" style="width:100%; border-color: rgba(239, 68, 68, 0.3); color: #fca5a5;">Wipe Student Payment History</button>
                ${user.pendingPayment > 0 ? `
                    <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.5); border-radius: 8px; padding: 1rem; margin-top: 1rem;">
                        <h4 style="color: #fbbf24; margin-bottom: 0.5rem; font-size: 1rem;">Pending Verification</h4>
                        <p style="font-size: 0.9rem; color: #fcd34d; margin-bottom: 1rem;">Student submitted a payment of <strong>₦${user.pendingPayment.toLocaleString()}</strong>.</p>
                        <button id="confirm-payment-btn" class="btn" style="background: #f59e0b; width: 100%;">Confirm Receipt (₦${user.pendingPayment.toLocaleString()})</button>
                    </div>
                ` : ''}
            `;

            document.getElementById('save-fee-btn').addEventListener('click', () => {
                const newFee = parseFloat(document.getElementById('override-total-fee').value);
                if (!isNaN(newFee) && newFee >= 0) {
                    const newBalance = Math.max(0, newFee - rawPaid);
                    window.db.updateUser(user.email, { totalFee: newFee, balance: newBalance });
                    window.app.render();
                    updateManageModalUI();
                }
            });

            document.getElementById('reset-payment-btn').addEventListener('click', () => {
                if (confirm("Are you certain you want to wipe this student's payment data? They will owe the full balance again and be sent back to the payment stage.")) {
                    window.db.updateUser(user.email, { amountPaid: 0, balance: totalFee, pendingPayment: 0, stage: 'payment' });
                    window.app.render();
                    updateManageModalUI();
                }
            });

            if (user.pendingPayment > 0) {
                document.getElementById('confirm-payment-btn').addEventListener('click', () => {
                    const newPaid = rawPaid + user.pendingPayment;
                    const newBalance = rawBalance - user.pendingPayment;
                    const newStage = (user.stage === 'payment') ? 'topics' : user.stage;

                    window.db.updateUser(user.email, { amountPaid: newPaid, balance: newBalance, pendingPayment: 0, stage: newStage });
                    window.app.render();
                });
            }

            const projectSec = document.getElementById('manage-project-section');
            if (user.projectFile) {
                projectSec.innerHTML = `
                    <h4 style="margin-bottom:1rem; color: #f8fafc;">Project File Details</h4>
                    ${rawBalance === 0 ? `<div style="background: rgba(16, 185, 129, 0.1); color: #6ee7b7; padding: 1rem; border-radius: 8px; border: 1px solid #10b981; font-size: 0.85rem; margin-bottom: 1rem;"><strong>Ready for Finalization:</strong> This student has completely fulfilled their balance! If the currently uploaded file is merely Chapters 1-3, please use the Re-upload section immediately below to deliver their Full Final Masterfile.</div>` : ''}
                    ${rawBalance > 0 ? `<div style="background: rgba(245, 158, 11, 0.1); color: #fcd34d; padding: 1rem; border-radius: 8px; border: 1px solid #f59e0b; font-size: 0.85rem; margin-bottom: 1rem;"><strong>Awaiting Completion:</strong> You have uploaded Chapters 1-3. The student has an outstanding balance of ₦${rawBalance.toLocaleString()} preventing them from receiving the final masterfile.</div>` : ''}
                    <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; display:flex; justify-content:space-between; align-items:center;">
                        <span style="color: #fff; font-weight:500;">${user.projectFile}</span>
                        <button id="delete-file-btn" class="btn" style="background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.3); padding: 0.5rem 1rem; width: auto; box-shadow:none; font-size: 0.85rem;">Delete File</button>
                    </div>
                    <div class="form-group">
                        <label>Re-upload & Replace File</label>
                        <input type="file" id="replace-file-input" style="padding: 0.5rem;" accept=".zip,.pdf,.docx,.rar">
                    </div>
                    <button id="reupload-btn" class="btn btn-secondary mt-1">Re-upload File & Notify Student</button>
                `;

                document.getElementById('delete-file-btn').addEventListener('click', () => {
                    if (confirm('Are you sure you want to permanently delete this project material?')) {
                        window.db.updateUser(user.email, { projectFile: null, stage: 'pending_project' });
                        window.app.render();
                    }
                });

                document.getElementById('reupload-btn').addEventListener('click', () => {
                    const fileInput = document.getElementById('replace-file-input');
                    if (fileInput.files.length > 0) {
                        window.db.updateUser(user.email, { projectFile: fileInput.files[0].name, stage: 'project_ready' });
                        window.app.render();
                    } else {
                        alert('Please select a replacement file first.');
                    }
                });
            } else {
                projectSec.innerHTML = `
                    <h4 style="margin-bottom:1rem; color: #f8fafc;">Project File Delivery</h4>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">No file has been uploaded for this student yet.</p>
                    ${user.approvedTopic ? `
                        ${rawBalance > 0 ? `<div style="background: rgba(239, 68, 68, 0.1); color: #fca5a5; padding: 1rem; border-radius: 8px; border: 1px solid rgba(239,68,68,0.3); font-size: 0.85rem; margin-bottom: 1rem;">Note: Student has an outstanding balance of ₦${rawBalance.toLocaleString()}. You should ONLY deliver Chapters 1-3 until they completely balance up.</div>` : ''}
                        <div class="form-group mt-1">
                            <label>Upload Project Material</label>
                            <input type="file" id="new-file-input" style="padding: 0.5rem;" accept=".zip,.pdf,.docx,.rar">
                        </div>
                        <button id="upload-new-btn" class="btn mt-1">Upload & Deliver File</button>
                    ` : '<div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245,158,11,0.5); padding: 1rem; border-radius: 8px; color: #fbbf24; font-size: 0.9rem;">Student must complete Payment and select an Approved Topic before you can upload their project.</div>'}
                `;

                const uploadBtn = document.getElementById('upload-new-btn');
                if (uploadBtn) {
                    uploadBtn.addEventListener('click', () => {
                        const fileInput = document.getElementById('new-file-input');
                        if (fileInput.files.length > 0) {
                            window.db.updateUser(user.email, { projectFile: fileInput.files[0].name, stage: 'project_ready' });
                            window.app.render();
                        } else {
                            alert('Please select a file first.');
                        }
                    });
                }
            }
        };

        document.querySelectorAll('.manage-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                currentManageEmail = e.target.dataset.email;
                updateManageModalUI();
                manageModal.style.display = 'flex';
            });
        });

        document.getElementById('save-stage-btn').addEventListener('click', () => {
            const newStage = document.getElementById('manage-stage-select').value;
            if (currentManageEmail) {
                window.db.updateUser(currentManageEmail, { stage: newStage });
                window.app.render();
            }
        });
    },

    initFeedbacksTab: function () {
        document.querySelectorAll('.resolve-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                window.db.resolveFeedback(e.target.dataset.id);
                window.app.render();
            });
        });
    },

    initUsersTab: function () {
        // Admin Manual Registration
        const form = document.getElementById('admin-create-user-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('new-email').value;
                const users = window.db.getUsers();

                if (users.find(u => u.email === email)) {
                    alert('Email already exists in system.');
                    return;
                }

                const newUser = {
                    name: document.getElementById('new-name').value,
                    department: document.getElementById('new-department').value,
                    email: email,
                    password: document.getElementById('new-password').value,
                    role: 'student',
                    stage: 'payment',
                    assignedTopics: [],
                    approvedTopic: null,
                    projectFile: null,
                    amountPaid: 0,
                    totalFee: 50000,
                    balance: 50000,
                    pendingPayment: 0
                };

                window.db.addUser(newUser);
                window.app.render();
            });
        }

        // Admin User Deletion
        document.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm('Are you absolutely certain you want to permanently delete this user?')) {
                    const email = e.target.dataset.email;
                    window.db.deleteUser(email);
                    window.app.render();
                }
            });
        });
    },

    initSettingsTab: function () {
        // Publish Rules & Bank Details
        document.getElementById('save-rules-btn').addEventListener('click', () => {
            const rules = document.getElementById('rules-input').value;
            const bankName = document.getElementById('bank-name-input').value;
            const accountName = document.getElementById('account-name-input').value;
            const accountNo = document.getElementById('account-no-input').value;
            window.db.saveSettings({ projectRules: rules, bankName, accountName, accountNo });
            alert("Settings and Bank Details published to global student dashboard successfully.");
        });

        // Broadcast Event
        const eventForm = document.getElementById('add-event-form');
        if (eventForm) {
            eventForm.addEventListener('submit', (e) => {
                e.preventDefault();
                window.db.addEvent({
                    title: document.getElementById('event-title').value,
                    detail: document.getElementById('event-detail').value,
                    time: document.getElementById('event-time').value
                });
                window.app.render();
            });
        }

        // Delete Event
        document.querySelectorAll('.delete-event-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                window.db.deleteEvent(id);
                window.app.render();
            });
        });

        // Department Forms
        document.getElementById('add-dept-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const val = document.getElementById('new-dept-name').value.trim();
            const feeVal = parseFloat(document.getElementById('new-dept-fee').value);
            
            if (val && !isNaN(feeVal) && feeVal >= 0) {
                const depts = window.db.getDepartments();
                const idStr = val.toLowerCase().replace(/[^a-z0-9]+/g, '_');
                if (depts.find(d => d.id === idStr)) {
                    alert('Department already exists!');
                    return;
                }
                window.db.addDepartment({ id: idStr, name: val, fee: feeVal, topics: [] });
                window.app.render();
            }
        });

        document.querySelectorAll('.delete-dept-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm('Delete this entire Department and all its bound topics?')) {
                    window.db.deleteDepartment(e.target.dataset.id);
                    window.app.render();
                }
            });
        });

        document.querySelectorAll('.add-topic-form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const deptId = e.currentTarget.dataset.dept;
                const input = e.currentTarget.querySelector('.new-topic-input').value.trim();
                if (input) {
                    const depts = window.db.getDepartments();
                    const dept = depts.find(d => d.id === deptId);
                    if (dept) {
                        dept.topics.push(input);
                        window.db.updateDepartment(deptId, { topics: dept.topics });
                        window.app.render();
                    }
                }
            });
        });

        document.querySelectorAll('.delete-topic-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const deptId = e.currentTarget.dataset.dept;
                const idx = parseInt(e.currentTarget.dataset.idx);
                const depts = window.db.getDepartments();
                const dept = depts.find(d => d.id === deptId);
                if (dept) {
                    dept.topics.splice(idx, 1);
                    window.db.updateDepartment(deptId, { topics: dept.topics });
                    window.app.render();
                }
            });
        });
    }
};
