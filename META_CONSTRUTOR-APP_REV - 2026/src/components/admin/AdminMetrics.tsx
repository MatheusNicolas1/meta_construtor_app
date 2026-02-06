import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminAcquisitionMetrics from "./AdminAcquisitionMetrics";
import AdminEngagementMetrics from "./AdminEngagementMetrics";
import AdminHealthMetrics from "./AdminHealthMetrics";
import AdminOperationalMetrics from "./AdminOperationalMetrics";

const AdminMetrics = () => {
  return (
    <Tabs defaultValue="operational" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="operational">Operacional</TabsTrigger>
        <TabsTrigger value="acquisition">Aquisição</TabsTrigger>
        <TabsTrigger value="engagement">Engajamento</TabsTrigger>
        <TabsTrigger value="health">Saúde</TabsTrigger>
      </TabsList>

      <TabsContent value="operational">
        <AdminOperationalMetrics />
      </TabsContent>

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
