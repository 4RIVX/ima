import { LayoutShell } from "@/components/layout-shell";
import { useAnalyses, useDeleteAnalysis, useClearHistory } from "@/hooks/use-analyses";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trash2, 
  Download, 
  FileX, 
  RotateCcw,
  Search,
  MoreHorizontal
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function HistoryPage() {
  const { data: analyses, isLoading } = useAnalyses();
  const { mutate: deleteAnalysis } = useDeleteAnalysis();
  const { mutate: clearHistory, isPending: isClearing } = useClearHistory();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAnalyses = analyses?.filter(item => 
    item.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.classification.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleExportCSV = () => {
    if (!analyses) return;
    const headers = ["ID", "Filename", "Classification", "Score", "Date"];
    const csvContent = [
      headers.join(","),
      ...analyses.map(row => 
        [row.id, `"${row.filename}"`, `"${row.classification}"`, row.score, `"${row.analyzedAt}"`].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "analysis_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <LayoutShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">History</h2>
          <p className="text-muted-foreground mt-1">Manage your past analysis records.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={!analyses?.length}>
                <Trash2 className="w-4 h-4 mr-2" /> Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your analysis history from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => clearHistory()} disabled={isClearing}>
                  {isClearing ? "Clearing..." : "Yes, delete everything"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="space-y-4">
        {/* Search Filter */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by filename or result..." 
            className="pl-9 bg-card" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Data Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30">
                <TableHead>File Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading Skeleton Rows
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 w-32 bg-secondary/50 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-24 bg-secondary/50 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-20 bg-secondary/50 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-12 bg-secondary/50 rounded animate-pulse" /></TableCell>
                    <TableCell className="text-right"><div className="h-8 w-8 ml-auto bg-secondary/50 rounded animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : filteredAnalyses.length === 0 ? (
                // Empty State
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileX className="w-12 h-12 mb-4 opacity-50" />
                      <p className="font-medium">No records found</p>
                      <p className="text-sm">Try adjusting your search or create a new analysis.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Data Rows
                filteredAnalyses.map((item) => (
                  <TableRow key={item.id} className="group hover:bg-secondary/20">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {item.imageUrl && (
                          <div className="w-8 h-8 rounded bg-muted overflow-hidden flex-shrink-0">
                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <span className="truncate max-w-[200px]">{item.filename || "Untitled"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(item.analyzedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          item.classification === 'Likely Authentic' ? "border-green-200 bg-green-50 text-green-700" :
                          item.classification === 'Likely AI-Generated' ? "border-red-200 bg-red-50 text-red-700" :
                          "border-amber-200 bg-amber-50 text-amber-700"
                        }
                      >
                        {item.classification}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${item.score}%` }} 
                          />
                        </div>
                        <span className="text-xs font-mono">{item.score}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => deleteAnalysis(item.id)} className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </LayoutShell>
  );
}
