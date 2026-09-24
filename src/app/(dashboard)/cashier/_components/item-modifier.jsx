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
      <CardContent>
        <p>DRINK SIZE</p>
        <Button>Small</Button>
        <Button>Medium</Button>
        <Button>Large</Button>
      </CardContent>
      <CardContent>
        <p>MILK SUB</p>
        <Button>Regular</Button>
        <Button>Oat(+$0.80)</Button>
        <Button>Almond</Button>
      </CardContent>
      <CardContent>
        <p>SHOT TUNING</p>
        <Button>Single</Button>
        <Button>Double</Button>
        <Button>Triple ($1.20)</Button>
      </CardContent>
      <CardContent>
        <p>EXTRA ICE</p>
        <Button>No Ice</Button>
        <Button>With Ice</Button>
        <Button>Less Ice</Button>
      </CardContent>
    </Card>
    </>
  );
}