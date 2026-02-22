
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSystemLogs } from '@/features/admin/api/adminService';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const formatLogData = (data) => {
    if (!data) return '-';
    let parsed = data;
    if (typeof data === 'string') {
        try {
            parsed = JSON.parse(data);
        } catch {
             return data;
        }
    }
    
    if (typeof parsed === 'object' && parsed !== null) {
        return (
            <div className="flex flex-wrap gap-1.5">
                {Object.entries(parsed).map(([key, value]) => (
                    <span key={key} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700">
                        <span className="font-semibold mr-1 text-slate-500">{key}:</span> 
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                ))}
            </div>
        );
    }
    return String(parsed);
};

const ViewLogs = () => {
    const { data: logsData, isLoading } = useQuery({ 
        queryKey: ['admin-logs-full'], 
        queryFn: () => getSystemLogs({ limit: 50 }) 
    });
    const logs = logsData?.logs || [];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">System Logs</h1>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                            <th className="px-6 py-4 font-medium">Level</th>
                            <th className="px-6 py-4 font-medium">Action</th>
                            <th className="px-6 py-4 font-medium">User</th>
                            <th className="px-6 py-4 font-medium">Details</th>
                            <th className="px-6 py-4 font-medium">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? <tr><td colSpan="5" className="p-6 text-center">Loading...</td></tr> : 
                         logs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4">
                                     <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${
                                        log.level === 'WARN' ? 'bg-orange-100 text-orange-700' :
                                        log.level === 'ERROR' ? 'bg-red-100 text-red-700' :
                                        'bg-blue-100 text-blue-700'
                                     }`}>
                                        {log.level}
                                     </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-800">{log.action}</td>
                                <td className="px-6 py-4 text-slate-600">{log.user?.username || 'System'}</td>
                                <td className="px-6 py-4">
                                    {formatLogData(log.data)}
                                </td>
                                <td className="px-6 py-4 text-slate-400">
                                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: vi })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ViewLogs;
