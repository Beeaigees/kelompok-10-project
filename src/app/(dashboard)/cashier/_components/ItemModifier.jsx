"use client";

import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { SlidersHorizontal } from "lucide-react";
import { useSelection } from "./SelectionContext";

const MODIFIER_GROUPS = [
  {
    group: "DRINK SIZE",
    options: [
      { label: "Small", priceAdd: 0 },
      { label: "Medium", priceAdd: 0 },
      { label: "Large", priceAdd: 0 },
    ],
  },
  {
    group: "MILK SUB",
    options: [
      { label: "Regular", priceAdd: 0 },
      { label: "Oat", priceAdd: 0.8 },
      { label: "Almond", priceAdd: 0.8 },
    ],
  },
  {
    group: "SHOT TUNING",
    options: [
      { label: "Single", priceAdd: 0 },
      { label: "Double", priceAdd: 0 },
      { label: "Triple", priceAdd: 1.2 },
    ],
  },
  {
    group: "EXTRA ICE",
    options: [
      { label: "No Ice", priceAdd: 0 },
      { label: "With Ice", priceAdd: 0 },
      { label: "Less Ice", priceAdd: 0 },
    ],
  },
];

export default function ItemModifier() {
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
        {MODIFIER_GROUPS.map((groupDef) => (
          <CardContent key={groupDef.group} className="p-0">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {groupDef.group}
            </p>
            <div className="flex gap-2">
              {groupDef.options.map((opt) => (
                <Button
                  key={opt.label}
                  size="sm"
                  disabled={!activeProduct}
                  variant={isSelected(groupDef.group, opt.label) ? "default" : "outline"}
                  onClick={() =>
                    toggleExtra({
                      group: groupDef.group,
                      label: opt.label,
                      priceAdd: opt.priceAdd,
                    })
                  }
                >
                  {opt.label}
                  {opt.priceAdd > 0 && ` (+$${opt.priceAdd.toFixed(2)})`}
                </Button>
              ))}
            </div>
          </CardContent>
        ))}
      </div>
    </Card>
  );
}