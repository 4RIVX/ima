import { LayoutShell } from "@/components/layout-shell";
import { useAnalyses } from "@/hooks/use-analyses";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { format } from "date-fns";
import { 
  AlertTriangle, 
  CheckCircle2, 
  FileSearch, 
  TrendingUp, 
  Activity,
  ShieldAlert
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const COLORS = {
  authentic: "#10B981", // Green
  manipulated: "#F59E0B", // Amber
  generated: "#EF4444",   // Red
  neutral: "#6B7280"      // Gray
};

export default function Dashboard() {
  const { data: analyses, isLoading } = useAnalyses();

  if (isLoading) {
    return (
      <LayoutShell>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-[400px] rounded-xl w-full mt-8" />
      </LayoutShell>
    );
  }

  const safeAnalyses = analyses || [];

  // Metrics
  const total = safeAnalyses.length;
  const authentic = safeAnalyses.filter(a => a.classification === 'Likely Authentic').length;
  const manipulated = safeAnalyses.filter(a => a.classification === 'Possibly AI-Manipulated').length;
  const generated = safeAnalyses.filter(a => a.classification === 'Likely AI-Generated').length;

  const pieData = [
    { name: 'Authentic', value: authentic, color: COLORS.authentic },
    { name: 'Manipulated', value: manipulated, color: COLORS.manipulated },
    { name: 'AI Generated', value: generated, color: COLORS.generated },
  ].filter(d => d.value > 0);

  // Line Chart Data (grouped by date)
  const groupedByDate = safeAnalyses.reduce((acc, curr) => {
    const date = format(new Date(curr.analyzedAt), 'MMM dd');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const lineData = Object.entries(groupedByDate)
    .map(([date, count]) => ({ date, count }))
    .slice(-7); // Last 7 days with data

  return (
    <LayoutShell>
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Overview of your analysis activities.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="Total Scans" 
          value={total} 
          icon={FileSearch} 
          trend="+12%" 
          trendUp={true} 
        />
        <KpiCard 
          title="AI Detected" 
          value={generated} 
          icon={AlertTriangle} 
          trend={total > 0 ? `${Math.round((generated/total)*100)}%` : "0%"} 
          trendUp={false} // High AI count might be "bad" or just informational
          color="text-red-500"
        />
        <KpiCard 
          title="Manipulated" 
          value={manipulated} 
          icon={ShieldAlert} 
          trend={total > 0 ? `${Math.round((manipulated/total)*100)}%` : "0%"} 
          color="text-amber-500"
        />
        <KpiCard 
          title="Authentic" 
          value={authentic} 
          icon={CheckCircle2} 
          trend={total > 0 ? `${Math.round((authentic/total)*100)}%` : "0%"} 
          trendUp={true}
          color="text-green-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-6">
        {/* Trend Chart */}
        <Card className="col-span-4 lg:col-span-4 shadow-sm border-border/60">
          <CardHeader>
            <CardTitle>Analysis Trend</CardTitle>
            <CardDescription>Daily scan volume over the last 7 active days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              {lineData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}`} 
                    />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                      labelStyle={{ color: 'var(--foreground)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: "hsl(var(--primary))" }} 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No trend data available yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Distribution Pie Chart */}
        <Card className="col-span-3 lg:col-span-3 shadow-sm border-border/60">
          <CardHeader>
            <CardTitle>Result Distribution</CardTitle>
            <CardDescription>Breakdown by classification type.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {total > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                       contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No analysis data to display.
                </div>
              )}
            </div>
            {/* Legend */}
            <div className="flex justify-center gap-4 text-xs mt-2">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span>{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card className="mt-6 shadow-sm border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {safeAnalyses.slice(0, 5).map((analysis) => (
              <div key={analysis.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                    {analysis.imageUrl ? (
                      <img src={analysis.imageUrl} alt="Thumbnail" className="h-full w-full object-cover" />
                    ) : (
                      <FileSearch className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{analysis.filename || "Unknown File"}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(analysis.analyzedAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                <Badge variant={
                  analysis.classification === 'Likely Authentic' ? 'outline' : 
                  analysis.classification === 'Likely AI-Generated' ? 'destructive' : 'secondary'
                } className={
                   analysis.classification === 'Likely Authentic' ? 'text-green-600 border-green-200 bg-green-50' : ''
                }>
                  {analysis.classification}
                </Badge>
              </div>
            ))}
            {safeAnalyses.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No recent activity.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </LayoutShell>
  );
}

function KpiCard({ title, value, icon: Icon, trend, trendUp, color }: any) {
  return (
    <Card className="shadow-sm border-border/60 hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color || "text-muted-foreground"}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            {trendUp === true && <TrendingUp className="w-3 h-3 text-green-500 mr-1" />}
            {trendUp === false && <TrendingUp className="w-3 h-3 text-red-500 mr-1 rotate-180" />}
            <span className={trendUp ? "text-green-600" : trendUp === false ? "text-red-600" : ""}>
              {trend}
            </span>
            <span className="ml-1 opacity-70">of total</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
