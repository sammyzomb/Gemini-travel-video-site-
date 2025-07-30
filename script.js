document.addEventListener('DOMContentLoaded', () => {
    // ------------------- 導航列功能 (Header / Navbar) -------------------
    const dropbtn = document.querySelector('.dropbtn');
    const dropdownContent = document.getElementById('region-dropdown');
    const mainNav = document.querySelector('.main-nav');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainHeader = document.querySelector('.main-header');

    // 點擊「世界分區」按鈕顯示/隱藏下拉選單
    if (dropbtn) {
        dropbtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // 防止點擊按鈕時觸發 body 點擊隱藏選單
            this.classList.toggle('open');
            this.parentNode.classList.toggle('show-dropdown');
        });
    }

    // 點擊任何地方隱藏下拉選單
    document.body.addEventListener('click', function(e) {
        if (dropbtn && dropdownContent && !dropdownContent.contains(e.target) && !dropbtn.contains(e.target)) {
            dropbtn.classList.remove('open');
            dropbtn.parentNode.classList.remove('show-dropdown');
        }
    });

    // 漢堡選單的開關 (手機版)
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            menuToggle.classList.toggle('active');
            // 當漢堡選單打開時，如果下拉選單也打開，則關閉下拉選單
            if (mainNav.classList.contains('active') && dropbtn && dropbtn.classList.contains('open')) {
                dropbtn.classList.remove('open');
                dropbtn.parentNode.classList.remove('show-dropdown');
            }
        });
    }

    // 處理導航列捲動變色
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) { // 當捲動超過 50px 時
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
    });

    // 動態載入地區分類到下拉選單 (這裡從 videos.json 獲取)
    fetch('videos.json')
        .then(res => res.json())
        .then(videos => {
            // 獲取所有不重複的區域並排序
            const regions = [...new Set(videos.map(v => v.region))].sort();
            regions.forEach(region => {
                const a = document.createElement('a');
                a.href = `vod.html?region=${encodeURIComponent(region)}`; // 點擊導向 VOD 頁面並篩選
                a.textContent = region;
                dropdownContent.appendChild(a);
            });
        })
        .catch(error => console.error('Error fetching regions:', error));


    // ------------------- HERO 影片輪播功能 (僅限 index.html) -------------------
    if (document.getElementById('hero-carousel')) { // 確保只在 index.html 執行
        let heroVideos = []; // 將用於輪播的影片資料
        let currentSlide = 0;
        let slideInterval;
        const heroCarousel = document.getElementById('hero-carousel');
        const heroTitle = document.getElementById('hero-title');
        const heroSubtitle = document.getElementById('hero-subtitle');
        const heroButton = document.querySelector('.hero-btn');
        const prevButton = document.querySelector('.carousel-nav .prev-slide');
        const nextButton = document.querySelector('.carousel-nav .next-slide');
        const carouselDotsContainer = document.getElementById('carousel-dots');

        fetch('videos.json')
            .then(res => res.json())
            .then(data => {
                // 過濾出用於 HERO 輪播的影片 (例如，標記為 featured: true)
                // 這裡我們暫時只取前 4 個 YouTube 影片作為範例輪播
                heroVideos = data.filter(v => v.type === 'youtube').slice(0, 4);

                if (heroVideos.length > 0) {
                    // 載入 YouTube Iframe API (如果還沒載入)
                    if (typeof YT === 'undefined' || !YT.Player) {
                         // YT Iframe API script is already in index.html, wait for it
                         // window.onYouTubeIframeAPIReady will be called by the API itself
                         console.log("Waiting for YouTube Iframe API to load...");
                    } else {
                        // API already loaded (e.g., if page navigated back)
                        initializeHeroCarousel();
                    }
                }
            })
            .catch(error => console.error('Error fetching hero videos:', error));

        // YouTube Iframe API 準備就緒後會呼叫此函數
        window.onYouTubeIframeAPIReady = function() {
            initializeHeroCarousel();
        };

        function initializeHeroCarousel() {
            renderHeroSlides();
            startSlideShow();
        }


        function renderHeroSlides() {
            heroCarousel.innerHTML = ''; // 清空現有內容
            carouselDotsContainer.innerHTML = ''; // 清空點點

            heroVideos.forEach((video, index) => {
                const item = document.createElement('div');
                item.classList.add('hero-video-item');
                if (index === 0) item.classList.add('active'); // 預設第一個 active

                let videoElement;
                if (video.type === 'youtube') {
                    // 使用 YT.Player API 創建播放器
                    const playerDiv = document.createElement('div');
                    playerDiv.id = `ytPlayer-${video.id}`; // 每個播放器獨特的ID
                    item.appendChild(playerDiv);
                    
                    // 等待 YT.Player 初始化
                    const playerInstance = new YT.Player(playerDiv.id, {
                        width: '100%',
                        height: '100%',
                        videoId: video.ytid,
                        playerVars: {
                            autoplay: (index === 0 ? 1 : 0), // 只有第一個自動播放
                            mute: 1,
                            controls: 0,
                            rel: 0, // 相關影片
                            showinfo: 0,
                            modestbranding: 1, // 品牌標誌
                            loop: 1,
                            playlist: video.ytid, // 單獨影片循環播放
                            vq: 'hd1080' // 優先載入高畫質
                        },
                        events: {
                            onReady: (event) => {
                                event.target.mute(); // 確保靜音
                                if (index === 0) {
                                    event.target.playVideo(); // 只有第一個播放
                                }
                            },
                            onStateChange: (event) => {
                                if (event.data === YT.PlayerState.ENDED) {
                                    // 影片結束後，自動切換到下一支，並確保繼續循環播放
                                    if (event.target.a.src.includes('loop=1')) { // If it's set to loop, it will replay automatically
                                        // Do nothing, let it loop
                                    } else {
                                        nextSlide();
                                    }
                                }
                            }
                        }
                    });
                } else if (video.type === 'mp4') {
                    videoElement = document.createElement('video');
                    videoElement.src = video.src;
                    videoElement.setAttribute('autoplay', '');
                    videoElement.setAttribute('loop', '');
                    videoElement.setAttribute('muted', '');
                    videoElement.setAttribute('playsinline', '');
                    videoElement.setAttribute('preload', 'auto');
                    item.appendChild(videoElement);
                    if (index === 0) videoElement.play(); // 只有第一個自動播放
                }
                heroCarousel.appendChild(item);

                // 創建輪播點點
                const dot = document.createElement('span');
                dot.classList.add('carousel-dot');
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    clearInterval(slideInterval);
                    goToSlide(index);
                    startSlideShow();
                });
                carouselDotsContainer.appendChild(dot);
            });
            updateHeroContent(heroVideos[0]); // 初始化內容
        }

        function goToSlide(index) {
            const slides = document.querySelectorAll('.hero-video-item');
            const dots = document.querySelectorAll('.carousel-dot');

            // 停止所有影片並移除 active 類
            slides.forEach((slide, i) => {
                slide.classList.remove('active');
                const videoElement = slide.querySelector('iframe, video');
                if (videoElement) {
                    if (videoElement.tagName === 'IFRAME' && videoElement.id && window.YT && window.YT.get(videoElement.id)) {
                        window.YT.get(videoElement.id).pauseVideo();
                    } else if (videoElement.tagName === 'VIDEO') {
                        videoElement.pause();
                        videoElement.currentTime = 0;
                    }
                }
            });
            dots.forEach(dot => dot.classList.remove('active'));

            // 設置新的 active 影片並播放
            currentSlide = index;
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
            
            const currentVideoElement = slides[currentSlide].querySelector('iframe, video');
            if (currentVideoElement) {
                if (currentVideoElement.tagName === 'IFRAME' && currentVideoElement.id && window.YT && window.YT.get(currentVideoElement.id)) {
                    window.YT.get(currentVideoElement.id).playVideo();
                } else if (currentVideoElement.tagName === 'VIDEO') {
                    currentVideoElement.play();
                }
            }

            updateHeroContent(heroVideos[currentSlide]);
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % heroVideos.length;
            goToSlide(currentSlide);
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + heroVideos.length) % heroVideos.length;
            goToSlide(currentSlide);
        }

        function startSlideShow() {
            // 清除之前的自動輪播，避免重複
            if (slideInterval) clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 7000); // 每 7 秒切換一次
        }

        function updateHeroContent(videoData) {
            if (videoData) {
                heroTitle.textContent = videoData.title;
                heroSubtitle.textContent = `${videoData.region} | ${videoData.country} | ${videoData.category}`;
                // 更新按鈕連結，如果需要
                // heroButton.onclick = () => window.location.href=`video.html?id=${videoData.id}`;
            } else {
                heroTitle.textContent = '探索世界，從這裡開始';
                heroSubtitle.textContent = 'Live 世界旅遊新視野';
            }
        }

        prevButton.addEventListener('click', () => {
            clearInterval(slideInterval);
            prevSlide();
            startSlideShow();
        });

        nextButton.addEventListener('click', () => {
            clearInterval(slideInterval);
            nextSlide();
            startSlideShow();
        });

        // ------------------- 首頁其他區塊內容載入 (最新上架, 熱門主題, 各地精選) -------------------
        // 這些功能可以放在 `script.js` 的這個位置，確保僅在首頁執行
        const latestVideosContainer = document.getElementById('latest-videos');
        const hotCategoriesContainer = document.getElementById('hot-categories');
        const regionsShowcaseContainer = document.getElementById('regions-showcase');

        if (latestVideosContainer || hotCategoriesContainer || regionsShowcaseContainer) {
            fetch('videos.json')
                .then(res => res.json())
                .then(videos => {
                    // 最新上架：取最近上架的 6 支影片
                    const latest = videos.slice(0, 6); // 假設前幾個是最新
                    if (latestVideosContainer) renderVodCards(latestVideosContainer, latest);

                    // 熱門主題：可以根據分類來生成卡片，例如每個熱門分類的代表影片
                    // 這裡簡化為顯示所有不重複的分類
                    if (hotCategoriesContainer) {
                        const categories = [...new Set(videos.map(v => v.category))].sort();
                        let categoryHtml = '';
                        categories.forEach(cat => {
                            // 這裡可以考慮加入一張該分類的代表圖片
                            categoryHtml += `
                                <div class="category-card" onclick="location.href='vod.html?category=${encodeURIComponent(cat)}'">
                                    <h3>${cat}</h3>
                                    <p>${videos.filter(v => v.category === cat).length} 支影片</p>
                                </div>
                            `;
                        });
                        hotCategoriesContainer.innerHTML = categoryHtml;
                    }
                    
                    // 各地精選：例如隨機選擇 6 支不同地區的影片
                    if (regionsShowcaseContainer) {
                         const regionsVideos = videos.filter(v => v.region !== '').sort(() => 0.5 - Math.random()).slice(0, 6); // 隨機選6支
                         renderVodCards(regionsShowcaseContainer, regionsVideos);
                    }

                })
                .catch(error => console.error('Error fetching data for sections:', error));
        }

        function renderVodCards(container, list) {
            let html = '';
            list.forEach(v => {
                html += `
                    <div class="vod-card" onclick="location.href='video.html?id=${v.id}'">
                        <div class="thumb" style="background-image:url('${v.thumb}')"></div>
                        <div class="vod-info">
                            <h3>${v.title}</h3>
                            <div class="meta">
                                <span>${v.region}｜${v.country}</span>
                                <span>｜${v.category}</span>
                            </div>
                            <p>${v.desc}</p>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        }

    } // End of if (document.getElementById('hero-carousel')) check for index.html specific logic
});