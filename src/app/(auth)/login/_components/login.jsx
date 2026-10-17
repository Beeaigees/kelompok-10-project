"use client";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "../../../../components/ui/field";
import { Input } from "../../../../components/ui/input";

import { useState, useEffect } from "react";
import { useAuth } from "../../../../components/common/auth-context";
import { useRouter } from "next/navigation";
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // 1. Panggil fungsi login dari context
  const { login, user, loading } = useAuth();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        // 2. Gunakan URLSearchParams karena backend FastAPI (OAuth2PasswordRequestForm) meminta format form-data
        body: new URLSearchParams({
          username: username,
          password: password,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // 3. Simpan token ke localStorage dan trigger update data user
        login(data.access_token);
      } else {
        alert("Login gagal! Periksa username dan password Anda.");
      }
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex h-screen items-center justify-center">
        Memeriksa sesi...
      </div>
    );
  }

  const handleReset = () => {
    setUsername("");
    setPassword("");
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="fieldgroup-name">Username</FieldLabel>
              <Input
                id="fieldgroup-name"
                type="text"
                placeholder="name"
                /* 2. Hubungkan Input ke state username */
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="fieldgroup-email">Password</FieldLabel>
              <Input
                id="fieldgroup-email"
                type="password"
                placeholder="••••••••"
                /* 3. Hubungkan Input ke state password */
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FieldDescription>
                We&apos;ll send updates to this address.
              </FieldDescription>
            </Field>
            <Field orientation="horizontal">
              {/* 4. Ubah type menjadi button untuk fungsi reset */}
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button type="submit">Submit</Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
