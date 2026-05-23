// API Base URL
const API_BASE = 'http://127.0.0.1:5000/api';

let sentimentChartInstance = null;

// Tab Switching Logic
function switchTab(tabId) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
        content.classList.remove('active');
    });
    
    const targetTab = document.getElementById(tabId);
    targetTab.classList.remove('hidden');
    // small timeout to allow display:block to apply before animating opacity
    setTimeout(() => targetTab.classList.add('active'), 10);
}

// Login Logic
async function loginInstagram() {
    const usernameInput = document.getElementById('login-username').value.trim();
    const passwordInput = document.getElementById('login-password').value.trim();
    
    if (!usernameInput || !passwordInput) {
        alert("Please enter both username and password.");
        return;
    }
    
    document.getElementById('login-loading').classList.remove('hidden');
    document.getElementById('login-success').classList.add('hidden');
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            document.getElementById('login-success').classList.remove('hidden');
            setTimeout(() => {
                switchTab('profile'); // Switch to scanner tab automatically
                document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
                document.querySelector('.tab-btn:nth-child(1)').classList.remove('active');
            }, 1500);
        } else {
            alert(data.error || "Login failed.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to connect to the server.");
    } finally {
        document.getElementById('login-loading').classList.add('hidden');
    }
}

// Single Post Analysis
async function analyzePost() {
    const input = document.getElementById('caption-input').value.trim();
    if (!input) {
        alert("Please enter a caption to analyze.");
        return;
    }

    document.getElementById('post-loading').classList.remove('hidden');
    document.getElementById('post-result').classList.add('hidden');

    try {
        const response = await fetch(`${API_BASE}/analyze-post`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caption: input })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayPostResult(data.sentiment);
        } else {
            alert(data.error || "An error occurred.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to connect to the server.");
    } finally {
        document.getElementById('post-loading').classList.add('hidden');
    }
}

function displayPostResult(sentiment) {
    const labelBadge = document.getElementById('post-label');
    labelBadge.textContent = sentiment.label;
    labelBadge.className = `badge ${sentiment.label.toLowerCase()}`;

    document.getElementById('post-compound').textContent = sentiment.compound.toFixed(3);
    document.getElementById('post-pos').textContent = sentiment.pos.toFixed(3);
    document.getElementById('post-neu').textContent = sentiment.neu.toFixed(3);
    document.getElementById('post-neg').textContent = sentiment.neg.toFixed(3);

    document.getElementById('post-result').classList.remove('hidden');
}

// Profile Analysis
async function analyzeProfile() {
    let username = document.getElementById('profile-input').value.trim();
    if (!username) {
        alert("Please enter an Instagram username.");
        return;
    }
    
    if (username.startsWith('@')) username = username.substring(1);

    document.getElementById('profile-loading').classList.remove('hidden');
    document.getElementById('profile-result').classList.add('hidden');
    
    const loadingText = document.getElementById('loading-text');
    loadingText.textContent = "Connecting to Instagram API...";
    setTimeout(() => loadingText.textContent = "Fetching recent posts...", 800);
    setTimeout(() => loadingText.textContent = "Running NLP pipeline...", 1600);

    try {
        const response = await fetch(`${API_BASE}/analyze-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayProfileResult(data);
        } else {
            alert(data.error || "An error occurred. Did you authenticate your account in the Connect tab?");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to connect to the server.");
    } finally {
        document.getElementById('profile-loading').classList.add('hidden');
    }
}

function displayProfileResult(data) {
    document.getElementById('res-username').textContent = `@${data.profile}`;
    document.getElementById('res-followers').textContent = data.followers.toLocaleString();
    
    const overallLabel = document.getElementById('res-overall-label');
    overallLabel.textContent = data.aggregate.overall_label;
    overallLabel.className = `badge ${data.aggregate.overall_label.toLowerCase()}`;
    
    document.getElementById('res-avg-score').textContent = data.aggregate.average_score.toFixed(3);

    renderChart(data.aggregate.distribution);

    const postsList = document.getElementById('posts-list');
    postsList.innerHTML = '';
    
    if (data.posts.length === 0) {
        postsList.innerHTML = '<p style="color: #aaa; text-align: center; margin-top: 1rem;">No posts found or account is private.</p>';
    }
    
    data.posts.forEach(post => {
        const div = document.createElement('div');
        div.className = `post-item ${post.sentiment.label.toLowerCase()}`;
        
        div.innerHTML = `
            <p>"${post.caption}"</p>
            <div class="post-stats">
                <span>❤️ ${post.likes}</span>
                <span>💬 ${post.comments}</span>
                <span>Score: ${post.sentiment.compound.toFixed(2)}</span>
            </div>
        `;
        postsList.appendChild(div);
    });

    document.getElementById('profile-result').classList.remove('hidden');
}

function renderChart(distribution) {
    const ctx = document.getElementById('sentimentChart').getContext('2d');
    
    if (sentimentChartInstance) {
        sentimentChartInstance.destroy();
    }

    sentimentChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Positive', 'Neutral', 'Negative'],
            datasets: [{
                data: [distribution.positive, distribution.neutral, distribution.negative],
                backgroundColor: [
                    '#2ecc71',
                    '#95a5a6',
                    '#e74c3c'
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#ffffff' }
                }
            },
            cutout: '70%'
        }
    });
}
