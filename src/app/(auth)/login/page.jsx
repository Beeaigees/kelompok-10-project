import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "../../../components/ui/field";
import { Input } from "../../../components/ui/input";
export default function LoginPage() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="fieldgroup-name">Email</FieldLabel>
              <Input id="fieldgroup-name" placeholder="name@example.com" />
            </Field>
            <Field>
              <FieldLabel htmlFor="fieldgroup-email">Password</FieldLabel>
              <Input
                id="fieldgroup-email"
                type="password"
                placeholder="••••••••"
              />
              <FieldDescription>
                We&apos;ll send updates to this address.
              </FieldDescription>
            </Field>
            <Field orientation="horizontal">
              <Button type="reset" variant="outline">
                Reset
              </Button>
              <Button type="submit">Submit</Button>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </>
  );
}
