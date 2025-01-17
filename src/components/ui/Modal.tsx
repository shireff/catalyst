import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode } from "react";

interface IProps {
  isOpen?: boolean;
  closeModal?: () => void;
  // closeModal?: (value: boolean) => void;
  title?: string;
  description?: string;
  children?: ReactNode;
}

const Modal = ({
  isOpen,
  closeModal,
  title,
  children,
  description,
}: IProps) => {
  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            if (closeModal) {
              closeModal();
            }
          }}
        >
          <div className="fixed inset-0 backdrop-blur-sm" aria-hidden="true">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/25 dark:bg-black/50" />
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
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                    {title && (
                      <Dialog.Title
                        as="h3"
                        className="text-lg mb-[15px] font-medium leading-6 text-gray-900 dark:text-gray-100"
                      >
                        {title}
                      </Dialog.Title>
                    )}
                    {description && (
                      <Dialog.Title
                        as="h3"
                        className="text-md mb-[15px] font-normal leading-6 text-gray-900 dark:text-gray-300"
                      >
                        {description}
                      </Dialog.Title>
                    )}
                    <div className="overflow-y-auto p-1 max-h-[90vh] dark:text-gray-200">
                      {children}
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Modal;
