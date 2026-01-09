import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UiContextType {
    isCartOpen: boolean;
    setIsCartOpen: (v: boolean) => void;
    isWishlistOpen: boolean;
    setIsWishlistOpen: (v: boolean) => void;
    isSearchOpen: boolean;
    setIsSearchOpen: (v: boolean) => void;
    isMenuOpen: boolean;
    setIsMenuOpen: (v: boolean) => void;

    // Modals
    openModal: (modal: ModalType, props?: any) => void;
    closeAllModals: () => void;
    currentModal: ModalType | null;
    modalProps: any;

    // Toast/Notification
    notification: { message: string; type: 'success' | 'info' | 'error' } | null;
    showNotification: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export type ModalType =
    | 'LOGIN'
    | 'SIZE_GUIDE'
    | 'QUICK_VIEW'
    | 'STYLIST_CHAT'
    | 'RETURN_REQUEST'
    | 'ORDER_TRACKING'
    | 'VIP_ACCESS'
    | 'PRESS_PORTAL'
    | 'STYLE_QUIZ'
    | 'ADMIN_DASHBOARD'
    | 'INFO'
    | 'NEWSLETTER'
    | 'ARCHIVE_LOGIN';

const UiContext = createContext<UiContextType | undefined>(undefined);

export const UiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Drawer States
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Modal Manager
    const [currentModal, setCurrentModal] = useState<ModalType | null>(null);
    const [modalProps, setModalProps] = useState<any>({});

    // Toast
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

    const openModal = (modal: ModalType, props: any = {}) => {
        setCurrentModal(modal);
        setModalProps(props);
    };

    const closeAllModals = () => {
        setCurrentModal(null);
        setModalProps({});
    };

    const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3500);
    };

    return (
        <UiContext.Provider value={{
            isCartOpen, setIsCartOpen,
            isWishlistOpen, setIsWishlistOpen,
            isSearchOpen, setIsSearchOpen,
            isMenuOpen, setIsMenuOpen,
            openModal, closeAllModals, currentModal, modalProps,
            notification, showNotification
        }}>
            {children}
        </UiContext.Provider>
    );
};

export const useUi = () => {
    const context = useContext(UiContext);
    if (!context) throw new Error('useUi must be used within a UiProvider');
    return context;
};
