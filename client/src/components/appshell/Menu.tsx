import { AnimatePresence } from "motion/react";
import React from "react";
import { motion } from "framer-motion";

function Menu({
  isOpen,
  position,
  itemHeight,
  items,
}: {
  isOpen: boolean;
  position: { top: number; left: number };
  itemHeight: string;
  items: Array<{
    icon: React.ReactNode;
    text: string;
    onClick: () => void;
    className?: string;
  }>;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: "0" }}
          exit={{ width: "0" }}
          animate={{
            width: "8rem",
          }}
          transition={{ duration: 0.2 }}
          className={`absolute flex flex-col overflow-x-hidden ${
            isOpen && "z-40"
          }`}
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          {items.map((item, index) => {
            return (
              <div
                className={`flex flex-row bg-mist px-2 hover:bg-silver cursor-pointer items-center text-[16px] py-[18px] max-md:py-[20px] ${
                  item.className
                } ${
                  index == 0
                    ? "rounded-tr-sm"
                    : index == items.length - 1
                    ? "rounded-br-sm"
                    : ""
                }`}
                key={item.text}
                style={{
                  height: itemHeight,
                }}
                onClick={item.onClick}
              >
                <div>{item.icon}</div>
                <span className="ml-2">{item.text}</span>
              </div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Menu;
