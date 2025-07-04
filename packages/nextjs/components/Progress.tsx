import { LoadingIndicator, Status } from "./LoadingIndicator";

export type ExecutionProgress = {
  step: "approve" | "deposit" | "fill";
  status: "idle" | "txPending" | "txSuccess" | "txError" | "simulationError" | "error";
  error?: Error;
};

export type ProgressProps = {
  progress: ExecutionProgress | null;
  error?: Error | null;
  className?: string;
};

export function Progress({ progress, error, className }: ProgressProps) {
  if (!progress || progress.status === "idle") {
    return null;
  }

  const status = (() => {
    if (
      progress.status === "txError" ||
      progress.status === "simulationError" ||
      progress.status === "error" ||
      error
    ) {
      return Status.ERROR;
    }
    if (progress.status === "txSuccess" && progress.step === "fill") {
      return Status.SUCCESS;
    }
    return Status.PENDING;
  })();

  const label = (() => {
    if (
      progress.status === "txError" ||
      progress.status === "simulationError" ||
      progress.status === "error" ||
      error
    ) {
      return error?.message || progress.error?.message || "Transaction failed";
    }
    if (progress.step === "approve") {
      return "Approving ERC20 spend...";
    }
    if (progress.step === "deposit") {
      return "Depositing on origin chain...";
    }
    if (progress.step === "fill" && progress.status === "txSuccess") {
      return "Bridge complete!";
    }
    if (progress.step === "fill" && progress.status === "txPending") {
      return "Filling on destination chain...";
    }
    return "Processing...";
  })();

  return (
    <div className={`py-2 w-full flex flex-col items-center gap-1 ${className || ""}`}>
      <LoadingIndicator status={status} />
      <p className="text-gray-600 text-sm">{label}</p>
    </div>
  );
}
