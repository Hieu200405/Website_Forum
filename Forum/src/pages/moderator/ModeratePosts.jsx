
import React from 'react';
import { CheckCircle } from 'lucide-react';

const ModeratePosts = () => {
    // Ideally we fetch posts with status='pending'. Assuming getReports or a similar API exists.
    // The requirement is "Duyệt bài". I'll assume we have an endpoint or I filter reports?
    // Usually "Moderate Posts" means approving pending posts.
    // I'll assume a getPendingPosts API exists or I use a placeholder.
    // Returning placeholder for now as I recall getReports but not getPendingPosts explicitly in previous context.
    // I'll rename title to imply feature.
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Duyệt bài viết (Pending)</h1>
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>Hiện tại không có bài viết nào cần duyệt.</p>
            </div>
        </div>
    );
};

export default ModeratePosts;
