"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "../ui/Button";

interface CommonDialogProps {
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
}

export function CommonDialog({
  trigger,
  title,
  description,
  children,
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  onCancel,
  onConfirm,
}: CommonDialogProps) {
  return (
    <Dialog>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent
        className="sm:max-w-md bg-[#4c6096] border-none "
        showCloseButton={false}
      >
        <div className="bg-[#4c6096] text-white py-1 rounded-t-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-white font-semibold">
              {title}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="bg-white rounded-md p-3">
          {description && (
            <h2 className="font-semibold text-lg">{description}</h2>
          )}
          <div className="mb-4 mt-2">{children}</div>
          <DialogFooter className="flex justify-between gap-3 pl-3">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="w-1/2 h-15 text-xl font-semibold border border-black hover:cursor-pointer"
                onClick={onCancel}
              >
                {cancelLabel}
              </Button>
            </DialogClose>

            <DialogClose asChild>
              <Button
                className="bg-[#1a2e66] w-1/2 h-15 text-xl font-semibold hover:bg-[#1a2e66] hover:cursor-pointer"
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
