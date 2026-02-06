import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReports } from './api/adminService';
import { Flag, Eye, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const ReportManagement = () => {
  const [page, setPage] = useState(1);
  
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports', page],
    queryFn: () => getReports({ page, limit: 10 }),
  });

  const reports = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">Quản lý Báo cáo vi phạm</h1>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Bài viết bị báo cáo</th>
                        <th className="px-6 py-4">Lý do</th>
                        <th className="px-6 py-4">Người báo cáo</th>
                        <th className="px-6 py-4">Ngày báo cáo</th>
                        <th className="px-6 py-4 text-right">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                         <tr><td colSpan="6" className="text-center py-8 text-slate-500">Đang tải dữ liệu...</td></tr>
                    ) : reports.length === 0 ? (
                         <tr><td colSpan="6" className="text-center py-8 text-slate-500">Không có báo cáo nào chưa xử lý.</td></tr>
                    ) : (
                        reports.map(report => (
                            <tr key={report.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm text-slate-500">#{report.id}</td>
                                <td className="px-6 py-4">
                                     <div className="max-w-xs">
                                        <p className="font-medium text-slate-900 truncate">{report.post?.title || 'Bài viết đã bị xóa'}</p>
                                        <p className="text-xs text-slate-500">ID: {report.post?.id}</p>
                                     </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="flex items-center space-x-2 text-slate-700 bg-red-50 text-xs px-2 py-1 rounded border border-red-100 w-fit font-medium">
                                        <AlertTriangle className="w-3 h-3 text-red-500" />
                                        <span>{report.reason}</span>
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {report.reporter?.username || 'Ẩn danh'}
                                </td>
                                <td className="px-6 py-4 text-slate-500 text-sm">
                                    {report.createdAt ? format(new Date(report.createdAt), 'dd/MM/yyyy HH:mm') : '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {report.post && (
                                        <Link 
                                            to={`/posts/${report.post.id}`} 
                                            target="_blank"
                                            className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span>Xem bài</span>
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            
             {/* Simple Pagination */}
             {pagination && (
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                        Hiển thị {reports.length} trên tổng số {pagination.total} báo cáo
                    </span>
                    <div className="flex space-x-2">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="px-3 py-1 border border-slate-200 rounded text-sm disabled:opacity-50 hover:bg-slate-50"
                        >
                            Previous
                        </button>
                        <button 
                             disabled={page >= pagination.totalPages}
                             onClick={() => setPage(page + 1)}
                             className="px-3 py-1 border border-slate-200 rounded text-sm disabled:opacity-50 hover:bg-slate-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
       </div>
    </div>
  );
};

export default ReportManagement;
