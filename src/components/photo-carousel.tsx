import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

export function PhotoCarousel({ photos, label }: { photos: string[]; label: string }) {
  const [viewportRef, api] = useEmblaCarousel({ align: 'start' })
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    if (!api) return
    const onSelect = () => setSelected(api.selectedScrollSnap())
    onSelect()
    api.on('select', onSelect).on('reInit', onSelect)
    return () => {
      api.off('select', onSelect).off('reInit', onSelect)
    }
  }, [api])

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 bg-placeholder text-[13px] text-muted-foreground">
        <ImageOff className="size-6" aria-hidden="true" />
        Sem fotos por enquanto
      </div>
    )
  }

  return (
    <section className="relative" aria-roledescription="carrossel" aria-label={`Fotos de ${label}`}>
      <div ref={viewportRef} className="overflow-hidden">
        <div className="flex">
          {photos.map((src, i) => (
            <div key={src} className="min-w-0 shrink-0 grow-0 basis-full">
              <img
                src={src}
                alt={`Foto ${i + 1} de ${photos.length}`}
                loading={i === 0 ? 'eager' : 'lazy'}
                referrerPolicy="no-referrer"
                draggable={false}
                className="aspect-[4/3] w-full select-none bg-placeholder object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <span className="absolute top-3 right-3 rounded-full bg-foreground/70 px-2.5 py-1 text-xs font-medium text-background tabular-nums">
        {selected + 1}/{photos.length}
      </span>

      {photos.length > 1 && (
        <>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-2.5 flex justify-center gap-1.5">
            {photos.map((src, i) => (
              <span key={src} className={cn('size-1.5 rounded-full', i === selected ? 'bg-white' : 'bg-white/55')} />
            ))}
          </div>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={() => api?.scrollPrev()}
            disabled={selected === 0}
            className="absolute top-1/2 left-2 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-background/90 shadow disabled:opacity-0 [@media(pointer:fine)]:grid"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Próxima foto"
            onClick={() => api?.scrollNext()}
            disabled={selected === photos.length - 1}
            className="absolute top-1/2 right-2 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-background/90 shadow disabled:opacity-0 [@media(pointer:fine)]:grid"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}
    </section>
  )
}
