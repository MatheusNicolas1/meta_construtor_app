import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const AdminHeatmap = () => {

    // Fetch Top Buttons
    const { data: topButtons, isLoading: loadingButtons } = useQuery({
        queryKey: ['admin-heatmap-buttons'],
        queryFn: async () => {
            // @ts-ignore
            const { data, error } = await supabase.from('view_analytics_top_buttons').select('*').limit(5);
            if (error) throw error;
            return data || [];
        }
    });

    // Fetch Top Pages
    const { data: topPages, isLoading: loadingPages } = useQuery({
        queryKey: ['admin-heatmap-pages'],
        queryFn: async () => {
            // @ts-ignore
            const { data, error } = await supabase.from('view_analytics_top_pages').select('*').limit(5);
            if (error) throw error;
            return data || [];
        }
    });

    // Fetch Top Items
    const { data: topItems, isLoading: loadingItems } = useQuery({
        queryKey: ['admin-heatmap-items'],
        queryFn: async () => {
            // @ts-ignore
            const { data, error } = await supabase.from('view_analytics_top_items').select('*').limit(5);
            if (error) throw error;
            return data || [];
        }
    });

    const isLoading = loadingButtons || loadingPages || loadingItems;

    if (isLoading) {
        return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
    }

    const getMax = (arr: any[], key: string) => Math.max(...arr.map(i => i[key] || 0), 1);

    const maxClicks = getMax(topButtons || [], 'click_count');
    const maxPageViews = getMax(topPages || [], 'view_count');
    const maxItemViews = getMax(topItems || [], 'view_count');

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">

                {/* Top Buttons */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            TOP BUTTONS CLICKED
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topButtons?.length === 0 ? <p className="text-sm text-muted-foreground">Sem dados ainda</p> :
                                topButtons?.map((btn: any) => (
                                    <div key={btn.button_id} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="truncate max-w-[180px]" title={btn.button_id}>{btn.button_id}</span>
                                            <span className="text-green-500 font-bold">{btn.click_count}</span>
                                        </div>
                                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500 transition-all duration-500"
                                                style={{ width: `${(btn.click_count / maxClicks) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Pages */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            MOST ACCESSED PAGES
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topPages?.length === 0 ? <p className="text-sm text-muted-foreground">Sem dados ainda</p> :
                                topPages?.map((page: any) => (
                                    <div key={page.page_path} className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                                            <span className="text-sm font-medium truncate" title={page.page_path}>{page.page_path}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground shrink-0">{page.view_count} Views</span>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Items */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            MOST VIEWED ITEMS
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topItems?.length === 0 ? <p className="text-sm text-muted-foreground">Sem dados ainda</p> :
                                topItems?.map((item: any) => (
                                    <div key={item.item_name} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="truncate max-w-[180px]" title={item.item_name}>{item.item_name || 'Item sem nome'}</span>
                                            <span className="text-green-500/80 font-bold">{item.view_count}</span>
                                        </div>
                                        <div className="h-1 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500/80 transition-all duration-500"
                                                style={{ width: `${(item.view_count / maxItemViews) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
};

export default AdminHeatmap;
