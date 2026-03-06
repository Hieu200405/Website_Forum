import useReadingProgress from '@/hooks/useReadingProgress';

/**
 * ReadingProgressBar — thanh tiến trình đọc bài viết
 * Cố định ở đầu màn hình, fill từ trái sang phải.
 * Hiển thị % đọc khi hover.
 */
const ReadingProgressBar = () => {
    const progress = useReadingProgress('#post-content');

    return (
        <>
            {/* Progress bar */}
            <div
                className="fixed top-0 left-0 right-0 z-[60] h-1"
                style={{ background: 'rgba(99,102,241,0.12)' }}
            >
                <div
                    style={{
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)',
                        height: '100%',
                        transition: 'width 0.1s ease',
                        boxShadow: '0 0 12px rgba(139,92,246,0.6)',
                        borderRadius: '0 9999px 9999px 0',
                    }}
                />
            </div>

            {/* % badge — show when > 5% */}
            {progress > 5 && (
                <div
                    className="fixed top-4 right-4 z-[61] text-[10px] font-black text-white px-2 py-1 rounded-full shadow-lg"
                    style={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        opacity: progress < 95 ? 1 : 0,
                        transition: 'opacity 0.3s ease',
                    }}
                >
                    {progress}%
                </div>
            )}

            {/* "Đã đọc xong" badge */}
            {progress >= 95 && (
                <div
                    className="fixed top-4 right-4 z-[61] text-[10px] font-black text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 fade-in"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                    ✓ Đã đọc xong
                </div>
            )}
        </>
    );
};

export default ReadingProgressBar;
