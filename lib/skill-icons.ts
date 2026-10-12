import { Braces, Container, Database, MonitorSmartphone, Server, Smartphone, Workflow } from "lucide-react";
import type { SkillIcon } from "@/types";

export const skillIcons: Record<SkillIcon, React.ElementType> = {
  languages: Braces,
  frontend: MonitorSmartphone,
  backend: Server,
  mobile: Smartphone,
  databases: Database,
  devops: Container,
  engineering: Workflow,
};
