import { JobDisplay } from "@/app/types/job";
import { format } from "date-fns";

interface JobTableProps {
  jobs: JobDisplay[];
  onRowClick?: (job: JobDisplay) => void;
}

export default function JobTable({ jobs, onRowClick }: JobTableProps) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-3 px-2 font-semibold">Title</th>
            <th className="py-3 px-2 font-semibold">Company</th>
            <th className="py-3 px-2 font-semibold">Status</th>
            <th className="py-3 px-2 font-semibold">Posted</th>
            <th className="py-3 px-2 font-semibold text-right">Salary</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr
              key={job.id}
              className="border-b hover:bg-muted/50 cursor-pointer"
              onClick={() => onRowClick?.(job)}
            >
              <td className="py-3 px-2 whitespace-nowrap">{job.title}</td>
              <td className="py-3 px-2 whitespace-nowrap">{job.company}</td>
              <td className="py-3 px-2 whitespace-nowrap capitalize">{job.status}</td>
              <td className="py-3 px-2 whitespace-nowrap">
                {job.posted_date ? format(new Date(job.posted_date), "MMM d, yyyy") : "-"}
              </td>
              <td className="py-3 px-2 whitespace-nowrap text-right">
                {job.salary || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 