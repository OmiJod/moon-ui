import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
    id: string;
    header: string;
    text?: string;
    icon?: string;
    color?: string;
    event: string;
    args?: any[];
    server?: boolean;
    subMenu?: MenuItem[];
}

interface ContextMenuProps {
    items: MenuItem[];
    visible: boolean;
    onClose: () => void;
    position?: { x: number; y: number };
    title?: string;
    description?: string;
}

export function ContextMenu({
    items,
    visible,
    onClose,
    title,
    description 
}: ContextMenuProps) {
    const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const menuRef = useRef<HTMLDivElement>(null);
    const [mainMenuWidth, setMainMenuWidth] = useState(0);

    useEffect(() => {
        const updatePosition = () => {
            const screenWidth = window.innerWidth;
            const menuWidth = 320;
            const padding = 20;
            setMenuPosition({
                x: screenWidth - menuWidth - padding,
                y: 100
            });
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        return () => window.removeEventListener('resize', updatePosition);
    }, []);

    useEffect(() => {
        if (menuRef.current) {
            setMainMenuWidth(menuRef.current.offsetWidth);
        }
    }, [visible]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (activeSubmenu) {
                    setActiveSubmenu(null);
                } else {
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [activeSubmenu, onClose]);

    const handleItemClick = (item: MenuItem, e: React.MouseEvent) => {
        e.stopPropagation();
      
        if (item.subMenu) {
          setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
          return;
        }
      
        fetch(`https://moon-ui/menuEvent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: item.id, // Include the id here
            event: item.event,
            server: item.server,
            args: item.args || []
          })
        });
      
        onClose();
    };
      

    const submenuAnimation = {
        initial: { opacity: 0, scale: 0.95, x: -20 },
        animate: { opacity: 1, scale: 1, x: 0 },
        exit: { opacity: 0, scale: 0.95, x: -20 },
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
        }
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50" style={{ pointerEvents: visible ? 'auto' : 'none' }}>
            <div
                ref={menuRef}
                className="context-menu absolute"
                style={{
                    top: menuPosition.y,
                    left: activeSubmenu ? menuPosition.x - mainMenuWidth - 20 : menuPosition.x
                }}
            >
                <div className={cn("glass-effect rounded-xl border border-primary/20 shadow-xl min-w-[280px] max-w-[320px]")}>
                    {/* Title */}
                    <div className="px-4 py-3 border-b border-primary/10 bg-primary/5">
                        <h3 className="text-lg font-semibold text-primary">{title}</h3>
                        <p className="text-sm text-primary/60 mt-0.5">{description}</p>
                    </div>

                    {/* Menu Items */}
                    <div
                        className="relative"
                        style={{ maxHeight: `calc(100vh - ${menuPosition.y + 200}px)` }}
                    >
                        {items.map((item, index) => (
                            <div
                                key={item.id}
                                onClick={(e) => handleItemClick(item, e)}
                                className={cn(
                                    "relative px-4 py-3 flex items-center gap-3 transition-all cursor-pointer group hover:bg-primary/10",
                                    index !== items.length - 1 && "border-b border-primary/10"
                                )}
                            >
                                {/* Icon */}
                                {item.icon && (
                                    <div className="w-5 h-5 flex items-center justify-center text-primary/60 group-hover:text-primary">
                                        <i className={item.icon} />
                                    </div>
                                )}

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className={cn("text-sm font-medium", item.color ? `text-${item.color}` : "text-primary")}>
                                        {item.header}
                                    </div>
                                    {item.text && (
                                        <div className="text-xs text-primary/60 mt-0.5">
                                            {item.text}
                                        </div>
                                    )}
                                </div>

                                {/* Submenu icon */}
                                {item.subMenu && (
                                    <ChevronRight className={cn(
                                        "w-4 h-4 transition-transform duration-300",
                                        "text-primary/40 group-hover:text-primary",
                                        activeSubmenu === item.id && "rotate-180"
                                    )} />
                                )}

                                {/* Submenu */}
                                <AnimatePresence mode="wait">
                                    {activeSubmenu === item.id && item.subMenu && (
                                        <motion.div
                                            {...submenuAnimation}
                                            className="absolute"
                                            style={{ top: 0, left: '100%', marginLeft: '12px' }}
                                        >
                                            <motion.div
                                                className={cn("glass-effect rounded-xl border border-primary/20 shadow-xl min-w-[240px] max-w-[280px]")}
                                                layoutId={`submenu-${item.id}`}
                                            >
                                                <div className="px-4 py-3 border-b border-primary/10 bg-primary/5">
                                                    <h4 className="text-sm font-medium text-primary">{item.header}</h4>
                                                </div>
                                                {item.subMenu.map((subItem, subIndex) => (
                                                    <motion.div
                                                        key={subItem.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: subIndex * 0.05 }}
                                                        onClick={(e) => handleItemClick(subItem, e)}
                                                        className={cn(
                                                            "relative px-4 py-3 flex items-center gap-3 transition-all cursor-pointer group hover:bg-primary/10",
                                                            subIndex !== item.subMenu!.length - 1 && "border-b border-primary/10"
                                                        )}
                                                    >
                                                        {subItem.icon && (
                                                            <div className="w-5 h-5 flex items-center justify-center text-primary/60 group-hover:text-primary">
                                                                <i className={subItem.icon} />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className={cn("text-sm font-medium", subItem.color ? `text-${subItem.color}` : "text-primary")}>
                                                                {subItem.header}
                                                            </div>
                                                            {subItem.text && (
                                                                <div className="text-xs text-primary/60 mt-0.5">
                                                                    {subItem.text}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
