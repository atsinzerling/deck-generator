"use client";
import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  title: string;
  description?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm: () => void;
  children: React.ReactNode;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  description,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  onConfirm,
  children,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="bg-[#242424] border-0 rounded-xl p-6 w-full max-w-sm mx-4">
        <DialogTitle className="text-xl font-bold text-white">
          {title}
        </DialogTitle>
        {description && (
          <DialogDescription className="text-sm text-gray-300 mb-4">
            {description}
          </DialogDescription>
        )}
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button className = "px-4 py-2 bg-[#2f2f2f] text-white rounded-lg hover:bg-[#363636]">
              {cancelButtonText}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              onClick={onConfirm}
              className="px-4 py-3 bg-[#2f2f2f] text-red-500 rounded-lg hover:bg-[#3f2f2f] transition-colors border border-red-900/30 flex items-center justify-center gap-2 text-sm"
            >
              {confirmButtonText}
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog; 