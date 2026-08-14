import { BookOpen, FileText, LayoutList, Share2, Layers } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import Flashcards from "@/pages/Flashcards";

const filters = [
  { id: "school", label: "كتب مدرسية", icon: BookOpen },
  { id: "notes", label: "ملازم", icon: FileText },
  { id: "summaries", label: "ملخصات", icon: LayoutList },
  { id: "mindmaps", label: "خرائط ذهنية", icon: Share2 },
  { id: "flashcards", label: "فلاش كارد", icon: Layers }
];

const books = [
  {
    title: "ملزمة الفيزياء العميقة",
    subtitle: "الفصل الدراسي الأول",
    category: "notes",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXWTxSXpflwWZItPL94yRgS72AE_eUXo1siiyESo1-FtlENXtwS4j5JXy150kvyqL6Pm5BDFrf3sDIzqGo4tX5STKCeKvqKMZM5BEt7Afqpdg-O7kLpY-wLOD5FlpE9YQyckPAvtZo1bOJPJDge_b-pNRmGkICV8U9A6LJ23e-go5TKE9CdYudpJH1DzZ8ZcZ1f814a8sXd37rJZtFFLaMLWddmxzm0WLnICj8-IAJcvcgGcdWPtqnsdZwqjXW9cI7-ztZZf6EI3vQ"
  },
  {
    title: "مراجعة الرياضيات المجردة",
    subtitle: "الوحدة الثانية",
    category: "school",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJwM21A8mp6-EC-Gvs1QB12S910ai9i_npIp_WG2YcVE8yUFfAwYzksHTsmDFMx3HlBbv7ErLUsaJ1FNZFJ9IL5SywhrzkSXL2t2W6vXkxCy5wmo6vpOh6yY-nYErarCyr79M0J1keZDwgri3_tBylAblRgvfO5b3KKSpFpg36IGQtp3gcftoQ5nhWDtO1wyE2q_kukZ6AhWHVV_LV_XXTSneG5t-0Z3j_eRDBh1Nr6yF1iuG1InbqwigTc5aaMIZAyTirMZhp9Ejt"
  },
  {
    title: "أصول الكيمياء العضوية",
    subtitle: "سلسلة التميز الصامت",
    category: "summaries",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCo8T6m-q_OtbXndHKL5sRp5tHdiGM5Koti71Ansr9VMeTv28zcqpg7HmBb7NRPVYmyULXnlZ4ko8AmbJw2UCuLVZynh85PZG6zUKQQLIO3xhxS3ytNIekqYkbcZe_e2A7R83d4Jx7IgHl-sh_m3cunSpXIXXFPNmTXvQ2pHSus_5_NBqxAIZu1zI46Z4C1qZ1JnA0C_YCXWgPzINDHDZYG_-4ONihE4wzKPc3QlUJAEEV4DDSy8Sk40P6LrvYxyaPBwGQJCEKP8K6"
  },
  {
    title: "ملاحظات الأحياء الخلوية",
    subtitle: "التركيب والوظيفة",
    category: "notes",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCymG1d7iJxfq5PAFJblJbwa8j9bPhKWO14rQ7mWFSb35GOXfzVwC4_8hizNhTERcZ7kRbUhTwpkOH6MVcBffZO1QkPCZYzkFiaM1pumSPh6pwwBYi2sTbkypxZNBJS8Eu_PFWEK3QhbVXxykoM570memsl2QsGtAbmoJ9l9PRpLy9NuediVtlNA2sidlHFBGfIIFkB-AKLl9wZ6BBJNaEVtyZCQcbUFke_PgV00e0GzOjCMQ0kpfoeVuNZ7NZnvgHY9BvNsSotfUOG"
  }
];

export default function Books() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  if (!activeFilter) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center gap-stack-lg">
        <div className="text-center mb-stack-lg">
          <h1 className="text-headline-lg font-headline-lg text-on-surface mb-2">اختر نوع المحتوى الأكاديمي</h1>
          <div className="w-12 h-0.5 bg-primary/30 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-lg w-full max-w-3xl px-gutter">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className="group flex flex-col items-center justify-center p-stack-lg bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-none hover:border-primary transition-all duration-300 ease-in-out cursor-pointer"
            >
              <filter.icon className="w-10 h-10 mb-stack-md text-on-surface-variant group-hover:text-primary transition-colors duration-300" />
              <span className="text-headline-lg font-headline-lg text-on-surface group-hover:text-primary transition-colors duration-300">
                {filter.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activeFilter === "flashcards") {
    return (
      <div className="flex flex-col gap-stack-md">
        <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
          <h1 className="text-headline-lg font-headline-lg text-on-surface">فلاش كارد</h1>
          <button 
            onClick={() => setActiveFilter(null)}
            className="text-label-sm font-label-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            تغيير النوع
          </button>
        </div>
        <Flashcards />
      </div>
    );
  }

  const filteredBooks = books.filter(book => book.category === activeFilter);

  return (
    <div className="flex flex-col gap-stack-lg">
      <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
        <h1 className="text-headline-lg font-headline-lg text-on-surface">
          {filters.find(f => f.id === activeFilter)?.label}
        </h1>
        <button 
          onClick={() => setActiveFilter(null)}
          className="text-label-sm font-label-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          تغيير النوع
        </button>
      </div>

      <motion.section 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-stack-lg"
      >
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book, index) => (
            <motion.article 
              layout
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="group flex flex-col bg-surface-container-low rounded-xl border border-outline-variant/30 overflow-hidden hover:border-primary transition-colors duration-500 cursor-pointer"
            >
              <div className="aspect-[4/3] w-full relative overflow-hidden bg-surface">
                <img 
                  src={book.image} 
                  alt={book.title}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 mix-blend-luminosity"
                />
              </div>
              <div className="p-stack-md flex flex-col gap-stack-sm">
                <h3 className="text-body-lg font-body-lg text-on-surface group-hover:text-primary transition-colors duration-300">
                  {book.title}
                </h3>
                <p className="text-label-sm font-label-sm text-on-surface-variant font-light">{book.subtitle}</p>
              </div>
            </motion.article>
          ))
        ) : (
          <div className="col-span-full py-[6rem] flex flex-col items-center justify-center text-center gap-4 opacity-40">
             <p className="text-body-lg text-on-surface-variant">لا يوجد محتوى في هذا القسم حالياً</p>
          </div>
        )}
      </motion.section>
    </div>
  );
}
