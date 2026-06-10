// main.js – Shared functionality for portfolio and case study pages

document.addEventListener('DOMContentLoaded', function () {
    // ---------- 1. Update footer copyright year ----------
    const yearSpan = document.querySelector('footer span');
    if (yearSpan) {
        const currentYear = new Date().getFullYear();
        // Avoid double-updating if already contains a year
        if (!yearSpan.innerHTML.includes(currentYear)) {
            yearSpan.innerHTML = `© ${currentYear} Timothy Veckranges`;
        }
    }

    // ---------- 2. Global demo navigation helper (if not already defined) ----------
    window.sendPrompt = window.sendPrompt || function (msg) {
        alert("Portfolio navigation: " + msg + " (demo interaction)");
    };

    // ---------- 3. Image lightbox with GLightbox ----------
    // For any element with class 'glightbox-image' that is an <a> tag,
    // we initialise GLightbox on all of them.
    const imageTriggers = document.querySelectorAll('.glightbox-image');
    if (imageTriggers.length && typeof GLightbox !== 'undefined') {
        const imageLightbox = GLightbox({
            selector: '.glightbox-image',
            touchNavigation: true,
            zoomable: true
        });
    }

    // ---------- 4. Dynamic video lightbox (uses data-video-url) ----------
    // Find any element that should open a video lightbox.
    // We support two patterns:
    // a) elements with class 'glightbox-video' and attribute data-video-url
    // b) elements with class 'video-thumb' (legacy from case study)
    const videoTriggers = document.querySelectorAll('.glightbox-video, .video-thumb');
    videoTriggers.forEach(trigger => {
        trigger.addEventListener('click', function (e) {
            e.preventDefault();
            // Get video URL from data attribute, or fallback to data-glightbox, or hardcoded? We force data-video-url.
            let videoUrl = this.getAttribute('data-video-url');
            let videoTitle = this.getAttribute('data-video-title') || 'Video preview';

            // If not set, try to extract from data-glightbox attribute (old style)
            if (!videoUrl) {
                const glightboxAttr = this.getAttribute('data-glightbox');
                if (glightboxAttr && glightboxAttr.includes('url:')) {
                    const match = glightboxAttr.match(/url:\s*([^;\s]+)/);
                    if (match) videoUrl = match[1];
                }
            }

            if (!videoUrl) {
                console.warn('Video trigger missing data-video-url', this);
                return;
            }

            // Ensure URL is embeddable (convert standard YouTube watch URL to embed if needed)
            if (videoUrl.includes('youtube.com/watch?v=')) {
                videoUrl = videoUrl.replace('watch?v=', 'embed/');
                videoUrl = videoUrl.split('&')[0]; // remove extra params
            }
            if (videoUrl.includes('youtu.be/')) {
                const videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
                videoUrl = `https://www.youtube.com/embed/${videoId}`;
            }

            // Open GLightbox video
            const lightbox = GLightbox({
                elements: [{
                    href: videoUrl,
                    type: 'video',
                    title: videoTitle
                }],
                autoplayVideos: true
            });
            lightbox.open();
        });
    });

    // ---------- 5. PDF modal (improved, reusable) ----------
    const pdfTriggers = document.querySelectorAll('.pdf-trigger');
    pdfTriggers.forEach(trigger => {
        trigger.addEventListener('click', function (e) {
            e.preventDefault();
            const pdfUrl = this.getAttribute('data-pdf-url');
            const title = this.getAttribute('data-title') || 'Document preview';
            if (!pdfUrl) return;

            // Create modal elements
            const modal = document.createElement('div');
            modal.className = 'pdf-modal';
            modal.innerHTML = `
                <div class="pdf-modal-content">
                    <div class="pdf-modal-header">
                        <span class="pdf-modal-title">${escapeHtml(title)}</span>
                        <div class="pdf-modal-actions">
                            <button class="pdf-icon-btn pdf-fs-exit" title="Exit fullscreen">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="4 14 10 14 10 20"/>
                                    <polyline points="20 10 14 10 14 4"/>
                                    <line x1="10" y1="14" x2="3" y2="21"/>
                                    <line x1="21" y1="3" x2="14" y2="10"/>
                                </svg>
                            </button>
                            <button class="pdf-icon-btn pdf-fs-enter" title="Enter fullscreen">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="15 3 21 3 21 9"/>
                                    <polyline points="9 21 3 21 3 15"/>
                                    <line x1="21" y1="3" x2="14" y2="10"/>
                                    <line x1="3" y1="21" x2="10" y2="14"/>
                                </svg>
                            </button>
                            <button class="pdf-icon-btn pdf-close-btn" title="Close">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="pdf-modal-body">
                        <iframe src="${pdfUrl}" allowfullscreen></iframe>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            const content = modal.querySelector('.pdf-modal-content');
            const fsEnter = modal.querySelector('.pdf-fs-enter');
            const fsExit = modal.querySelector('.pdf-fs-exit');
            const closeBtn = modal.querySelector('.pdf-close-btn');

            const enterFullscreen = () => content.requestFullscreen?.();
            const exitFullscreen = () => document.exitFullscreen?.();

            fsEnter.onclick = enterFullscreen;
            fsExit.onclick = exitFullscreen;
            closeBtn.onclick = () => {
                if (document.fullscreenElement) exitFullscreen();
                modal.remove();
            };
            modal.onclick = (e) => {
                if (e.target === modal) {
                    if (document.fullscreenElement) exitFullscreen();
                    modal.remove();
                }
            };
        });
    });

    // Helper to escape HTML in title
    function escapeHtml(str) {
        return str.replace(/[&<>]/g, function (m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
});