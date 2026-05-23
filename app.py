from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from sentiment_analyzer import analyze_sentiment
from instagram_scraper import scrape_profile, login_instagram

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"error": "Missing credentials"}), 400
        
    try:
        success = login_instagram(data['username'], data['password'])
        return jsonify({"success": success})
    except Exception as e:
        return jsonify({"error": str(e)}), 401

@app.route('/api/analyze-post', methods=['POST'])
def api_analyze_post():
    data = request.json
    if not data or 'caption' not in data:
        return jsonify({"error": "Missing caption"}), 400
        
    caption = data['caption']
    sentiment_result = analyze_sentiment(caption)
    
    return jsonify({
        "caption": caption,
        "sentiment": sentiment_result
    })

@app.route('/api/analyze-profile', methods=['POST'])
def api_analyze_profile():
    data = request.json
    if not data or 'username' not in data:
        return jsonify({"error": "Missing username"}), 400
        
    username = data['username']
    
    try:
        # 1. Scrape the profile to get recent posts
        profile_data = scrape_profile(username, num_posts=6)
        
        # 2. Analyze sentiment for each post
        analyzed_posts = []
        total_compound = 0
        pos_count = 0
        neu_count = 0
        neg_count = 0
        
        for post in profile_data['posts']:
            sentiment = analyze_sentiment(post['caption'])
            post['sentiment'] = sentiment
            analyzed_posts.append(post)
            
            total_compound += sentiment['compound']
            if sentiment['label'] == 'Positive': pos_count += 1
            elif sentiment['label'] == 'Negative': neg_count += 1
            else: neu_count += 1
            
        # Calculate aggregates
        num_posts = len(analyzed_posts)
        avg_compound = total_compound / num_posts if num_posts > 0 else 0
        
        # Overall Label
        if avg_compound >= 0.05: overall_label = "Positive"
        elif avg_compound <= -0.05: overall_label = "Negative"
        else: overall_label = "Neutral"

        return jsonify({
            "profile": profile_data['profile'],
            "followers": profile_data['follower_count'],
            "aggregate": {
                "average_score": round(avg_compound, 3),
                "overall_label": overall_label,
                "distribution": {
                    "positive": pos_count,
                    "neutral": neu_count,
                    "negative": neg_count
                }
            },
            "posts": analyzed_posts
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
