"use client";

import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Hooks } from "@matchain/matchid-sdk-react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";

const { useUserInfo } = Hooks;

export default function LoginModalDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { getLoginEmailCode, loginByEmail, address } = useUserInfo();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGetEmailCode = async () => {
    setIsLoadingCode(true);
    try {
      await getLoginEmailCode(email);
      setIsCodeSent(true);
    } catch (error) {
      console.error("Failed to get email code", error);
    } finally {
      setIsLoadingCode(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginByEmail({ email, code });
      setIsOpen(false);
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  function toggle() {
    setIsOpen((t) => !t);
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{address ? "User Profile" : "Login"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!isCodeSent ? (
            <>
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button onClick={handleGetEmailCode} className="w-full" disabled={!email || isLoadingCode}>
                {isLoadingCode ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <div className="text-sm text-muted-foreground mb-2 w-full">Enter the 6-digit code sent to {email}</div>
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <Button onClick={handleLogin} className="w-full mt-4" disabled={code.length !== 6 || isLoggingIn}>
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login with Email"
                )}
              </Button>
              <Button
                variant="secondary"
                className="w-full mt-2"
                onClick={() => {
                  setIsCodeSent(false);
                  setCode("");
                }}
                disabled={isLoggingIn}
              >
                Change Email
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
