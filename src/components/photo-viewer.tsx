import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Dialog, DialogClose, DialogDescription, DialogFullscreen, DialogTitle } from '@/components/ui/dialog'

/** Asks the Airbnb image CDN for a bigger rendition; other URLs pass through unchanged. */
export function largePhoto(src: string) {
  return src.replace(/([?&]im_w=)\d+/, '$11440')
}

type Props = {
  photos: string[]
  label: string
  /** Index of the photo to open, or null when closed. */
  openAt: number | null
  onClose: () => void
}

export function PhotoViewer({ photos, label, openAt, onClose }: Props) {
  return (
    <Dialog open={openAt !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogFullscreen aria-describedby="photo-viewer-hint">
        {openAt !== null && <Viewer photos={photos} label={label} startIndex={openAt} />}
      </DialogFullscreen>
    </Dialog>
  )
}

function Viewer({ photos, label, startIndex }: { photos: string[]; label: string; startIndex: number }) {
  const [viewportRef, api] = useEmblaCarousel({ startIndex })
  const [selected, setSelected] = useState(startIndex)

  useEffect(() => {
    if (!api) return
    const onSelect = () => setSelected(api.selectedScrollSnap())
    api.on('select', onSelect)
    return () => {
      api.off('select', onSelect)
    }
  }, [api])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') api?.scrollPrev()
      if (event.key === 'ArrowRight') api?.scrollNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [api])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3">
        <div className="min-w-0">
          <DialogTitle className="truncate text-[15px]">{label}</DialogTitle>
          <DialogDescription id="photo-viewer-hint" className="text-[13px] text-white/70 tabular-nums">
            Foto {selected + 1} de {photos.length}
          </DialogDescription>
        </div>
        <DialogClose
          aria-label="Fechar fotos"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 outline-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="size-5" />
        </DialogClose>
      </div>

      <div className="relative min-h-0 flex-1">
        <div ref={viewportRef} className="h-full overflow-hidden">
          <div className="flex h-full">
            {photos.map((src, i) => (
              <div key={src} className="flex h-full min-w-0 shrink-0 grow-0 basis-full items-center justify-center">
                <img
                  src={largePhoto(src)}
                  alt={`Foto ${i + 1} de ${photos.length} de ${label}`}
                  loading={Math.abs(i - startIndex) <= 1 ? 'eager' : 'lazy'}
                  referrerPolicy="no-referrer"
                  draggable={false}
                  className="max-h-full max-w-full select-none object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {photos.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              onClick={() => api?.scrollPrev()}
              disabled={selected === 0}
              className="absolute top-1/2 left-3 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 outline-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white disabled:opacity-0 [@media(pointer:fine)]:grid"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              aria-label="Próxima foto"
              onClick={() => api?.scrollNext()}
              disabled={selected === photos.length - 1}
              className="absolute top-1/2 right-3 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 outline-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white disabled:opacity-0 [@media(pointer:fine)]:grid"
            >
              <ChevronRight className="size-6" />
            </button>
          </>
        )}
      </div>

      <div
        aria-hidden="true"
        className="flex justify-center gap-1.5 px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]"
      >
        {photos.map((src, i) => (
          <span
            key={src}
            className={i === selected ? 'size-1.5 rounded-full bg-white' : 'size-1.5 rounded-full bg-white/40'}
          />
        ))}
      </div>
    </div>
  )
}
