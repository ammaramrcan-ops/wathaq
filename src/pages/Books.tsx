import { BookOpen, FileText, LayoutList, Share2, Layers, Plus, ExternalLink, Trash2, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Flashcards from "@/pages/Flashcards";
import { useAuth } from "@/context/AuthContext";
import { AddContentModal } from "@/components/AddContentModal";
import { subscribeDeletedItems, subscribeCustomContent, markItemAsDeleted, getLocalDeletedIds, CustomContentItem } from "@/lib/contentService";

const filters = [
  { id: "school", label: "كتب مدرسية", icon: BookOpen },
  { id: "notes", label: "ملازم", icon: FileText },
  { id: "summaries", label: "ملخصات", icon: LayoutList },
  { id: "mindmaps", label: "خرائط ذهنية", icon: Share2 },
  { id: "flashcards", label: "فلاش كارد", icon: Layers }
];

const defaultBooks = [
  {
    id: "b1",
    title: "ملزمة الفيزياء العميقة",
    subtitle: "الفصل الدراسي الأول",
    category: "notes",
    linkUrl: "https://drive.google.com",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXWTxSXpflwWZItPL94yRgS72AE_eUXo1siiyESo1-FtlENXtwS4j5JXy150kvyqL6Pm5BDFrf3sDIzqGo4tX5STKCeKvqKMZM5BEt7Afqpdg-O7kLpY-wLOD5FlpE9YQyckPAvtZo1bOJPJDge_b-pNRmGkICV8U9A6LJ23e-go5TKE9CdYudpJH1DzZ8ZcZ1f814a8sXd37rJZtFFLaMLWddmxzm0WLnICj8-IAJcvcgGcdWPtqnsdZwqjXW9cI7-ztZZf6EI3vQ"
  },
  {
    id: "b2",
    title: "مراجعة الرياضيات المجردة",
    subtitle: "الوحدة الثانية",
    category: "school",
    linkUrl: "https://drive.google.com",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJwM21A8mp6-EC-Gvs1QB12S910ai9i_npIp_WG2YcVE8yUFfAwYzksHTsmDFMx3HlBbv7ErLUsaJ1FNZFJ9IL5SywhrzkSXL2t2W6vXkxCy5wmo6vpOh6yY-nYErarCyr79M0J1keZDwgri3_tBylAblRgvfO5b3KKSpFpg36IGQtp3gcftoQ5nhWDtO1wyE2q_kukZ6AhWHVV_LV_XXTSneG5t-0Z3j_eRDBh1Nr6yF1iuG1InbqwigTc5aaMIZAyTirMZhp9Ejt"
  },
  {
    id: "b3",
    title: "أصول الكيمياء العضوية",
    subtitle: "سلسلة التميز الصامت",
    category: "summaries",
    linkUrl: "https://drive.google.com",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCo8T6m-q_OtbXndHKL5sRp5tHdiGM5Koti71Ansr9VMeTv28zcqpg7HmBb7NRPVYmyULXnlZ4ko8AmbJw2UCuLVZynh85PZG6zUKQQLIO3xhxS3ytNIekqYkbcZe_e2A7R83d4Jx7IgHl-sh_m3cunSpXIXXFPNmTXvQ2pHSus_5_NBqxAIZu1zI46Z4C1qZ1JnA0C_YCXWgPzINDHDZYG_-4ONihE4wzKPc3QlUJAEEV4DDSy8Sk40P6LrvYxyaPBwGQJCEKP8K6"
  }
];

export default function Books() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customBooks, setCustomBooks] = useState<CustomContentItem[]>([]);
  const [deletedBookIds, setDeletedBookIds] = useState<string[]>([]);

  useEffect(() => {
    const unsubDeleted = subscribeDeletedItems("book", user?.uid, (ids) => {
      setDeletedBookIds(ids);
    });

    const unsubCustom = subscribeCustomContent(user?.uid, (items) => {
      const approved = items.filter(
        (item) => item.status !== "pending" && (item.contentType === "book" || item.contentType === "mindmaps")
      );
      setCustomBooks(approved);
    });

    return () => {
      unsubDeleted();
      unsubCustom();
    };
  }, [user?.uid]);

  const handleDeleteBook = async (id: string, e: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm("هل أنت تأكد من رغبتك في حذف هذا الكتاب/الملزمة نهائياً؟")) {
      await markItemAsDeleted(id, "book", user?.uid, true);
    }
  };

  if (!activeFilter) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center gap-stack-lg min-h-[65vh]">
        <div className="text-center mb-stack-lg max-w-xl">
          <h1 className="text-headline-lg font-headline-lg text-on-surface mb-2">مكتبة وثاق للكتب والملازم والخرائط الذهنية</h1>
          <p className="text-body-md text-on-surface-variant font-light">اختر قسم المحتوى الأكاديمي لبدء التصفح أو التفاعل المباشر.</p>
          <div className="w-12 h-0.5 bg-primary/30 mx-auto mt-4"></div>
        </div>

        {/* Add Button inside Page for All Users */}
        <div className="mb-4">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary text-on-primary hover:bg-primary/90 px-5 py-2.5 rounded-xl text-label-sm font-medium flex items-center gap-2 shadow-lg shadow-primary/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة كتاب / ملزمة / مصدر جديد</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-gutter w-full max-w-4xl">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => handleSelectFilter(filter.id)}
                className="group flex flex-col items-center justify-center p-stack-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:border-primary hover:bg-surface-container transition-all duration-300 gap-stack-sm cursor-pointer shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-body-lg font-body-lg text-on-surface group-hover:text-primary transition-colors">
                  {filter.label}
                </span>
              </button>
            );
          })}
        </div>

        <AddContentModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
          }}
          defaultContentType="book"
        />
      </div>
    );
  }

  if (activeFilter === "flashcards") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
          <button
            onClick={() => handleSelectFilter(null)}
            className="text-label-sm text-on-surface-variant hover:text-primary border border-outline-variant/30 px-3 py-1.5 rounded-lg"
          >
            ← العودة لأقسام الكتب
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-sm font-medium flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة بطاقة فلاش كارد جديدة</span>
          </button>
        </div>
        <Flashcards />
        <AddContentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} defaultContentType="flashcards" />
      </div>
    );
  }

  const allFilteredBooks = [
    ...defaultBooks.filter((b) => !deletedBookIds.includes(b.id) && (b.category === activeFilter || activeFilter === "school")),
    ...customBooks.filter((cb) => !deletedBookIds.includes(cb.id)).map((cb) => ({
      id: cb.id,
      title: cb.title,
      subtitle: cb.description || "محتوى مخصص",
      category: cb.contentType,
      linkUrl: cb.linkUrl,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXWTxSXpflwWZItPL94yRgS72AE_eUXo1siiyESo1-FtlENXtwS4j5JXy150kvyqL6Pm5BDFrf3sDIzqGo4tX5STKCeKvqKMZM5BEt7Afqpdg-O7kLpY-wLOD5FlpE9YQyckPAvtZo1bOJPJDge_b-pNRmGkICV8U9A6LJ23e-go5TKE9CdYudpJH1DzZ8ZcZ1f814a8sXd37rJZtFFLaMLWddmxzm0WLnICj8-IAJcvcgGcdWPtqnsdZwqjXW9cI7-ztZZf6EI3vQ"
    }))
  ];

  return (
    <div className="flex flex-col gap-stack-lg">
      <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
        <button
          onClick={() => handleSelectFilter(null)}
          className="text-label-sm text-on-surface-variant hover:text-primary border border-outline-variant/30 px-3 py-1.5 rounded-lg cursor-pointer"
        >
          ← الرجوع للأقسام الرئيسية
        </button>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg text-label-sm font-medium flex items-center gap-1.5 cursor-pointer shadow-lg shadow-primary/10"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة كتاب / ملزمة جديدة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
        {allFilteredBooks.map((book, idx) => (
          <motion.a
            key={book.id || idx}
            href={book.linkUrl || "https://drive.google.com"}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="group flex flex-col bg-surface-container-low rounded-2xl border border-outline-variant/30 overflow-hidden hover:border-primary transition-all shadow-lg relative"
          >
            <div className="aspect-[4/3] overflow-hidden relative">
              <img
                src={book.image}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white p-1.5 rounded-lg text-xs flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5" /> Google Drive
              </span>

              {/* Direct Delete Button for All Users */}
              <button
                onClick={(e) => handleDeleteBook(book.id, e)}
                className="absolute top-3 right-3 bg-error/90 text-white p-2 rounded-xl shadow-lg hover:bg-error transition-all z-20 cursor-pointer"
                title="حذف هذا الكتاب أو الملزمة نهائياً"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-stack-md flex flex-col gap-1 text-right">
              <h3 className="text-body-lg font-body-lg text-on-surface group-hover:text-primary transition-colors">
                {book.title}
              </h3>
              <p className="text-label-sm text-on-surface-variant opacity-80">{book.subtitle}</p>
            </div>
          </motion.a>
        ))}
      </div>

      <AddContentModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          loadBooks();
        }}
        defaultContentType="book"
      />
    </div>
  );
}
