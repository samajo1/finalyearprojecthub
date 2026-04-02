window.landing = {
    renderLanding: function(container) {
        container.innerHTML = `
            <div class="landing-page" style="width: 100%; min-height: 100vh; overflow-y: auto; background-color: var(--bg-color);">
                
                <!-- Navigation Bar -->
                <nav style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 5%; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.05); position: sticky; top: 0; z-index: 50;">
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <svg style="width:32px; height:32px; color:var(--primary-color);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                        <h2 style="margin:0; font-size: 1.25em; font-weight: 700; background: linear-gradient(90deg, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Samajo Portal</h2>
                    </div>
                    <div>
                        <button id="nav-login-btn" class="btn" style="padding: 0.5rem 1.5rem; font-size:0.9rem; border-radius: 9999px;">Sign In</button>
                    </div>
                </nav>

                <!-- Hero Section with confined Video Background -->
                <section style="padding: 10rem 5%; text-align: center; position: relative; z-index: 10; overflow: hidden; min-height: 80vh; display: flex; align-items: center; justify-content: center;">
                    
                    <!-- Live Video Background Advertisement (Confined to this block) -->
                    <video autoplay loop muted playsinline style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: -2; opacity: 1;">
                        <source src="background.mp4" type="video/mp4">
                    </video>
                    
                    <!-- Dark Overlay to ensure text readability -->
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, rgba(15,23,42,0.6), rgba(15,23,42,0.3)); z-index: -1;"></div>

                    <div class="fade-in-up" style="max-width: 800px; margin: 0 auto; display:flex; flex-direction:column; align-items:center; gap: 1.5rem; position: relative; z-index: 1;">
                        <span style="background: rgba(99,102,241,0.1); color: #818cf8; padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 500; border: 1px solid rgba(99,102,241,0.2);">
                            Next-Generation Academic Lifecycle
                        </span>
                        
                        <h1 style="font-size: 4rem; line-height: 1.1; font-weight: 800; letter-spacing: -1px; margin: 0;">
                            Simplifying Your  <span style="background: linear-gradient(90deg, #a855f7, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Final Year Project</span>
                        </h1>
                        
                        <p style="font-size: 1.25rem; color: #94a3b8; max-width: 600px; line-height: 1.6; margin: 0;">
                            A premium, fully autonomous ecosystem connecting students and administrators. Secure your topic, manage payments, and download your final thesis effortlessly.
                        </p>
                        
                        <div style="display:flex; gap: 1rem; justify-content: center; margin-top: 1rem;">
                            <button id="hero-get-started-btn" class="btn" style="padding: 1rem 2rem; font-size: 1.1rem; border-radius: 8px; box-shadow: 0 10px 30px rgba(99,102,241,0.3); transition: transform 0.2s;">
                                Access Portal Workspace
                            </button>
                            <button class="btn btn-secondary" onclick="document.getElementById('features').scrollIntoView({behavior: 'smooth'})" style="padding: 1rem 2rem; font-size: 1.1rem; border-radius: 8px;">
                                Learn More
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Features Section -->
                <section id="features" style="padding: 6rem 5%; text-align: center; position: relative; z-index: 10; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.2); margin-top: 4rem;">
                    <div style="max-width: 1200px; margin: 0 auto;">
                        <span style="color: #818cf8; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 2px; font-weight: 600;">Core Capabilities</span>
                        <h2 style="font-size: 2.5rem; margin-top: 0.5rem; margin-bottom: 4rem;">Everything you need to graduate</h2>
                        
                        <div class="grid-3" style="gap: 2.5rem; text-align: left;">
                            <!-- Feature 1 -->
                            <div class="glass-card feature-hover" style="padding: 2rem;">
                                <div style="background: rgba(16, 185, 129, 0.1); width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; color: #10b981;">
                                    <svg style="width: 30px; height: 30px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                </div>
                                <h3 style="margin-bottom: 0.75rem; font-size: 1.2rem;">Automated Secure Payments</h3>
                                <p style="color: #94a3b8; line-height: 1.6; font-size: 0.95rem;">Seamlessly handle partial or full processing fees with dual-flow options: instant online validation via Paystack or structured manual bank transfers.</p>
                            </div>

                            <!-- Feature 2 -->
                            <div class="glass-card feature-hover" style="padding: 2rem;">
                                <div style="background: rgba(99, 102, 241, 0.1); width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; color: #818cf8;">
                                    <svg style="width: 30px; height: 30px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                </div>
                                <h3 style="margin-bottom: 0.75rem; font-size: 1.2rem;">Intelligent Topic Allocation</h3>
                                <p style="color: #94a3b8; line-height: 1.6; font-size: 0.95rem;">Say goodbye to disorganized topic proposals. Register your department and receive algorithmically curated, non-duplicated project topics assigned instantly.</p>
                            </div>

                            <!-- Feature 3 -->
                            <div class="glass-card feature-hover" style="padding: 2rem;">
                                <div style="background: rgba(245, 158, 11, 0.1); width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; color: #fbbf24;">
                                    <svg style="width: 30px; height: 30px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                </div>
                                <h3 style="margin-bottom: 0.75rem; font-size: 1.2rem;">Direct Material Delivery</h3>
                                <p style="color: #94a3b8; line-height: 1.6; font-size: 0.95rem;">Never lose track of files. Your project drafts, chapters, and final finalized masterfiles are delivered flawlessly through a secure cloud-bound portal interface.</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                <!-- Footer -->
                <footer style="text-align: center; padding: 3rem 0; border-top: 1px solid rgba(255,255,255,0.05); color: #64748b; font-size: 0.9rem;">
                    &copy; 2026 Samajo Portal Solutions. All rights reserved. Let's make graduation simple.
                </footer>
            </div>
        `;

        // Transition Logic to Auth
        const navigateToAuth = () => {
            window.app.showLanding = false;
            window.app.render(); // This immediately calls the auth renderer
        };

        document.getElementById('nav-login-btn').addEventListener('click', navigateToAuth);
        document.getElementById('hero-get-started-btn').addEventListener('click', navigateToAuth);
    }
};
