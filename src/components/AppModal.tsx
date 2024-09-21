import { Button, ButtonProps, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { ReactNode } from 'react';

// 167. Adding a modal
// 168. Adding a confirmation modal
// 169. Adding an image modal

type Props = {
  // imageModal であれば、<Modal/> の中で body だけ表示します。
  imageModal?: boolean;
  isOpen: boolean;
  onClose: () => void;
  header?: string;
  body: ReactNode;
  footerButtons?: ButtonProps[];
};

// 再利用可能な NextUI の <Modal/> です。Props の値でカスタマイズできます。
const AppModal = ({ isOpen, onClose, header, body, footerButtons, imageModal }: Props) => {
  const handleClose = () => {
    setTimeout(() => onClose(), 10);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={'2xl'}
      placement={'top-center'}
      classNames={{ base: `${imageModal ? 'border-2 border-white' : ''}`, body: `${imageModal ? 'p-0' : ''}` }}
      motionProps={{
        variants: {
          enter: { y: 0, opacity: 100, transition: { duration: 0.3 } },
          exit: { y: 100, opacity: 0, transition: { duration: 0.3 } },
        },
      }}
    >
      <ModalContent>
        {!imageModal && <ModalHeader className={'flex flex-col gap-1'}>{header}</ModalHeader>}
        {/* imageModal であれば、<Modal/> の中で body だけ表示します。 */}
        <ModalBody>{body}</ModalBody>
        {!imageModal && (
          <ModalFooter>
            {footerButtons &&
              footerButtons.map((props: ButtonProps, index) => (
                <Button {...props} key={index}>
                  {props.children}
                </Button>
              ))}
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AppModal;
