import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "../../hooks/useAuth";
import { t } from "@/lib/i18n";
import { FileText, CheckCircle, Users } from "lucide-react";
import { Link } from "wouter";

interface CardDataType {
  id: string;
  title: string;
  value: number;
  icon: JSX.Element;
  bgColor: string;
  linkText: string;
  linkUrl: string;
}

export default function OverviewCards() {
  const { user } = useAuth();

  // Fetch active complaints
  const { data: complaints, isLoading: complaintsLoading } = useQuery({
    queryKey: ['/api/complaints'],
  });

  // Fetch alumni connections
  const { data: connections, isLoading: connectionsLoading } = useQuery({
    queryKey: ['/api/connections'],
  });

  const isLoading = complaintsLoading || connectionsLoading;

  // Process the data for the cards
  const getCardData = (): CardDataType[] => {
    const activeComplaints = complaints?.filter(
      (complaint: any) => complaint.status !== "resolved"
    ).length || 0;
    
    const resolvedComplaints = complaints?.filter(
      (complaint: any) => complaint.status === "resolved"
    ).length || 0;
    
    const totalConnections = connections?.length || 0;

    return [
      {
        id: "active-complaints",
        title: t("activeComplaints"),
        value: activeComplaints,
        icon: <FileText className="text-primary-600" />,
        bgColor: "bg-primary-100",
        linkText: t("viewAll"),
        linkUrl: "/complaints?tab=active",
      },
      {
        id: "resolved-issues",
        title: t("resolvedIssues"),
        value: resolvedComplaints,
        icon: <CheckCircle className="text-green-600" />,
        bgColor: "bg-green-100",
        linkText: t("viewHistory"),
        linkUrl: "/complaints?tab=resolved",
      },
      {
        id: "alumni-connections",
        title: t("connections"),
        value: totalConnections,
        icon: <Users className="text-secondary-600" />,
        bgColor: "bg-secondary-100",
        linkText: t("findMoreAlumni"),
        linkUrl: "/alumni-connect",
      },
    ];
  };

  const cardData = getCardData();

  if (isLoading) {
    return (
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array(3).fill(null).map((_, index) => (
          <Skeleton key={index} className="h-36" />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cardData.map((card) => (
        <Card key={card.id} className="bg-white overflow-hidden shadow rounded-lg">
          <CardContent className="p-0">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${card.bgColor} rounded-md p-3`}>
                  {card.icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-neutral-500 truncate">{card.title}</dt>
                    <dd>
                      <div className="text-lg font-medium text-neutral-900">{card.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-neutral-50 px-5 py-3">
              <div className="text-sm">
                <Link href={card.linkUrl}>
                  <a className="font-medium text-accent-500 hover:text-accent-600">
                    {card.linkText}
                  </a>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
