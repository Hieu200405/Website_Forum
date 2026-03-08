import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FileText,
  User,
  Hash,
  TrendingUp,
  X,
  ArrowRight,
  Command,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPosts } from "@/features/posts/api/postService";
import { getCategories } from "@/features/categories/api/categoryService";

// ─── Keyboard shortcut: Ctrl+K / ⌘K opens the palette ───────────
const SHORTCUT_KEY = "k";

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Open / close
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === SHORTCUT_KEY) {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setSelected(0);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // Search posts
  const { data: searchData } = useQuery({
    queryKey: ["cmd-search", query],
    queryFn: () => getPosts({ page: 1, limit: 5, search: query }),
    enabled: query.length > 1,
    staleTime: 30000,
  });
  const { data: categoriesResponse = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 300000,
  });

  const postsRaw = searchData?.data || [];
  const posts = Array.isArray(postsRaw) ? postsRaw : [];
  const categoriesRaw = Array.isArray(categoriesResponse)
    ? categoriesResponse
    : categoriesResponse?.data || [];
  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : [];

  // Build result groups
  const quickActions = [
    {
      id: "home",
      label: "Bảng tin",
      icon: TrendingUp,
      action: () => navigate("/user"),
    },
    {
      id: "leaderboard",
      label: "Bảng xếp hạng",
      icon: TrendingUp,
      action: () => navigate("/user/leaderboard"),
    },
    {
      id: "saved",
      label: "Bài đã lưu",
      icon: FileText,
      action: () => navigate("/user/saved"),
    },
  ];

  const allItems = [
    ...quickActions.map((a) => ({ ...a, type: "action" })),
    ...posts.map((p) => ({
      id: `post-${p.id}`,
      label: p.title,
      sub: p.author?.username,
      type: "post",
      action: () => navigate(`/user/posts/${p.id}`),
    })),
    ...categories
      .slice(0, 4)
      .map((c) => ({
        id: `cat-${c.id}`,
        label: c.name,
        type: "category",
        action: () => navigate("/user"),
      })),
  ].filter(
    (item) => !query || item.label.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = useCallback((item) => {
    item.action?.();
    setOpen(false);
    setQuery("");
  }, []);

  // Arrow key navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, allItems.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      }
      if (e.key === "Enter" && allItems[selected])
        handleSelect(allItems[selected]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, selected, allItems, handleSelect]);

  if (!open) return null;

  const TypeIcon = {
    action: ArrowRight,
    post: FileText,
    category: Hash,
    user: User,
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-start justify-center pt-[15vh] px-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl fade-in"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          boxShadow: "0 25px 60px rgba(99,102,241,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div
          className="flex items-center gap-3 px-4 py-3.5 border-b"
          style={{ borderColor: "var(--border-color)" }}
        >
          <Search
            className="w-5 h-5 shrink-0"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            placeholder="Tìm kiếm bài viết, chuyên mục, điều hướng..."
            className="flex-1 bg-transparent text-sm font-medium outline-none"
            style={{ color: "var(--text-primary)" }}
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="py-2 max-h-80 overflow-y-auto">
          {allItems.length === 0 ? (
            <div
              className="px-4 py-8 text-center text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Không tìm thấy kết quả cho "{query}"
            </div>
          ) : (
            allItems.map((item, idx) => {
              const Icon = TypeIcon[item.type] || ArrowRight;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                  style={{
                    background:
                      idx === selected ? "var(--bg-muted)" : "transparent",
                    color: "var(--text-primary)",
                  }}
                  onMouseEnter={() => setSelected(idx)}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background:
                        item.type === "action"
                          ? "rgba(99,102,241,0.1)"
                          : item.type === "post"
                            ? "rgba(16,185,129,0.1)"
                            : "rgba(245,158,11,0.1)",
                    }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{
                        color:
                          item.type === "action"
                            ? "#6366f1"
                            : item.type === "post"
                              ? "#10b981"
                              : "#f59e0b",
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {item.label}
                    </div>
                    {item.sub && (
                      <div
                        className="text-xs truncate"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {item.sub}
                      </div>
                    )}
                  </div>
                  {idx === selected && (
                    <kbd
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        background: "var(--bg-muted)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      ↵
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        <div
          className="px-4 py-2.5 flex items-center gap-3 text-xs border-t"
          style={{
            borderColor: "var(--border-color)",
            color: "var(--text-muted)",
          }}
        >
          <span className="flex items-center gap-1">
            <kbd
              className="px-1 py-0.5 rounded border"
              style={{ borderColor: "var(--border-color)" }}
            >
              ↑↓
            </kbd>{" "}
            điều hướng
          </span>
          <span className="flex items-center gap-1">
            <kbd
              className="px-1 py-0.5 rounded border"
              style={{ borderColor: "var(--border-color)" }}
            >
              ↵
            </kbd>{" "}
            chọn
          </span>
          <span className="flex items-center gap-1">
            <kbd
              className="px-1 py-0.5 rounded border"
              style={{ borderColor: "var(--border-color)" }}
            >
              Esc
            </kbd>{" "}
            đóng
          </span>
          <span className="ml-auto flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span>K</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
