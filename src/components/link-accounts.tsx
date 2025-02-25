"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import Discord from "../../public/icons/discord.svg";

export default function LinkAccounts() {
  const { user, linkDiscord, unlinkDiscord, ready, linkGithub, unlinkGithub, login, authenticated } = usePrivy();

  const services = [
    {
      id: "discord",
      actions: {
        link: linkDiscord,
        unlink: unlinkDiscord,
      },
      icon: <Image src={Discord} alt="Discord" width={20} height={20} />,
      linkedAccount: user?.discord?.username,
    },
  ];

  if (!ready)
    return (
      <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
        {services.map((service) => (
          <Skeleton key={service.id} className="h-10 w-32 px-4 py-2 rounded-md border border-input bg-foreground/10" />
        ))}
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
      {services.map((service) => (
        <Button
          key={service.id}
          variant="outline"
          onClick={() => (authenticated ? service.actions.link() : login())}
          className="bg-background text-foreground"
          disabled={Boolean(service.linkedAccount)}
          aria-disabled={Boolean(service.linkedAccount)}
          aria-label={
            service.linkedAccount
              ? `Connected to ${service.id} as ${service.linkedAccount}`
              : `Connect ${service.id} account`
          }
        >
          {service.linkedAccount ? (
            <>
              <div className="flex items-center gap-2">
                {service.icon}
                {service.linkedAccount}
              </div>
              <span className="sr-only">Connected to {service.id}</span>
            </>
          ) : (
            <span className="capitalize">Connect {service.id}</span>
          )}
        </Button>
      ))}
    </div>
  );
}
