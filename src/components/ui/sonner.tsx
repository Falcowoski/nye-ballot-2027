import { Toaster as Sonner, type ToasterProps } from 'sonner'

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          toast: '!rounded-full !bg-foreground !text-background !border-0 !font-sans !text-sm !font-medium !py-2.5 !px-4 !w-auto !mx-auto',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
