"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";

interface TallyFormDialogProps {
  title?: string;
  formId: string;
  trigger?: React.ReactNode;
  onSubmit?: () => void;
}

export function TallyFormDialog({
  title = "Form",
  formId,
  trigger = <Button>Open Form</Button>,
}: TallyFormDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-[600px] h-[75vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="h-full">
          <iframe
            src={`https://tally.so/embed/${formId}?alignLeft=1&hideTitle=1&transparentBackground=1&enableOnSubmit=1`}
            width="100%"
            height="100%"
            style={{ border: "none" }}
            title="Tally Form"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
