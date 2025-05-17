import { useState } from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import ComplaintList from "@/components/complaint/ComplaintList";
import ComplaintForm from "@/components/complaint/ComplaintForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { t } from "@/lib/i18n";

export default function Complaints() {
  const [isComplaintFormOpen, setIsComplaintFormOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mb-24 sm:mb-0">
        {/* Header section */}
        <div className="px-4 sm:px-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">{t("complaints")}</h1>
              <p className="mt-1 text-sm text-neutral-600">
                Submit and track complaints about educational facilities
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button 
                onClick={() => setIsComplaintFormOpen(true)}
                className="bg-accent-500 hover:bg-accent-600"
              >
                <Plus className="mr-2 h-4 w-4" /> {t("newComplaint")}
              </Button>
            </div>
          </div>
        </div>

        {/* Complaint list */}
        <div className="mt-8 px-4 sm:px-0">
          <ComplaintList />
        </div>

        {/* Complaint form modal */}
        <ComplaintForm
          isOpen={isComplaintFormOpen}
          onClose={() => setIsComplaintFormOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
}
