import React from 'react';
import CreatePostModal from '@/features/posts/components/CreatePostModal';
import ReportModal from '@/components/modals/ReportModal';

const ModalProvider = () => {
  return (
    <>
      <CreatePostModal />
      {/* Add LoginModal here later */}
      <ReportModal />
    </>
  );
};

export default ModalProvider;
