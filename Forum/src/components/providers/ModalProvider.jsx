import React from 'react';
const CreatePostModal = React.lazy(() => import('@/features/posts/components/CreatePostModal'));
import ReportModal from '@/components/modals/ReportModal';

const ModalProvider = () => {
  return (
    <React.Suspense fallback={null}>
      <CreatePostModal />
      {/* Add LoginModal here later */}
      <ReportModal />
    </React.Suspense>
  );
};

export default ModalProvider;
