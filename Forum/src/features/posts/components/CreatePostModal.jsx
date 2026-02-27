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

const CreatePostModal = () => {
  const { onClose, data: editPost } = useModalStore();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: editPost?.title || "",
    content: editPost?.content || "",
    categoryId: editPost?.categoryId || "",
  });

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
        categoryId: editPost.categoryId || "",
      });
    } else {
      setFormData({ title: "", content: "", categoryId: "" });
    }
  }, [editPost]);

  const quillRef = useRef(null);

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
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
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
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Tiêu đề bài viết..."
            className="w-full text-lg font-bold placeholder:text-slate-400 border-none focus:ring-0 px-0 bg-transparent"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            autoFocus
          />
        </div>

        {/* Category Selector */}
        <div>
          <select
            value={formData.categoryId}
            onChange={(e) =>
              setFormData({ ...formData, categoryId: parseInt(e.target.value) })
            }
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-slate-700"
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

        <div className="h-px bg-slate-100 w-full my-2"></div>
        <div className="bg-white rounded-t-lg">
          <ReactQuill
            ref={quillRef}
            modules={modules}
            theme="snow"
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
            placeholder="Bạn đang nghĩ gì thế? Cùng chia sẻ với mọi người nhé..."
            className="h-48 mb-12 custom-quill"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            isLoading={mutation.isPending}
            className="w-full sm:w-auto px-8 rounded-full"
          >
            {editPost ? "Lưu thay đổi" : "Đăng bài"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePostModal;
