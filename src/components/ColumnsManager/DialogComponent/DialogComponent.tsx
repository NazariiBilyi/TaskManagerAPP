import './DialogComponent.css'
import type {IDialogProps} from "./types.ts";
import * as React from "react";

const DialogComponent: React.FC<IDialogProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="dialog-backdrop" onClick={onClose}>
            <div className="dialog" onClick={(e) => e.stopPropagation()}>
                <button className="dialog-close" onClick={onClose}>×</button>
                {children}
            </div>
        </div>
    );
}

export default DialogComponent