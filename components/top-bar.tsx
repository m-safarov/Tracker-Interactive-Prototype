import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Select-и забон дар кунҷи рости боло, дар ҳамаи саҳифаҳо.
// Танҳо дизайн. Логикаи иваз кардани забонро Dev1 менависад.
export default function TopBar() {
  return (
    <div className="fixed top-[8px] right-[56px] z-40">
      <Select defaultValue="en">
        <SelectTrigger className="h-[32px] w-[152px]">
          <Globe className="size-[16px] text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tg">Тоҷикӣ</SelectItem>
          <SelectItem value="ru">Русский</SelectItem>
          <SelectItem value="en">English</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
