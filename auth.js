window.auth = {
    isLogin: true,
    renderAuth: function(container) {
        window.auth.isLogin = true;
        window.auth.renderForm(container);
    },
    renderForm: function(container) {
        const departments = window.db.getDepartments();
        const deptOptions = departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');

        container.innerHTML = `
            <div style="display:flex; justify-content:center; align-items:center; width:100%; height:100%;">
            <div class="glass-card" style="width: 100%; max-width: 450px;">
                <h1 class="text-center mb-1">${window.auth.isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                <p class="text-center mb-2">${window.auth.isLogin ? 'Login to access your project dashboard.' : 'Register to start your project journey.'}</p>
                
                <form id="auth-form">
                    ${!window.auth.isLogin ? `
                        <div class="form-group">
                            <label>Full Name</label>
                            <input type="text" id="name" required placeholder="John Doe">
                        </div>
                        <div class="form-group">
                            <label>Department</label>
                            <select id="department" required>
                                ${deptOptions}
                            </select>
                        </div>
                    ` : ''}
                    
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="email" required placeholder="you@example.com">
                    </div>
                    
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="password" required placeholder="••••••••">
                    </div>
                    
                    <button type="submit" class="btn mt-2">${window.auth.isLogin ? 'Sign In' : 'Register'}</button>
                </form>
                
                <div class="text-center mt-2">
                    <button id="toggle-auth" class="btn-link">
                        ${window.auth.isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                    </button>
                </div>
            </div>
            </div>
        `;

        document.getElementById('toggle-auth').addEventListener('click', () => {
            window.auth.isLogin = !window.auth.isLogin;
            window.auth.renderForm(container);
        });

        document.getElementById('auth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const users = window.db.getUsers();
            
            if (window.auth.isLogin) {
                const user = users.find(u => u.email === email && u.password === password);
                if (user) {
                    window.db.setCurrentUser(user);
                    window.app.render();
                } else {
                    alert('Invalid email or password');
                }
            } else {
                if (users.find(u => u.email === email)) {
                    alert('Email already registered');
                    return;
                }
                
                const assignedDeptId = document.getElementById('department').value;
                const selectedDeptObj = window.db.getDepartments().find(d => d.id === assignedDeptId);
                const dynamicFee = selectedDeptObj ? (selectedDeptObj.fee || 50000) : 50000;

                const newUser = {
                    name: document.getElementById('name').value,
                    department: assignedDeptId,
                    email,
                    password,
                    role: 'student',
                    stage: 'payment',
                    assignedTopics: [],
                    approvedTopic: null,
                    projectFile: null,
                    amountPaid: 0,
                    totalFee: dynamicFee,
                    balance: dynamicFee,
                    pendingPayment: 0
                };
                
                window.db.addUser(newUser);
                window.db.setCurrentUser(newUser);
                window.app.render();
            }
        });
    }
};
