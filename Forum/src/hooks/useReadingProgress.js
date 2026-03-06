import { useEffect, useState } from 'react';

/**
 * Hook: theo dõi tiến trình đọc bài viết.
 * Trả về % đã đọc (0–100) dựa trên scroll position.
 *
 * @param {string} contentSelector - CSS selector của vùng nội dung cần đo
 */
const useReadingProgress = (contentSelector = '#post-content') => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const el = document.querySelector(contentSelector);
            if (!el) {
                // Fallback: dùng toàn bộ trang
                const scrollTop    = window.scrollY;
                const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
                setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
                return;
            }
            const { top, height } = el.getBoundingClientRect();
            const viewportH   = window.innerHeight;
            const docScrolled = window.scrollY;
            const elTop       = docScrolled + top;
            const viewBottom  = docScrolled + viewportH;
            const read        = Math.max(0, viewBottom - elTop);
            const pct         = Math.min(100, (read / height) * 100);
            setProgress(pct);
        };

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
        return () => window.removeEventListener('scroll', updateProgress);
    }, [contentSelector]);

    return Math.round(progress);
};

export default useReadingProgress;
