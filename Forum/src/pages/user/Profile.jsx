import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPosts } from '@/features/posts/api/postService';
import api from '@/lib/axios';
import { Calendar, FileText, Loader2, Info, Trash2, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import useAuthStore from '@/features/auth/store/authStore';
import { useDeletePost } from '@/features/posts/hooks/useDeletePost';
import useModalStore from '@/components/hooks/useModalStore';

// Service to fetch user profile
const getUserProfile = async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
};

const Profile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();

    // Fetch user info
    const { data: userResponse, isLoading: userLoading, error: userError } = useQuery({
        queryKey: ['user', userId],
        queryFn: () => getUserProfile(userId),
        retry: false
    });

    // Fetch user posts
    const { data: postsResponse, isLoading: postsLoading } = useQuery({
        queryKey: ['posts', 'user', userId],
        queryFn: () => getPosts({ authorId: userId, limit: 50 }),
        enabled: !!userId
    });

    const { user: currentUser } = useAuthStore();
    const deleteMutation = useDeletePost();
    const { onOpen } = useModalStore();

    const isOwnProfile = currentUser && String(currentUser.id) === String(userId);

    const user = userResponse || null;
    let posts = [];
    if (postsResponse?.data?.data && Array.isArray(postsResponse.data.data)) {
        posts = postsResponse.data.data;
    } else if (postsResponse?.data && Array.isArray(postsResponse.data)) {
        posts = postsResponse.data;
    }

    if (userLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (userError || !user) {
        return (
            <div className="bg-white rounded-xl border border-red-100 p-8 text-center text-red-500 max-w-2xl mx-auto mt-10">
                <Info className="w-12 h-12 mx-auto mb-4 text-red-400" />
                <p className="text-lg font-medium">Không tìm thấy người dùng!</p>
                <p className="text-sm mt-2 text-slate-500">Người dùng này có thể không tồn tại hoặc đã bị xóa.</p>
                <button 
                    onClick={() => navigate('/user')}
                    className="mt-6 px-6 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition"
                >
                    Quay lại Trang chủ
                </button>
            </div>
        );
    }

    const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${user.username}&background=random&size=128`;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20 max-w-5xl mx-auto">
            {/* Left Column: Profile Info */}
            <div className="md:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center flex flex-col items-center">
                     <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 bg-slate-100">
                         <img 
                            src={user.avatar || defaultAvatarUrl} 
                            alt={user.username}
                            className="w-full h-full object-cover"
                         />
                     </div>
                     <h2 className="text-2xl font-bold text-slate-800">{user.username}</h2>
                     <p className="text-primary-600 font-medium text-sm mt-1 capitalize cursor-pointer">{user.role}</p>
                     
                     <div className="w-full mt-6 space-y-4 text-left">
                         <div className="flex items-center text-slate-600 text-sm">
                             <Calendar className="w-4 h-4 mr-3 text-slate-400" />
                             Tham gia: {user.created_at ? format(new Date(user.created_at), 'MMMM yyyy', { locale: vi }) : 'Gần đây'}
                         </div>
                         <div className="flex items-start text-slate-600 text-sm">
                             <Info className="w-4 h-4 mr-3 text-slate-400 mt-0.5" />
                             <span className="flex-1">{user.bio || 'Chưa có tiểu sử.'}</span>
                         </div>
                     </div>
                </div>
            </div>

            {/* Right Column: User Posts */}
            <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary-600" />
                        Bài viết của {user.username} ({posts.length})
                    </h3>
                    
                    {postsLoading ? (
                        <div className="flex justify-center py-8">
                             <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {posts.length > 0 ? (
                                posts.map(post => (
                                    <div 
                                        key={post.id} 
                                        onClick={() => navigate(`/user/posts/${post.id}`)}
                                        className="p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/30 cursor-pointer transition-all flex flex-col sm:flex-row gap-4 justify-between"
                                    >
                                        <div className="flex-1 min-w-0">
                                             <h4 className="font-bold text-slate-800 text-base mb-1 truncate">{post.title}</h4>
                                             <div className="flex flex-wrap items-center text-xs text-slate-500 gap-3">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                                                    {post.category || 'Thảo luận'}
                                                </span>
                                                <span>•</span>
                                                <span>{format(new Date(post.createdAt), 'dd/MM/yyyy')}</span>
                                             </div>
                                        </div>
                                        <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
                                            <span className="text-sm text-slate-500">❤️ {post.likeCount || 0}</span>
                                            <span className="text-sm text-slate-500">💬 {post.commentCount || 0}</span>
                                            {isOwnProfile && (
                                                <>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onOpen('create-post', post); }}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { 
                                                            e.stopPropagation();
                                                            if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
                                                                deleteMutation.mutate(post.id);
                                                            }
                                                        }}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                                    <p>Người dùng này chưa có bài viết nào.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
