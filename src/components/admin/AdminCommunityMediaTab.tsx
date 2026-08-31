import React, { useState, useEffect, FormEvent } from "react";
import {
  subscribeCommunityMedia,
  addCommunityMediaItem,
  deleteCommunityMediaItem,
  subscribeCommunityCategories,
  addCommunityCategory,
  deleteCommunityCategory,
  getYouTubeThumbnail,
  CommunityMediaItem
} from "@/lib/communityMediaService";
import {
  Film,
  Plus,
  Trash2,
  ExternalLink,
  BookOpen,
  Youtube,
  Tag,
  Pencil,
  Image as ImageIcon
} from "lucide-react";

export function AdminCommunityMediaTab() {
  const [items, setItems] = useState<CommunityMediaItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>("all");

  // Form & Edit State
  const [editingItem, setEditingItem] = useState<CommunityMediaItem | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [type, setType] = useState<"youtube" | "book" | "link">("youtube");
  const [linkUrl, setLinkUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubMedia = subscribeCommunityMedia((list) => setItems(list));
    const unsubCats = subscribeCommunityCategories((cats) => {
      setCategories(cats);
      if (cats.length > 0 && !category) setCategory(cats[0]);
    });
    return () => {
      unsubMedia();
      unsubCats();
    };
  }, []);

  const filteredItems = selectedFilterCategory === "all"
    ? items
    : items.filter((i) => i.category === selectedFilterCategory);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setTitle("");
    setCategory(categories[0] || "فيديوهات وتطوير ذات 🎬");
    setCustomCategory("");
    setType("youtube");
    setLinkUrl("");
    setThumbnailUrl("");
    setDescription("");
    setAuthor("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: CommunityMediaItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setCategory(categories.includes(item.category) ? item.category : "custom");
    if (!categories.includes(item.category)) {
      setCustomCategory(item.category);
    } else {
      setCustomCategory("");
    }
    setType(item.type);
    setLinkUrl(item.linkUrl);
    setThumbnailUrl(item.thumbnailUrl || "");
    setDescription(item.description || "");
    setAuthor(item.author || "");
    setIsModalOpen(true);
  };

  const handleAddCategorySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    await addCommunityCategory(newCategoryName.trim());
    setNewCategoryName("");
    setIsAddCategoryModalOpen(false);
  };

  const handleDeleteCategory = async (catName: string) => {
    if (confirm(`هل أنت تأكد من رغبتك في حذف تصنيف "${catName}"؟`)) {
      setCategories((prev) => prev.filter((c) => c !== catName));
      await deleteCommunityCategory(catName);
    }
  };

  const handleSaveItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !linkUrl.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const finalCategory = category === "custom"
        ? (customCategory.trim() || "عام")
        : (category || categories[0] || "فيديوهات وتطوير ذات 🎬");

      if (category === "custom" && customCategory.trim()) {
        await addCommunityCategory(customCategory.trim());
      }

      // Auto extract YouTube thumbnail if not provided
      let finalThumbnail = thumbnailUrl.trim();
      if (!finalThumbnail && type === "youtube") {
        const extracted = getYouTubeThumbnail(linkUrl.trim());
        if (extracted) finalThumbnail = extracted;
      }

      const newItem: CommunityMediaItem = {
        id: editingItem ? editingItem.id : "m-" + Date.now(),
        title: title.trim(),
        category: finalCategory,
        type,
        linkUrl: linkUrl.trim(),
        thumbnailUrl: finalThumbnail || undefined,
        description: description.trim() || "مقطع أو كتاب مميز موصى به للطلاب للترفيه وتطوير الذات.",
        author: author.trim() || undefined,
        createdAt: editingItem ? editingItem.createdAt : new Date().toLocaleDateString("ar-SA")
      };

      await addCommunityMediaItem(newItem);
      setTitle("");
      setLinkUrl("");
      setThumbnailUrl("");
      setDescription("");
      setAuthor("");
      setCustomCategory("");
      setEditingItem(null);
      setIsModalOpen(false);
    } catch (err: unknown) {
      console.error("Error saving community media item:", err);
      alert("حدث خطأ أثناء حفظ العنصر. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت تأكد من رغبتك في حذف هذا المقطع أو الكتاب الموصى به؟")) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      await deleteCommunityMediaItem(id);
    }
  };

  return (
    <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 text-right shadow-xl">
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-outline-variant/10 pb-4">
        <div>
          <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-bold w-fit mb-2">
            <Film className="w-4 h-4" />
            <span>ترفيه وثقافة ونادي القراءة 🎬📚</span>
          </div>
          <h3 className="text-headline-md font-bold text-on-surface">إدارة وتعديل محتوى الترفيه وقنوات يوتيوب والنادي</h3>
          <p className="text-body-md text-on-surface-variant font-light mt-1">
            إضافة وتعديل وحذف الفيديوهات والكتب وقنوات يوتيوب الموصى بها وسحب الصور المصغرة تلقائياً.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddCategoryModalOpen(true)}
            className="bg-surface-container-high border border-outline-variant/40 hover:border-primary text-on-surface px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Tag className="w-4 h-4 text-purple-400" />
            <span>إضافة قسم جديد 🏷️</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="bg-primary text-on-primary hover:bg-primary/90 px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-primary/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة فيديو أو كتاب جديد ➕</span>
          </button>
        </div>
      </div>

      {/* Dynamic Categories Admin Manager Bar */}
      <div className="bg-surface-container p-4 rounded-2xl border border-outline-variant/20 flex flex-col gap-3">
        <h4 className="text-xs font-bold text-on-surface flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary" />
          <span>الأقسام المفعلة حالياً في نافذة الترفيه:</span>
        </h4>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div
              key={cat}
              className="bg-surface-container-high border border-outline-variant/30 px-3 py-1.5 rounded-xl text-xs font-bold text-on-surface flex items-center gap-2"
            >
              <span>{cat}</span>
              <button
                onClick={() => handleDeleteCategory(cat)}
                className="text-on-surface-variant hover:text-error transition-colors"
                title="حذف هذا القسم"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedFilterCategory("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            selectedFilterCategory === "all"
              ? "bg-primary text-on-primary shadow-md"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          الكل ({items.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilterCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedFilterCategory === cat
                ? "bg-primary text-on-primary shadow-md"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {cat} ({items.filter((i) => i.category === cat).length})
          </button>
        ))}
      </div>

      {/* Grid List */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-surface-container rounded-3xl border border-outline-variant/20 text-on-surface-variant flex flex-col items-center gap-3">
          <Film className="w-12 h-12 text-on-surface-variant/40" />
          <h4 className="text-headline-md font-bold text-on-surface">لا توجد عناصر مضافة بهذا التصنيف حالياً 🎬</h4>
          <p className="text-body-md text-on-surface-variant font-light">
            يمكنك إضافة أي فيديو يوتيوب أو كتاب ورواية عبر زر الإضافة أعلاه.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map((item) => {
            const displayThumbnail = item.thumbnailUrl || (item.type === "youtube" ? getYouTubeThumbnail(item.linkUrl) : null);
            return (
              <div
                key={item.id}
                className="bg-surface-container p-5 rounded-2xl border border-outline-variant/20 flex flex-col justify-between gap-4 hover:border-primary/40 transition-all shadow-md overflow-hidden"
              >
                {/* Thumbnail Preview Banner */}
                {displayThumbnail ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden bg-black/40 border border-outline-variant/20 group">
                    <img
                      src={displayThumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                      <span className="text-[10px] bg-black/60 text-white backdrop-blur-md font-bold px-2 py-0.5 rounded-md border border-white/10">
                        {item.category}
                      </span>
                    </div>
                  </div>
                ) : null}

                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3">
                    {!displayThumbnail && (
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold border shrink-0 ${
                        item.type === "youtube"
                          ? "bg-red-500/10 text-red-400 border-red-500/30"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      }`}>
                        {item.type === "youtube" ? <Youtube className="w-6 h-6 text-red-400" /> : <BookOpen className="w-6 h-6 text-blue-400" />}
                      </div>
                    )}

                    <div>
                      {!displayThumbnail && (
                        <span className="text-[11px] bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-md w-fit mb-1 inline-block">
                          {item.category}
                        </span>
                      )}
                      <h4 className="text-body-lg font-bold text-on-surface leading-snug">{item.title}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="text-primary hover:bg-primary/10 p-2 rounded-xl transition-colors cursor-pointer"
                      title="تعديل هذا العنصر"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-error hover:bg-error/10 p-2 rounded-xl transition-colors cursor-pointer"
                      title="حذف هذا العنصر"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant font-light bg-surface-container-high p-3 rounded-xl leading-relaxed">
                  "{item.description}"
                </p>

                <div className="pt-2 border-t border-outline-variant/10 flex justify-between items-center text-xs font-bold">
                  <a
                    href={item.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1.5"
                  >
                    <span>{item.type === "youtube" ? "مشاهدة الفيديو على يوتيوب" : "قراءة أو تحميل الكتاب"}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {item.author && (
                    <span className="text-on-surface-variant font-medium">بواسطة: {item.author}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Category Modal */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-right flex flex-col gap-4">
            <h4 className="text-headline-md font-bold text-on-surface border-b border-outline-variant/10 pb-3">
              إضافة قسم ترفيهي أو قناة جديدة 🏷️
            </h4>

            <form onSubmit={handleAddCategorySubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface">اسم القسم الجديد:</label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="مثال: قنوات يوتيوب ننصح بها 📺، بودكاست تحفيزي..."
                  className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface-variant font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg cursor-pointer"
                >
                  إضافة القسم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Content Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-right flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <h4 className="text-headline-md font-bold text-on-surface border-b border-outline-variant/10 pb-3">
              {editingItem ? "تعديل فيديو أو كتاب ✏️" : "إضافة فيديو ترفيهي، قناة أو كتاب وتطوير ذات ➕"}
            </h4>

            <form onSubmit={handleSaveItem} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface">العنوان:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: قناة دروس أونلاين / فيديو تنظيم الوقت"
                  className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface">اختر القسم / التصنيف:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface font-bold"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="custom">قسم جديد (يدوي)</option>
                </select>

                {category === "custom" && (
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="اكتب اسم القسم الجديد..."
                    className="bg-surface-container-high border border-primary rounded-xl p-3 text-body-md text-on-surface mt-1"
                  />
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface">نوع المحتوى:</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "youtube" | "book" | "link")}
                  className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface font-bold"
                >
                  <option value="youtube">فيديو أو قناة يوتيوب 🎬</option>
                  <option value="book">رابط كتاب / رواية 📚</option>
                  <option value="link">رابط موقع / مقال 🔗</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface">رابط الفيديو، القناة، أو الكتاب (URL):</label>
                <input
                  type="url"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface"
                />
                {type === "youtube" && linkUrl && (
                  <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <span>✓ سيتم سحب الصورة المصغرة للفيديو تلقائياً من يوتيوب 🎬</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                  <span>رابط صورة الغلاف / البوستر (URL اختياري للكتب أو الصور الخاصة):</span>
                </label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://example.com/cover-image.jpg"
                  className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface">اسم صاحب القناة أو المؤلف (اختياري):</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="مثال: أ. أحمد أبو زيد"
                  className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface">وصف مختصر:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="نبذة مختصرة عن الفوائد والمعلومات..."
                  className="bg-surface-container-high border border-outline-variant/40 rounded-xl p-3 text-body-md text-on-surface"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface-variant font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg cursor-pointer"
                >
                  {editingItem ? "حفظ التعديلات 💾" : "حفظ المحتوى ➕"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
