import { User, Clock, Package } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent
} from "@/components/ui/card";

// Types
interface LogCauser {
    name: string;
    email: string;
}

interface LogProperties {
    attributes?: Record<string, any>;
    old?: Record<string, any>;
    user_agent?: string;
}

interface ActivityLog {
    id: number;
    log_name: string;
    description: string;
    causer?: LogCauser;
    properties: LogProperties;
    created_at: string;
}

interface ActivityLogDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentLog: ActivityLog | null;
}

// Helper functions
const getLogIcon = (logName: string) => {
    // You can customize these icons based on your log types
    switch (logName.toLowerCase()) {
        case "user":
            return <User className="h-5 w-5 text-sidebar-accent-foreground" />;
        case "inventory":
            return <Package className="h-5 w-5 text-sidebar-accent-foreground" />;
        default:
            return <User className="h-5 w-5 text-gray-500" />;
    }
};

const getDescriptionBadgeColor = (description: string) => {
    if (description.startsWith("Updated")) {
        return "bg-sidebar-accent text-sidbar-accent-foreground p-2";
    } else if (description.startsWith("Created")) {
        return "border-green-200 bg-green-100 text-green-800";
    } else if (description.startsWith("Deleted")) {
        return "border-red-200 bg-red-100 text-red-800";
    }
    return "border-gray-200 bg-gray-100 text-gray-800";
};

export function ActivityLogDialog({ isOpen, onClose, currentLog }: ActivityLogDialogProps) {
    if (!currentLog) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[650px] max-h-[90vh] p-0 flex flex-col">
                <DialogHeader className="px-6 pt-6 pb-2 border-b">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        {getLogIcon(currentLog.log_name)}
                        Activity Log Details
                    </DialogTitle>
                </DialogHeader>

                {/* Custom styled scrollable content */}
                <div
                    className="flex-1 px-6 py-4 overflow-y-auto custom-scrollbar"
                    style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#cbd5e1 transparent'
                    }}
                >
                    <div className="space-y-6">
                        <Card className="border shadow-sm">
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1.5">Activity</h3>
                                        <Badge
                                            className={`${getDescriptionBadgeColor(currentLog.description)}`}
                                            variant="outline"
                                        >
                                            {currentLog.description}
                                        </Badge>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1.5">Log Type</h3>
                                        <div className="flex items-center gap-2">
                                            {getLogIcon(currentLog.log_name)}
                                            <p className="text-base font-medium">{currentLog.log_name}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1.5">Performed By</h3>
                                        {currentLog.causer ? (
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <p className="text-base">{currentLog.causer.name} ({currentLog.causer.email})</p>
                                            </div>
                                        ) : (
                                            <p className="text-base italic text-muted-foreground">System</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border shadow-sm">
                            <CardContent className="pt-6">
                                <h3 className="text-sm font-medium text-muted-foreground mb-3">Changed Properties</h3>
                                {currentLog.properties && currentLog.properties.attributes ? (
                                    <div className="bg-sidebar-accent dark:bg-sidebar-accent rounded-md p-4 overflow-hidden">
                                        <div className="overflow-x-auto custom-scrollbar-x" style={{
                                            scrollbarWidth: 'thin',
                                            scrollbarColor: '#64748b transparent'
                                        }}>
                                            <pre className="text-sm text-slate-200 whitespace-pre-wrap">{JSON.stringify(currentLog.properties.attributes, null, 2)}</pre>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-base italic text-muted-foreground">No properties recorded</p>
                                )}

                                {currentLog.properties && currentLog.properties.old && Object.keys(currentLog.properties.old).length > 0 && (
                                    <>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-3 mt-4">Previous Values</h3>
                                        <div className="bg-sidebar-accent dark:bg-sidebar-accent rounded-md p-4 overflow-hidden">
                                            <div className="overflow-x-auto custom-scrollbar-x" style={{
                                                scrollbarWidth: 'thin',
                                                scrollbarColor: '#64748b transparent'
                                            }}>
                                                <pre className="text-sm text-slate-200 whitespace-pre-wrap">{JSON.stringify(currentLog.properties.old, null, 2)}</pre>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border shadow-sm">
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1.5">Timestamp</h3>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <p className="text-sm">
                                                {new Date(currentLog.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit',
                                                    hour12: false,
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-1.5">User Agent</h3>
                                        <p className="text-sm break-words">
                                            {currentLog.properties.user_agent || 'Not recorded'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t">
                    <Button onClick={onClose} variant="default" className="w-full sm:w-auto hover:cursor-pointer">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}