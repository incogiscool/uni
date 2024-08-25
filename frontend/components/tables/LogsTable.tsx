"use client";
import { Log } from "@/lib/types";
import { cn, formatBytes } from "@/lib/utils";
import { DataTable } from "../ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Copy, Download, MoreVertical, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "../ui/skeleton";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteFile } from "@/lib/api/delete-file";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getFile } from "@/lib/api/get-file";

export const LogsTableSkeleton = () => {
  return (
    <div className="mt-4">
      <Skeleton className="flex border border-b-0 flex-col gap-4 w-full h-12 rounded-tr-md rounded-tl-md" />
      <hr />
      <Skeleton className="w-full h-16 border border-t-0" />
      <Skeleton className="w-full h-16 border border-t-0" />
      <Skeleton className="w-full h-16 border border-t-0" />
      <Skeleton className="w-full h-16 border border-t-0" />
      <Skeleton className="w-full h-16 border border-t-0" />
      <Skeleton className="w-full h-16 border border-t-0" />
      <Skeleton className="w-full h-16 border border-t-0" />
      <Skeleton className="w-full h-16 border border-t-0 rounded-bl-md rounded-br-md" />
    </div>
  );
};

export const LogsTable = ({ logs }: { logs: Log[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { mutate: mutateDeleteFile, isPending: isPendingDeleteFile } =
    useMutation({
      mutationFn: deleteFile,
      onSuccess: async () => {
        router.refresh();

        setIsOpen(false);

        toast.success("File deleted successfully");
      },
      onError(error) {
        toast.error(error.message);
      },
    });

  const { mutate: mutateDownloadFile, isPending: isPendingDownloadFile } =
    useMutation({
      mutationFn: async (id: string) => {
        const data = await getFile(id);
        const bytes = Buffer.from(data.content);

        // Dwonload the file
        const blob = new Blob([bytes], { type: data.file_extension });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = data.file_name;
        link.click();
      },
      onSuccess: async () => {
        router.refresh();
        toast.success("File downloaded successfully");
      },
      onError(error) {
        console.log(error);
        toast.error(error.message);
      },
    });

  const router = useRouter();

  const columns: ColumnDef<Log>[] = [
    {
      accessorKey: "file_name",
      header: "Name",
    },
    {
      accessorKey: "timestamp",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Uploaded Date/Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      accessorFn: (log) =>
        new Date(log.timestamp).toDateString() +
        ", " +
        new Date(log.timestamp).toLocaleTimeString(),
    },
    {
      accessorKey: "size",
      header: "Size",
      accessorFn: (log) => formatBytes(log.size),
    },
    {
      accessorKey: "file_extension",
      header: "Extension",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const log = row.original;

        return (
          <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onClick={() => mutateDownloadFile(log.id)}
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(log.id)}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy ID</span>
                </DropdownMenuItem>

                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive flex items-center gap-2">
                    <Trash className="w-4 h-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your data from the servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant={"destructive"}
                  onClick={() => mutateDeleteFile(log.id)}
                  disabled={isPendingDeleteFile}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      },
    },
  ];

  // Reverse the logs array to display the most recent logs first
  return <DataTable className="mt-4" columns={columns} data={logs.reverse()} />;
};
