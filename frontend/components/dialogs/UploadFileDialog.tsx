"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn, formatBytes } from "@/lib/utils";
import { Button } from "../ui/button";
import { Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { uploadFile } from "@/lib/api/upload-file";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export const UploadFileDialog = ({
  triggerClassName,
  className,
}: {
  triggerClassName?: string;
  className?: string;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => setFile(acceptedFiles[0]),
    [file, setFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: uploadFile,
    onSuccess: (data) => {
      toast.success("File uploaded successfully!");
      router.refresh();
      setIsOpen(false);
      setFile(null);
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.message);
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className={triggerClassName}>
        <Button className="flex items-center gap-2">
          <Upload className="w-4 h-4" /> <span>Upload File</span>
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("", className)}>
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Add a new file to your account. This will be uploaded to the servers
            and will be available to download.
          </DialogDescription>
        </DialogHeader>
        <>
          {!file ? (
            <div
              className={`border-dashed border w-full rounded-lg h-[175px] flex items-center flex-col justify-center ${
                isDragActive && "border-black"
              } transition gap-2 cursor-pointer`}
              {...getRootProps()}
            >
              <input {...getInputProps()} />

              <div className="border bg-slate-100 w-fit p-2 text-xl rounded-full text-secondary">
                <Upload />
              </div>
              <p>
                Drag and drop or{" "}
                <span className="text-primary font-medium">
                  Click to upload
                </span>
              </p>
            </div>
          ) : (
            <>
              <div>
                <div className="border bg-background w-full p-2 rounded-md text-secondary">
                  <p>{file.name}</p>
                  <p className="text-sm">{formatBytes(file.size)}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFile(null)}>
                  Cancel
                </Button>
                <Button onClick={() => mutate(file)} disabled={isPending}>
                  Upload
                </Button>
              </DialogFooter>
            </>
          )}
        </>
      </DialogContent>
    </Dialog>
  );
};
