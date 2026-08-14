import React from "react";
import { PlayCircle, Play, Trash2, Clock } from "lucide-react";

export interface VideoResourceItem {
  id: string;
  title: string;
  subjectId: string;
  type: "playlist" | "video";
  duration?: string;
  lessonsCount?: number;
  author: string;
  description: string;
  image: string;
  lessonsList?: { title: string; duration: string }[];
}

interface VideoCardProps {
  vid: VideoResourceItem;
  onSelectVideo: (vid: VideoResourceItem) => void;
  onDeleteVideo: (id: string) => void;
}

export function VideoCard({ vid, onSelectVideo, onDeleteVideo }: VideoCardProps) {
  return (
    <div
      className="group flex flex-col bg-surface-container-low rounded-2xl border border-outline-variant/30 overflow-hidden hover:border-primary transition-all duration-300 shadow-md text-right"
    >
      <div className="aspect-video w-full relative overflow-hidden bg-surface flex items-center justify-center">
        {vid.image ? (
          <img
            src={vid.image}
            alt={vid.title}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface-container-high via-surface-container to-surface flex flex-col items-center justify-center text-primary/60 gap-2">
            <PlayCircle className="w-10 h-10 opacity-70" />
            <span className="text-label-sm text-on-surface-variant font-light">فيديو دراسي</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent"></div>

        <button
          onClick={() => onSelectVideo(vid)}
          className="absolute w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-110 transition-transform shadow-lg cursor-pointer"
        >
          <Play className="w-6 h-6 translate-x-[-1px]" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteVideo(vid.id);
          }}
          className="absolute top-3 left-3 bg-error/90 text-white p-2 rounded-xl shadow-lg hover:bg-error transition-all z-20 cursor-pointer"
          title="حذف هذا الفيديو أو قائمة التشغيل"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {vid.duration && (
          <span className="absolute bottom-3 right-3 bg-black/80 px-2.5 py-1 rounded text-[11px] text-white flex items-center gap-1">
            <Clock className="w-3 h-3" /> {vid.duration}
          </span>
        )}
      </div>

      <div className="p-stack-md flex flex-col justify-between flex-grow gap-stack-sm">
        <div>
          <h3 className="text-body-lg font-headline-md text-on-surface group-hover:text-primary transition-colors duration-300 mb-2">
            {vid.title}
          </h3>
          <p className="text-label-sm text-on-surface-variant font-light line-clamp-2 leading-relaxed">
            {vid.description}
          </p>
        </div>

        {vid.lessonsList && (
          <div className="mt-2 pt-3 border-t border-outline-variant/10 flex flex-col gap-1.5">
            <span className="text-[12px] text-primary font-medium">الدروس في السلسلة:</span>
            {vid.lessonsList.slice(0, 3).map((lesson, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px] text-on-surface-variant">
                <span className="truncate">{lesson.title}</span>
                <span>{lesson.duration}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-outline-variant/10 flex justify-between items-center text-label-sm text-on-surface-variant">
          <span>{vid.author}</span>
          <button
            onClick={() => onSelectVideo(vid)}
            className="text-primary hover:underline text-label-sm font-medium cursor-pointer"
          >
            تشغيل الشرح ←
          </button>
        </div>
      </div>
    </div>
  );
}
