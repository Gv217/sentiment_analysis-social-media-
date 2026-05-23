// API Base URL
const API_BASE = 'http://127.0.0.1:5000/api';

let sentimentChartInstance = null;

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
        content.classList.remove('active');
    });
    
    const targetTab = document.getElementById(tabId);
    targetTab.classList.remove('hidden');
    setTimeout(() => targetTab.classList.add('active'), 10);
}

// Analyze Post URL
async function analyzePostUrl() {
    let url = document.getElementById('post-url-input').value.trim();
    if (!url || !url.includes('instagram.com')) {
        alert("Please enter a valid Instagram post URL.");
        return;
    }

    document.getElementById('url-loading').classList.remove('hidden');
    document.getElementById('url-result').classList.add('hidden');
    
    const loadingText = document.getElementById('loading-text');
    loadingText.textContent = "Connecting to Instagram API...";
    setTimeout(() => loadingText.textContent = "Fetching comments...", 800);
    setTimeout(() => loadingText.textContent = "Running NLP sentiment pipeline...", 1600);

    try {
        const response = await fetch(`${API_BASE}/analyze-post-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayUrlResult(data);
        } else {
            alert(data.error || "An error occurred.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to connect to the server.");
    } finally {
        document.getElementById('url-loading').classList.add('hidden');
    }
}

function displayUrlResult(data) {
    document.getElementById('res-shortcode').textContent = data.shortcode;
    
    // Update labels and score
    const overallLabel = document.getElementById('res-overall-label');
    overallLabel.textContent = data.aggregate.overall_label;
    overallLabel.className = `badge ${data.aggregate.overall_label.toLowerCase()}`;
    
    document.getElementById('res-avg-score').textContent = data.aggregate.average_score.toFixed(3);

    // Update percentages
    document.getElementById('res-pos-pct').textContent = data.aggregate.percentages.positive;
    document.getElementById('res-neu-pct').textContent = data.aggregate.percentages.neutral;
    document.getElementById('res-neg-pct').textContent = data.aggregate.percentages.negative;

    // Update predicted views
    document.getElementById('res-predicted-views').textContent = data.aggregate.virality.predicted_views.toLocaleString() + " Views";
    
    const viralityStatus = document.getElementById('res-virality-status');
    viralityStatus.textContent = data.aggregate.virality.status;
    
    if (data.aggregate.virality.status.includes('High Viral')) {
        viralityStatus.style.color = '#f58529'; // Orange fire color
    } else if (data.aggregate.virality.status.includes('Good Reach')) {
        viralityStatus.style.color = '#2ecc71'; // Green
    } else {
        viralityStatus.style.color = '#95a5a6'; // Gray
    }

    renderChart(data.aggregate.distribution);

    const commentsList = document.getElementById('comments-list');
    commentsList.innerHTML = '';
    
    if (data.comments.length === 0) {
        commentsList.innerHTML = '<p style="color: #aaa; text-align: center; margin-top: 1rem;">No comments found.</p>';
    }
    
    data.comments.forEach(comment => {
        const div = document.createElement('div');
        div.className = `post-item ${comment.sentiment.label.toLowerCase()}`;
        
        div.innerHTML = `
            <p><strong>@${comment.username}</strong>: "${comment.text}"</p>
            <div class="post-stats">
                <span>❤️ ${comment.likes}</span>
                <span>Score: ${comment.sentiment.compound.toFixed(2)}</span>
            </div>
        `;
        commentsList.appendChild(div);
    });

    document.getElementById('url-result').classList.remove('hidden');
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
