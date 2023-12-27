import { useState } from 'react'

type UseModalHook = {
  readonly isOpen: boolean
  open: () => void
  close: () => void
}

const useModal = (): UseModalHook => {
  const [isOpen, setIsOpen] = useState(false)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  return { isOpen, open, close }
}

export default useModal
