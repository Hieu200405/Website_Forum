
import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { Trash2, Plus } from 'lucide-react';

const ManageBannedWords = () => {
    // Mock data for now as no API endpoint was explicitly seen in previous context, 
    // but the requirement "Manage Banned Words" implies specific functionality.
    // I will use local state to demonstrate the UI.
    const [words, setWords] = useState([
        { id: 1, word: 'scam' },
        { id: 2, word: 'bet88' },
        { id: 3, word: 'lừa đảo' },
    ]);
    const [newWord, setNewWord] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        if(!newWord.trim()) return;
        const newItem = { id: Date.now(), word: newWord.trim().toLowerCase() };
        setWords([...words, newItem]);
        setNewWord('');
    };

    const handleDelete = (id) => {
        setWords(words.filter(w => w.id !== id));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Quản lý từ cấm (Banned Words)</h1>
            <p className="text-slate-500">Các từ trong danh sách này sẽ bị tự động filter hoặc warning khi user đăng bài.</p>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <form onSubmit={handleAdd} className="flex gap-4 mb-8">
                    <input 
                        type="text" 
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value)}
                        placeholder="Nhập từ cấm mới..."
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                    <Button type="submit" className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white">
                        <Plus className="w-4 h-4" />
                        <span>Thêm từ</span>
                    </Button>
                </form>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {words.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                            <span className="font-medium text-slate-700">{item.word}</span>
                            <button 
                                onClick={() => handleDelete(item.id)}
                                className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManageBannedWords;
