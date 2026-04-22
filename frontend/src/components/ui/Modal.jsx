import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Modal({ isOpen, onClose, title, description, children, className, maxWidth = "max-w-md" }) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-secondary-950/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={cn(
                  "w-full transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all", 
                  maxWidth,
                  className
              )}>
                 <div className="flex justify-between items-center mb-4">
                    {title && (
                        <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-secondary-900"
                        >
                        {title}
                        </Dialog.Title>
                    )}
                    <button
                        onClick={onClose}
                        className="text-secondary-400 hover:text-secondary-500 focus:outline-none ml-auto"
                    >
                        <X className="h-5 w-5" />
                    </button>
                 </div>
                 
                {description && (
                    <div className="mt-2 mb-4">
                        <p className="text-sm text-secondary-500">
                        {description}
                        </p>
                    </div>
                )}

                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
