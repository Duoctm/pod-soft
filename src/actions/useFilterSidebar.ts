import { create } from "zustand";

interface FilterSidebarState {
    isOpen: boolean;
    onClose: () => void;
    onOpen: () => void;
    toggle: () => void;
}

const initialState = {
    isOpen: false
};

export const useFilterSidebar = create<FilterSidebarState>()((set) => ({
    ...initialState,
    onClose: () => {
        set({ isOpen: false });
    },
    onOpen: () => {
        set({ isOpen: true });
    },
    toggle: () => {
        set((state) => ({ isOpen: !state.isOpen }));
    }
}));
