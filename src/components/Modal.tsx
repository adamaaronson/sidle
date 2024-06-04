import '../styles/Modal.scss';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
    layer?: number;
}

export default function Modal({ title, children, onClose, layer = 0 }: Props) {
    return (
        <div className="modal-background" onClick={onClose} style={{ zIndex: layer * 2 + 1 }}>
            <AnimatePresence>
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="modal"
                    onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
                    style={{ zIndex: layer * 2 + 2 }}
                >
                    <div className="modal-header">
                        <h2 className="modal-title">{title}</h2>
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
