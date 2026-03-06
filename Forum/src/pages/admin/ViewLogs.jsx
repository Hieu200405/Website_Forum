
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSystemLogs } from '@/features/admin/api/adminService';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Activity, AlertTriangle, AlertCircle, Info, Loader2 } from 'lucide-react';

const LEVEL_CONFIG = {
    INFO:  { icon: Info,          cls: 'bg-blue-100 text-blue-700 border-blue-200',   dot: 'bg-blue-500' },
    WARN:  { icon: AlertTriangle, cls: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    ERROR: { icon: AlertCircle,   cls: 'bg-red-100 text-red-700 border-red-200',       dot: 'bg-red-500' },
};

const formatLogData = (data) => {
    if (!data) return null;
    let parsed = data;
    if (typeof data === 'string') {
        try { parsed = JSON.parse(data); } catch { return <span className="text-slate-500 text-xs">{data}</span>; }
    }
    if (typeof parsed === 'object' && parsed !== null) {
        return (
            <div className="flex flex-wrap gap-1.5">
                {Object.entries(parsed).map(([key, value]) => (
                    <span key={key} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono bg-slate-100 border border-slate-200 text-slate-700">
                        <span className="font-bold text-slate-400">{key}:</span>
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                ))}
            </div>
        );
    }
    return <span className="text-slate-500 text-xs">{String(parsed)}</span>;
};

const ViewLogs = () => {
    const [filterLevel, setFilterLevel] = useState('ALL');

    const { data: logsData, isLoading } = useQuery({
        queryKey: ['admin-logs-full'],
        queryFn: () => getSystemLogs({ limit: 100 }),
        refetchInterval: 15000,
    });

    const allLogs = logsData?.logs || [];
    const logs = filterLevel === 'ALL' ? allLogs : allLogs.filter(l => l.level === filterLevel);

    const countBy = (level) => allLogs.filter(l => l.level === level).length;

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-black text-slate-900">Nhật ký hệ thống</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Cập nhật tự động mỗi 15 giây · {allLogs.length} bản ghi gần nhất</p>
                </div>
            </div>

            {/* Level filter chips */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { key: 'ALL',   label: 'Tất cả',       count: allLogs.length, cls: 'bg-slate-800 text-white', inact: 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50' },
                    { key: 'INFO',  label: 'Info',          count: countBy('INFO'), cls: 'bg-blue-600 text-white', inact: 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50' },
                    { key: 'WARN',  label: 'Warning',       count: countBy('WARN'), cls: 'bg-amber-500 text-white', inact: 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50' },
                    { key: 'ERROR', label: 'Error',         count: countBy('ERROR'), cls: 'bg-red-600 text-white', inact: 'bg-white text-red-700 border border-red-200 hover:bg-red-50' },
                ].map(({ key, label, count, cls, inact }) => (
                    <button key={key} onClick={() => setFilterLevel(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${filterLevel === key ? cls : inact}`}>
                        {label}
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${filterLevel === key ? 'bg-white/25' : 'bg-slate-100 text-slate-600'}`}>
                            {count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Log timeline */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary-500 mx-auto" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <Activity className="w-10 h-10 mx-auto text-slate-200 mb-3" />
                        <p className="font-medium">Chưa có bản ghi nào</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {logs.map(log => {
                            const cfg = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.INFO;
                            const LIcon = cfg.icon;
                            return (
                                <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors">
                                    {/* Level dot */}
                                    <div className="mt-1 shrink-0">
                                        <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                                    </div>

                                    {/* Badge */}
                                    <div className="shrink-0 pt-0.5">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black border ${cfg.cls}`}>
                                            <LIcon className="w-3 h-3" />
                                            {log.level}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-slate-800 text-sm">{log.action}</span>
                                            {log.user && (
                                                <span className="text-xs text-slate-400">
                                                    bởi <span className="font-semibold text-slate-600">{log.user.username}</span>
                                                </span>
                                            )}
                                        </div>
                                        {log.data && <div className="mt-1.5">{formatLogData(log.data)}</div>}
                                    </div>

                                    {/* Time */}
                                    <div className="shrink-0 text-right">
                                        <div className="text-xs text-slate-400 font-medium whitespace-nowrap">
                                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: vi })}
                                        </div>
                                        <div className="text-[10px] text-slate-300 mt-0.5">
                                            {format(new Date(log.created_at), 'HH:mm dd/MM')}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewLogs;
