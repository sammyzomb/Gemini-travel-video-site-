// Hero 影片輪播 IDs (已更新為您提供的 15 個 ID)
const HERO_VIDEO_IDS = [
    "3GZCJfIOg_k", "ylVxw3sQCiY", "i2bhyjD2OJY", "ylVxw3sQCiY", // 注意這裡 'ylVxw3sQCiY' 重複了
    "LcdGhVwS3gw", "VW_Pl9sFGVU", "nmXaW525rUU", "1SARBs2zWLI",
    "25Fmx1G-C3k", "u4XvG8jkToY", "l4A6f7fKglc", "BuFuQBNj4x4",
    "DM9qdIs9O70", "QR3T7s-gsNY", "jLNBKAFgtNU"
];
let currentHeroVideoIndex = 0;
let heroPlayer;
let heroVideoInterval; // 用於控制輪播間隔的變數

// YouTube IFrame Player API 準備好時調用
function onYouTubeIframeAPIReady() {
    heroPlayer = new YT.Player('youtube-player', {
        videoId: HERO_VIDEO_IDS[currentHeroVideoIndex],
        playerVars: {
            autoplay: 1,      // 自動播放
            mute: 1,          // 靜音
            controls: 0,      // 不顯示控制項
            loop: 1,          // 循環播放 (雖然我們手動切換，但設定loop有時有助於API行為)
            playlist: HERO_VIDEO_IDS.join(','), // 確保 API 知道整個播放列表
            showinfo: 0,      // 不顯示影片資訊
            modestbranding: 1, // 較小的 YouTube 品牌標誌
            fs: 0,            // 不允許全螢幕按鈕
            rel: 0,           // 不顯示相關影片
            enablejsapi: 1    // 啟用 JavaScript API
        },
        events: {
            onReady: onHeroPlayerReady,
            onStateChange: onHeroPlayerStateChange
        }
    });
}

function onHeroPlayerReady(event) {
    event.target.playVideo();
    event.target.mute(); // 確保靜音
    startHeroVideoCarousel(); // 影片準備好後開始輪播
}

function onHeroPlayerStateChange(event) {
    // 當影片結束時 (State 0)，或影片暫停 (State 2) 後恢復，切換到下一支影片
    // 這裡我們只在結束時切換，保持簡單輪播
    if (event.data === YT.PlayerState.ENDED) {
        playNextHeroVideo();
    }
}

function playNextHeroVideo() {
    currentHeroVideoIndex = (currentHeroVideoIndex + 1) % HERO_VIDEO_IDS.length;
    heroPlayer.loadVideoById(HERO_VIDEO_IDS[currentHeroVideoIndex]);
}

function startHeroVideoCarousel() {
    // 每 10 秒切換一次影片
    if (heroVideoInterval) { // 防止重複設定間隔
        clearInterval(heroVideoInterval);
    }
    heroVideoInterval = setInterval(playNextHeroVideo, 10000); // 10 秒
}

document.addEventListener('DOMContentLoaded', () => {
    // 導覽列滾動變色效果
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // 載入精選影片 (此部分維持原狀，使用 videos.json)
    fetch('videos.json')
        .then(response => response.json())
        .then(data => {
            const featuredVideos = data.videos;
            const featuredVideoList = document.getElementById('featured-video-list');

            if (featuredVideoList) {
                featuredVideos.forEach(video => {
                    const swiperSlide = document.createElement('div');
                    swiperSlide.className = 'swiper-slide';
                    swiperSlide.innerHTML = `
                        <div class="video-card">
                            <img src="${video.thumbnail || 'https://via.placeholder.com/300x180?text=No+Thumbnail'}" alt="${video.title}">
                            <div class="video-card-content">
                                <h3>${video.title}</h3>
                                <p>${video.description}</p>
                                <a href="video.html?id=${video.id}" class="btn">觀看影片</a>
                            </div>
                        </div>
                    `;
                    featuredVideoList.appendChild(swiperSlide);
                });

                new Swiper('.featured-swiper', {
                    slidesPerView: 1,
                    spaceBetween: 30,
                    loop: true,
                    navigation: {
                        nextEl: '.swiper-button-next',
                        prevEl: '.swiper-button-prev',
                    },
                    breakpoints: {
                        640: {
                            slidesPerView: 2,
                            spaceBetween: 20,
                        },
                        1024: {
                            slidesPerView: 3,
                            spaceBetween: 30,
                        },
                    }
                });
            }
        })
        .catch(error => console.error('Error loading featured videos:', error));

    // 載入熱門分類 (此部分維持原狀)
    const categories = [
        { name: '冒險', icon: 'fa-solid fa-mountain' },
        { name: '文化', icon: 'fa-solid fa-archway' },
        { name: '美食', icon: 'fa-solid fa-utensils' },
        { name: '自然', icon: 'fa-solid fa-leaf' },
        { name: '城市', icon: 'fa-solid fa-city' }
    ];
    const categoryGrid = document.querySelector('.category-grid');
    if (categoryGrid) {
        categories.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.innerHTML = `
                <i class="${category.icon}"></i>
                <h3>${category.name}</h3>
            `;
            categoryGrid.appendChild(categoryItem);
        });
    }

    // 載入最新更新影片 (此部分維持原狀，使用 videos.json)
    fetch('videos.json')
        .then(response => response.json())
        .then(data => {
            const latestVideos = data.videos.slice(0, 6);
            const latestVideoList = document.getElementById('latest-video-list');

            if (latestVideoList) {
                latestVideos.forEach(video => {
                    const videoCard = document.createElement('div');
                    videoCard.className = 'video-card';
                    videoCard.innerHTML = `
                        <img src="${video.thumbnail || 'https://via.placeholder.com/300x180?text=No+Thumbnail'}" alt="${video.title}">
                        <div class="video-card-content">
                            <h3>${video.title}</h3>
                            <p>${video.description}</p>
                            <a href="video.html?id=${video.id}" class="btn">觀看影片</a>
                        </div>
                    `;
                    latestVideoList.appendChild(videoCard);
                });
            }
        })
        .catch(error => console.error('Error loading latest videos:', error));

    // === 「目前正在播放」區塊邏輯 ===
    // 這裡的邏輯是假設 program.json 的第一個節目為「目前正在播放」
    // 如果您需要根據時間判斷，則需要更複雜的 JS 邏輯，或從後端獲取
    fetch('program.json')
        .then(response => response.json())
        .then(programData => {
            const nowPlayingSection = document.getElementById('now-playing-video');
            if (nowPlayingSection && programData.programs && programData.programs.length > 0) {
                const currentProgram = programData.programs[0]; // 假設第一個節目
                const nowPlayingCard = nowPlayingSection.querySelector('.now-playing-card');
                
                if (nowPlayingCard) {
                    const videoPlaceholder = nowPlayingCard.querySelector('.video-placeholder');
                    if (currentProgram.videoId) {
                        videoPlaceholder.innerHTML = `
                            <iframe
                                src="https://www.youtube.com/embed/${currentProgram.videoId}?autoplay=0&controls=1&modestbranding=1&showinfo=0&rel=0"
                                frameborder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen
                            ></iframe>
                        `;
                    } else if (currentProgram.thumbnail) {
                         videoPlaceholder.innerHTML = `<img src="${currentProgram.thumbnail}" alt="${currentProgram.title}" style="width:100%; height:100%; object-fit:cover;">`;
                    } else {
                        videoPlaceholder.textContent = '影片預覽不可用';
                    }

                    nowPlayingCard.querySelector('.now-playing-details h3').textContent = currentProgram.title || '未知節目';
                    nowPlayingCard.querySelector('.now-playing-details p').textContent = currentProgram.description || '無描述';
                    nowPlayingCard.querySelector('.now-playing-details .btn').href = `video.html?id=${currentProgram.videoId || ''}`;
                }
            } else {
                 if (nowPlayingSection) nowPlayingSection.style.display = 'none'; // 如果沒有節目，隱藏此區塊
            }
        })
        .catch(error => console.error('Error loading program data for now playing:', error));


    // === 「各地區分類的影片」區塊邏輯 ===
    // 為了這個區塊能正常顯示，你需要確保 videos.json 中有 'region' 欄位
    fetch('videos.json')
        .then(response => response.json())
        .then(data => {
            const allVideos = data.videos;
            const regionVideoGrid = document.getElementById('region-video-grid');

            if (regionVideoGrid) {
                const videosByRegion = allVideos.reduce((acc, video) => {
                    const region = video.region || '未分類'; // 如果 videos.json 沒有 region，則歸類到 '未分類'
                    if (!acc[region]) {
                        acc[region] = [];
                    }
                    acc[region].push(video);
                    return acc;
                }, {});

                for (const regionName in videosByRegion) {
                    const regionSection = document.createElement('div');
                    regionSection.className = 'region-category-section';
                    regionSection.innerHTML = `<h3>${regionName}</h3><div class="region-video-list"></div>`;
                    regionVideoGrid.appendChild(regionSection);

                    const videoListContainer = regionSection.querySelector('.region-video-list');
                    videosByRegion[regionName].forEach(video => {
                        const videoCard = document.createElement('div');
                        videoCard.className = 'video-card';
                        videoCard.innerHTML = `
                            <img src="${video.thumbnail || 'https://via.placeholder.com/300x180?text=No+Thumbnail'}" alt="${video.title}">
                            <div class="video-card-content">
                                <h3>${video.title}</h3>
                                <p>${video.description}</p>
                                <a href="video.html?id=${video.id}" class="btn">觀看影片</a>
                            </div>
                        `;
                        videoListContainer.appendChild(videoCard);
                    });
                }
            }
        })
        .catch(error => console.error('Error loading regional videos:', error));
});
