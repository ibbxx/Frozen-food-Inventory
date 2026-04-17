import * as React from "react";
import { X } from "lucide-react";
import { Button } from "./button";

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-all duration-100"
        onClick={onClose}
      />
      
      {/* Modal Dialog */}
      <div className="fixed z-50 grid w-full max-w-lg scale-100 gap-4 border bg-background p-6 shadow-lg sm:rounded-lg md:w-full">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={onClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Tutup</span>
            </Button>
          </div>
        </div>
        <div className="py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
