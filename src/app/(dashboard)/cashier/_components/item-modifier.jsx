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
        <Button>8 oz</Button>
        <Button>12 oz</Button>
        <Button>16 oz</Button>
      </CardContent>
      <CardContent>
        <p>MILK SUB</p>
        <Button>whole</Button>
        <Button>Oat (+$0.80)</Button>
        <Button>Almond</Button>
      </CardContent>
      <CardContent>
        <p>SHOT TUNING</p>
        <Button>Single</Button>
        <Button>Double</Button>
        <Button>+Shout($1.20)</Button>
      </CardContent>
      <CardContent>
        <p>TEMP & SWEET</p>
        <Button>Extra Hot</Button>
        <Button>Light Ice</Button>
        <Button>Vanilla(+$0.60)</Button>
      </CardContent>
    </Card>
    </>
  );
}