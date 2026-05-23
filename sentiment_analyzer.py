import re
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

def clean_text(text):
    """
    Cleans the input text by removing URLs, mentions, and extra whitespace.
    Emojis and punctuation are kept as VADER handles them well.
    """
    if not isinstance(text, str):
        return ""
    
    # Remove URLs
    text = re.sub(r'http\S+', '', text)
    # Remove Mentions
    text = re.sub(r'@\w+', '', text)
    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def analyze_sentiment(text):
    """
    Analyzes the sentiment of a given text using VADER.
    Returns polarity scores and a classification label.
    """
    cleaned_text = clean_text(text)
    
    if not cleaned_text:
        return {
            "compound": 0.0,
            "pos": 0.0,
            "neu": 0.0,
            "neg": 0.0,
            "label": "Neutral"
        }

    scores = analyzer.polarity_scores(cleaned_text)
    
    # Determine label based on compound score
    # Typical threshold: positive >= 0.05, negative <= -0.05
    if scores['compound'] >= 0.05:
        label = "Positive"
    elif scores['compound'] <= -0.05:
        label = "Negative"
    else:
        label = "Neutral"
        
    scores['label'] = label
    return scores
