window.app = {
    container: document.getElementById('app'),
    
    render: function() {
        if (!window.app.container) {
            window.app.container = document.getElementById('app');
        }

        const currentUser = window.db.getCurrentUser();
        
        if (!currentUser) {
            if (window.app.showLanding) {
                window.landing.renderLanding(window.app.container);
            } else {
                window.auth.renderAuth(window.app.container);
            }
        } else if (currentUser.role === 'admin') {
            window.admin.renderAdminDashboard(window.app.container);
        } else {
            window.student.renderStudentDashboard(window.app.container);
        }
    },

    initApp: async function() {
        // Assume true unless they log in previously. 
        // We evaluate this in render().
        window.app.showLanding = true;

        if (!window.app.container) window.app.container = document.getElementById('app');
        
        window.app.container.innerHTML = `
            <div style="display:flex; justify-content:center; align-items:center; width:100%; height:100vh; flex-direction:column; gap: 1rem;">
                <svg style="width: 48px; height: 48px; color: var(--primary-color); animation: spin 1s linear infinite;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                <h3 style="color: white; font-weight: 500;">Connecting to Cloud...</h3>
            </div>
            <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
        `;

        await window.db.init();
        window.app.render();
    }
};

window.app.initApp();
