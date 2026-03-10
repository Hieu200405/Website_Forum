import React, { useState, useRef, useCallback, useMemo } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createPost, updatePost } from "../api/postService";
import { getCategories } from "@/features/categories/api/categoryService";
import { uploadImage } from "@/lib/uploadService";
import useModalStore from "@/components/hooks/useModalStore";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

import { Image, X, Loader2 } from "lucide-react";

const CreatePostModal = () => {
  const { onClose, data: editPost } = useModalStore();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: editPost?.title || "",
    content: editPost?.content || "",
    categoryId: editPost?.categoryId || editPost?.category?.id || "",
    imageUrl: editPost?.imageUrl || editPost?.image_url || "",
  });

  const [coverPreview, setCoverPreview] = useState(editPost?.imageUrl || editPost?.image_url || "");
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Fetch categories
  const { data: rawCategories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  const categoriesList = Array.isArray(rawCategories) ? rawCategories : rawCategories?.data || [];

  // Reset form when editPost changes
  React.useEffect(() => {
    if (editPost) {
      setFormData({
        title: editPost.title || "",
        content: editPost.content || "",
        categoryId: editPost.categoryId || editPost.category?.id || "",
        imageUrl: editPost.imageUrl || editPost.image_url || "",
      });
      setCoverPreview(editPost.imageUrl || editPost.image_url || "");
    } else {
      setFormData({ title: "", content: "", categoryId: "", imageUrl: "" });
      setCoverPreview("");
    }
  }, [editPost]);

  const quillRef = useRef(null);

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCoverPreview(URL.createObjectURL(file));
    setIsUploadingCover(true);

    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
        const res = await uploadImage(uploadData);
        setFormData(prev => ({ ...prev, imageUrl: res.url }));
        toast.success("Tải ảnh bìa thành công");
    } catch {
        toast.error("Tải ảnh bìa thất bại");
        setCoverPreview("");
    } finally {
        setIsUploadingCover(false);
    }
  };

  const removeCover = () => {
    setCoverPreview("");
    setFormData(prev => ({ ...prev, imageUrl: "" }));
  };

  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        const toastId = toast.loading("Đang tải ảnh lên...");
        const uploadData = new FormData();
        uploadData.append("image", file);
        try {
          const res = await uploadImage(uploadData);
          const url = res.url;
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, "image", url);
          quill.setSelection(range.index + 1);
          toast.success("Tải ảnh thành công", { id: toastId });
        } catch (error) {
          console.error('Image upload failed', error);
          toast.error("Tải ảnh thất bại", { id: toastId });
        }
      }
    };
  }, []);

  const modules = useMemo(
    () => ({
      syntax: true, // Enable syntax highlighting
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler]
  );

  const mutation = useMutation({
    mutationFn: (data) => {
      if (editPost) {
        return updatePost({ id: editPost.id, data });
      }
      return createPost(data);
    },
    onSuccess: (data) => {
      toast.success(
        data?.data?.message || (editPost ? "Đã cập nhật bài viết!" : "Bài viết đã được đăng!")
      );
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      if (editPost) {
        queryClient.invalidateQueries({ queryKey: ["post", editPost.id] });
      }
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Thao tác thất bại");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !(formData.title || "").trim() ||
      !(formData.content || "").trim()
    ) {
      toast.error("Vui lòng điền đầy đủ Tiêu đề và Nội dung");
      return;
    }
    
    const payload = { ...formData };
    
    // Default to "Hỏi đáp" if no category is selected
    if (!payload.categoryId) {
        const defaultCategory = categoriesList.find(c => c.name.toLowerCase().includes('hỏi đáp'));
        if (defaultCategory) {
            payload.categoryId = defaultCategory.id;
        } else if (categoriesList.length > 0) {
            // Fallback to first category if 'Hỏi đáp' is not found
            payload.categoryId = categoriesList[0].id;
        }
    }
    
    mutation.mutate(payload);
  };

  return (
    <Modal
      type="create-post"
      title={editPost ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
      className="max-w-4xl h-[90vh] flex flex-col"
    >
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
        <div className="flex-shrink-0 space-y-4 mb-6">
          <input
            type="text"
            placeholder="Tiêu đề bài viết..."
            className="w-full text-2xl font-extrabold placeholder:text-slate-400 border-none focus:ring-0 px-0 bg-transparent text-slate-900"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            autoFocus
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 w-full">
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: parseInt(e.target.value) })
                }
                className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-slate-50 text-slate-700 text-sm font-medium"
                disabled={categoriesLoading}
              >
                <option value="">-- Chọn danh mục (Tùy chọn) --</option>
                {categoriesList.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                ))}
              </select>
            </div>
            
            <label className="shrink-0 flex items-center gap-2 px-4 h-11 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors text-slate-600 text-sm font-medium">
                <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={isUploadingCover} />
                <Image className="w-4 h-4" />
                {isUploadingCover ? "Đang tải..." : (formData.imageUrl ? "Đổi ảnh bìa" : "Thêm ảnh bìa")}
            </label>
          </div>

          {coverPreview && (
              <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden border border-slate-200 group">
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  {!isUploadingCover && (
                      <button 
                         type="button" 
                         onClick={removeCover}
                         className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                          <X className="w-4 h-4" />
                      </button>
                  )}
                  {isUploadingCover && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                  )}
              </div>
          )}
        </div>

        <div className="flex-1 min-h-0 flex flex-col border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-inner group focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
          <ReactQuill
            ref={quillRef}
            modules={modules}
            theme="snow"
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
            placeholder="Bạn đang nghĩ gì thế? Cùng chia sẻ với mọi người nhé..."
            className="flex-1 flex flex-col custom-quill-fullscreen"
          />
        </div>

        <div className="flex-shrink-0 flex items-center justify-between pt-6 mt-2 border-t border-slate-100">
           <div className="text-xs text-slate-400">
              Mẹo: Sử dụng <b>`code`</b> để đánh dấu mã nguồn.
           </div>
           <Button
            type="submit"
            isLoading={mutation.isPending}
            className="px-10 rounded-xl font-bold text-base shadow-lg shadow-primary-500/25"
          >
            {editPost ? "Lưu thay đổi" : "Đăng bài ngay"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePostModal;
