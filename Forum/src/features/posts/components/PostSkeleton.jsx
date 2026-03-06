import React from 'react';

const PostCardSkeleton = () => (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="p-5">
            {/* Author row */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full skeleton shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-28 skeleton rounded-full" />
                    <div className="h-3 w-20 skeleton rounded-full" />
                </div>
            </div>
            {/* Title */}
            <div className="pl-14 space-y-2 mb-4">
                <div className="h-5 w-4/5 skeleton rounded-xl" />
                <div className="h-3.5 w-full skeleton rounded-full" />
                <div className="h-3.5 w-3/4 skeleton rounded-full" />
            </div>
        </div>
        {/* Action bar */}
        <div className="px-5 py-3 border-t border-slate-50 flex gap-3">
            <div className="h-8 w-20 skeleton rounded-xl" />
            <div className="h-8 w-28 skeleton rounded-xl" />
            <div className="ml-auto h-8 w-8 skeleton rounded-xl" />
            <div className="h-8 w-8 skeleton rounded-xl" />
        </div>
    </div>
);

export default PostCardSkeleton;
