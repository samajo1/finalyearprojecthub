window.student = {
    activeTab: 'home',

    assignTopics: function (user) {
        if (!user.assignedTopics || user.assignedTopics.length === 0) {
            const depts = window.db.getDepartments();
            const myDept = depts.find(d => d.id === user.department);
            const availableTopics = myDept ? myDept.topics : [];

            if (availableTopics.length >= 2) {
                // Shuffle and pick 2 topics
                let shuffled = [...availableTopics].sort(() => 0.5 - Math.random());
                user.assignedTopics = shuffled.slice(0, 2);
                window.db.updateUser(user.email, { assignedTopics: user.assignedTopics });
            }
        }
        return user.assignedTopics;
    },

    triggerPaystackPayment: function (user, amount) {
        console.log('triggerPaystackPayment called for amount:', amount);
        if (!window.PaystackPop) {
            console.error('Paystack script is not loaded!');
            alert('Payment gateway is loading, please try again in a moment...');
            return;
        }

        console.log('Initializing Paystack with key:', 'pk_test_222ac2f19a47ddc1970ba73e56fd8ab23ef8d39d');
        try {
            let handler = PaystackPop.setup({
                key: 'pk_test_222ac2f19a47ddc1970ba73e56fd8ab23ef8d39d', // Test public key
                email: user.email || 'test@example.com', // fallback just in case
                amount: amount * 100, // amount in kobo
                currency: 'NGN',
                ref: '' + Math.floor((Math.random() * 1000000000) + 1), // generate a random reference number
                callback: function (response) {
                    console.log('Paystack UI callback success:', response);
                    // Success:
                    let rawPaid = user.amountPaid || 0;
                    let rawBalance = user.balance === undefined ? 50000 : user.balance;

                    let updates = {
                        amountPaid: rawPaid + amount,
                        balance: Math.max(0, rawBalance - amount),
                        pendingPayment: 0 // clear any pending manual review
                    };

                    // If this is their first payment, auto advance to topics
                    if (user.stage === 'payment') updates.stage = 'topics';

                    window.db.updateUser(user.email, updates);
                    alert('Payment complete! Reference: ' + response.reference);
                    window.app.render();
                },
                onClose: function () {
                    console.log('Paystack UI closed without payment');
                }
            });
            console.log('Opening Paystack Iframe...');
            handler.openIframe();
        } catch (e) {
            console.error('Error opening Paystack:', e);
            alert('An error occurred trying to load Paystack: ' + e.message);
        }
    },

    // --- Tab 1: Home / Activities ---
    renderHomeTab: function (user) {
        // Fallbacks for older DB items
        const rawPaid = user.amountPaid || 0;
        const rawBalance = user.balance === undefined ? 50000 : user.balance;

        const events = window.db.getEvents();
        const settings = window.db.getSettings();

        let eventsHtml = '';
        if (events.length === 0) {
            eventsHtml = '<p style="color:var(--text-muted); font-size:0.9rem;">No upcoming events currently scheduled.</p>';
        } else {
            eventsHtml = events.map(e => `
                <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); cursor:pointer;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                        <span style="font-weight: 500; color: #fff;">${e.title}</span>
                        <strong style="color: var(--primary-color); font-size: 0.85rem;">${e.time}</strong>
                    </div>
                    <p style="margin:0; font-size: 0.85rem; color: #94a3b8;">${e.detail}</p>
                </div>
            `).join('');
        }

        return `
            <div class="fade-in">
                <h2 class="mb-2">Academy Activities</h2>
                <div class="grid-2" style="align-items: start;">
                    <div class="glass-card" style="padding: 1.5rem;">
                        <h4 style="color: #cbd5e1; margin-bottom: 1rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem;">Official Feed / Events</h4>
                        ${eventsHtml}
                    </div>
                    
                    <div style="display:flex; flex-direction:column; gap: 1rem;">
                        <div class="glass-card" style="padding: 1.5rem;">
                            <h4 style="color: #cbd5e1; margin-bottom: 1rem;">Project Rules & Guidelines</h4>
                            <p style="font-size: 0.9rem; color: #cbd5e1; line-height: 1.6; padding: 1rem; background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                                ${settings.projectRules}
                            </p>
                        </div>

                        <div class="glass-card" style="padding: 1.5rem;">
                            <h4 style="color: #cbd5e1; margin-bottom: 1rem;">Project Finance Overview</h4>
                            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.2); padding: 0.75rem 1rem; border-radius: 8px;">
                                    <span style="color: var(--text-muted); font-size: 0.9rem;">Amount Paid</span>
                                    <strong style="color: #10b981; font-size: 1.1rem;">₦${rawPaid.toLocaleString()}</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.2); padding: 0.75rem 1rem; border-radius: 8px;">
                                    <span style="color: var(--text-muted); font-size: 0.9rem;">Outstanding Balance</span>
                                    <strong style="color: #ef4444; font-size: 1.1rem;">₦${rawBalance.toLocaleString()}</strong>
                                </div>
                                ${user.pendingPayment > 0 ?
                `<div style="text-align: center; margin-top: 0.5rem; font-size: 0.8rem; color: #fbbf24;">A payment of ₦${user.pendingPayment.toLocaleString()} is awaiting admin confirmation.</div>`
                : ''
            }
                            </div>
                        </div>

                        <div class="glass-card" style="padding: 1.5rem; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                            <h4 style="color: #cbd5e1; margin-bottom: 1rem;">Project Status</h4>
                            ${user.stage === 'completed' ?
                '<span class="badge badge-success" style="font-size:1rem;">Completed</span>' :
                '<span class="badge badge-warning" style="font-size:1rem;">In Progress</span>'
            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // --- Tab 2: Project Work ---
    getProjectHeader: function (user) {
        return `
            <div class="header">
                <div>
                    <h2>Project Workspace</h2>
                    <p style="margin:0">Manage your final project steps here.</p>
                </div>
            </div>
            <div class="stepper">
                <div class="step ${user.stage === 'payment' ? 'active' : 'completed'}">1<span class="step-label">Payment</span></div>
                <div class="step ${['topics', 'pending_project', 'project_ready', 'completed'].includes(user.stage) ? (user.stage === 'topics' ? 'active' : 'completed') : ''}">2<span class="step-label">Topics</span></div>
                <div class="step ${['pending_project', 'project_ready', 'completed'].includes(user.stage) ? (user.stage === 'pending_project' ? 'active' : 'completed') : ''}">3<span class="step-label">Upload</span></div>
                <div class="step ${['project_ready', 'completed'].includes(user.stage) ? (user.stage === 'project_ready' ? 'active' : 'completed') : ''}">4<span class="step-label">Download</span></div>
            </div>
        `;
    },

    renderProjectTab: function (user) {
        if (user.pendingPayment > 0) {
            return `
                <div class="glass-card fade-in" style="width: 100%; max-width: 1000px; margin: 0 auto; text-align: center;">
                    <div style="padding: 3rem;">
                        <svg style="width: 64px; height: 64px; color: #fbbf24; margin-bottom: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <h2 class="mb-1">Payment Pending Verification</h2>
                        <p style="color:var(--text-muted); font-size: 1.1rem; line-height: 1.6;">Your recent payment of <strong style="color: white;">₦${user.pendingPayment.toLocaleString()}</strong> was successfully submitted.<br>The administration is manually reviewing and confirming it.</p>
                        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 2rem auto; max-width: 400px;">
                        <p style="color: #94a3b8; font-size: 0.9rem;">Access to the project workspace will dynamically unlock here once approved.</p>
                    </div>
                </div>
            `;
        }

        const rawPaid = user.amountPaid || 0;
        const rawBalance = user.balance === undefined ? 50000 : user.balance;
        const totalFee = user.totalFee || (rawPaid + rawBalance) || 50000;
        const halfFee = totalFee / 2;
        const fullFee = totalFee;

        const financeWidget = `
            <div style="background: rgba(0,0,0,0.3); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--glass-border);">
                <div>
                    <h4 style="margin:0; margin-bottom: 0.5rem; color: #fff;">Financial Overview</h4>
                    <p style="margin:0; font-size:0.9rem; color: var(--text-muted);">Amount Paid: <strong style="color:#10b981;">₦${rawPaid.toLocaleString()}</strong> &nbsp;•&nbsp; Balance: <strong style="color:#ef4444;">₦${rawBalance.toLocaleString()}</strong></p>
                </div>
                ${rawBalance > 0 && user.stage !== 'payment' ?
                `<div style="display:flex; gap:0.5rem;">
                        <button id="pay-bal-online-btn" class="btn" style="padding: 0.5rem 1rem; width: auto; font-size: 0.85rem; background: #10b981; color: white; border: none;">Pay Online Now (₦${rawBalance.toLocaleString()})</button>
                        <button id="pay-balance-btn" class="btn btn-secondary" style="padding: 0.5rem 1rem; width: auto; font-size: 0.85rem; border-color: rgba(99,102,241,0.5); color: #818cf8;">Manual Transfer</button>
                     </div>`
                : ''
            }
            </div>
        `;

        const settings = window.db.getSettings() || {};
        const bankName = settings.bankName || 'FCMB';
        const accountName = settings.accountName || 'Ajodo Egwuda Samson ';
        const accountNo = settings.accountNo || '3334408019';

        let content = '';
        switch (user.stage) {
            case 'payment':
                content = `
                    <div class="text-center fade-in">
                        <h3 class="mb-1">Project Processing Fee</h3>
                        <p class="mb-2">To proceed to Topic Selection, you must make a payment. You can submit the full total or split it in half initially.</p>
                        
                        <div style="max-width: 600px; margin: 0 auto 2rem auto; background: rgba(99,102,241,0.05); padding: 1.5rem; border-radius: 12px; border: 1px dashed rgba(99,102,241,0.3); text-align: left;">
                            <h4 style="margin-bottom: 0.5rem; color: #818cf8; font-size: 0.95rem;">Manual Transfer Information</h4>
                            <p style="margin: 0; font-size: 0.9rem; color: #cbd5e1; line-height: 1.6;">
                                Bank: <strong style="color: white;">${bankName}</strong><br>
                                Account Name: <strong style="color: white;">${accountName}</strong><br>
                                Account Number: <strong style="color: white; font-size: 1.1rem; letter-spacing: 1px;">${accountNo}</strong>
                            </p>
                            <p style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-muted);"><em>After transferring, click the "Pay via Bank Transfer" button below. We will manually verify your transfer.</em></p>
                        </div>
                        
                        <div class="grid-2" style="max-width: 600px; margin: 0 auto; gap: 2rem;">
                            <!-- Half Payment Option -->
                            <div style="background: rgba(0,0,0,0.2); padding: 2rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
                                <p style="color: #cbd5e1; font-size: 0.9rem; margin-bottom: 0.5rem;">Partial Payment</p>
                                <h1 style="margin-bottom: 1.5rem;">₦${halfFee.toLocaleString()}</h1>
                                <button id="pay-half-online-btn" class="btn" style="width:100%; margin-bottom: 0.5rem; background: #10b981; color: white; border: none;">Pay Online Now</button>
                                <button id="pay-half-btn" class="btn btn-secondary" style="width:100%;">Pay via Bank Transfer</button>
                            </div>
                            <!-- Full Payment Option -->
                            <div style="background: rgba(99,102,241,0.1); padding: 2rem; border-radius: 16px; border: 1px solid rgba(99,102,241,0.3);">
                                <p style="color: #818cf8; font-size: 0.9rem; margin-bottom: 0.5rem;">Full Payment</p>
                                <h1 style="margin-bottom: 1.5rem; color: #fff;">₦${fullFee.toLocaleString()}</h1>
                                <button id="pay-full-online-btn" class="btn" style="width:100%; margin-bottom: 0.5rem; background: #10b981; color: white; border: none;">Pay Online Now</button>
                                <button id="pay-full-btn" class="btn btn-secondary" style="width:100%;">Pay via Bank Transfer</button>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'topics':
                const topics = this.assignTopics(user);
                if (topics && topics.length >= 2) {
                    content = `
                        <div class="fade-in">
                            <h3 class="text-center mb-1">Select Your Project Topic</h3>
                            <p class="text-center mb-2">Based on your department, the system has assigned two topics. Please select one to submit for final approval.</p>
                            <div class="grid-2">
                                <div class="topic-card" data-topic="${topics[0]}">
                                    <h4>Topic A</h4>
                                    <p style="margin:0; margin-top:0.5rem; color: #fff;">${topics[0]}</p>
                                </div>
                                <div class="topic-card" data-topic="${topics[1]}">
                                    <h4>Topic B</h4>
                                    <p style="margin:0; margin-top:0.5rem; color: #fff;">${topics[1]}</p>
                                </div>
                            </div>
                            <div class="text-center mt-2">
                                <button id="submit-topic-btn" class="btn" disabled style="max-width: 300px;">Submit Selected Topic</button>
                            </div>
                        </div>
                    `;
                } else {
                    content = `
                        <div class="text-center fade-in">
                            <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.5); padding: 2.5rem; border-radius: 16px; margin: 0 auto; max-width: 600px;">
                                <svg style="width: 64px; height: 64px; color: #fbbf24; margin-bottom: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                <h3 class="mb-1" style="color: #fbbf24;">Topics Unavailable</h3>
                                <p style="color: #cbd5e1; font-size: 1.05rem; line-height: 1.6; margin:0;">Your department has not been supplied with enough Project Topics by the Administration.</p>
                                <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 1.5rem auto; max-width: 300px;">
                                <p style="color: var(--text-muted); font-size: 0.9rem; margin:0;">Please wait until the administration uploads topics to your faculty to proceed.</p>
                            </div>
                        </div>
                    `;
                }
                break;
            case 'pending_project':
                content = `
                    <div class="text-center fade-in">
                        <h3 class="mb-1">Topic Approved!</h3>
                        <p>Your selected topic:</p>
                        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; padding: 1rem; border-radius: 12px; margin-bottom: 2rem; color: #34d399; font-weight: 500;">
                            ${user.approvedTopic}
                        </div>
                        <div style="padding: 2rem; border: 2px dashed rgba(255,255,255,0.2); border-radius: 16px;">
                            <svg style="width: 48px; height: 48px; color: #cbd5e1; margin-bottom: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <h4>Waiting for Admin...</h4>
                            <p style="margin:0;">The administration is currently preparing your project files.</p>
                            ${rawBalance > 0 ? `<p style="margin-top: 1rem; color: #fbbf24; font-size: 0.85rem;">(Note: Admins may require full payment balance before delivering final project materials.)</p>` : ''}
                        </div>
                    </div>
                `;
                break;
            case 'project_ready':
                content = `
                    <div class="text-center fade-in">
                        <h3 class="mb-1">${rawBalance > 0 ? '<span style="color:#fbbf24;">Partial</span> Project Material Delivered' : 'Final Project Material Ready'}</h3>
                        ${rawBalance > 0 ? `<p style="margin-bottom: 2rem; color: #fcd34d;">The currently uploaded work contains <strong>Chapter One to Three</strong>. The rest of the work will be uploaded once your full payment of <strong>₦${rawBalance.toLocaleString()}</strong> has been balanced.</p>` : '<p style="margin-bottom: 2rem; color: #a7f3d0;">Congratulations! The administration has uploaded your final complete masterfile.</p>'}
                        <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid #6366f1; padding: 2rem; border-radius: 16px;">
                            <svg style="width: 64px; height: 64px; color: #818cf8; margin-bottom: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            <h3 style="margin-bottom: 1.5rem; word-break: break-all;">${user.projectFile}</h3>
                            <button id="download-btn" class="btn" style="max-width: 300px;">${rawBalance > 0 ? 'Download Chapters 1-3' : 'Download Complete Masterfile'}</button>
                        </div>
                    </div>
                `;
                break;
            case 'completed':
                content = `
                    <div class="text-center fade-in">
                        <h2 class="mb-1">Journey Completed!</h2>
                        <h4 style="color: #fff; margin-bottom: 2rem;">${user.approvedTopic}</h4>
                        <button class="btn btn-secondary" onclick="window.location.reload()" style="max-width: 200px;">Back to Home</button>
                    </div>
                `;
                break;
        }

        return `
            <div class="glass-card fade-in" style="width: 100%; max-width: 1000px; margin: 0 auto;">
                ${this.getProjectHeader(user)}
                ${financeWidget}
                ${content}
            </div>
        `;
    },

    // --- Tab 3: Feedback & Complaints ---
    renderFeedbackTab: function (user) {
        const allFeedbacks = window.db.getFeedbacks().filter(f => f.email === user.email);
        let feedbackHistoryHtml = '';

        if (allFeedbacks.length === 0) {
            feedbackHistoryHtml = '<p>You have not submitted any feedbacks yet.</p>';
        } else {
            feedbackHistoryHtml = allFeedbacks.reverse().map(f => `
                <div class="feedback-card">
                    <div class="flex-between mb-1">
                        <strong style="color: white; font-size: 1.1rem;">${f.subject}</strong>
                        <span class="badge ${f.status === 'Resolved' ? 'badge-success' : 'badge-warning'}">${f.status}</span>
                    </div>
                    <p style="margin:0; font-size: 0.95rem;">${f.message}</p>
                    <p style="margin: 0; margin-top: 1rem; font-size: 0.8rem; color: var(--text-muted);">${f.date}</p>
                </div>
            `).join('');
        }

        return `
            <div class="fade-in grid-2" style="align-items: start;">
                <div class="glass-card" style="padding: 2rem;">
                    <h2 class="mb-1">Submit Feedback</h2>
                    <p class="mb-2">Do you have a complaint or simply a suggestion? Let the administration know.</p>
                    <form id="feedback-form">
                        <div class="form-group">
                            <label>Subject</label>
                            <input type="text" id="fb-subject" required placeholder="E.g. Issue with portal">
                        </div>
                        <div class="form-group">
                            <label>Message</label>
                            <textarea id="fb-message" required rows="5" style="width: 100%; padding: 1rem; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; color: white; font-family: inherit; font-size: 1rem; transition: all 0.3s ease; resize: vertical;"></textarea>
                        </div>
                        <button type="submit" class="btn">Submit Ticket</button>
                    </form>
                </div>
                <div>
                    <h2 class="mb-1">Your Tickets</h2>
                    <div style="max-height: 60vh; overflow-y: auto; padding-right: 1rem;">
                        ${feedbackHistoryHtml}
                    </div>
                </div>
            </div>
        `;
    },

    renderStudentDashboard: function (container) {
        const user = window.db.getCurrentUser();

        let mainContent = '';
        if (this.activeTab === 'home') mainContent = this.renderHomeTab(user);
        if (this.activeTab === 'project') mainContent = this.renderProjectTab(user);
        if (this.activeTab === 'feedback') mainContent = this.renderFeedbackTab(user);

        container.innerHTML = `
            <div class="dashboard-layout fade-in">
                <!-- Sidebar -->
                <div class="sidebar">
                    <div class="sidebar-title">Student Portal</div>
                    <div style="margin-bottom: 2rem;">
                        <p style="color: white; font-weight: 500; margin: 0;">${user.name}</p>
                        <p style="font-size: 0.8rem; margin: 0; text-transform: capitalize;">${user.department.replace('_', ' ')}</p>
                    </div>
                    
                    <div class="nav-item ${this.activeTab === 'home' ? 'active' : ''}" data-tab="home">
                        <svg style="width: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                        Dashboard
                    </div>
                    <div class="nav-item ${this.activeTab === 'project' ? 'active' : ''}" data-tab="project">
                        <svg style="width: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Project Workspace
                        ${user.pendingPayment > 0 ? `<span style="width: 8px; height: 8px; border-radius: 50%; background: #fbbf24; margin-left: auto;"></span>` : ''}
                    </div>
                    <div class="nav-item ${this.activeTab === 'feedback' ? 'active' : ''}" data-tab="feedback">
                        <svg style="width: 20px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                        Feedback & Complaints
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

        // Event Listeners for Nav
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

        // Event Listeners for Project Flow (if active)
        if (this.activeTab === 'project' && !(user.pendingPayment > 0)) {
            const rawPaid = user.amountPaid || 0;
            const rawBalance = user.balance === undefined ? 50000 : user.balance;
            const totalFee = user.totalFee || (rawPaid + rawBalance) || 50000;
            const halfFee = totalFee / 2;
            const fullFee = totalFee;

            // Payment Stage Buttons
            if (user.stage === 'payment') {
                const payHalfBtn = document.getElementById('pay-half-btn');
                const payFullBtn = document.getElementById('pay-full-btn');
                const payHalfOnlineBtn = document.getElementById('pay-half-online-btn');
                const payFullOnlineBtn = document.getElementById('pay-full-online-btn');

                if (payHalfOnlineBtn) payHalfOnlineBtn.addEventListener('click', () => {
                    console.log('Pay Half Online clicked');
                    window.student.triggerPaystackPayment(user, halfFee);
                });

                if (payFullOnlineBtn) payFullOnlineBtn.addEventListener('click', () => {
                    console.log('Pay Full Online clicked');
                    window.student.triggerPaystackPayment(user, fullFee);
                });

                if (payHalfBtn) payHalfBtn.addEventListener('click', () => {
                    payHalfBtn.innerHTML = 'Processing...';
                    setTimeout(() => {
                        window.db.updateUser(user.email, { pendingPayment: halfFee });
                        window.app.render();
                    }, 500);
                });

                if (payFullBtn) payFullBtn.addEventListener('click', () => {
                    payFullBtn.innerHTML = 'Processing...';
                    setTimeout(() => {
                        window.db.updateUser(user.email, { pendingPayment: fullFee });
                        window.app.render();
                    }, 500);
                });
            }

            // Pay Outstanding Balance Button (if available)
            const payBalanceBtn = document.getElementById('pay-balance-btn');
            const payBalOnlineBtn = document.getElementById('pay-bal-online-btn');

            if (payBalOnlineBtn) {
                payBalOnlineBtn.addEventListener('click', () => {
                    console.log('Pay Balance Online clicked');
                    window.student.triggerPaystackPayment(user, user.balance);
                });
            }

            if (payBalanceBtn) {
                payBalanceBtn.addEventListener('click', () => {
                    payBalanceBtn.innerHTML = 'Processing...';
                    setTimeout(() => {
                        window.db.updateUser(user.email, { pendingPayment: user.balance });
                        window.app.render();
                    }, 500);
                });
            }

            // Topics Stage Buttons
            if (user.stage === 'topics') {
                const cards = document.querySelectorAll('.topic-card');
                const submitBtn = document.getElementById('submit-topic-btn');
                let selected = null;

                cards.forEach(card => {
                    card.addEventListener('click', () => {
                        cards.forEach(c => c.classList.remove('selected'));
                        card.classList.add('selected');
                        selected = card.dataset.topic;
                        submitBtn.disabled = false;
                    });
                });

                submitBtn.addEventListener('click', () => {
                    if (selected) {
                        window.db.updateUser(user.email, {
                            approvedTopic: selected,
                            stage: 'pending_project'
                        });
                        window.app.render();
                    }
                });
            }

            // Download Document
            if (user.stage === 'project_ready') {
                document.getElementById('download-btn').addEventListener('click', () => {
                    const a = document.createElement('a');
                    const fileContent = "This is a mock project file content for: " + user.approvedTopic;
                    const blob = new Blob([fileContent], { type: "text/plain" });
                    a.href = URL.createObjectURL(blob);
                    a.download = user.projectFile;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);

                    window.db.updateUser(user.email, { stage: 'completed' });
                    window.app.render();
                });
            }
        }

        // Event Listeners for Feedback Form (if active)
        if (this.activeTab === 'feedback') {
            const fbForm = document.getElementById('feedback-form');
            if (fbForm) {
                fbForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const sub = document.getElementById('fb-subject').value;
                    const msg = document.getElementById('fb-message').value;

                    window.db.addFeedback({
                        email: user.email,
                        name: user.name,
                        subject: sub,
                        message: msg
                    });

                    window.app.render(); // Refresh to show new ticket
                });
            }
        }
    }
};
