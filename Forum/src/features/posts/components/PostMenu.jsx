import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Trash2, Edit } from 'lucide-react';
import useAuthStore from '@/features/auth/store/authStore';
import useModalStore from '@/components/hooks/useModalStore';
import { Flag } from 'lucide-react';

const PostMenu = ({ post, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { user } = useAuthStore();

  const { onOpen } = useModalStore();

  const isOwner = user?.id === post.author?.id;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // if (!isOwner) return null; // Remove this to allow non-owners to report

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-full transition-colors"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10 animate-in fade-in zoom-in-95 duration-200">
           {isOwner ? (
            <>
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); onEdit(); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary-600 flex items-center space-x-2"
                    >
                    <Edit className="w-4 h-4" />
                    <span>Chỉnh sửa bài viết</span>
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); onDelete(); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa bài viết</span>
                </button>
            </>
           ) : (
                <button 
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); onOpen('report-post', { postId: post.id }); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-red-600 flex items-center space-x-2"
                >
                    <Flag className="w-4 h-4" />
                    <span>Báo cáo bài viết</span>
                </button>
           )}
        </div>
      )}
    </div>
  );
};

export default PostMenu;
