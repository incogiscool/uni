import { Suspense } from "react";
import Loading from "./loading";
import { getLogs } from "@/lib/api/get-logs";
import { LogsTable } from "@/components/tables/LogsTable";
import { UploadFileDialog } from "@/components/dialogs/UploadFileDialog";

const Files = async () => {
  const logs = await getLogs();

  return (
    <div>
      <h1 className="text-3xl font-semibold">Files</h1>
      <Suspense fallback={<Loading />}>
        <LogsTable logs={logs} />
      </Suspense>
      <UploadFileDialog triggerClassName="fixed bottom-4 right-4" />
    </div>
  );
};

export default Files;
