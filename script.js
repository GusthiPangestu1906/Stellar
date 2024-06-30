const audio = document.getElementById('audio');
const playButton = document.getElementById('play');
const prevButton = document.getElementById('prev'); // Tombol Sebelumnya
const nextButton = document.getElementById('next'); // Tombol Selanjutnya
const repeatModeButton = document.getElementById('repeat-mode'); // Repeat Mode Button
const shuffleButton = document.getElementById('shuffle'); // Shuffle Button
const progressContainer = document.getElementById('progress-container');
const progressFilled = document.getElementById('progress-filled');
const currentTimeElem = document.getElementById('current-time');
const durationElem = document.getElementById('duration');
const lyricsDiv = document.getElementById('lyrics');
const songTitleElem = document.getElementById('song-title');
const artistNameElem = document.getElementById('artist-name');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const mainContent = document.getElementById('main-content');
const albumCover = document.getElementById('album-cover');
const playlistToggle = document.getElementById('playlist-toggle');
const playlist = document.getElementById('playlist');


playlistToggle.addEventListener('click', () => {
    playlist.style.display = playlist.style.display === 'none' ? 'block' : 'none';
});

let isPlaying = false;
let isRepeating = false; // Repeat state
let isShuffling = false; // Shuffle state
let currentLyricIndex = 0;
let typingInterval;

const playlistItems = document.querySelectorAll('.playlist-item');
let currentSongIndex = 0;

function updatePlaylistActiveState(index) {
    playlistItems.forEach((item, i) => {
        if (i === index) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

async function loadSong(src, albumCoverSrc, title, artist) {
    audio.src = src;
    albumCover.style.backgroundImage = `url(${albumCoverSrc})`;
    songTitleElem.textContent = title;
    artistNameElem.textContent = artist;
    audio.load();
    await fetchLyrics(title);
}

async function fetchLyrics(songTitle) {
    const response = await fetch(`/lyrics?song_title=${encodeURIComponent(songTitle)}`);
    const data = await response.json();
    lyrics = data.lyrics;
    delays = data.delays;
}

function displayLyric(lyric, speed) {
    lyricsDiv.textContent = '';
    let index = 0;
    typingInterval = setInterval(() => {
        if (index < lyric.length) {
            lyricsDiv.textContent += lyric[index];
            index++;
        } else {
            clearInterval(typingInterval);
        }
    }, speed * 600); // Adjust the speed of the text animation here (multiplied by 600 for slower typing effect)
}

function synchronizeLyrics() {
    audio.addEventListener('timeupdate', () => {
        if (currentLyricIndex < lyrics.length) {
            const [lyric, speed] = lyrics[currentLyricIndex];
            const delay = delays[currentLyricIndex];
            if (audio.currentTime >= delay) {
                displayLyric(lyric, speed);
                currentLyricIndex++;
            }
        }
    });
}

// Trigger audio play when "Play" button is clicked
playButton.addEventListener('click', () => {
    if (!isPlaying) {
        playAudio();
    } else {
        pauseAudio();
    }
});

function playAudio() {
    playButton.classList.remove('fa-play');
    playButton.classList.add('fa-pause');
    audio.play();
    isPlaying = true;
    synchronizeLyrics();
}

function pauseAudio() {
    playButton.classList.remove('fa-pause');
    playButton.classList.add('fa-play');
    audio.pause();
    isPlaying = false;
    clearInterval(typingInterval);
}

// Tombol untuk kembali ke lagu sebelumnya
prevButton.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex - 1 + playlistItems.length) % playlistItems.length;
    const prevSongItem = playlistItems[currentSongIndex];
    loadSong(prevSongItem.dataset.src, prevSongItem.dataset.albumCover, prevSongItem.dataset.title, prevSongItem.dataset.artist);
    updatePlaylistActiveState(currentSongIndex);
    resetLyrics();
    fetchLyrics(prevSongItem.dataset.title);
    playAudio();
});

// Tombol untuk ke lagu selanjutnya
nextButton.addEventListener('click', () => {
    nextSong();
});

shuffleButton.addEventListener('click', () => {
    isShuffling = !isShuffling;
    shuffleButton.classList.toggle('active', isShuffling); // Toggle active class for visual feedback
});

function nextSong() {
    if (isShuffling) {
        currentSongIndex = Math.floor(Math.random() * playlistItems.length);
    } else {
        currentSongIndex = (currentSongIndex + 1) % playlistItems.length;
    }
    const nextSongItem = playlistItems[currentSongIndex];
    loadSong(nextSongItem.dataset.src, nextSongItem.dataset.albumCover, nextSongItem.dataset.title, nextSongItem.dataset.artist);
    updatePlaylistActiveState(currentSongIndex);
    resetLyrics();
    fetchLyrics(nextSongItem.dataset.title);
    playAudio();
}

repeatModeButton.addEventListener('click', () => {
    isRepeating = !isRepeating;
    repeatModeButton.classList.toggle('active', isRepeating); // Toggle active class for visual feedback
});

progressContainer.addEventListener('click', (e) => {
    const { clientWidth } = progressContainer;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / clientWidth) * duration;
});

audio.addEventListener('loadedmetadata', () => {
    durationElem.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', updateProgress);

audio.addEventListener('pause', () => {
    clearInterval(typingInterval);
});

audio.addEventListener('ended', () => {
    if (isRepeating) {
        audio.currentTime = 0;
        playAudio();
    } else {
        nextSong();
    }
});

function updateProgress() {
    const { currentTime, duration } = audio;
    const progressPercent = (currentTime / duration) * 100;
    progressFilled.style.width = `${progressPercent}%`;
    currentTimeElem.textContent = formatTime(currentTime);
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

function resetLyrics() {
    currentLyricIndex = 0;
    clearInterval(typingInterval);
    lyricsDiv.textContent = '';
}

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    mainContent.classList.toggle('sidebar-open');

    // Ganti URL gambar dengan URL gambar yang ingin Anda gunakan
    const customBackgroundUrl = '/static/images/playlist-background.jpg';

    // Atur latar belakang sidebar
    sidebar.style.backgroundImage = `url(${customBackgroundUrl})`;
});



// Initialize player with the first song
window.onload = async () => {
    await loadSong(
        playlistItems[currentSongIndex].dataset.src,
        playlistItems[currentSongIndex].dataset.albumCover,
        playlistItems[currentSongIndex].dataset.title,
        playlistItems[currentSongIndex].dataset.artist
    );
    updatePlaylistActiveState(currentSongIndex);
    fetchLyrics(playlistItems[currentSongIndex].dataset.title);
};

// Event listener for clicking on a playlist item
playlistItems.forEach((item, index) => {
    item.addEventListener('click', async () => {
        currentSongIndex = index;
        await loadSong(item.dataset.src, item.dataset.albumCover, item.dataset.title, item.dataset.artist);
        updatePlaylistActiveState(index);
        resetLyrics();
        fetchLyrics(item.dataset.title);
        playAudio();
    });
});
