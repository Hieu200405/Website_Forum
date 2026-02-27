import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import useAuthStore from '@/features/auth/store/authStore';
import { 
    User, Lock, Camera, Loader2, Save, CheckCircle2, AlertCircle,
    ArrowLeft, Eye, EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const getMe = async () => {
    const res = await api.get('/users/me');
    return res.data;
};

const updateMe = async (data) => {
    const res = await api.put('/users/me', data);
    return res.data;
};

const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.url || res.data?.url;
};

const InputField = ({ label, id, type = 'text', value, onChange, placeholder, hint, extra }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
        {hint && <p className="text-xs text-slate-400 mb-2">{hint}</p>}
        <div className="relative">
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition placeholder:text-slate-400"
            />
            {extra}
        </div>
    </div>
);

const Settings = () => {
    const navigate = useNavigate();
    const { user: authUser, login: setAuth } = useAuthStore();
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);

    const [infoForm, setInfoForm] = useState({ username: '', bio: '' });
    const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showPassCurrent, setShowPassCurrent] = useState(false);
    const [showPassNew, setShowPassNew] = useState(false);

    const { data: meData, isLoading } = useQuery({
        queryKey: ['me'],
        queryFn: getMe,
        retry: false
    });

    const me = meData;

    // Sync form state from server data once loaded
    const [formSynced, setFormSynced] = React.useState(false);
    if (me && !formSynced) {
        setFormSynced(true);
        setInfoForm({ username: me.username || '', bio: me.bio || '' });
        setAvatarPreview(me.avatar || null);
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ảnh quá lớn (tối đa 5MB)');
            return;
        }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const updateMutation = useMutation({
        mutationFn: updateMe,
        onSuccess: (data) => {
            toast.success('Cập nhật thành công!');
            queryClient.invalidateQueries({ queryKey: ['me'] });
            // Update auth store so NavBar reflects new username/avatar
            if (authUser) {
                setAuth({ ...authUser, username: data.username, avatar: data.avatar }, null);
            }
        },
        onError: (err) => {
            toast.error(err?.message || 'Có lỗi xảy ra');
        }
    });

    const handleSaveInfo = async (e) => {
        e.preventDefault();
        let avatarUrl = me?.avatar;

        // If new avatar file chosen, upload to Cloudinary first
        if (avatarFile) {
            setUploading(true);
            try {
                avatarUrl = await uploadAvatar(avatarFile);
                setAvatarFile(null);
            } catch {
                toast.error('Tải ảnh lên thất bại');
                setUploading(false);
                return;
            }
            setUploading(false);
        }

        updateMutation.mutate({
            username: infoForm.username,
            bio: infoForm.bio,
            avatar: avatarUrl
        });
    };

    const handleSavePassword = (e) => {
        e.preventDefault();
        if (passForm.newPassword !== passForm.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }
        updateMutation.mutate({
            currentPassword: passForm.currentPassword,
            newPassword: passForm.newPassword
        }, {
            onSuccess: () => {
                setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        });
    };

    const defaultAvatar = `https://ui-avatars.com/api/?name=${me?.username || 'U'}&background=random&size=128`;

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto pb-20 space-y-6">
            {/* Back button */}
            <button 
                onClick={() => navigate('/user')} 
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition mb-2"
            >
                <ArrowLeft className="w-4 h-4" /> Quay lại bảng tin
            </button>

            <h1 className="text-2xl font-bold text-slate-800">Cài đặt tài khoản</h1>

            {/* ---- Profile Info Card ---- */}
            <form onSubmit={handleSaveInfo} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
                <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-500" /> Thông tin cá nhân
                </h2>

                {/* Avatar */}
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-100">
                            <img 
                                src={avatarPreview || defaultAvatar}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 w-7 h-7 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-md transition"
                        >
                            <Camera className="w-3.5 h-3.5" />
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800">{me?.username}</p>
                        <p className="text-sm text-slate-500">{me?.email}</p>
                        <p className="text-xs text-slate-400 mt-1 capitalize">
                            Vai trò: <span className="font-medium text-primary-600">{me?.role}</span>
                        </p>
                    </div>
                </div>

                <InputField 
                    id="username" label="Tên hiển thị" value={infoForm.username}
                    onChange={e => setInfoForm(p => ({...p, username: e.target.value}))}
                    placeholder="Tên người dùng (4-30 ký tự)"
                />

                <div>
                    <label htmlFor="bio" className="block text-sm font-semibold text-slate-700 mb-1.5">Tiểu sử</label>
                    <textarea
                        id="bio"
                        rows={3}
                        value={infoForm.bio}
                        onChange={e => setInfoForm(p => ({...p, bio: e.target.value}))}
                        placeholder="Viết vài dòng giới thiệu về bản thân..."
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition placeholder:text-slate-400 resize-none"
                        maxLength={300}
                    />
                    <p className="text-right text-xs text-slate-400 mt-1">{infoForm.bio.length}/300</p>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={updateMutation.isPending || uploading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition disabled:opacity-60"
                    >
                        {(updateMutation.isPending || uploading) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Lưu thay đổi
                    </button>
                </div>
            </form>

            {/* ---- Password Card ---- */}
            <form onSubmit={handleSavePassword} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
                <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary-500" /> Đổi mật khẩu
                </h2>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu hiện tại</label>
                    <div className="relative">
                        <input
                            type={showPassCurrent ? 'text' : 'password'}
                            value={passForm.currentPassword}
                            onChange={e => setPassForm(p => ({...p, currentPassword: e.target.value}))}
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition placeholder:text-slate-400 pr-12"
                        />
                        <button type="button" onClick={() => setShowPassCurrent(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showPassCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu mới</label>
                    <div className="relative">
                        <input
                            type={showPassNew ? 'text' : 'password'}
                            value={passForm.newPassword}
                            onChange={e => setPassForm(p => ({...p, newPassword: e.target.value}))}
                            placeholder="Tối thiểu 8 ký tự"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition placeholder:text-slate-400 pr-12"
                        />
                        <button type="button" onClick={() => setShowPassNew(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showPassNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Xác nhận mật khẩu mới</label>
                    <div className="relative">
                        <input
                            type="password"
                            value={passForm.confirmPassword}
                            onChange={e => setPassForm(p => ({...p, confirmPassword: e.target.value}))}
                            placeholder="Nhập lại mật khẩu mới"
                            className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition placeholder:text-slate-400 ${passForm.confirmPassword && passForm.newPassword !== passForm.confirmPassword ? 'border-red-300' : 'border-slate-200'}`}
                        />
                        {passForm.confirmPassword && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {passForm.newPassword === passForm.confirmPassword 
                                    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    : <AlertCircle className="w-4 h-4 text-red-400" />
                                }
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={updateMutation.isPending || !passForm.currentPassword || !passForm.newPassword}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition disabled:opacity-50"
                    >
                        {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        Đổi mật khẩu
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
