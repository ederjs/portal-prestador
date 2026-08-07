import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { C } from "../theme/colors";
import type { MenuNode } from "../types";

interface MenuItemProps {
  item: MenuNode;
  level: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  active: string;
  onSelect: (id: string) => void;
  collapsed: boolean;
  textColor: string;
}

export default function MenuItem({ item, level, expanded, onToggle, active, onSelect, collapsed, textColor }: MenuItemProps) {
  const Icon = item.icon;
  const hasChildren = !!item.children;
  const isExpanded = expanded.has(item.id);
  const isActive = active === item.id;

  const paddingLeft = level === 0 ? 14 : level === 1 ? 40 : 58;

  return (
    <div>
      <button
        onClick={() => (hasChildren ? onToggle(item.id) : onSelect(item.id))}
        className="font-body w-full flex items-center gap-2.5 py-2.5 pr-3 text-left text-sm rounded-lg transition-colors"
        style={{
          paddingLeft,
          color: isActive ? C.bronze : textColor,
          backgroundColor: isActive ? C.bronzeSoft : "transparent",
        }}
      >
        {level === 0 && Icon && <Icon size={17} className="shrink-0" style={{ color: isActive ? C.bronze : textColor }} />}
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {hasChildren && (
              isExpanded ? <ChevronDown size={14} style={{ color: textColor, opacity: 0.6 }} /> : <ChevronRight size={14} style={{ color: textColor, opacity: 0.6 }} />
            )}
          </>
        )}
      </button>
      {hasChildren && isExpanded && !collapsed && (
        <div>
          {item.children!.map((child) => (
            <MenuItem
              key={child.id}
              item={child}
              level={level + 1}
              expanded={expanded}
              onToggle={onToggle}
              active={active}
              onSelect={onSelect}
              collapsed={collapsed}
              textColor={textColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
