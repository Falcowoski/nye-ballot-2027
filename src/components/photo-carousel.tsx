import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, ImageOff, Maximize2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { PhotoViewer } from '@/components/photo-viewer'
import { cn } from '@/lib/utils'

export function PhotoCarousel({ photos, label, className }: { photos: string[]; label: string; className?: string }) {
  const [viewportRef, api] = useEmblaCarousel({ align: 'start' })
  const [selected, setSelected] = useState(0)
  const [viewerAt, setViewerAt] = useState<number | null>(null)

  useEffect(() => {
    if (!api) return
    const onSelect = () => setSelected(api.selectedScrollSnap())
    api.on('select', onSelect).on('reInit', onSelect)
    return () => {
      api.off('select', onSelect).off('reInit', onSelect)
    }
  }, [api])

  if (photos.length === 0) {
    return (
      <div
        className={cn(
          'flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 bg-placeholder text-[13px] text-muted-foreground',
          className,
        )}
      >
        <ImageOff className="size-6" aria-hidden="true" />
        Sem fotos por enquanto
      </div>
    )
  }

  return (
    <section
      className={cn('relative overflow-hidden', className)}
      aria-roledescription="carrossel"
      aria-label={`Fotos de ${label}`}
    >
      <div ref={viewportRef} className="overflow-hidden">
        <div className="flex">
          {photos.map((src, i) => (
            <div key={src} className="min-w-0 shrink-0 grow-0 basis-full">
              <button
                type="button"
                aria-label={`Ampliar foto ${i + 1} de ${photos.length}`}
                // Embla swallows the click that ends a swipe, so only a real tap opens the viewer.
                onClick={() => setViewerAt(i)}
                className="block w-full cursor-zoom-in outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60 focus-visible:ring-inset"
              >
                <img
                  src={src}
                  alt=""
                  loading={i === 0 ? 'eager' : 'lazy'}
                  referrerPolicy="no-referrer"
                  draggable={false}
                  className="aspect-[4/3] w-full select-none bg-placeholder object-cover"
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <span className="pointer-events-none absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-foreground/70 px-2.5 py-1 text-xs font-medium text-background tabular-nums">
        <Maximize2 className="size-3" aria-hidden="true" />
        {selected + 1}/{photos.length}
      </span>

      {photos.length > 1 && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-2.5 flex justify-center gap-1.5"
          >
            {photos.map((src, i) => (
              <span key={src} className={cn('size-1.5 rounded-full', i === selected ? 'bg-white' : 'bg-white/55')} />
            ))}
          </div>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={() => api?.scrollPrev()}
            disabled={selected === 0}
            className="absolute top-1/2 left-2 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-background/90 shadow outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60 disabled:opacity-0 [@media(pointer:fine)]:grid"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Próxima foto"
            onClick={() => api?.scrollNext()}
            disabled={selected === photos.length - 1}
            className="absolute top-1/2 right-2 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-background/90 shadow outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60 disabled:opacity-0 [@media(pointer:fine)]:grid"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}

      <PhotoViewer photos={photos} label={label} openAt={viewerAt} onClose={() => setViewerAt(null)} />
    </section>
  )
}
