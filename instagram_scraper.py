import random
import re

# Mock comment pools for generating realistic engagement
POSITIVE_COMMENTS = [
    "This is absolutely amazing! 😍",
    "Love the vibe here, keep it up! 🔥",
    "Wow, such a great post! Inspired.",
    "Best thing I've seen all day! 👏",
    "Incredible detail, I want one! ❤️",
    "So beautiful, you are killing it!",
    "I'm obsessed with this look! ✨"
]

NEUTRAL_COMMENTS = [
    "Interesting perspective.",
    "Can you tell me where you got this?",
    "Check your DMs please.",
    "I've seen similar things before.",
    "Okay, cool.",
    "What camera did you use for this?",
    "Just passing by."
]

NEGATIVE_COMMENTS = [
    "Honestly, I don't like this at all. 😒",
    "Way too overpriced for what it is.",
    "This didn't work for me, very disappointed. 😡",
    "Overrated in my opinion.",
    "Customer service was terrible.",
    "I expected much better quality.",
    "Not a fan of this new style."
]

def extract_shortcode(url):
    """Extracts the Instagram shortcode from a given URL."""
    # Match patterns like https://www.instagram.com/p/CqQ9X_vL7X-/
    match = re.search(r'instagram\.com/(?:p|reel)/([^/?#&]+)', url)
    if match:
        return match.group(1)
    return "unknown"

def scrape_post_comments(url, num_comments=15):
    """
    Simulates scraping comments from an Instagram post URL.
    Since Instagram actively blocks anonymous scraping (403 Forbidden),
    this generates realistic mock audience comments for demonstration.
    """
    shortcode = extract_shortcode(url)
    if shortcode == "unknown":
        raise ValueError("Invalid Instagram URL provided.")
    
    comments = []
    for _ in range(num_comments):
        # Randomly pick sentiment to generate a mixed bag of comments
        # 60% positive, 20% neutral, 20% negative for a realistic tilt
        choice = random.choices(["pos", "neu", "neg"], weights=[0.6, 0.2, 0.2])[0]
        
        if choice == "pos":
            text = random.choice(POSITIVE_COMMENTS)
        elif choice == "neu":
            text = random.choice(NEUTRAL_COMMENTS)
        else:
            text = random.choice(NEGATIVE_COMMENTS)
            
        comments.append({
            "username": f"user_{random.randint(1000, 9999)}",
            "text": text,
            "likes": random.randint(0, 50)
        })
        
    return {
        "url": url,
        "shortcode": shortcode,
        "total_comments_analyzed": len(comments),
        "comments": comments
    }
