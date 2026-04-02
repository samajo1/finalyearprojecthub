const SUPABASE_URL = 'https://nghvvrmvbluvkptuaqih.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5naHZ2cm12Ymx1dmtwdHVhcWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNjk5NTMsImV4cCI6MjA5MDY0NTk1M30.d87JkS0vmXNfJ4pcOSha41ZyZFLUsfePFoVfF9daJHY';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

window.db = {
    cache: {
        users: [], feedbacks: [], events: [], settings: null, departments: []
    },
    
    // Auth (Local Only)
    getCurrentUser: () => JSON.parse(localStorage.getItem('currentUser')),
    setCurrentUser: (user) => localStorage.setItem('currentUser', JSON.stringify(user)),
    logout: () => {
        localStorage.removeItem('currentUser');
        window.app.render();
    },

    init: async function() {
        try {
            // Add a timeout warning for slow/paused Supabase projects
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Supabase Connection Timeout')), 10000)
            );

            // Fetch everything concurrently to save time, wrapped in a race against the timeout
            const [uRes, fRes, eRes, sRes, dRes] = await Promise.race([
                Promise.all([
                    supabaseClient.from('users').select('*'),
                    supabaseClient.from('feedbacks').select('*'),
                    supabaseClient.from('events').select('*'),
                    supabaseClient.from('settings').select('*').eq('id', 'global'),
                    supabaseClient.from('departments').select('*')
                ]),
                timeoutPromise
            ]);
            
            this.cache.users = uRes.data || [];
            this.cache.feedbacks = fRes.data || [];
            this.cache.events = eRes.data || [];
            this.cache.settings = (sRes.data && sRes.data[0]) ? sRes.data[0] : null;
            this.cache.departments = dRes.data || [];

            // Seeding defaults on first run if totally empty
            if (this.cache.users.length === 0) {
                const admin = { name: 'System Admin', email: 'admin@portal.com', password: 'admin', role: 'admin' };
                this.addUser(admin);
            }
            if (!this.cache.settings) {
                const defSet = { 
                    id: 'global', 
                    projectRules: "Welcome to the portal. Please ensure your project submissions are completely original. Plagiarism checks will be strictly enforced upon final submittal.",
                    bankName: "GTBank",
                    accountName: "Samajo Portal Solutions",
                    accountNo: "0123456789"
                };
                this.cache.settings = defSet;
                supabaseClient.from('settings').insert(defSet).then(); // fire & forget
            }
            if (this.cache.events.length === 0) {
                this.addEvent({ id: '1', title: 'Advanced Methodologies', detail: 'Mandatory seminar for final years', time: '10:00 AM' });
                this.addEvent({ id: '2', title: 'Ethics in Practice', detail: 'General departmental lecture', time: '01:30 PM' });
            }
            if (this.cache.departments.length === 0) {
                this.addDepartment({ id: 'computer_science', name: 'Computer Science', fee: 50000, topics: ["AI-Driven Intrusion Detection System", "Blockchain for Secure Voting Systems", "Predictive Analysis in Healthcare using ML", "IoT based Smart Agriculture System"] });
                this.addDepartment({ id: 'engineering', name: 'Engineering', fee: 60000, topics: ["Design of a Miniature Wind Turbine", "Smart Grid Energy Management", "Autonomous Drone Navigation", "Advanced Material Stress Testing"] });
                this.addDepartment({ id: 'business', name: 'Business Administration', fee: 40000, topics: ["Impact of Digital Marketing on Startups", "Cryptocurrency Adoption in Emerging Markets", "Supply Chain Optimization Analytics", "Consumer Behavior in E-commerce"] });
            }
        } catch (error) {
            console.error("Supabase Init Error:", error);
            alert("Database connection failed. Please ensure your tables are created correctly via the SQL Editor.");
        }
    },

    // Users
    getUsers: () => window.db.cache.users,
    addUser: (userObj) => {
        window.db.cache.users.push(userObj);
        supabaseClient.from('users').insert(userObj).then();
    },
    updateUser: (email, updates) => {
        const u = window.db.cache.users.find(u => u.email === email);
        if (u) {
            Object.assign(u, updates);
            supabaseClient.from('users').update(updates).eq('email', email).then();
            
            // Sync local storage if active user is modified
            const current = window.db.getCurrentUser();
            if (current && current.email === email) {
                window.db.setCurrentUser(u);
            }
        }
    },
    deleteUser: (email) => {
        window.db.cache.users = window.db.cache.users.filter(u => u.email !== email);
        supabaseClient.from('users').delete().eq('email', email).then();
    },

    // Events
    getEvents: () => window.db.cache.events,
    addEvent: (eventObj) => {
        if (!eventObj.id) eventObj.id = Date.now().toString();
        window.db.cache.events.push(eventObj);
        supabaseClient.from('events').insert(eventObj).then();
    },
    deleteEvent: (id) => {
        window.db.cache.events = window.db.cache.events.filter(e => e.id !== id);
        supabaseClient.from('events').delete().eq('id', id).then();
    },

    // Feedbacks
    getFeedbacks: () => window.db.cache.feedbacks,
    addFeedback: (fb) => {
        fb.id = Date.now().toString();
        fb.date = new Date().toLocaleDateString();
        fb.status = 'Pending';
        window.db.cache.feedbacks.push(fb);
        supabaseClient.from('feedbacks').insert(fb).then();
    },
    resolveFeedback: (id) => {
        const f = window.db.cache.feedbacks.find(x => x.id === id);
        if (f) {
            f.status = 'Resolved';
            supabaseClient.from('feedbacks').update({ status: 'Resolved' }).eq('id', id).then();
        }
    },

    // Settings
    getSettings: () => window.db.cache.settings,
    saveSettings: (settingsObj) => {
        Object.assign(window.db.cache.settings, settingsObj);
        supabaseClient.from('settings').update(settingsObj).eq('id', 'global').then();
    },

    // Departments
    getDepartments: () => window.db.cache.departments,
    addDepartment: (deptObj) => {
        window.db.cache.departments.push(deptObj);
        supabaseClient.from('departments').insert(deptObj).then();
    },
    updateDepartment: (id, updates) => {
        const d = window.db.cache.departments.find(x => x.id === id);
        if (d) {
            Object.assign(d, updates);
            supabaseClient.from('departments').update(updates).eq('id', id).then();
        }
    },
    deleteDepartment: (id) => {
        window.db.cache.departments = window.db.cache.departments.filter(d => d.id !== id);
        supabaseClient.from('departments').delete().eq('id', id).then();
    }
};
