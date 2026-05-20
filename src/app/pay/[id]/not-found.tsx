import { FileX } from "lucide-react";

export default function PayNotFound() {
  return (
    <div className="rounded-2xl bg-white shadow-md p-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <FileX className="h-7 w-7 text-slate-400" />
      </div>
      <h1 className="text-xl font-semibold text-slate-800">Invoice not found</h1>
      <p className="mt-2 text-sm text-slate-500">
        This invoice link is invalid, has expired, or has been cancelled.
      </p>
    </div>
  );
}
