from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import random
from sentiment_analyzer import analyze_sentiment
from instagram_scraper import scrape_post_comments

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/analyze-post-url', methods=['POST'])
def api_analyze_post_url():
    data = request.json
    if not data or 'url' not in data:
        return jsonify({"error": "Missing URL"}), 400
        
    url = data['url']
    
    try:
        # 1. Scrape comments from the post URL
        post_data = scrape_post_comments(url, num_comments=20)
        
        # 2. Analyze sentiment for each comment
        analyzed_comments = []
        total_compound = 0
        pos_count = 0
        neu_count = 0
        neg_count = 0
        
        for comment in post_data['comments']:
            sentiment = analyze_sentiment(comment['text'])
            comment['sentiment'] = sentiment
            analyzed_comments.append(comment)
            
            total_compound += sentiment['compound']
            if sentiment['label'] == 'Positive': pos_count += 1
            elif sentiment['label'] == 'Negative': neg_count += 1
            else: neu_count += 1
            
        # Calculate aggregates
        num_comments = len(analyzed_comments)
        avg_compound = total_compound / num_comments if num_comments > 0 else 0
        
        # Overall Label
        if avg_compound >= 0.05: overall_label = "Positive"
        elif avg_compound <= -0.05: overall_label = "Negative"
        else: overall_label = "Neutral"

        # Calculate Percentages
        pos_pct = round((pos_count / num_comments) * 100) if num_comments > 0 else 0
        neu_pct = round((neu_count / num_comments) * 100) if num_comments > 0 else 0
        neg_pct = round((neg_count / num_comments) * 100) if num_comments > 0 else 0

        # Predict Virality / Views (Mock Logic)
        # Highly positive or highly negative posts tend to go more viral.
        virality_multiplier = 1.0 + abs(avg_compound)
        base_views = random.randint(10000, 50000)
        predicted_views = int(base_views * virality_multiplier)

        if predicted_views > 80000:
            virality_status = "High Viral Potential 🔥"
        elif predicted_views > 40000:
            virality_status = "Good Reach 📈"
        else:
            virality_status = "Average Reach 📉"

        return jsonify({
            "url": post_data['url'],
            "shortcode": post_data['shortcode'],
            "aggregate": {
                "average_score": round(avg_compound, 3),
                "overall_label": overall_label,
                "distribution": {
                    "positive": pos_count,
                    "neutral": neu_count,
                    "negative": neg_count
                },
                "percentages": {
                    "positive": pos_pct,
                    "neutral": neu_pct,
                    "negative": neg_pct
                },
                "virality": {
                    "predicted_views": predicted_views,
                    "status": virality_status
                }
            },
            "comments": analyzed_comments
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
