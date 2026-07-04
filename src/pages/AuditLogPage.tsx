import { ScrollText } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/Feedback";

export default function AuditLogPage() {
  const { lang } = useLanguage();
  return (
    <div className="p-6">
      <Card>
        <EmptyState
          icon={<ScrollText className="h-5 w-5" />}
          title={
            lang === "fr"
              ? "Le journal d'audit complet sera affiché ici"
              : "The full audit log will be displayed here"
          }
          description={
            lang === "fr"
              ? "Le backend enregistre déjà chaque action (connexions, création de cas, modifications) dans la table audit_logs. Un point de terminaison de liste paginé reste à exposer pour cette vue."
              : "The backend already records every action (logins, case creation, modifications) in the audit_logs table. A paginated list endpoint still needs to be exposed for this view."
          }
        />
      </Card>
    </div>
  );
}
