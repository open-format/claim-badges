"use client";

import { useBadgeContext } from "@/components/providers/badge-provider";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { fetchUserProfile, revalidate } from "@/lib/openformat";
import { zodResolver } from "@hookform/resolvers/zod";
import { Hooks } from "@matchain/matchid-sdk-react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";

const { useUserInfo } = Hooks;

// Zod schema for email validation
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Zod schema for code validation
const codeSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
});

export default function LoginModalDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { getLoginEmailCode, loginByEmail, address } = useUserInfo();
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const { setBadges } = useBadgeContext();

  // Email form
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  // Code form
  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: {
      code: "",
    },
  });

  const handleGetEmailCode = async (data: z.infer<typeof emailSchema>) => {
    setIsLoadingCode(true);
    try {
      await getLoginEmailCode(data.email);
      setIsCodeSent(true);
    } catch (error) {
      console.error("Failed to get email code", error);
      emailForm.setError("email", {
        type: "manual",
        message: "Failed to send code. Please try again.",
      });
    } finally {
      setIsLoadingCode(false);
    }
  };

  function handleLogin(data: z.infer<typeof codeSchema>) {
    const email = emailForm.getValues("email");
    try {
      loginByEmail({ email, code: data.code })
        .then(async () => {
          const userProfile = await fetchUserProfile(process.env.NEXT_PUBLIC_COMMUNITY_ID as string);

          if (userProfile?.badges) {
            setBadges(userProfile.badges);
          }

          setIsOpen(false);
          revalidate();
        })
        .catch((error) => {
          console.error("Login failed", error);
          codeForm.setError("code", {
            type: "manual",
            message: error instanceof Error ? error.message : "Login failed. Please try again.",
          });
        });
    } catch (error) {
      console.error("Login failed", error);
      codeForm.setError("code", {
        type: "manual",
        message: error instanceof Error ? error.message : "Login failed. Please try again.",
      });
    }
  }

  function toggle() {
    setIsOpen((t) => !t);
    // Reset forms when toggling
    emailForm.reset();
    codeForm.reset();
    setIsCodeSent(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={toggle}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{address ? "User Profile" : "Login"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!isCodeSent ? (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(handleGetEmailCode)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoadingCode}>
                  {isLoadingCode ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...codeForm}>
              <form onSubmit={codeForm.handleSubmit(handleLogin)} className="flex flex-col items-center space-y-4">
                <div className="text-sm text-muted-foreground mb-2 w-full">
                  Enter the 6-digit code sent to {emailForm.getValues("email")}
                </div>

                <FormField
                  control={codeForm.control}
                  name="code"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          value={value}
                          onChange={(otpValue) => {
                            onChange(otpValue);
                            // Automatically submit when 6 digits are entered
                            if (otpValue.length === 6) {
                              codeForm.handleSubmit(handleLogin)();
                            }
                          }}
                          {...field}
                        >
                          <InputOTPGroup>
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                              <InputOTPSlot key={index} index={index} />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full mt-4">
                  {codeForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login with Email"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full mt-2"
                  onClick={() => {
                    setIsCodeSent(false);
                    codeForm.reset();
                  }}
                  disabled={codeForm.formState.isSubmitting}
                >
                  Change Email
                </Button>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
