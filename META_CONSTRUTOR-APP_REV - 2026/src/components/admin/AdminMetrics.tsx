import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminAcquisitionMetrics from "./AdminAcquisitionMetrics";
import AdminEngagementMetrics from "./AdminEngagementMetrics";
import AdminHealthMetrics from "./AdminHealthMetrics";

const AdminMetrics = () => {
  return (
    <Tabs defaultValue="acquisition" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="acquisition">Aquisição</TabsTrigger>
        <TabsTrigger value="engagement">Engajamento</TabsTrigger>
        <TabsTrigger value="health">Saúde</TabsTrigger>
      </TabsList>

      <TabsContent value="acquisition">
        <AdminAcquisitionMetrics />
      </TabsContent>

      <TabsContent value="engagement">
        <AdminEngagementMetrics />
      </TabsContent>

      <TabsContent value="health">
        <AdminHealthMetrics />
      </TabsContent>
    </Tabs>
  );
};

export default AdminMetrics;
