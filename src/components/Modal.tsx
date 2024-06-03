import '../styles/Modal.scss';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}

export default function Modal({ title, children, onClose }: Props) {
    return (
        <div className="modal-background" onClick={onClose}>
            <AnimatePresence>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="modal"
                    onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <h2>{title}</h2>
                        <button className="modal-close-button" onClick={onClose}>
                            ×
                        </button>
                    </div>
                    <div className="modal-contents">{children}</div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
