// components/subscription/PlanCard.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Copy, Users, UserCog, HardDrive, School } from "lucide-react";
import { SubscriptionPlanModel } from "@/types";


const formatKES = (amount: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(amount);

interface PlanCardProps {
  plan: SubscriptionPlanModel;
  index: number;
  onEdit: (plan: SubscriptionPlanModel) => void;
  onDelete: (plan: SubscriptionPlanModel) => void;
  onDuplicate: (plan: SubscriptionPlanModel) => void;
}

export function PlanCard({ plan, index, onEdit, onDelete, onDuplicate }: PlanCardProps) {
  return (
    <Card
      className="group overflow-hidden border-0 shadow-[0_1px_3px_hsl(var(--maroon-200)/0.3),0_6px_24px_hsl(var(--maroon-200)/0.12)] hover:shadow-[0_4px_12px_hsl(var(--maroon-200)/0.4),0_12px_40px_hsl(var(--maroon-200)/0.18)] transition-shadow duration-300"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Maroon header strip */}
      <div className="h-1.5 bg-primary" />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
            <p className="text-xs font-mono text-muted-foreground tracking-wide">{plan.code}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {!plan.is_active && (
              <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] uppercase tracking-wider">
                Inactive
              </Badge>
            )}
            {plan.is_active && (
              <Badge className="bg-success text-success-foreground text-[10px] uppercase tracking-wider border-0">
                Active
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mt-1">{plan.description}</p>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Pricing */}
        <div className="flex items-baseline gap-4">
          <div>
            <span className="text-2xl font-bold text-primary">{formatKES(plan.price_monthly)}</span>
            <span className="text-xs text-muted-foreground ml-1">/mo</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatKES(plan.price_yearly)}<span className="text-xs">/year</span>
          </div>
        </div>

        {/* Limits grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Users, label: "Students", value: plan.student_limit === 0 ? "Unlimited" : plan.student_limit.toLocaleString() },
            { icon: UserCog, label: "Staff", value: plan.staff_limit === 0 ? "Unlimited" : plan.staff_limit.toLocaleString() },
            { icon: HardDrive, label: "Storage", value: plan.storage_limit_mb === 0 ? "Unlimited" : `${(plan.storage_limit_mb / 1024).toFixed(0)} GB` },
            { icon: School, label: "Subscribers", value: String(plan.schools_count ?? 0) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2.5 rounded-lg bg-secondary/60 px-3 py-2.5">
              <Icon className="h-4 w-4 text-primary/70 shrink-0" />
              <div className="min-w-0 ">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold text-foreground truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Modules */}
        {plan.included_modules && plan.included_modules.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
              Included Modules
            </p>
            <div className="flex flex-wrap gap-1.5">
              {plan.included_modules.map((m) => (
                <span
                  key={m.id}
                  className="inline-flex items-center rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground"
                >
                  {m.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => onEdit(plan)}
          >
            <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-accent"
            onClick={() => onDuplicate(plan)}
            title="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(plan)}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}