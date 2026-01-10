"use client";

import { useState, useEffect, useRef } from "react";

type ContextMenuItem = {
  label: string;
  action: () => void;
  icon?: string;
  disabled?: boolean;
  divider?: boolean;
  danger?: boolean;
};

type ContextMenuProps = {
  items: ContextMenuItem[];
  children: React.ReactNode;
  disabled?: boolean;
};

export function ContextMenu({ items, children, disabled = false }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  };

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;
    item.action();
    setIsOpen(false);
  };

  return (
    <>
      <div ref={triggerRef} onContextMenu={handleContextMenu}>
        {children}
      </div>
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-[160px] rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] shadow-[var(--elev-3)] py-1"
          style={{
            top: `${position.y}px`,
            left: `${position.x}px`,
          }}
          role="menu"
        >
          {items.map((item, idx) => (
            <div key={idx}>
              {item.divider && idx > 0 && (
                <div className="my-1 border-t border-[var(--border-subtle)]" />
              )}
              <button
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`w-full px-3 py-2 text-left text-sm transition ${
                  item.danger
                    ? "text-[var(--danger)] hover:bg-[var(--danger-weak)]"
                    : "text-[var(--text-primary)] hover:bg-[var(--card-muted)]"
                } ${item.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                role="menuitem"
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
