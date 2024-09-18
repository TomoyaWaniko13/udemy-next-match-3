import { Button, ButtonProps, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { ReactNode } from 'react';

// 167. Adding a modal

type Props = {
  isOpen: boolean;
  onClose: () => void;
  header: string;
  body: ReactNode;
  footerButtons: ButtonProps[];
};

// 再利用可能な NextUI の <Modal/> です。Props の値でカスタマイズできます。
const AppModal = ({ isOpen, onClose, header, body, footerButtons }: Props) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement={'top-center'}
      motionProps={{
        variants: {
          enter: { y: 0, opacity: 100, transition: { duration: 0.1 } },
          exit: { y: 100, opacity: 0, transition: { duration: 0.1 } },
        },
      }}
    >
      <ModalContent>
        <ModalHeader className={'flex flex-col gap-1'}>{header}</ModalHeader>
        <ModalBody>{body}</ModalBody>
        <ModalFooter>
          {footerButtons.map((props: ButtonProps, index) => (
            <Button {...props} key={index}>
              {props.children}
            </Button>
          ))}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AppModal;
