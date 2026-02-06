import React from 'react';

const PostSkeleton = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-center mb-4">
        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
        <div className="ml-3 space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-gray-200 rounded"></div>
        <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
      </div>
      <div className="flex space-x-4">
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default PostSkeleton;
