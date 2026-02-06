import { create } from 'zustand';

const useModalStore = create((set) => ({
  type: null, // 'create-post', 'login-required', 'report', etc.
  data: null, // Optional data passed to modal (e.g., postId for report)
  isOpen: false,

  onOpen: (type, data = null) => set({ isOpen: true, type, data }),
  onClose: () => set({ isOpen: false, type: null, data: null }),
}));

export default useModalStore;
