"use client";

import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { SlidersHorizontal } from "lucide-react";
import { useSelection } from "./SelectionContext";

export default function ItemModifier({ modifierGroups = [] }) {
  const { activeProduct, stagedExtras, toggleExtra } = useSelection();

  const isSelected = (group, label) =>
    stagedExtras.some((e) => e.group === group && e.label === label);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          {activeProduct
            ? `Modifiers for: ${activeProduct.name}`
            : "Extras"}
        </CardTitle>
      </CardHeader>

      <div className="flex items-start gap-6 px-6 pb-4">
        {modifierGroups.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Belum ada data modifier.
          </p>
        )}

        {modifierGroups.map((group) => (
          <CardContent key={group.id} className="p-0">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {group.name}
            </p>
            <div className="flex gap-2">
              {group.options.map((opt) => {
                const priceAdd = Number(opt.price_add);
                return (
                  <Button
                    key={opt.id}
                    size="sm"
                    disabled={!activeProduct}
                    variant={isSelected(group.name, opt.label) ? "default" : "outline"}
                    onClick={() =>
                      toggleExtra({
                        group: group.name,
                        label: opt.label,
                        priceAdd,
                        optionId: opt.id, // UUID yang dikirim ke backend
                      })
                    }
                  >
                    {opt.label}
                    {priceAdd > 0 && ` (+Rp ${priceAdd.toLocaleString("id-ID")})`}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        ))}
      </div>
    </Card>
  );
}