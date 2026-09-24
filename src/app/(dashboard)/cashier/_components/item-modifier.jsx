import {Button} from "../../../../components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "../../../../components/ui/card" 
import { SlidersHorizontal, } from "lucide-react";
export default function ItemModifier() {
  return (
    <>

    <Card>
      <CardHeader>
        <CardTitle><SlidersHorizontal/> Active item Modifiers(Selected/Last Added)</CardTitle>
        
      </CardHeader>
    <div className="flex items-start gap-2">
      <CardContent className="p-0">
        <p>DRINK SIZE</p>
        <Button>Small</Button>
        <Button>Medium</Button>
        <Button>Large</Button>
      </CardContent>
      <CardContent className="p-0">
        <p>MILK SUB</p>
        <Button>Regular</Button>
        <Button>Oat(+$0.80)</Button>
        <Button>Almond</Button>
      </CardContent>
      <CardContent className="p-0">
        <p>SHOT TUNING</p>
        <Button>Single</Button>
        <Button>Double</Button>
        <Button>Triple ($1.20)</Button>
      </CardContent>
      <CardContent className="p-0">
        <p>EXTRA ICE</p>
        <Button>No Ice</Button>
        <Button>With Ice</Button>
        <Button>Less Ice</Button>
      </CardContent>
    </div>
    </Card>
    </>
  );
}