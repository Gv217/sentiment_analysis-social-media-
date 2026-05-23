import instaloader
from datetime import datetime, timedelta

L = instaloader.Instaloader()

def login_instagram(username, password):
    """
    Attempts to login to Instagram.
    Raises an exception if login fails.
    """
    try:
        L.login(username, password)
        return True
    except instaloader.exceptions.BadCredentialsException:
        raise ValueError("Incorrect username or password.")
    except instaloader.exceptions.TwoFactorAuthRequiredException:
        raise ValueError("Two-factor authentication is required. This automated login does not support 2FA.")
    except Exception as e:
        raise ValueError(f"Login failed: {str(e)}")

def scrape_profile(target_username, num_posts=6):
    """
    Scrapes a public profile using the logged-in session.
    """
    try:
        profile = instaloader.Profile.from_username(L.context, target_username)
        
        posts = []
        count = 0
        for post in profile.get_posts():
            if count >= num_posts:
                break
            # Get basic info
            posts.append({
                "caption": post.caption if post.caption else "",
                "likes": post.likes,
                "comments": post.comments,
                "date": post.date.strftime('%Y-%m-%d')
            })
            count += 1
            
        return {
            "profile": profile.username,
            "follower_count": profile.followers,
            "following_count": profile.followees,
            "posts": posts
        }
    except Exception as e:
        raise ValueError(f"Failed to fetch profile: {str(e)}")
