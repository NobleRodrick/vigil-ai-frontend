import { FileBarChart } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/Feedback";

export default function ReportsPage() {
  const { lang } = useLanguage();
  return (
    <div className="p-6">
      <Card>
        <EmptyState
          icon={<FileBarChart className="h-5 w-5" />}
          title={
            lang === "fr"
              ? "Le rapport mensuel automatisé sera disponible ici"
              : "The automated monthly report will appear here"
          }
          description={
            lang === "fr"
              ? "Cette fonctionnalité (DOC FR-038) est planifiée pour la phase 2 — génération PDF programmée du rapport de transparence du cyberespace camerounais."
              : "This feature (FR-038) is planned for phase 2 — scheduled PDF generation of the Cameroonian cyberspace transparency report."
          }
        />
      </Card>
    </div>
  );
}
