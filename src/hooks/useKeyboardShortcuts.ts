import { useEffect } from 'react';
import useGraphStore from '../store/graphStore';

type KeyboardShortcut = {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
};

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!event.ctrlKey === !!shortcut.ctrlKey &&
          !!event.shiftKey === !!shortcut.shiftKey &&
          !!event.altKey === !!shortcut.altKey
        ) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};

export const useCommonKeyboardShortcuts = () => {
  const { undo, redo } = useGraphStore();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'z',
      ctrlKey: true,
      action: undo,
    },
    {
      key: 'y',
      ctrlKey: true,
      action: redo,
    },
    {
      key: 'z',
      ctrlKey: true,
      shiftKey: true,
      action: redo,
    },
  ];

  useKeyboardShortcuts(shortcuts);
}; 