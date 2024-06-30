from flask import Flask, render_template, send_from_directory, jsonify, request
import os

app = Flask(__name__)

# Direktori musik dan gambar album
MUSIC_DIR = 'static/music/'
ALBUM_DIR = 'static/images/'

# Daftar metadata lagu
SONGS = [
    {
        "title": "Beautiful in White",
        "filename": "music1.mp3",
        "album_cover": "album1.jpg",
        "lyrics": [
            ("Not sure if you know this", 0.08),
            ("But when we first met", 0.08),
            ("I got so nervous", 0.09),
            ("I couldn't speak", 0.09),
            ("In that very moment", 0.09),
            ("I found the one and", 0.09),
            ("My life had found its missing piece", 0.08),
            ("So as long as I live I love you", 0.08),
            ("Will have and hold you", 0.08),
            ("You look so beautiful in white", 0.08),
            ("And from now to my very last breath", 0.08),
            ("This day I'll cherish", 0.08),
            ("You look so beautiful in white", 0.08),
            ("Tonight", 0.08),
            ("Coding by Mr.G", 0.08),
        ],
        "delays": [13.0, 17.0, 20.0, 23.0, 26.0, 29.0, 33.0, 38.0, 44.0, 47.0, 52.0, 56.0, 60.0, 65.0, 68.0]
    },
    {
        "title": "All of Me",
        "filename": "music2.mp3",
        "album_cover": "album2.jpg",
        "lyrics": [
            ("What would I do without your smart mouth?", 0.08),
            ("Drawing me in, and you kicking me out", 0.08),
            ("You've got my head spinning, no kidding", 0.09),
            ("I can't pin you down", 0.09),
            ("What's going on in that beautiful mind?", 0.09),
            ("I'm on your magical mystery ride", 0.09),
            ("And I'm so dizzy, don't know what hit me", 0.08),
            ("But I'll be alright", 0.08),
            ("My head's underwater", 0.08),
            ("But I'm breathing fine", 0.08),
            ("You're crazy and I'm out of my mind", 0.08),
            ("Cause all of me loves all of you", 0.08),
            ("Love your curves and all your edges", 0.08),
            ("All your perfect imperfections", 0.08),
            ("Give your all to me, I'll give my all to you", 0.08),
            ("You're my end and my beginning", 0.08),
            ("Even when I lose, I'm winning", 0.08),
            ("'Cause I give you all of me", 0.08),
            ("And you give me all of you", 0.08),
            ("Coding by Mr.G", 0.08),
        ],
        "delays": [17.0, 21.0, 25.0, 30.0, 33.0, 36.0, 40.0, 45.0, 48.0, 51.0, 56.0, 62.0, 69.0, 73.0, 76.0, 84.0, 88.0, 91.0, 95.0, 98.0]
    },
    {
        "title": "Pray",
        "filename": "music3.mp3",
        "album_cover": "album3.jpg",
        "lyrics": [
            ("The lives we play behind the mask", 0.08),
            ("A constant rain of pain", 0.08),
            ("Our minds belong to those who ask", 0.08),
            ("To those who seek to change", 0.09),
            ("I can say anything that I want", 0.09),
            ("When I want", 0.08),
            ("I believe in things that I see", 0.09),
            ("I pray", 0.08),
            ("I don't know if I can anymore", 0.08),
            ("So watch me break", 0.08),
            ("I can see everything torn away", 0.08),
            ("From me", 0.08), 
            ("That was a while ago", 0.08),
            ("That was a while ago", 0.08),
        ],
        "delays": [30.0, 36.0, 42.0, 49.0, 57.0, 60.0, 63.0, 67.0, 70.0, 73.0, 76.0, 79.0, 83.0, 97.0, 120.0]
    },
    {
        "title": "Here's Your Perfect", 
        "filename": "music4.mp3",
        "album_cover": "album4.jpg",
        "lyrics": [
            ("I remember the day", 0.08),
            ("Even wrote down the date, that I fell for you", 0.08),
            ("And now it's crossed out in red", 0.08),
            ("But I still can't forget if I wanted to", 0.08),
            ("And it drives me insane", 0.08),
            ("Think I'm hearing your name, everywhere I go", 0.08),
            ("But it's all in my head", 0.08),
            ("It's just all in my head", 0.08),
            ("But you won't see me break, call you up in three days", 0.08),
            ("Or send you a bouquet, saying, It's a mistake", 0.08),
            ("Drink my troubles away, one more glass of champagne", 0.08),
            ("And you know", 0.08),
            ("I'm the first to say that I'm not perfect", 0.08),
            ("And you're the first to say you want the best thing", 0.08),
            ("But now I know a perfect way to let you go", 0.08),
            ("Give my last hello, hope it's worth it", 0.08), 
            ("Here's your perfect", 0.08),
        ],
        "delays": []
    },
    {
        "title": "The Night We Met", 
        "filename": "music5.mp3", 
        "album_cover": "album5.jpg",
        "lyrics": [
            ("I am not the only traveler", 0.08),
            ("Who has not repaid his debt", 0.08),
            ("I've been searching for a trail to follow again", 0.08),
            ("Take me back to the night we met", 0.08),
            ("And then I can tell myself", 0.08),
            ("What the hell I'm supposed to do", 0.08),
            ("And then I can tell myself", 0.08),
            ("Not to ride along with you", 0.08),
            ("I had all and then most of you", 0.08),
            ("Some and now none of you", 0.08),
            ("Take me back to the night we met", 0.08),
            ("I don't know what I'm supposed to do", 0.08),
            ("Haunted by the ghost of you", 0.08),
            ("Oh, take me back to the night we met", 0.08),
            ("When the night was full of terrors", 0.08),
            ("And your eyes were filled with tears", 0.08),
            ("When you had not touched me yet", 0.08),
            ("Oh, take me back to the night we met", 0.08),
        ],
        "delays": [30.0, 38.0, 44.0, 52.0, 59.0, 66.0, 72.0, 80.0, 87.0, 90.0, 92.0, 101.0, 105.0, 109.0, 117.0, 123.0, 132.0, 138.0, 145.0]
    }
]

# Inisialisasi metadata untuk pencarian cepat berdasarkan judul lagu
SONGS_METADATA = {song["title"]: song for song in SONGS}

@app.route('/')
def index():
    return render_template('index.html', albums=ALBUM_DIR, songs=SONGS)

@app.route('/music/<filename>')
def music(filename):
    return send_from_directory(MUSIC_DIR, filename)

@app.route('/lyrics')
def get_lyrics():
    song_title = request.args.get('song_title', 'Beautiful in White')  # Mendapatkan judul lagu dari query parameter, default ke 'Beautiful in White' jika tidak ada
    if song_title in SONGS_METADATA:
        song = SONGS_METADATA[song_title]
        return jsonify({"lyrics": song["lyrics"], "delays": song["delays"]})
    return jsonify({"lyrics": [], "delays": []})

if __name__ == '__main__':
    app.run(debug=True)
